import {
  CheckCircle2,
  FolderPlus,
  Lock,
  LogOut,
  Mail,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useStudio } from '../context/StudioContext';
import {
  ContactSubmission,
  HeroContent,
  ProjectCategory,
  ProjectStatus,
  StudioProject,
} from '../types/studio';

export const AdminPage: React.FC = () => {
  const { lang, refreshStudioData } = useStudio();

  const [token, setToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('dabour_admin_token');
    } catch {
      return null;
    }
  });

  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'contacts' | 'projects' | 'hero'>('contacts');

  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [heroForm, setHeroForm] = useState<HeroContent | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New project form state
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCategory, setNewCategory] = useState<ProjectCategory>('games');
  const [newStatus, setNewStatus] = useState<ProjectStatus>('production');
  const [newCoverImage, setNewCoverImage] = useState('/images/project-hornet-unity6.svg');
  const [newShortDescAr, setNewShortDescAr] = useState('');
  const [newShortDescEn, setNewShortDescEn] = useState('');
  const [newTechs, setNewTechs] = useState('Unity 6, C#, URP');
  const [newIsSample, setNewIsSample] = useState(false);

  const fetchOverview = useCallback(async (adminToken: string) => {
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 401) {
        sessionStorage.removeItem('dabour_admin_token');
        setToken(null);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
        setProjects(data.projects || []);
        setHeroForm(data.hero || null);
      }
    } catch {
      // ignore network error
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchOverview(token);
    }
  }, [token, fetchOverview]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.token) {
        setAuthError(
          data?.error ||
            (lang === 'ar'
              ? 'كلمة المرور غير صحيحة.'
              : 'Invalid studio admin password.')
        );
        return;
      }
      sessionStorage.setItem('dabour_admin_token', data.token);
      setToken(data.token);
      setPassword('');
    } catch {
      setAuthError(
        lang === 'ar' ? 'تعذر الاتصال بالخادم.' : 'Failed to connect to authentication server.'
      );
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dabour_admin_token');
    setToken(null);
  };

  const showFlash = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleUpdateContactStatus = async (
    id: string,
    status: ContactSubmission['status']
  ) => {
    if (!token) return;
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchOverview(token);
      showFlash(lang === 'ar' ? 'تم تحديث حالة الطلب بنجاح' : 'Inquiry status updated');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchOverview(token);
      showFlash(lang === 'ar' ? 'تم حذف الطلب' : 'Inquiry removed');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: { ar: newTitleAr, en: newTitleEn },
        slug: newSlug,
        category: newCategory,
        status: newStatus,
        isSamplePrototype: newIsSample,
        coverImage: newCoverImage,
        shortDescription: { ar: newShortDescAr, en: newShortDescEn },
        fullDescription: { ar: newShortDescAr, en: newShortDescEn },
        technologies: newTechs
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setNewTitleAr('');
      setNewTitleEn('');
      setNewSlug('');
      setNewShortDescAr('');
      setNewShortDescEn('');
      await fetchOverview(token);
      await refreshStudioData();
      showFlash(
        lang === 'ar'
          ? 'تمت إضافة المشروع وحفظه في قاعدة بيانات الاستوديو'
          : 'Project created and persisted to database'
      );
    } else {
      showFlash(data?.error || 'Error creating project');
    }
  };

  const handleToggleSampleFlag = async (project: StudioProject) => {
    if (!token) return;
    const res = await fetch(`/api/admin/projects/${project.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        isSamplePrototype: !project.isSamplePrototype,
        status: !project.isSamplePrototype ? 'prototype' : 'production',
      }),
    });
    if (res.ok) {
      await fetchOverview(token);
      await refreshStudioData();
      showFlash(
        lang === 'ar'
          ? 'تم تحديث تصنيف المشروع وحفظه'
          : 'Project classification updated and saved'
      );
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchOverview(token);
      await refreshStudioData();
      showFlash(lang === 'ar' ? 'تم حذف المشروع من قاعدة البيانات' : 'Project deleted');
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !heroForm) return;
    const res = await fetch('/api/admin/hero', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(heroForm),
    });
    if (res.ok) {
      await refreshStudioData();
      showFlash(
        lang === 'ar'
          ? 'تم حفظ محتوى الواجهة الرئيسية بنجاح'
          : 'Home hero content saved to database'
      );
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 pt-20">
        <div className="bg-[#101218] border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5B700]/15 border border-[#F5B700]/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#F5B700]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {lang === 'ar' ? 'لوحة إدارة DabourStudio' : 'DabourStudio CMS Portal'}
              </h1>
              <p className="text-xs text-zinc-400">
                {lang === 'ar'
                  ? 'مصادقة المشرف لإدارة المشاريع وطلبات العملاء'
                  : 'Authenticated Studio Management Console'}
              </p>
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-pass" className="block text-xs font-semibold text-zinc-300">
                {lang === 'ar' ? 'كلمة مرور المشرف (STUDIO_ADMIN_PASSWORD)' : 'Studio Admin Password'}
              </label>
              <input
                id="admin-pass"
                type="password"
                dir="ltr"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="dabour-admin-2026"
                className="w-full px-4 py-2.5 bg-[#08090D] border border-white/15 focus:border-[#F5B700] rounded-xl text-sm text-white outline-none"
              />
              <p className="text-[11px] text-zinc-500 font-mono-tabular">
                {lang === 'ar'
                  ? 'كلمة المرور الافتراضية للتجربة المحلية: dabour-admin-2026'
                  : 'Default local dev password: dabour-admin-2026'}
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-sm font-bold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] rounded-xl transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'تسجيل الدخول إلى لوحة الإدارة' : 'Authenticate & Enter CMS'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="text-xs font-mono-tabular text-[#F5B700]">
            AUTHENTICATED STUDIO CMS · PERSISTENT STORAGE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {lang === 'ar'
              ? 'لوحة إدارة دبور ستيديو (CMS)'
              : 'DabourStudio Content & Client Management'}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-[#F5B700]/15 border border-[#F5B700]/40 text-[#F5B700] text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-[#F5B700] text-[#070709]'
              : 'bg-[#101218] text-zinc-300 border border-white/10'
          }`}
        >
          {lang === 'ar'
            ? `طلبات العملاء (${contacts.length})`
            : `Client Inquiries (${contacts.length})`}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-[#F5B700] text-[#070709]'
              : 'bg-[#101218] text-zinc-300 border border-white/10'
          }`}
        >
          {lang === 'ar'
            ? `المشاريع والألعاب (${projects.length})`
            : `Projects & Games (${projects.length})`}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-[#F5B700] text-[#070709]'
              : 'bg-[#101218] text-zinc-300 border border-white/10'
          }`}
        >
          {lang === 'ar' ? 'محتوى الواجهة الرئيسية' : 'Home Hero Content'}
        </button>
      </div>

      {/* TAB 1: CLIENT INQUIRIES */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <div className="bg-[#101218] border border-white/10 rounded-2xl p-12 text-center space-y-2">
              <Mail className="w-8 h-8 text-zinc-500 mx-auto" />
              <p className="text-sm text-zinc-300">
                {lang === 'ar'
                  ? 'لا توجد طلبات تواصل مرسلة حتى الآن. جرّب إرسال طلب من صفحة "تواصل معنا" ليظهر هنا فورًا.'
                  : 'No client inquiries submitted yet. Submit a test inquiry on the Contact page to see it here immediately.'}
              </p>
            </div>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                className="bg-[#101218] border border-white/10 rounded-2xl p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span className="font-mono-tabular font-bold text-[#F5B700]">
                      {c.referenceCode}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-white">{c.name}</span>
                    <span>·</span>
                    <span className="font-mono-tabular">{c.email}</span>
                    <span>·</span>
                    <span className="font-mono-tabular">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={c.status}
                      onChange={(e) =>
                        handleUpdateContactStatus(
                          c.id,
                          e.target.value as ContactSubmission['status']
                        )
                      }
                      className="px-3 py-1.5 bg-[#08090D] border border-white/15 rounded-lg text-xs text-white"
                    >
                      <option value="new">New / جديد</option>
                      <option value="reviewed">Reviewed / تمت المراجعة</option>
                      <option value="in_discussion">In Discussion / قيد النقاش</option>
                      <option value="archived">Archived / مؤرشف</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteContact(c.id)}
                      aria-label="Delete inquiry"
                      className="p-2 text-zinc-400 hover:text-red-400 rounded-lg bg-white/5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 flex flex-wrap gap-4">
                  <span>
                    <strong className="text-zinc-200">
                      {lang === 'ar' ? 'نوع المشروع:' : 'Project Type:'}
                    </strong>{' '}
                    {c.projectType}
                  </span>
                  <span>
                    <strong className="text-zinc-200">
                      {lang === 'ar' ? 'الميزانية:' : 'Budget:'}
                    </strong>{' '}
                    {c.budget}
                  </span>
                </div>

                <p className="text-sm text-zinc-200 whitespace-pre-wrap bg-[#090A0E] p-4 rounded-xl border border-white/5">
                  {c.details}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PROJECTS MANAGEMENT */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Add New Project Form */}
          <form
            onSubmit={handleCreateProject}
            className="lg:col-span-5 bg-[#101218] border border-white/10 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2 text-base font-bold text-white border-b border-white/10 pb-3">
              <FolderPlus className="w-5 h-5 text-[#F5B700]" />
              <span>{lang === 'ar' ? 'إضافة مشروع أو لعبة جديدة' : 'Add New Studio Project'}</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-300">
                {lang === 'ar' ? 'اسم المشروع بالعربية *' : 'Arabic Title *'}
              </label>
              <input
                type="text"
                required
                value={newTitleAr}
                onChange={(e) => setNewTitleAr(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-sm text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-300">
                {lang === 'ar' ? 'اسم المشروع بالإنجليزية *' : 'English Title *'}
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={newTitleEn}
                onChange={(e) => setNewTitleEn(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs text-zinc-300">Slug (URL) *</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  placeholder="my-unity6-game"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-sm text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-zinc-300">
                  {lang === 'ar' ? 'التصنيف' : 'Category'}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ProjectCategory)}
                  className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-sm text-white"
                >
                  <option value="games">ألعاب / Games</option>
                  <option value="apps">تطبيقات / Apps</option>
                  <option value="web">مواقع ويب / Web</option>
                  <option value="tools">أدوات برمجية / Tools</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs text-zinc-300">
                  {lang === 'ar' ? 'صورة الغلاف' : 'Cover Artwork'}
                </label>
                <select
                  value={newCoverImage}
                  onChange={(e) => setNewCoverImage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-xs text-white"
                >
                  <option value="/images/project-hornet-unity6.svg">Unity 6 Tactical Scene</option>
                  <option value="/images/project-hive-android.svg">Android Mobile Showcase</option>
                  <option value="/images/project-nexus-web.svg">Web Cloud Platform</option>
                  <option value="/images/project-swarm-sdk.svg">Hexagonal SDK Toolkit</option>
                  <option value="/images/project-desert-drift.svg">Desert Rally Game</option>
                  <option value="/images/project-atlas-erp.svg">Custom Software System</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-zinc-300">
                  {lang === 'ar' ? 'حالة المشروع' : 'Status'}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-xs text-white"
                >
                  <option value="production">مشروع فعلي منشور / Production</option>
                  <option value="prototype">نموذج أولي / Prototype</option>
                  <option value="in_development">قيد التطوير / In Dev</option>
                  <option value="completed_concept">نموذج مكتمل / Concept</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-300">
                {lang === 'ar' ? 'وصف مختصر بالعربية *' : 'Short Description (AR) *'}
              </label>
              <textarea
                rows={2}
                required
                value={newShortDescAr}
                onChange={(e) => setNewShortDescAr(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-sm text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-300">
                {lang === 'ar' ? 'وصف مختصر بالإنجليزية *' : 'Short Description (EN) *'}
              </label>
              <textarea
                rows={2}
                required
                dir="ltr"
                value={newShortDescEn}
                onChange={(e) => setNewShortDescEn(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-sm text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-300">
                {lang === 'ar' ? 'التقنيات (مفصولة بفاصلة)' : 'Technologies (comma-separated)'}
              </label>
              <input
                type="text"
                dir="ltr"
                value={newTechs}
                onChange={(e) => setNewTechs(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-sm text-white"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={newIsSample}
                onChange={(e) => setNewIsSample(e.target.checked)}
                className="rounded accent-[#F5B700]"
              />
              <span>
                {lang === 'ar'
                  ? 'وسم كبيانات تجريبية استعراضية (Concept Prototype)'
                  : 'Mark as Showcase Concept Prototype'}
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3 text-xs sm:text-sm font-bold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'حفظ ونشر المشروع' : 'Save & Publish Project'}</span>
            </button>
          </form>

          {/* Existing Projects List */}
          <div className="lg:col-span-7 space-y-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-[#101218] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span className="text-[#F5B700] font-mono-tabular">{p.slug}</span>
                    <span>·</span>
                    <span>
                      {p.isSamplePrototype
                        ? lang === 'ar'
                          ? 'بيانات تجريبية'
                          : 'Sample Prototype'
                        : lang === 'ar'
                        ? 'مشروع فعلي منشور'
                        : 'Verified Production'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{p.title[lang]}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {p.shortDescription[lang]}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleSampleFlag(p)}
                    className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-200 rounded-lg cursor-pointer"
                  >
                    {p.isSamplePrototype
                      ? lang === 'ar'
                        ? 'تحويل لمشروع فعلي'
                        : 'Mark as Production'
                      : lang === 'ar'
                      ? 'تحويل لنموذج تجريبي'
                      : 'Mark as Sample'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProject(p.id)}
                    aria-label="Delete project"
                    className="p-2 text-zinc-400 hover:text-red-400 bg-white/5 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HERO CONTENT */}
      {activeTab === 'hero' && heroForm && (
        <form
          onSubmit={handleSaveHero}
          className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-3xl space-y-5"
        >
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">
            {lang === 'ar'
              ? 'تعديل نصوص الواجهة الرئيسية (Hero Section)'
              : 'Edit Home Page Hero Content'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-300">العنوان الرئيسي (عربي)</label>
              <input
                type="text"
                value={heroForm.headline.ar}
                onChange={(e) =>
                  setHeroForm({
                    ...heroForm,
                    headline: { ...heroForm.headline, ar: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-sm text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-300">Main Headline (English)</label>
              <input
                type="text"
                dir="ltr"
                value={heroForm.headline.en}
                onChange={(e) =>
                  setHeroForm({
                    ...heroForm,
                    headline: { ...heroForm.headline, en: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-sm text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-zinc-300">الوصف الفرعي (عربي)</label>
            <textarea
              rows={2}
              value={heroForm.subheadline.ar}
              onChange={(e) =>
                setHeroForm({
                  ...heroForm,
                  subheadline: { ...heroForm.subheadline, ar: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-sm text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-zinc-300">Subheadline (English)</label>
            <textarea
              rows={2}
              dir="ltr"
              value={heroForm.subheadline.en}
              onChange={(e) =>
                setHeroForm({
                  ...heroForm,
                  subheadline: { ...heroForm.subheadline, en: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 bg-[#08090D] border border-white/15 rounded-xl text-sm text-white"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 text-xs sm:text-sm font-bold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'ar' ? 'حفظ التغييرات' : 'Save Hero Content'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
