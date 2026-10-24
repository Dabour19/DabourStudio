import { Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { useStudio } from '../context/StudioContext';
import { ProjectCategory } from '../types/studio';

interface ProjectsPageProps {
  onNavigate: (path: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const { lang, t, projects } = useStudio();
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProjectCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        selectedCategory === 'all' || project.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        project.title.ar.toLowerCase().includes(q) ||
        project.title.en.toLowerCase().includes(q) ||
        project.shortDescription.ar.toLowerCase().includes(q) ||
        project.shortDescription.en.toLowerCase().includes(q) ||
        project.technologies.some((tech) => tech.toLowerCase().includes(q))
      );
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
      {/* Header */}
      <div className="space-y-4 border-b border-white/10 pb-8">
        <div className="text-xs font-semibold text-[#F5B700]">{t.projectsSection.kicker}</div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight text-balance">
          {t.projectsSection.title}
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          {t.projectsSection.subtitle}
        </p>
      </div>

      {/* Transparency Notice */}
      <div className="px-5 py-4 rounded-xl bg-[#101218] border border-white/10 text-xs sm:text-sm text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span>{t.projectsSection.sampleDisclaimer}</span>
        <button
          type="button"
          onClick={() => onNavigate('/admin')}
          className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#F5B700] font-semibold text-xs whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
        >
          {t.utility.studioCms}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label={lang === 'ar' ? 'تصنيف المشاريع' : 'Filter Projects'}
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0E1016] border border-white/10 rounded-xl self-start"
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

        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.projectsSection.searchPlaceholder}
            className="w-full ps-10 pe-9 py-2.5 bg-[#0E1016] border border-white/10 focus:border-[#F5B700] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute top-1/2 -translate-y-1/2 end-3 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="bg-[#101218] border border-white/10 rounded-2xl p-12 text-center space-y-4">
          <p className="text-base text-zinc-300">{t.projectsSection.noProjectsFound}</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-semibold text-[#070709] bg-[#F5B700] rounded-lg cursor-pointer"
          >
            {t.projectsSection.resetFilters}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelectProject={(slug) => onNavigate(`/projects/${slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
