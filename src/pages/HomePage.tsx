import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  Gamepad2,
  Globe,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import { InteractiveHornetHeroCore } from '../components/HornetLogo';
import { ProjectCard } from '../components/ProjectCard';
import { useStudio } from '../context/StudioContext';
import { ProjectCategory } from '../types/studio';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { lang, isRtl, t, hero, services, projects } = useStudio();
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProjectCategory>('all');

  const filteredProjects =
    selectedCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  const renderServiceIcon = (iconKey: string) => {
    switch (iconKey) {
      case 'gamepad':
        return <Gamepad2 className="w-6 h-6 text-[#F5B700]" />;
      case 'smartphone':
        return <Smartphone className="w-6 h-6 text-[#F5B700]" />;
      case 'cpu':
        return <Cpu className="w-6 h-6 text-[#F5B700]" />;
      case 'globe':
        return <Globe className="w-6 h-6 text-[#F5B700]" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#F5B700]" />;
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-12 overflow-hidden bg-hornet-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 2-Column Split Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Typographic Column */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="text-xs sm:text-sm font-medium text-[#F5B700]">
                {hero.studioTagline[lang]}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.15] text-balance">
                {hero.headline[lang]}
              </h1>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl">
                {hero.subheadline[lang]}
              </p>

              {/* Hero CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('/projects')}
                  className="px-6 py-3.5 text-sm font-semibold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{hero.primaryCta[lang]}</span>
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-[#13151D] hover:bg-[#1C1F2B] border border-white/15 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {hero.secondaryCta[lang]}
                </button>
              </div>

              {/* Quiet Technical Capabilities Summary */}
              <div className="pt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono-tabular">
                <span>Unity &amp; Unity 6</span>
                <span aria-hidden="true">·</span>
                <span>Android Native &amp; Cross-Platform</span>
                <span aria-hidden="true">·</span>
                <span>Full-Stack Web &amp; Custom Tools</span>
              </div>
            </div>

            {/* Interactive Visual Hornet Engine Core Column */}
            <div className="lg:col-span-6 flex">
              <InteractiveHornetHeroCore
                onNavigateProject={(slug) => onNavigate(`/projects/${slug}`)}
              />
            </div>
          </div>

          {/* Full-Width 4-Column Engineering Metric Bar Below Split */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-white/10">
            <div className="bg-[#0E1016] border border-white/10 rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-bold text-[#F5B700] font-mono-tabular">
                {t.hero.metric1Val}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-zinc-400">{t.hero.metric1Label}</div>
            </div>

            <div className="bg-[#0E1016] border border-white/10 rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono-tabular">
                {t.hero.metric2Val}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-zinc-400">{t.hero.metric2Label}</div>
            </div>

            <div className="bg-[#0E1016] border border-white/10 rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-bold text-[#F5B700] font-mono-tabular">
                {t.hero.metric3Val}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-zinc-400">{t.hero.metric3Label}</div>
            </div>

            <div className="bg-[#0E1016] border border-white/10 rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono-tabular">
                {t.hero.metric4Val}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-zinc-400">{t.hero.metric4Label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR SERVICES SECTION (Asymmetric Bento Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-semibold text-[#F5B700]">{t.servicesSection.kicker}</div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight text-balance">
              {t.servicesSection.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              {t.servicesSection.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/services')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#F5B700] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{t.servicesSection.viewAllServices}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const isMarquee = index === 0;
            return (
              <div
                key={service.id}
                onClick={() => onNavigate('/services')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('/services');
                  }
                }}
                tabIndex={0}
                role="button"
                className={`group bg-[#101218] border border-white/10 hover:border-[#F5B700]/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-colors cursor-pointer ${
                  isMarquee ? 'lg:col-span-2 bg-gradient-to-br from-[#12151E] to-[#0C0D12]' : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#070709] border border-white/10 flex items-center justify-center">
                      {renderServiceIcon(service.iconKey)}
                    </div>
                    <span className="text-sm font-mono-tabular text-zinc-500">
                      {service.number}.
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-[#F5B700] transition-colors">
                    {service.number}. {service.title[lang]}
                  </h3>

                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {service.shortDescription[lang]}
                  </p>

                  {isMarquee && (
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                      {service.detailedDescription[lang]}
                    </p>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs font-mono-tabular text-zinc-400">
                  {service.technologies.map((tech, idx) => (
                    <React.Fragment key={tech}>
                      {idx > 0 && <span aria-hidden="true">·</span>}
                      <span>{tech}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. OUR PROJECTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-semibold text-[#F5B700]">{t.projectsSection.kicker}</div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight text-balance">
              {t.projectsSection.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              {t.projectsSection.subtitle}
            </p>
          </div>

          {/* Interactive Category Filter Segmented Control */}
          <div
            role="tablist"
            aria-label={lang === 'ar' ? 'تصنيف المشاريع' : 'Filter Projects by Category'}
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0E1016] border border-white/10 rounded-xl self-start lg:self-auto"
          >
            {(['all', 'games', 'apps', 'web', 'tools'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#F5B700] text-[#070709] font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t.projectsSection.filters[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Explicit Transparency Disclaimer for Sample Showcase Data */}
        <div className="mb-8 px-4 py-3 rounded-xl bg-[#11131A] border border-white/10 text-xs text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{t.projectsSection.sampleDisclaimer}</span>
          <button
            type="button"
            onClick={() => onNavigate('/admin')}
            className="text-[#F5B700] font-semibold hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            {t.utility.studioCms}
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelectProject={(slug) => onNavigate(`/projects/${slug}`)}
            />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate('/projects')}
            className="px-6 py-3 text-sm font-semibold text-white bg-[#12141C] hover:bg-[#191C26] border border-white/15 rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{t.projectsSection.viewAllProjects}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* 4. WHY DABOURSTUDIO SECTION */}
      <section className="bg-[#0B0C11] border-y border-white/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2 mb-12">
            <div className="text-xs font-semibold text-[#F5B700]">{t.whySection.kicker}</div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight text-balance">
              {t.whySection.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              {t.whySection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.whySection.items.map((item, idx) => (
              <div
                key={item.num}
                className={`bg-[#11131B] border border-white/10 rounded-2xl p-6 space-y-3 ${
                  idx === 4 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                <div className="text-sm font-mono-tabular font-semibold text-[#F5B700]">
                  {item.num}.
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WORK PROCESS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-2 mb-12">
          <div className="text-xs font-semibold text-[#F5B700]">{t.processSection.kicker}</div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight text-balance">
            {t.processSection.title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            {t.processSection.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {t.processSection.steps.map((stepItem) => (
            <div
              key={stepItem.step}
              className="bg-[#101218] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-2xl font-bold font-mono-tabular text-[#F5B700]">
                  {stepItem.step}
                </span>
                <span className="text-xs font-mono-tabular text-zinc-500">STAGE</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">{stepItem.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{stepItem.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO COLLABORATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-[#141620] via-[#0F1118] to-[#090A0E] border border-[#F5B700]/40 rounded-2xl p-8 sm:p-12 lg:p-16 overflow-hidden">
          <div className="absolute inset-0 bg-hex-grid opacity-50 pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="text-xs font-mono-tabular text-[#F5B700]">
                DabourStudio | دبور ستيديو
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight text-balance">
                {t.ctaSection.title}
              </h2>
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                {t.ctaSection.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="px-7 py-4 text-sm sm:text-base font-bold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] rounded-xl transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer"
            >
              <span>{t.ctaSection.button}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
