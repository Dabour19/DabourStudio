import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { initialStudioData } from '../data/initialStudioData';
import { uiTranslations } from '../data/translations';
import { HeroContent, Language, StudioProject, StudioService } from '../types/studio';

interface StudioContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  isRtl: boolean;
  t: typeof uiTranslations.ar;
  hero: HeroContent;
  services: StudioService[];
  projects: StudioProject[];
  loading: boolean;
  refreshStudioData: () => Promise<void>;
}

const StudioContext = createContext<StudioContextValue | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('dabour_lang');
      return saved === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  });

  const [hero, setHero] = useState<HeroContent>(initialStudioData.hero);
  const [services, setServices] = useState<StudioService[]>(initialStudioData.services);
  const [projects, setProjects] = useState<StudioProject[]>(initialStudioData.projects);
  const [loading, setLoading] = useState<boolean>(true);

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    try {
      localStorage.setItem('dabour_lang', nextLang);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }, [lang, setLang]);

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const refreshStudioData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/studio');
      if (res.ok) {
        const data = await res.json();
        if (data.hero) setHero(data.hero);
        if (Array.isArray(data.services)) setServices(data.services);
        if (Array.isArray(data.projects)) setProjects(data.projects);
      }
    } catch {
      // Fallback to initialStudioData already loaded in state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStudioData();
  }, [refreshStudioData]);

  const value: StudioContextValue = {
    lang,
    setLang,
    toggleLang,
    isRtl: lang === 'ar',
    t: uiTranslations[lang],
    hero,
    services,
    projects,
    loading,
    refreshStudioData,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
};

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return ctx;
}
