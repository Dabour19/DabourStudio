export type Language = 'ar' | 'en';

export type ProjectCategory = 'games' | 'apps' | 'web' | 'tools';

export type ProjectStatus = 'prototype' | 'in_development' | 'completed_concept' | 'production';

export interface BilingualText {
  ar: string;
  en: string;
}

export interface ProjectMetric {
  label: BilingualText;
  value: string;
}

export interface ProjectMilestone {
  phase: BilingualText;
  detail: BilingualText;
  completed: boolean;
}

export interface StudioProject {
  id: string;
  slug: string;
  category: ProjectCategory;
  status: ProjectStatus;
  isSamplePrototype: boolean;
  featured: boolean;
  coverImage: string;
  galleryImages: string[];
  title: BilingualText;
  shortDescription: BilingualText;
  fullDescription: BilingualText;
  challenge: BilingualText;
  architecture: BilingualText;
  technologies: string[];
  targetPlatforms: string[];
  year: string;
  metrics: ProjectMetric[];
  milestones: ProjectMilestone[];
}

export interface StudioService {
  id: string;
  number: string;
  iconKey: 'gamepad' | 'smartphone' | 'cpu' | 'globe' | 'sparkles';
  title: BilingualText;
  shortDescription: BilingualText;
  detailedDescription: BilingualText;
  deliverables: {
    ar: string[];
    en: string[];
  };
  technologies: string[];
}

export interface HeroContent {
  headline: BilingualText;
  subheadline: BilingualText;
  primaryCta: BilingualText;
  secondaryCta: BilingualText;
  studioTagline: BilingualText;
}

export interface ContactSubmission {
  id: string;
  referenceCode: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  details: string;
  status: 'new' | 'reviewed' | 'in_discussion' | 'archived';
  createdAt: string;
}

export interface StudioDatabase {
  hero: HeroContent;
  services: StudioService[];
  projects: StudioProject[];
  contacts: ContactSubmission[];
}
