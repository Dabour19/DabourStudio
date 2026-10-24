import { ArrowLeft, ArrowRight, CheckCircle2, Layers } from 'lucide-react';
import React, { useState } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { ResilientImage } from '../components/ResilientImage';
import { useStudio } from '../context/StudioContext';

interface ProjectDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ slug, onNavigate }) => {
  const { lang, isRtl, t, projects } = useStudio();
  const project = projects.find((p) => p.slug === slug);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center space-y-6">
        <div className="text-sm font-mono-tabular text-[#F5B700]">404 · PROJECT NOT FOUND</div>
        <h1 className="text-3xl font-bold text-white">
          {lang === 'ar' ? 'المشروع المطلوب غير موجود' : 'Requested Project Not Found'}
        </h1>
        <p className="text-sm text-zinc-400">
          {lang === 'ar'
            ? 'قد يكون قد تم تعديل رابط المشروع أو حذفه من معرض المشاريع.'
            : 'The project slug may have been updated or removed from the studio portfolio.'}
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/projects')}
          className="px-5 py-2.5 text-sm font-semibold text-[#070709] bg-[#F5B700] rounded-xl cursor-pointer"
        >
          {t.projectsSection.viewAllProjects}
        </button>
      </div>
    );
  }

  const gallery =
    project.galleryImages && project.galleryImages.length > 0
      ? project.galleryImages
      : [project.coverImage];
  const currentImage = gallery[activeImageIndex] || project.coverImage;

  const relatedProjects = projects
    .filter((p) => p.id !== project.id && p.category === project.category)
    .slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">
      {/* Back Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={() => onNavigate('/projects')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-400 hover:text-[#F5B700] transition-colors cursor-pointer"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t.projectsSection.viewAllProjects}</span>
        </button>
      </div>

      {/* Top Project Header */}
      <div className="space-y-4 border-b border-white/10 pb-8">
        {/* Clean Unboxed Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-zinc-400">
          <span className="text-[#F5B700] font-semibold">
            {t.projectsSection.filters[project.category]}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t.projectsSection.statusLabels[project.status]}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">{project.year}</span>
          <span aria-hidden="true">·</span>
          <span className="text-zinc-300">
            {project.isSamplePrototype
              ? t.projectsSection.sampleLabel
              : t.projectsSection.liveProjectLabel}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight text-balance">
          {project.title?.[lang]}
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 max-w-3xl leading-relaxed">
          {project.shortDescription?.[lang]}
        </p>
      </div>

      {/* Showcase Media Viewer & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Image & Thumbnails */}
        <div className="lg:col-span-8 space-y-4">
          <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#0A0B10] border border-white/10">
            <ResilientImage
              src={currentImage}
              alt={project.title?.[lang] || project.title?.ar || ''}
              fallbackLabel={project.title?.[lang] || project.title?.ar || ''}
              className="w-full h-full object-cover"
            />
          </div>

          {gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={imgUrl + idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-28 aspect-[16/10] rounded-lg overflow-hidden border-2 transition-colors shrink-0 cursor-pointer ${
                    activeImageIndex === idx ? 'border-[#F5B700]' : 'border-white/10 opacity-65 hover:opacity-100'
                  }`}
                >
                  <ResilientImage
                    src={imgUrl}
                    alt={`${project.title?.[lang] || ''} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Technical Specifications Sidebar */}
        <div className="lg:col-span-4 bg-[#101218] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="space-y-1 border-b border-white/10 pb-4">
            <div className="text-xs font-mono-tabular text-[#F5B700]">TECHNICAL SPECS</div>
            <h2 className="text-lg font-bold text-white">
              {lang === 'ar' ? 'المواصفات والبيانات التقنية' : 'Engineering Specifications'}
            </h2>
          </div>

          {/* Metrics */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {project.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-[#0A0B0F] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <span className="text-xs text-zinc-400">{m.label?.[lang] || m.label?.ar || ''}</span>
                  <span className="text-base font-bold text-[#F5B700] font-mono-tabular">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Technologies */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-400">
              {lang === 'ar' ? 'التقنيات والأدوات المستخدمة:' : 'Technology Stack:'}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular text-white">
              {project.technologies.map((tech, idx) => (
                <React.Fragment key={tech}>
                  {idx > 0 && <span className="text-zinc-600">·</span>}
                  <span>{tech}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Target Platforms */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-400">
              {lang === 'ar' ? 'المنصات المستهدفة:' : 'Target Platforms:'}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular text-zinc-300">
              {project.targetPlatforms.map((plat, idx) => (
                <React.Fragment key={plat}>
                  {idx > 0 && <span className="text-zinc-600">·</span>}
                  <span>{plat}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* CTA to request a similar project */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="w-full py-3 px-4 text-xs sm:text-sm font-bold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] rounded-xl transition-colors cursor-pointer"
            >
              {lang === 'ar'
                ? 'اطلب تطوير مشروع مشابه معنا'
                : 'Request a Similar Project With Us'}
            </button>
          </div>
        </div>
      </div>

      {/* Deep-Dive Architecture & Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-3">
          <div className="text-xs font-mono-tabular text-[#F5B700]">01. OVERVIEW</div>
          <h3 className="text-lg font-bold text-white">
            {lang === 'ar' ? 'نظرة شاملة على المشروع' : 'Project Overview'}
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed">{project.fullDescription?.[lang]}</p>
        </div>

        <div className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-3">
          <div className="text-xs font-mono-tabular text-[#F5B700]">02. CHALLENGE</div>
          <h3 className="text-lg font-bold text-white">
            {lang === 'ar' ? 'التحدي الهندسي والأداء' : 'Engineering Challenge'}
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed">{project.challenge?.[lang]}</p>
        </div>

        <div className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-3">
          <div className="text-xs font-mono-tabular text-[#F5B700]">03. ARCHITECTURE</div>
          <h3 className="text-lg font-bold text-white">
            {lang === 'ar' ? 'المعمارية البرمجية المعتمدة' : 'System Architecture'}
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed">{project.architecture?.[lang]}</p>
        </div>
      </div>

      {/* Engineering Milestones */}
      {project.milestones && project.milestones.length > 0 && (
        <div className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#F5B700]" />
            <h2 className="text-xl font-bold text-white">
              {lang === 'ar' ? 'مراحل بناء وتطوير النموذج' : 'Development Milestones'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.milestones.map((ms, idx) => (
              <div
                key={idx}
                className="bg-[#0B0C11] border border-white/10 rounded-xl p-5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono-tabular text-[#F5B700]">
                  <span>PHASE 0{idx + 1}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#F5B700]" />
                </div>
                <h4 className="text-sm font-bold text-white">{ms.phase?.[lang] || ms.phase?.ar || ''}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{ms.detail?.[lang] || ms.detail?.ar || ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {lang === 'ar' ? 'مشاريع أخرى ذات صلة' : 'Related Studio Projects'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedProjects.map((rel) => (
              <ProjectCard
                key={rel.id}
                project={rel}
                onSelectProject={(nextSlug) => {
                  setActiveImageIndex(0);
                  onNavigate(`/projects/${nextSlug}`);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
