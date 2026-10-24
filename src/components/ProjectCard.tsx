import { ArrowLeft, ArrowRight } from 'lucide-react';
import React from 'react';
import { useStudio } from '../context/StudioContext';
import { StudioProject } from '../types/studio';
import { ResilientImage } from './ResilientImage';

interface ProjectCardProps {
  project: StudioProject;
  onSelectProject: (slug: string) => void;
  featuredSpan?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelectProject,
  featuredSpan = false,
}) => {
  const { lang, isRtl, t } = useStudio();

  const categoryLabel = t.projectsSection.filters[project.category];
  const statusLabel = t.projectsSection.statusLabels[project.status];
  const sampleLabel = project.isSamplePrototype
    ? t.projectsSection.sampleLabel
    : t.projectsSection.liveProjectLabel;

  return (
    <article
      onClick={() => onSelectProject(project.slug)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectProject(project.slug);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${project.title[lang]} — ${t.projectsSection.viewProjectDetails}`}
      className={`group bg-[#101218] border border-white/10 hover:border-[#F5B700]/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700] ${
        featuredSpan ? 'lg:col-span-2' : 'col-span-1'
      }`}
    >
      <div>
        {/* Media Frame */}
        <div className="relative aspect-[16/10] w-full bg-[#090A0E] overflow-hidden border-b border-white/10">
          <ResilientImage
            src={project.coverImage}
            alt={project.title[lang]}
            fallbackLabel={project.title[lang]}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709]/85 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-3">
          {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="text-[#F5B700] font-medium">{categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{statusLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{project.year}</span>
            <span aria-hidden="true">·</span>
            <span className="text-zinc-500">{sampleLabel}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#F5B700] transition-colors">
            {project.title?.[lang]}
          </h3>

          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
            {project.shortDescription?.[lang]}
          </p>
        </div>
      </div>

      {/* Footer Tech Stack & Action */}
      <div className="px-6 pb-6 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono-tabular text-zinc-400">
          {project.technologies.slice(0, 4).map((tech, idx) => (
            <React.Fragment key={tech}>
              {idx > 0 && <span aria-hidden="true">·</span>}
              <span>{tech}</span>
            </React.Fragment>
          ))}
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F5B700] group-hover:underline whitespace-nowrap shrink-0">
          <span>{t.projectsSection.viewProjectDetails}</span>
          {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
        </span>
      </div>
    </article>
  );
};
