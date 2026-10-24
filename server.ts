import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialStudioData } from './src/data/initialStudioData.ts';
import { ContactSubmission, HeroContent, StudioDatabase, StudioProject } from './src/types/studio.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'studio-db.json');

const ADMIN_PASSWORD = process.env.STUDIO_ADMIN_PASSWORD || 'dabour-admin-2026';
const TOKEN_SECRET = crypto.createHash('sha256').update(`dabour-studio-${ADMIN_PASSWORD}`).digest('hex');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    console.warn('Supabase initialization failed, falling back to local file storage:', err);
    supabase = null;
  }
}

// Local filesystem fallback database helpers
function ensureLocalDatabase(): StudioDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialStudioData, null, 2), 'utf-8');
    return structuredClone(initialStudioData);
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as StudioDatabase;
    if (!parsed.projects || !parsed.services || !parsed.hero) {
      fs.writeFileSync(DB_PATH, JSON.stringify(initialStudioData, null, 2), 'utf-8');
      return structuredClone(initialStudioData);
    }
    if (!Array.isArray(parsed.contacts)) {
      parsed.contacts = [];
    }
    return parsed;
  } catch {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialStudioData, null, 2), 'utf-8');
    return structuredClone(initialStudioData);
  }
}

function saveLocalDatabase(db: StudioDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save local database:', err);
  }
}

function normalizeHero(raw: any): HeroContent {
  const def = initialStudioData.hero;
  if (!raw || typeof raw !== 'object') return def;
  return {
    headline: raw.headline || def.headline,
    subheadline: raw.subheadline || def.subheadline,
    primaryCta: raw.primaryCta || raw.primary_cta || def.primaryCta,
    secondaryCta: raw.secondaryCta || raw.secondary_cta || def.secondaryCta,
    studioTagline: raw.studioTagline || raw.studio_tagline || def.studioTagline,
  };
}

function normalizeProject(raw: any, fallbackIndex = 0): StudioProject {
  const def = initialStudioData.projects[fallbackIndex] || initialStudioData.projects[0];
  if (!raw || typeof raw !== 'object') return def;
  return {
    id: raw.id || def.id,
    slug: raw.slug || def.slug,
    category: raw.category || def.category,
    status: raw.status || def.status,
    isSamplePrototype: raw.isSamplePrototype ?? raw.is_sample_prototype ?? def.isSamplePrototype,
    featured: raw.featured ?? def.featured,
    coverImage: raw.coverImage || raw.cover_image || def.coverImage,
    galleryImages: Array.isArray(raw.galleryImages || raw.gallery_images)
      ? (raw.galleryImages || raw.gallery_images)
      : def.galleryImages,
    title: raw.title || def.title,
    shortDescription: raw.shortDescription || raw.short_description || def.shortDescription,
    fullDescription: raw.fullDescription || raw.full_description || def.fullDescription,
    challenge: raw.challenge || def.challenge,
    architecture: raw.architecture || def.architecture,
    technologies: Array.isArray(raw.technologies) ? raw.technologies : def.technologies,
    targetPlatforms: Array.isArray(raw.targetPlatforms || raw.target_platforms)
      ? (raw.targetPlatforms || raw.target_platforms)
      : def.targetPlatforms,
    year: raw.year || def.year,
    metrics: Array.isArray(raw.metrics) ? raw.metrics : def.metrics,
    milestones: Array.isArray(raw.milestones) ? raw.milestones : def.milestones,
  };
}

function createAdminToken(): string {
  const payload = JSON.stringify({
    role: 'studio_admin',
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 12,
  });
  const base64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(base64Payload).digest('base64url');
  return `${base64Payload}.${signature}`;
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [base64Payload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(base64Payload).digest('base64url');
  if (signature !== expectedSig) return false;
  try {
    const decoded = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf-8'));
    return decoded.role === 'studio_admin' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || !verifyAdminToken(authHeader.slice(7).trim())) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid studio admin token.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Ensure local database exists as instant local cache
  const localDb = ensureLocalDatabase();

  // Public Endpoint: Fetch Studio Content
  app.get('/api/studio', async (_req: Request, res: Response) => {
    try {
      let hero = localDb.hero;
      let projects = localDb.projects;

      if (supabase) {
        try {
          const [heroRes, projRes] = await Promise.all([
            supabase.from('hero_content').select('*').eq('id', 'hero').maybeSingle(),
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
          ]);

          if (heroRes.data) {
            hero = normalizeHero(heroRes.data);
          }
          if (Array.isArray(projRes.data) && projRes.data.length > 0) {
            projects = projRes.data.map((p, idx) => normalizeProject(p, idx));
          }
        } catch (dbErr) {
          console.warn('Supabase fetch failed, serving from local cache:', dbErr);
        }
      }

      res.json({
        hero: normalizeHero(hero),
        services: initialStudioData.services,
        projects: projects && projects.length > 0 ? projects.map((p, i) => normalizeProject(p, i)) : initialStudioData.projects,
      });
    } catch (err) {
      console.error('Error in /api/studio:', err);
      res.json({
        hero: initialStudioData.hero,
        services: initialStudioData.services,
        projects: initialStudioData.projects,
      });
    }
  });

  // Public Endpoint: Submit Contact Form
  app.post('/api/contact', async (req: Request, res: Response) => {
    try {
      const { name, email, projectType, budget, details } = req.body || {};
      const cleanName = typeof name === 'string' ? name.trim() : '';
      const cleanEmail = typeof email === 'string' ? email.trim() : '';
      const cleanProjectType = typeof projectType === 'string' ? projectType.trim() : '';
      const cleanBudget = typeof budget === 'string' ? budget.trim() : '';
      const cleanDetails = typeof details === 'string' ? details.trim() : '';

      if (cleanName.length < 2) {
        res.status(400).json({ error: 'الاسم مطلوب (حرفان على الأقل) / Valid name is required.' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        res.status(400).json({ error: 'يرجى إدخال بريد إلكتروني صحيح / Valid email address is required.' });
        return;
      }

      if (!cleanProjectType) {
        res.status(400).json({ error: 'يرجى اختيار نوع المشروع / Project type is required.' });
        return;
      }

      if (cleanDetails.length < 15) {
        res.status(400).json({
          error: 'يرجى كتابة تفاصيل المشروع (15 حرفًا على الأقل) / Please provide at least 15 characters of project details.',
        });
        return;
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

      // Always save to local database
      localDb.contacts.unshift(submission);
      saveLocalDatabase(localDb);

      // Also persist to Supabase if available
      if (supabase) {
        try {
          await supabase.from('contacts').insert({
            id: submission.id,
            reference_code: submission.referenceCode,
            name: submission.name,
            email: submission.email,
            project_type: submission.projectType,
            budget: submission.budget,
            details: submission.details,
            status: submission.status,
            created_at: submission.createdAt,
          });
        } catch (sbErr) {
          console.warn('Supabase contact insert failed, preserved locally:', sbErr);
        }
      }

      res.status(201).json({
        ok: true,
        submission: {
          id: submission.id,
          referenceCode: submission.referenceCode,
          createdAt: submission.createdAt,
        },
      });
    } catch (err) {
      console.error('Contact submission error:', err);
      res.status(500).json({ error: 'حدث خطأ أثناء حفظ الطلب / Server failed to persist inquiry.' });
    }
  });

  // Admin Auth
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body || {};
    if (typeof password !== 'string' || password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: 'كلمة مرور لوحة الإدارة غير صحيحة / Invalid studio admin password.' });
      return;
    }
    res.json({ ok: true, token: createAdminToken(), role: 'studio_admin' });
  });

  // Admin Overview
  app.get('/api/admin/overview', requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      let hero = localDb.hero;
      let projects = localDb.projects;
      let contacts = localDb.contacts;

      if (supabase) {
        try {
          const [heroRes, projRes, cntRes] = await Promise.all([
            supabase.from('hero_content').select('*').eq('id', 'hero').maybeSingle(),
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
            supabase.from('contacts').select('*').order('created_at', { ascending: false }),
          ]);

          if (heroRes.data) hero = normalizeHero(heroRes.data);
          if (Array.isArray(projRes.data) && projRes.data.length > 0) {
            projects = projRes.data.map((p, i) => normalizeProject(p, i));
          }
          if (Array.isArray(cntRes.data) && cntRes.data.length > 0) {
            contacts = cntRes.data.map((c: any) => ({
              id: c.id,
              referenceCode: c.referenceCode || c.reference_code || `DBS-${c.id}`,
              name: c.name || '',
              email: c.email || '',
              projectType: c.projectType || c.project_type || '',
              budget: c.budget || '',
              details: c.details || '',
              status: c.status || 'new',
              createdAt: c.createdAt || c.created_at || new Date().toISOString(),
            }));
          }
        } catch (dbErr) {
          console.warn('Supabase overview fetch failed, using local:', dbErr);
        }
      }

      res.json({
        hero: normalizeHero(hero),
        projects: projects.map((p, i) => normalizeProject(p, i)),
        contacts,
        services: initialStudioData.services,
      });
    } catch (err) {
      console.error('Error in /api/admin/overview:', err);
      res.json(localDb);
    }
  });

  // Admin: Update Contact Status
  app.patch('/api/admin/contacts/:id', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body || {};
    const item = localDb.contacts.find((c) => c.id === id);
    if (item) {
      item.status = status;
      saveLocalDatabase(localDb);
    }
    if (supabase) {
      try {
        await supabase.from('contacts').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('Supabase update contact failed:', err);
      }
    }
    res.json({ ok: true });
  });

  // Admin: Delete Contact
  app.delete('/api/admin/contacts/:id', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    localDb.contacts = localDb.contacts.filter((c) => c.id !== id);
    saveLocalDatabase(localDb);
    if (supabase) {
      try {
        await supabase.from('contacts').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete contact failed:', err);
      }
    }
    res.json({ ok: true });
  });

  // Admin: Create Project
  app.post('/api/admin/projects', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const payload = req.body as Partial<StudioProject>;
      if (!payload.title?.ar || !payload.title?.en || !payload.slug) {
        res.status(400).json({ error: 'Both Arabic/English titles and slug are required.' });
        return;
      }
      const cleanSlug = payload.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const newProj: StudioProject = normalizeProject({
        ...payload,
        id: `prj-${Date.now()}`,
        slug: cleanSlug,
      });

      localDb.projects.unshift(newProj);
      saveLocalDatabase(localDb);

      if (supabase) {
        try {
          await supabase.from('projects').insert({
            id: newProj.id,
            slug: newProj.slug,
            category: newProj.category,
            status: newProj.status,
            is_sample_prototype: newProj.isSamplePrototype,
            featured: newProj.featured,
            cover_image: newProj.coverImage,
            gallery_images: newProj.galleryImages,
            title: newProj.title,
            short_description: newProj.shortDescription,
            full_description: newProj.fullDescription,
            challenge: newProj.challenge,
            architecture: newProj.architecture,
            technologies: newProj.technologies,
            target_platforms: newProj.targetPlatforms,
            year: newProj.year,
            metrics: newProj.metrics,
            milestones: newProj.milestones,
          });
        } catch (sbErr) {
          console.warn('Supabase project insert failed, saved locally:', sbErr);
        }
      }

      res.status(201).json({ ok: true, project: newProj });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create project.' });
    }
  });

  // Admin: Update Project
  app.put('/api/admin/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body as Partial<StudioProject>;
    const idx = localDb.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      localDb.projects[idx] = normalizeProject({
        ...localDb.projects[idx],
        ...updates,
      });
      saveLocalDatabase(localDb);
    }
    if (supabase) {
      try {
        await supabase.from('projects').update({
          ...(updates.isSamplePrototype !== undefined && { is_sample_prototype: updates.isSamplePrototype }),
          ...(updates.status && { status: updates.status }),
          ...(updates.title && { title: updates.title }),
          ...(updates.shortDescription && { short_description: updates.shortDescription }),
          ...(updates.coverImage && { cover_image: updates.coverImage }),
        }).eq('id', id);
      } catch (err) {
        console.warn('Supabase update project failed:', err);
      }
    }
    res.json({ ok: true });
  });

  // Admin: Delete Project
  app.delete('/api/admin/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    localDb.projects = localDb.projects.filter((p) => p.id !== id);
    saveLocalDatabase(localDb);
    if (supabase) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete project failed:', err);
      }
    }
    res.json({ ok: true });
  });

  // Admin: Update Hero Content
  app.put('/api/admin/hero', requireAdminAuth, async (req: Request, res: Response) => {
    const hero = normalizeHero({ ...localDb.hero, ...req.body });
    localDb.hero = hero;
    saveLocalDatabase(localDb);
    if (supabase) {
      try {
        await supabase.from('hero_content').upsert({
          id: 'hero',
          headline: hero.headline,
          subheadline: hero.subheadline,
          primary_cta: hero.primaryCta,
          secondary_cta: hero.secondaryCta,
          studio_tagline: hero.studioTagline,
        });
      } catch (err) {
        console.warn('Supabase upsert hero failed:', err);
      }
    }
    res.json({ ok: true, hero });
  });

  // Static files & SPA routing
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist', 'index.html'));
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => console.log(`DabourStudio server running on http://0.0.0.0:${PORT}`));
}

startServer();
