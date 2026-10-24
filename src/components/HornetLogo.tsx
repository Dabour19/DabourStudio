import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';

export const HornetMark: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M32 4L56 17.8V45.5L32 59.3L8 45.5V17.8L32 4Z"
      fill="#111216"
      stroke="#F5B700"
      strokeWidth="2.2"
      strokeOpacity="0.65"
    />
    {/* Upper Geometric Wings */}
    <path d="M32 13L49 22.5L39 30L32 25.5L25 30L15 22.5L32 13Z" fill="#F5B700" />
    {/* Thorax Armored Plate */}
    <path d="M21 31.5L32 27.5L43 31.5L39.5 40L32 43.5L24.5 40L21 31.5Z" fill="#FAFAFA" />
    {/* Precision Stinger */}
    <path d="M25.5 43L32 46.5L38.5 43L32 54.5L25.5 43Z" fill="#F5B700" />
    {/* Digital Pixel Nodes */}
    <rect x="12" y="29.5" width="4" height="4" fill="#F5B700" />
    <rect x="48" y="29.5" width="4" height="4" fill="#F5B700" />
  </svg>
);

export const InteractiveHornetHeroCore: React.FC<{
  onNavigateProject: (slug: string) => void;
}> = ({ onNavigateProject }) => {
  const { lang, t } = useStudio();
  const [activeLayer, setActiveLayer] = useState<'unity' | 'android' | 'web'>('unity');
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setPointerOffset({ x: normX, y: normY });
  };

  const handlePointerLeave = () => {
    setPointerOffset({ x: 0, y: 0 });
  };

  const layerSpecs = {
    unity: {
      title: lang === 'ar' ? 'نواة تطوير الألعاب — Unity 6' : 'Game Engine Core — Unity 6',
      detail:
        lang === 'ar'
          ? 'تطوير ألعاب 2D و3D متكاملة مع إضاءة URP/HDRP، فيزياء مخصصة، وذكاء اصطناعي تكتيكي.'
          : 'Full-cycle 2D & 3D game architecture with URP/HDRP shaders, custom physics, and tactical AI.',
      projectSlug: 'sector-vespula-unity6',
      cta: lang === 'ar' ? 'معاينة نموذج لعبة Unity 6' : 'Inspect Unity 6 Prototype',
      metrics: 'Unity 6 · C# · Shader Graph · 60+ FPS',
    },
    android: {
      title: lang === 'ar' ? 'منظومة تطبيقات الهواتف — Android' : 'Mobile Engineering — Android',
      detail:
        lang === 'ar'
          ? 'تطبيقات Android سريعة وعملية بواجهات Jetpack Compose ومزامنة ذكية دون اتصال.'
          : 'High-speed Android applications built with Kotlin, Jetpack Compose, and offline-first sync.',
      projectSlug: 'hivepulse-field-android',
      cta: lang === 'ar' ? 'معاينة نموذج تطبيق Android' : 'Inspect Android Prototype',
      metrics: 'Kotlin · Jetpack Compose · Room DB',
    },
    web: {
      title: lang === 'ar' ? 'منصات الويب والأنظمة الذكية' : 'Full-Stack Web & Smart Systems',
      detail:
        lang === 'ar'
          ? 'تطبيقات ويب حديثة وأدوات برمجية مخصصة بسرعات تحميل فائقة وتجربة ثنائية اللغة.'
          : 'Responsive web platforms and developer tools engineered with React, TypeScript, and Node.js.',
      projectSlug: 'qafilah-cloud-platform',
      cta: lang === 'ar' ? 'معاينة نموذج منصة الويب' : 'Inspect Web Platform',
      metrics: 'React 19 · TypeScript · Node.js · REST API',
    },
  };

  const currentSpec = layerSpecs[activeLayer];

  return (
    <div
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="relative w-full h-full min-h-[420px] bg-[#0D0E13] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Subtle Architectural Hex Grid */}
      <div className="absolute inset-0 bg-hex-grid opacity-75 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5B700]/5 via-transparent to-[#070709]/90 pointer-events-none" />

      {/* Top Interactive Mode Switcher inside Hero Canvas */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <span className="text-xs font-mono-tabular text-zinc-400">
          DabourStudio · {lang === 'ar' ? 'معاينة النواة التفاعلية' : 'Interactive Studio Core'}
        </span>
        <div className="flex items-center gap-1 p-1 bg-[#070709] border border-white/10 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveLayer('unity')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeLayer === 'unity'
                ? 'bg-[#F5B700] text-[#070709] font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Unity 6
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('android')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeLayer === 'android'
                ? 'bg-[#F5B700] text-[#070709] font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Android
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('web')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeLayer === 'web'
                ? 'bg-[#F5B700] text-[#070709] font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'الويب والبرمجيات' : 'Web & Systems'}
          </button>
        </div>
      </div>

      {/* Center Geometric Hornet & Hexagonal Hive Visualizer */}
      <div className="relative z-10 my-4 flex items-center justify-center py-4">
        <div
          style={{
            transform: `translate3d(${pointerOffset.x}px, ${pointerOffset.y}px, 0)`,
          }}
          className="transition-transform duration-150 ease-out"
        >
          <svg
            viewBox="0 0 360 240"
            className="w-full max-w-[340px] h-auto drop-shadow-[0_0_30px_rgba(245,183,0,0.18)]"
            role="img"
            aria-label="DabourStudio Geometric Hornet Emblem"
          >
            {/* Outer Satellite Hexagons */}
            <g stroke="#27272A" strokeWidth="1.5" fill="#11131A">
              <polygon points="75,70 105,52 135,70 135,105 105,122 75,105" />
              <polygon points="225,70 255,52 285,70 285,105 255,122 225,105" />
              <polygon points="75,140 105,122 135,140 135,175 105,192 75,175" />
              <polygon points="225,140 255,122 285,140 285,175 255,192 225,175" />
            </g>

            {/* Connecting Energy Traces */}
            <g stroke="#F5B700" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6">
              <line x1="105" y1="87" x2="180" y2="120" />
              <line x1="255" y1="87" x2="180" y2="120" />
              <line x1="105" y1="157" x2="180" y2="120" />
              <line x1="255" y1="157" x2="180" y2="120" />
            </g>

            {/* Central Hexagonal Shield */}
            <polygon
              points="180,26 258,71 258,161 180,206 102,161 102,71"
              fill="#0A0B0F"
              stroke="#F5B700"
              strokeWidth="2.5"
            />
            <polygon
              points="180,42 244,79 244,153 180,190 116,153 116,79"
              fill="#12141C"
              stroke="#3F3F46"
              strokeWidth="1"
            />

            {/* Geometric Hornet Sculpture */}
            {/* Upper Wings */}
            <path
              d="M180 58 L236 90 L202 114 L180 98 L158 114 L124 90 Z"
              fill={activeLayer === 'unity' ? '#F5B700' : '#E4E4E7'}
            />
            {/* Lower Wings */}
            <path
              d="M136 106 L165 118 L155 134 L128 122 Z"
              fill="#F5B700"
              fillOpacity="0.7"
            />
            <path
              d="M224 106 L195 118 L205 134 L232 122 Z"
              fill="#F5B700"
              fillOpacity="0.7"
            />
            {/* Armored Thorax */}
            <path
              d="M152 117 L180 104 L208 117 L198 144 L180 154 L162 144 Z"
              fill="#FAFAFA"
            />
            {/* Hornet Stinger */}
            <path
              d="M164 152 L180 162 L196 152 L180 184 Z"
              fill="#F5B700"
            />
            {/* Digital Pixel Clusters */}
            <rect x="92" y="114" width="6" height="6" fill="#F5B700" />
            <rect x="262" y="114" width="6" height="6" fill="#F5B700" />
            <rect x="177" y="14" width="6" height="6" fill="#F5B700" />
          </svg>
        </div>
      </div>

      {/* Bottom Active Architecture Readout Card */}
      <div className="relative z-10 bg-[#12141C] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono-tabular text-[#F5B700]">{currentSpec.metrics}</div>
          <h3 className="text-sm font-semibold text-white">{currentSpec.title}</h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-md">{currentSpec.detail}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateProject(currentSpec.projectSlug)}
          className="px-3.5 py-2 text-xs font-semibold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {currentSpec.cta}
        </button>
      </div>

      <p className="relative z-10 mt-3 text-[11px] text-zinc-500 text-center">
        {t.hero.interactiveHint}
      </p>
    </div>
  );
};
