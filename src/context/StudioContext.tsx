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

function normalizeHeroState(incoming: any): HeroContent {
  const def = initialStudioData.hero;
  if (!incoming || typeof incoming !== 'object') return def;
  return {
    headline: incoming.headline || def.headline,
    subheadline: incoming.subheadline || def.subheadline,
    primaryCta: incoming.primaryCta || incoming.primary_cta || def.primaryCta,
    secondaryCta: incoming.secondaryCta || incoming.secondary_cta || def.secondaryCta,
    studioTagline: incoming.studioTagline || incoming.studio_tagline || def.studioTagline,
  };
}

function normalizeProjectsState(incoming: any[]): StudioProject[] {
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return initialStudioData.projects;
  }
  return incoming.map((p, idx) => {
    const def = initialStudioData.projects[idx] || initialStudioData.projects[0];
    return {
      id: p.id || def.id,
      slug: p.slug || def.slug,
      category: p.category || def.category,
      status: p.status || def.status,
      isSamplePrototype: p.isSamplePrototype ?? p.is_sample_prototype ?? def.isSamplePrototype,
      featured: p.featured ?? def.featured,
      coverImage: p.coverImage || p.cover_image || def.coverImage,
      galleryImages: Array.isArray(p.galleryImages || p.gallery_images)
        ? (p.galleryImages || p.gallery_images)
        : def.galleryImages,
      title: p.title || def.title,
      shortDescription: p.shortDescription || p.short_description || def.shortDescription,
      fullDescription: p.fullDescription || p.full_description || def.fullDescription,
      challenge: p.challenge || def.challenge,
      architecture: p.architecture || def.architecture,
      technologies: Array.isArray(p.technologies) ? p.technologies : def.technologies,
      targetPlatforms: Array.isArray(p.targetPlatforms || p.target_platforms)
        ? (p.targetPlatforms || p.target_platforms)
        : def.targetPlatforms,
      year: p.year || def.year,
      metrics: Array.isArray(p.metrics) ? p.metrics : def.metrics,
      milestones: Array.isArray(p.milestones) ? p.milestones : def.milestones,
    };
  });
}

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
        if (data.hero) setHero(normalizeHeroState(data.hero));
        if (Array.isArray(data.services) && data.services.length > 0) setServices(data.services);
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(normalizeProjectsState(data.projects));
        }
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
    t: uiTranslations[lang] || uiTranslations.ar,
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
