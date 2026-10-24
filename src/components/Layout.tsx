import { Globe, Menu, ShieldCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { HoneycombCursor } from './HoneycombCursor';
import { HornetMark } from './HornetLogo';

interface LayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentPath, onNavigate, children }) => {
  const { lang, toggleLang, t } = useStudio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: t.nav.home },
    { path: '/services', label: t.nav.services },
    { path: '/projects', label: t.nav.projects },
    { path: '/about', label: t.nav.about },
    { path: '/contact', label: t.nav.contact },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const isPathActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-[#FAFAFA] selection:bg-[#F5B700] selection:text-[#070709]">
      <HoneycombCursor />

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#070709]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <a
            href="/"
            onClick={(e) => handleNavClick(e, '/')}
            className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-white hover:text-[#F5B700] transition-colors whitespace-nowrap shrink-0"
          >
            <HornetMark className="w-7 h-7 shrink-0" />
            <span>DabourStudio | دبور ستيديو</span>
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav
            aria-label={lang === 'ar' ? 'التنقل الرئيسي' : 'Main Navigation'}
            className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300"
          >
            {navItems.map((item) => {
              const active = isPathActive(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    active
                      ? 'text-[#F5B700] border-[#F5B700]'
                      : 'text-zinc-300 border-transparent hover:text-white hover:border-white/40'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action (+ Mobile Menu Button on small screens) */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/contact"
              onClick={(e) => handleNavClick(e, '/contact')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.startProject}
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={lang === 'ar' ? 'فتح القائمة' : 'Toggle Menu'}
              className="md:hidden p-2 text-zinc-300 hover:text-white rounded-lg border border-white/10 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Workspace & Language Toolbar below the Top Bar */}
      <div className="bg-[#0C0D12] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="hidden sm:flex items-center gap-2">
            <span>{t.utility.specialtyNote}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="Switch Language / تبديل اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-[#F5B700]" />
              <span>{t.utility.currentLangLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#F5B700]">{t.utility.switchLang}</span>
            </button>

            <a
              href="/admin"
              onClick={(e) => handleNavClick(e, '/admin')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentPath === '/admin'
                  ? 'bg-[#F5B700]/20 text-[#F5B700] font-semibold'
                  : 'hover:text-white text-zinc-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#F5B700]" />
              <span>{t.utility.studioCms}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D0E14] border-b border-white/10 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const active = isPathActive(item.path);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-[#F5B700]/15 text-[#F5B700]'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Studio Footer */}
      <footer className="bg-[#050507] border-t border-white/10 pt-16 pb-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            {/* Brand & Bio */}
            <div className="lg:col-span-5 space-y-4">
              <a
                href="/"
                onClick={(e) => handleNavClick(e, '/')}
                className="inline-flex items-center gap-2.5 text-lg font-bold text-white"
              >
                <HornetMark className="w-7 h-7" />
                <span>DabourStudio | دبور ستيديو</span>
              </a>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-md">{t.footer.bio}</p>
              <div className="text-xs text-zinc-500 font-mono-tabular pt-1">
                Unity 6 · Android SDK · React &amp; TypeScript · Custom Systems
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-semibold text-white">{t.footer.quickLinks}</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <a
                      href={item.path}
                      onClick={(e) => handleNavClick(e, item.path)}
                      className="hover:text-[#F5B700] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-sm font-semibold text-white">{t.footer.servicesLinks}</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <a
                    href="/services"
                    onClick={(e) => handleNavClick(e, '/services')}
                    className="hover:text-[#F5B700] transition-colors"
                  >
                    {lang === 'ar' ? 'تطوير الألعاب (Unity & Unity 6)' : 'Unity & Unity 6 Game Development'}
                  </a>
                </li>
                <li>
                  <a
                    href="/services"
                    onClick={(e) => handleNavClick(e, '/services')}
                    className="hover:text-[#F5B700] transition-colors"
                  >
                    {lang === 'ar' ? 'تطوير تطبيقات Android' : 'Android Mobile Applications'}
                  </a>
                </li>
                <li>
                  <a
                    href="/services"
                    onClick={(e) => handleNavClick(e, '/services')}
                    className="hover:text-[#F5B700] transition-colors"
                  >
                    {lang === 'ar' ? 'تطوير البرمجيات والأنظمة المخصصة' : 'Custom Software Engineering'}
                  </a>
                </li>
                <li>
                  <a
                    href="/services"
                    onClick={(e) => handleNavClick(e, '/services')}
                    className="hover:text-[#F5B700] transition-colors"
                  >
                    {lang === 'ar' ? 'تطوير مواقع وتطبيقات الويب' : 'Full-Stack Web Platforms'}
                  </a>
                </li>
              </ul>
            </div>

            {/* System & Legal */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-semibold text-white">{t.footer.legalAndAdmin}</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <a
                    href="/privacy"
                    onClick={(e) => handleNavClick(e, '/privacy')}
                    className="hover:text-[#F5B700] transition-colors"
                  >
                    {t.footer.privacyPolicy}
                  </a>
                </li>
                <li>
                  <a
                    href="/admin"
                    onClick={(e) => handleNavClick(e, '/admin')}
                    className="hover:text-[#F5B700] transition-colors"
                  >
                    {t.footer.adminPortal}
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={toggleLang}
                    className="text-zinc-400 hover:text-[#F5B700] transition-colors cursor-pointer"
                  >
                    {lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>{t.footer.copyright}</p>
            <div className="flex items-center gap-3">
              <span className="text-[#F5B700] font-mono-tabular">dabourstudio.dev</span>
              <span aria-hidden="true">·</span>
              <a
                href="mailto:H.Dabour19@gmail.com"
                className="hover:text-zinc-300 transition-colors font-mono-tabular"
              >
                H.Dabour19@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
