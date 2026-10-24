/**
 * DabourStudio — Cloudflare Worker
 *
 * Serves the built React SPA (dist/) and replaces the Express API of server.ts:
 *   GET    /api/studio
 *   POST   /api/contact
 *   POST   /api/admin/login
 *   GET    /api/admin/overview
 *   PATCH  /api/admin/contacts/:id
 *   DELETE /api/admin/contacts/:id
 *   POST   /api/admin/projects
 *   PUT    /api/admin/projects/:id
 *   DELETE /api/admin/projects/:id
 *   PUT    /api/admin/hero
 *
 * Content edits and incoming contact messages are stored in the STUDIO_KV namespace,
 * so the /admin panel keeps working on Cloudflare (no filesystem available).
 */

/// <reference types="@cloudflare/workers-types" />

import { initialStudioData } from '../src/data/initialStudioData.ts';
import type {
  ContactSubmission,
  HeroContent,
  StudioProject,
} from '../src/types/studio.ts';

/**
 * KV layout
 *   studio:data  → encrypted JSON blob {hero, projects, contacts} (AES-256-CTR + HMAC-SHA256)
 * The payload is encrypted because Workers KV cannot store UTF-8 values larger than 512 bytes,
 * and compressed when that makes the value smaller (stored as raw bytes).
 */
const DATA_KEY = 'studio:data';
const DATA_GZIP_KEY = 'studio:data.gzip';
const MAX_DATA_BYTES = 12 * 1024 * 1024;
const MAX_CONTACTS = 1000;

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  STUDIO_KV?: KVNamespace;
  STUDIO_ADMIN_PASSWORD?: string;
  DB_SECRET_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

const DEFAULT_ADMIN_PASSWORD = 'dabour-admin-2026';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });
}

function normalizeText(value: any, fallback: any) {
  if (value && typeof value === 'object' && (value.ar || value.en)) {
    return {
      ar: typeof value.ar === 'string' ? value.ar : fallback?.ar || '',
      en: typeof value.en === 'string' ? value.en : fallback?.en || '',
    };
  }
  return fallback;
}

function normalizeHero(raw: any): HeroContent {
  const def = initialStudioData.hero;
  if (!raw || typeof raw !== 'object') return structuredClone(def);
  return {
    headline: normalizeText(raw.headline, def.headline),
    subheadline: normalizeText(raw.subheadline, def.subheadline),
    primaryCta: normalizeText(raw.primaryCta ?? raw.primary_cta, def.primaryCta),
    secondaryCta: normalizeText(raw.secondaryCta ?? raw.secondary_cta, def.secondaryCta),
    studioTagline: normalizeText(raw.studioTagline ?? raw.studio_tagline, def.studioTagline),
  };
}

function normalizeProject(raw: any, fallbackIndex = 0): StudioProject {
  const def = initialStudioData.projects[fallbackIndex] || initialStudioData.projects[0];
  if (!raw || typeof raw !== 'object') return structuredClone(def);
  return {
    id: raw.id || def.id,
    slug: raw.slug || def.slug,
    category: raw.category || def.category,
    status: raw.status || def.status,
    isSamplePrototype: raw.isSamplePrototype ?? raw.is_sample_prototype ?? def.isSamplePrototype,
    featured: raw.featured ?? def.featured,
    coverImage: raw.coverImage || raw.cover_image || def.coverImage,
    galleryImages: Array.isArray(raw.galleryImages ?? raw.gallery_images)
      ? raw.galleryImages ?? raw.gallery_images
      : def.galleryImages,
    title: normalizeText(raw.title, def.title),
    shortDescription: normalizeText(raw.shortDescription ?? raw.short_description, def.shortDescription),
    fullDescription: normalizeText(raw.fullDescription ?? raw.full_description, def.fullDescription),
    challenge: normalizeText(raw.challenge, def.challenge),
    architecture: normalizeText(raw.architecture, def.architecture),
    technologies: Array.isArray(raw.technologies) ? raw.technologies : def.technologies,
    targetPlatforms: Array.isArray(raw.targetPlatforms ?? raw.target_platforms)
      ? raw.targetPlatforms ?? raw.target_platforms
      : def.targetPlatforms,
    year: raw.year || def.year,
    metrics: Array.isArray(raw.metrics) ? raw.metrics : def.metrics,
    milestones: Array.isArray(raw.milestones) ? raw.milestones : def.milestones,
  };
}

/* ------------------------------------------------------------------ */
/* Storage (encrypted KV → Supabase → built-in defaults)                */
/* ------------------------------------------------------------------ */

async function supabaseRequest(env: Env, path: string, init: RequestInit = {}): Promise<any | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!env.SUPABASE_URL.startsWith('http')) return null;
  try {
    const res = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'content-type': 'application/json',
        prefer: 'return=representation',
        ...(init.headers || {}),
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

interface Overview {
  hero: HeroContent;
  projects: StudioProject[];
  contacts: ContactSubmission[];
}

function defaultOverview(): Overview {
  return {
    hero: normalizeHero(initialStudioData.hero),
    projects: initialStudioData.projects.map((p, i) => normalizeProject(p, i)),
    contacts: [],
  };
}

async function deriveKeys(env: Env): Promise<{ enc: CryptoKey; mac: CryptoKey }> {
  const raw = await crypto.subtle.digest('SHA-256', encoder.encode(secretFor(env)));
  const [enc, mac] = await Promise.all([
    crypto.subtle.importKey('raw', raw, { name: 'AES-CTR' }, false, ['encrypt', 'decrypt']),
    crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']),
  ]);
  return { enc, mac };
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

/** Read a KV value as raw bytes (works with values stored as text or as binary). */
async function kvReadBytes(env: Env, key: string): Promise<Uint8Array | null> {
  try {
    if (!env.STUDIO_KV) return null;
    const buffer = await env.STUDIO_KV.get(key, 'arrayBuffer');
    if (!buffer || buffer.byteLength === 0) return null;
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return bytes;
  try {
    const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

async function gzip(bytes: Uint8Array): Promise<Uint8Array | null> {
  try {
    const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

/** Decrypt a value written by saveDatabase (version byte + HMAC tag + AES-CTR payload). */
async function decryptValue(env: Env, raw: Uint8Array): Promise<string | null> {
  if (raw.length < 33 || raw[0] !== 1) return null;
  const { enc, mac } = await deriveKeys(env);
  const tag = raw.subarray(1, 33);
  const ciphertext = raw.subarray(33);
  const valid = await crypto.subtle.verify('HMAC', mac, toArrayBuffer(tag), toArrayBuffer(ciphertext));
  if (!valid) return null;
  const counter = await crypto.subtle.digest('SHA-256', encoder.encode('iv'));
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-CTR', counter: toArrayBuffer(new Uint8Array(counter)), length: 64 },
    enc,
    toArrayBuffer(ciphertext),
  );
  return decoder.decode(plain);
}

async function encryptValue(env: Env, plaintext: string): Promise<Uint8Array> {
  const { enc, mac } = await deriveKeys(env);
  const counter = await crypto.subtle.digest('SHA-256', encoder.encode('iv'));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-CTR', counter: toArrayBuffer(new Uint8Array(counter)), length: 64 },
      enc,
      encoder.encode(plaintext),
    ),
  );
  const tag = new Uint8Array(await crypto.subtle.sign('HMAC', mac, ciphertext));
  const out = new Uint8Array(1 + tag.length + ciphertext.length);
  out[0] = 1;
  out.set(tag, 1);
  out.set(ciphertext, 1 + tag.length);
  return out;
}

let cachedOverview: { raw: string; value: Overview } | null = null;

async function loadOverview(env: Env): Promise<Overview> {
  if (!env.STUDIO_KV) {
    return defaultOverview();
  }

  const plainKey = DATA_KEY;
  let raw = await kvReadBytes(env, plainKey);
  if (raw) {
    const gunzipped = await gunzip(raw);
    if (gunzipped) raw = gunzipped;
  } else {
    raw = await kvReadBytes(env, DATA_GZIP_KEY);
    if (raw) {
      const gunzipped = await gunzip(raw);
      if (gunzipped) raw = gunzipped;
    }
  }

  if (raw) {
    const plain = await decryptValue(env, raw);
    if (plain) {
      try {
        const parsed = JSON.parse(plain);
        const overview: Overview = {
          hero: normalizeHero(parsed.hero),
          projects:
            Array.isArray(parsed.projects) && parsed.projects.length > 0
              ? parsed.projects.map((p: any, i: number) => normalizeProject(p, i))
              : defaultOverview().projects,
          contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
        };
        cachedOverview = { raw: plain, value: overview };
        return overview;
      } catch {
        // corrupted payload — fall through to defaults
      }
    }
  }

  // Data not migrated into the encrypted store yet: seed from Supabase when configured.
  const overview = defaultOverview();
  const remoteHero = await supabaseRequest(env, 'hero_content?id=eq.hero&select=*');
  if (Array.isArray(remoteHero) && remoteHero[0]) overview.hero = normalizeHero(remoteHero[0]);
  const remoteProjects = await supabaseRequest(env, 'projects?select=*&order=created_at.desc');
  if (Array.isArray(remoteProjects) && remoteProjects.length > 0) {
    overview.projects = remoteProjects.map((p: any, i: number) => normalizeProject(p, i));
  }
  return overview;
}

async function saveDatabase(env: Env, overview: Overview): Promise<boolean> {
  if (!env.STUDIO_KV) return false;
  const payload = JSON.stringify(overview);
  if (payload === cachedOverview?.raw) return true;

  const encrypted = await encryptValue(env, payload);
  if (encrypted.byteLength > MAX_DATA_BYTES) {
    console.error('Studio database is too large to store in KV:', encrypted.byteLength);
    return false;
  }

  try {
    const compressed = await gzip(encrypted);
    const value = compressed && compressed.byteLength < encrypted.byteLength ? compressed : encrypted;
    await env.STUDIO_KV.put(DATA_KEY, toArrayBuffer(value));
    if (value !== encrypted) await env.STUDIO_KV.delete(DATA_GZIP_KEY);
    cachedOverview = { raw: payload, value: overview };
    return true;
  } catch (err) {
    console.error('KV write failed for studio database:', err);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Admin auth (HMAC-signed token)                                      */
/* ------------------------------------------------------------------ */

const b64url = {
  encode(bytes: Uint8Array): string {
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  decode(text: string): Uint8Array {
    const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
    const bin = atob(padded);
    const out = new Uint8Array(new ArrayBuffer(bin.length));
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  },
};

function secretFor(env: Env): string {
  return env.DB_SECRET_KEY || `dabour-studio-${env.STUDIO_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD}`;
}

async function hmacKey(env: Env): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secretFor(env)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function createAdminToken(env: Env): Promise<string> {
  const payload = {
    role: 'studio_admin',
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };
  const base64Payload = b64url.encode(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(env), encoder.encode(base64Payload));
  return `${base64Payload}.${b64url.encode(new Uint8Array(signature))}`;
}

async function verifyAdminToken(env: Env, token: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [base64Payload, signature] = parts;
  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(env),
      b64url.decode(signature) as unknown as BufferSource,
      encoder.encode(base64Payload),
    );
    if (!valid) return false;
    const decoded = JSON.parse(decoder.decode(b64url.decode(base64Payload)));
    return decoded.role === 'studio_admin' && Number(decoded.exp) > Date.now();
  } catch {
    return false;
  }
}

function bearer(request: Request): string | null {
  const header = request.headers.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

/* ------------------------------------------------------------------ */
/* API handlers                                                        */
/* ------------------------------------------------------------------ */

async function handleApi(request: Request, env: Env, url: URL): Promise<Response | null> {
  const { pathname } = url;
  if (!pathname.startsWith('/api/')) return null;

  const method = request.method.toUpperCase();

  // public content
  if (pathname === '/api/studio' && method === 'GET') {
    const overview = await loadOverview(env);
    return json({
      hero: overview.hero,
      services: initialStudioData.services,
      projects: overview.projects,
    });
  }

  // contact form
  if (pathname === '/api/contact' && method === 'POST') {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400);
    }

    const cleanName = typeof body.name === 'string' ? body.name.trim() : '';
    const cleanEmail = typeof body.email === 'string' ? body.email.trim() : '';
    const cleanProjectType = typeof body.projectType === 'string' ? body.projectType.trim() : '';
    const cleanBudget = typeof body.budget === 'string' ? body.budget.trim() : '';
    const cleanDetails = typeof body.details === 'string' ? body.details.trim() : '';

    if (cleanName.length < 2) {
      return json({ error: 'الاسم مطلوب (حرفان على الأقل) / Valid name is required.' }, 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return json({ error: 'يرجى إدخال بريد إلكتروني صحيح / Valid email address is required.' }, 400);
    }
    if (!cleanProjectType) {
      return json({ error: 'يرجى اختيار نوع المشروع / Project type is required.' }, 400);
    }
    if (cleanDetails.length < 15) {
      return json(
        {
          error:
            'يرجى كتابة تفاصيل المشروع (15 حرفًا على الأقل) / Please provide at least 15 characters of project details.',
        },
        400,
      );
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const submission: ContactSubmission = {
      id: `cnt-${Date.now()}-${randomDigits}`,
      referenceCode: `DBS-${new Date().getFullYear()}-${randomDigits}`,
      name: cleanName.slice(0, 120),
      email: cleanEmail.slice(0, 160),
      projectType: cleanProjectType.slice(0, 80),
      budget: cleanBudget ? cleanBudget.slice(0, 80) : 'غير محدد / Not specified',
      details: cleanDetails.slice(0, 3000),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    const existing = await loadOverview(env);
    existing.contacts = [submission, ...existing.contacts].slice(0, MAX_CONTACTS);
    await saveDatabase(env, existing);

    await supabaseRequest(env, 'contacts', {
      method: 'POST',
      body: JSON.stringify({
        id: submission.id,
        reference_code: submission.referenceCode,
        name: submission.name,
        email: submission.email,
        project_type: submission.projectType,
        budget: submission.budget,
        details: submission.details,
        status: submission.status,
        created_at: submission.createdAt,
      }),
    });

    return json(
      {
        ok: true,
        submission: {
          id: submission.id,
          referenceCode: submission.referenceCode,
          createdAt: submission.createdAt,
        },
      },
      201,
    );
  }

  // admin login
  if (pathname === '/api/admin/login' && method === 'POST') {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400);
    }
    const expected = env.STUDIO_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
    if (typeof body.password !== 'string' || body.password !== expected) {
      return json(
        { error: 'كلمة مرور لوحة الإدارة غير صحيحة / Invalid studio admin password.' },
        401,
      );
    }
    return json({ ok: true, token: await createAdminToken(env), role: 'studio_admin' });
  }

  // everything below requires admin auth
  if (pathname.startsWith('/api/admin/')) {
    const token = bearer(request);
    if (!token || !(await verifyAdminToken(env, token))) {
      return json({ error: 'Unauthorized: Missing or invalid studio admin token.' }, 401);
    }
  }

  if (pathname === '/api/admin/overview' && method === 'GET') {
    const overview = await loadOverview(env);
    return json({ ...overview, services: initialStudioData.services });
  }

  const contactMatch = pathname.match(/^\/api\/admin\/contacts\/([^/]+)$/);
  if (contactMatch && (method === 'PATCH' || method === 'DELETE')) {
    const id = decodeURIComponent(contactMatch[1]);
    const overview = await loadOverview(env);

    if (method === 'PATCH') {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON body.' }, 400);
      }
      overview.contacts = overview.contacts.map((c) =>
        c.id === id ? { ...c, status: body.status ?? c.status } : c,
      );
      await saveDatabase(env, overview);
      await supabaseRequest(env, `contacts?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: body.status }),
      });
      return json({ ok: true });
    }

    overview.contacts = overview.contacts.filter((c) => c.id !== id);
    await saveDatabase(env, overview);
    await supabaseRequest(env, `contacts?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    return json({ ok: true });
  }

  if (pathname === '/api/admin/projects' && method === 'POST') {
    let payload: any = {};
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400);
    }
    if (!payload?.title?.ar || !payload?.title?.en || !payload?.slug) {
      return json({ error: 'Both Arabic/English titles and slug are required.' }, 400);
    }
    const cleanSlug = String(payload.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newProject = normalizeProject(
      { ...payload, id: `prj-${Date.now()}`, slug: cleanSlug, featured: payload.featured ?? true },
      0,
    );

    const overview = await loadOverview(env);
    overview.projects = [newProject, ...overview.projects];
    await saveDatabase(env, overview);

    await supabaseRequest(env, 'projects', {
      method: 'POST',
      body: JSON.stringify({
        id: newProject.id,
        slug: newProject.slug,
        category: newProject.category,
        status: newProject.status,
        is_sample_prototype: newProject.isSamplePrototype,
        featured: newProject.featured,
        cover_image: newProject.coverImage,
        gallery_images: newProject.galleryImages,
        title: newProject.title,
        short_description: newProject.shortDescription,
        full_description: newProject.fullDescription,
        challenge: newProject.challenge,
        architecture: newProject.architecture,
        technologies: newProject.technologies,
        target_platforms: newProject.targetPlatforms,
        year: newProject.year,
        metrics: newProject.metrics,
        milestones: newProject.milestones,
      }),
    });

    return json({ ok: true, project: newProject }, 201);
  }

  const projectMatch = pathname.match(/^\/api\/admin\/projects\/([^/]+)$/);
  if (projectMatch && (method === 'PUT' || method === 'DELETE')) {
    const id = decodeURIComponent(projectMatch[1]);
    const overview = await loadOverview(env);

    if (method === 'PUT') {
      let updates: any = {};
      try {
        updates = await request.json();
      } catch {
        return json({ error: 'Invalid JSON body.' }, 400);
      }
      overview.projects = overview.projects.map((p) =>
        p.id === id ? normalizeProject({ ...p, ...updates }) : p,
      );
      await saveDatabase(env, overview);
      await supabaseRequest(env, `projects?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...(updates.isSamplePrototype !== undefined && { is_sample_prototype: updates.isSamplePrototype }),
          ...(updates.status && { status: updates.status }),
          ...(updates.title && { title: updates.title }),
          ...(updates.shortDescription && { short_description: updates.shortDescription }),
          ...(updates.coverImage && { cover_image: updates.coverImage }),
        }),
      });
      return json({ ok: true });
    }

    overview.projects = overview.projects.filter((p) => p.id !== id);
    await saveDatabase(env, overview);
    await supabaseRequest(env, `projects?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    return json({ ok: true });
  }

  if (pathname === '/api/admin/hero' && method === 'PUT') {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400);
    }
    const overview = await loadOverview(env);
    const hero = normalizeHero({ ...overview.hero, ...body });
    overview.hero = hero;
    await saveDatabase(env, overview);
    await supabaseRequest(env, 'hero_content', {
      method: 'POST',
      headers: { prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        id: 'hero',
        headline: hero.headline,
        subheadline: hero.subheadline,
        primary_cta: hero.primaryCta,
        secondary_cta: hero.secondaryCta,
        studio_tagline: hero.studioTagline,
      }),
    });
    return json({ ok: true, hero });
  }

  return json({ error: `No API route for ${method} ${pathname}` }, 404);
}

/* ------------------------------------------------------------------ */
/* Worker entrypoint                                                   */
/* ------------------------------------------------------------------ */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        const response = await handleApi(request, env, url);
        if (response) return response;
      } catch (err) {
        console.error('API error:', err);
        return json({ error: 'Internal server error.' }, 500);
      }
    }

    // Static assets (SPA fallback is configured in wrangler.jsonc)
    return env.ASSETS.fetch(request);
  },
};
