import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialStudioData } from './src/data/initialStudioData.ts';
import { ContactSubmission, StudioDatabase, StudioProject } from './src/types/studio.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'studio-db.json');

const ADMIN_PASSWORD = process.env.STUDIO_ADMIN_PASSWORD || 'dabour-admin-2026';
const TOKEN_SECRET = crypto.createHash('sha256').update(`dabour-studio-${ADMIN_PASSWORD}`).digest('hex');

function ensureDatabase(): StudioDatabase {
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

function saveDatabase(db: StudioDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function createAdminToken(): string {
  const payload = JSON.stringify({
    role: 'studio_admin',
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 12, // 12 hours
  });
  const base64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [base64Payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(base64Payload)
    .digest('base64url');
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
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing studio admin token.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired studio admin token.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Initialize database on startup
  ensureDatabase();

  // Public Endpoint: Fetch Studio Content (Hero, Services, Projects)
  app.get('/api/studio', (_req: Request, res: Response) => {
    try {
      const db = ensureDatabase();
      res.json({
        hero: db.hero,
        services: db.services,
        projects: db.projects,
      });
    } catch {
      res.status(500).json({ error: 'Failed to load studio data.' });
    }
  });

  // Public Endpoint: Submit Contact / Project Inquiry
  app.post('/api/contact', (req: Request, res: Response) => {
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

      const db = ensureDatabase();
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

      db.contacts.unshift(submission);
      saveDatabase(db);

      res.status(201).json({
        ok: true,
        submission: {
          id: submission.id,
          referenceCode: submission.referenceCode,
          createdAt: submission.createdAt,
        },
      });
    } catch {
      res.status(500).json({ error: 'حدث خطأ أثناء حفظ الطلب على الخادم / Server failed to persist contact request.' });
    }
  });

  // Admin Endpoint: Login
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body || {};
    if (typeof password !== 'string' || password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: 'كلمة مرور لوحة الإدارة غير صحيحة / Invalid studio admin password.' });
      return;
    }
    const token = createAdminToken();
    res.json({
      ok: true,
      token,
      role: 'studio_admin',
    });
  });

  // Admin Endpoint: Verify session & get full database including contacts
  app.get('/api/admin/overview', requireAdminAuth, (_req: Request, res: Response) => {
    const db = ensureDatabase();
    res.json(db);
  });

  // Admin Endpoint: Update Contact Status
  app.patch('/api/admin/contacts/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body || {};
    const validStatuses = ['new', 'reviewed', 'in_discussion', 'archived'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid contact status.' });
      return;
    }
    const db = ensureDatabase();
    const item = db.contacts.find((c) => c.id === id);
    if (!item) {
      res.status(404).json({ error: 'Contact request not found.' });
      return;
    }
    item.status = status;
    saveDatabase(db);
    res.json({ ok: true, contact: item });
  });

  // Admin Endpoint: Delete Contact Request
  app.delete('/api/admin/contacts/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = ensureDatabase();
    db.contacts = db.contacts.filter((c) => c.id !== id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Admin Endpoint: Create Project
  app.post('/api/admin/projects', requireAdminAuth, (req: Request, res: Response) => {
    const payload = req.body as Partial<StudioProject>;
    if (!payload.title?.ar || !payload.title?.en || !payload.slug) {
      res.status(400).json({ error: 'Both Arabic/English titles and slug are required.' });
      return;
    }
    const db = ensureDatabase();
    const cleanSlug = payload.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    if (db.projects.some((p) => p.slug === cleanSlug)) {
      res.status(400).json({ error: 'A project with this slug already exists.' });
      return;
    }

    const newProject: StudioProject = {
      id: `prj-${Date.now()}`,
      slug: cleanSlug,
      category: payload.category || 'games',
      status: payload.status || 'prototype',
      isSamplePrototype: payload.isSamplePrototype ?? false,
      featured: payload.featured ?? true,
      coverImage: payload.coverImage || '/images/project-hornet-unity6.svg',
      galleryImages: payload.galleryImages?.length
        ? payload.galleryImages
        : [payload.coverImage || '/images/project-hornet-unity6.svg'],
      title: {
        ar: payload.title.ar,
        en: payload.title.en,
      },
      shortDescription: {
        ar: payload.shortDescription?.ar || payload.title.ar,
        en: payload.shortDescription?.en || payload.title.en,
      },
      fullDescription: {
        ar: payload.fullDescription?.ar || payload.shortDescription?.ar || '',
        en: payload.fullDescription?.en || payload.shortDescription?.en || '',
      },
      challenge: {
        ar: payload.challenge?.ar || 'تحقيق أعلى مستويات الأداء والجودة البرمجية.',
        en: payload.challenge?.en || 'Delivering high frame-rate stability and clean architecture.',
      },
      architecture: {
        ar: payload.architecture?.ar || 'معمارية برمجية معيارية قابلة للتوسع.',
        en: payload.architecture?.en || 'Modular, scalable engineering architecture.',
      },
      technologies: Array.isArray(payload.technologies) && payload.technologies.length > 0
        ? payload.technologies
        : ['Unity 6', 'C#'],
      targetPlatforms: Array.isArray(payload.targetPlatforms) && payload.targetPlatforms.length > 0
        ? payload.targetPlatforms
        : ['PC', 'Android'],
      year: payload.year || String(new Date().getFullYear()),
      metrics: Array.isArray(payload.metrics) && payload.metrics.length > 0
        ? payload.metrics
        : [
            {
              label: { ar: 'حالة الإنجاز', en: 'Build Target' },
              value: '100%',
            },
          ],
      milestones: Array.isArray(payload.milestones) && payload.milestones.length > 0
        ? payload.milestones
        : [
            {
              phase: { ar: 'التصميم والمعمارية البرمجية', en: 'Architecture & Core Systems' },
              detail: { ar: 'تطوير النواة الأساسية للمشروع', en: 'Core engineering implementation' },
              completed: true,
            },
          ],
    };

    db.projects.unshift(newProject);
    saveDatabase(db);
    res.status(201).json({ ok: true, project: newProject });
  });

  // Admin Endpoint: Update Project
  app.put('/api/admin/projects/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body as Partial<StudioProject>;
    const db = ensureDatabase();
    const index = db.projects.findIndex((p) => p.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    db.projects[index] = {
      ...db.projects[index],
      ...updates,
      id: db.projects[index].id,
    };
    saveDatabase(db);
    res.json({ ok: true, project: db.projects[index] });
  });

  // Admin Endpoint: Delete Project
  app.delete('/api/admin/projects/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = ensureDatabase();
    db.projects = db.projects.filter((p) => p.id !== id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Admin Endpoint: Update Hero Content
  app.put('/api/admin/hero', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDatabase();
    db.hero = {
      ...db.hero,
      ...req.body,
    };
    saveDatabase(db);
    res.json({ ok: true, hero: db.hero });
  });

  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist', 'index.html'));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DabourStudio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
