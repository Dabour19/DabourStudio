import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { StudioProvider, useStudio } from './context/StudioContext';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage, PrivacyPage } from './pages/PrivacyAndNotFound';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ServicesPage } from './pages/ServicesPage';

const AppRouter: React.FC = () => {
  const { lang, projects } = useStudio();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const navigate = useCallback((path: string) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic SEO Title per Route & Language
  useEffect(() => {
    const brand = 'DabourStudio | دبور ستيديو';
    if (currentPath === '/') {
      document.title =
        lang === 'ar'
          ? `${brand} — تطوير الألعاب والبرمجيات المتقدمة`
          : `${brand} — Unity 6 Game & Software Development Studio`;
    } else if (currentPath === '/services') {
      document.title =
        lang === 'ar' ? `خدماتنا — ${brand}` : `Our Services — ${brand}`;
    } else if (currentPath === '/projects') {
      document.title =
        lang === 'ar' ? `معرض المشاريع — ${brand}` : `Projects Portfolio — ${brand}`;
    } else if (currentPath.startsWith('/projects/')) {
      const slug = currentPath.replace('/projects/', '');
      const found = projects.find((p) => p.slug === slug);
      const projTitle = found?.title?.[lang] || found?.title?.ar || slug;
      document.title = `${projTitle} — ${brand}`;
    } else if (currentPath === '/about') {
      document.title =
        lang === 'ar' ? `من نحن — ${brand}` : `About Us — ${brand}`;
    } else if (currentPath === '/contact') {
      document.title =
        lang === 'ar' ? `تواصل معنا — ${brand}` : `Contact Us — ${brand}`;
    } else if (currentPath === '/privacy') {
      document.title =
        lang === 'ar' ? `سياسة الخصوصية — ${brand}` : `Privacy Policy — ${brand}`;
    } else if (currentPath === '/admin') {
      document.title =
        lang === 'ar' ? `لوحة الإدارة — ${brand}` : `Studio CMS — ${brand}`;
    } else {
      document.title = `404 — ${brand}`;
    }

    const canonicalUrl = `https://dabourstudio.dev${currentPath === '/' ? '/' : currentPath}`;
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    }
    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    if (ogUrlMeta) {
      ogUrlMeta.setAttribute('content', canonicalUrl);
    }
  }, [currentPath, lang, projects]);

  const renderPage = () => {
    if (currentPath === '/') {
      return <HomePage onNavigate={navigate} />;
    }
    if (currentPath === '/services') {
      return <ServicesPage onNavigate={navigate} />;
    }
    if (currentPath === '/projects') {
      return <ProjectsPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/projects/')) {
      const slug = currentPath.slice('/projects/'.length);
      return <ProjectDetailPage slug={slug} onNavigate={navigate} />;
    }
    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage />;
    }
    if (currentPath === '/privacy') {
      return <PrivacyPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin') {
      return <AdminPage />;
    }
    return <NotFoundPage onNavigate={navigate} />;
  };

  return (
    <Layout currentPath={currentPath} onNavigate={navigate}>
      {renderPage()}
    </Layout>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <AppRouter />
    </StudioProvider>
  );
}
