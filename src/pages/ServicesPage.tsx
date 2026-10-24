import {
  ArrowLeft,
  ArrowRight,
  Check,
  Cpu,
  Gamepad2,
  Globe,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';

interface ServicesPageProps {
  onNavigate: (path: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const { lang, isRtl, t, services } = useStudio();
  const [selectedScope, setSelectedScope] = useState<'game' | 'mobile' | 'web' | 'tool'>('game');

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

  const scopeRecommendations = {
    game: {
      title: lang === 'ar' ? 'تطوير لعبة فيديو (Unity / Unity 6)' : 'Unity 6 Video Game Production',
      stack: 'Unity 6 · C# · URP/HDRP · Shader Graph · Netcode',
      duration: lang === 'ar' ? '4 – 16 أسبوعًا (حسب النطاق)' : '4 – 16 Weeks (Scope Dependent)',
      deliverables:
        lang === 'ar'
          ? 'نسخة قابلة للعب (Playable Build)، الكود المصدري المنظم، ووثيقة تصميم الأنظمة (GDD).'
          : 'Playable multi-platform build, modular C# source repository, and technical design documentation.',
    },
    mobile: {
      title: lang === 'ar' ? 'تطبيق هاتف ذكي (Android)' : 'Android Mobile Application',
      stack: 'Kotlin · Jetpack Compose · Room DB · REST API',
      duration: lang === 'ar' ? '4 – 10 أسابيع' : '4 – 10 Weeks',
      deliverables:
        lang === 'ar'
          ? 'حزمة APK / AAB جاهزة للنشر على Google Play، مع دعم العمل دون اتصال وواجهة ثنائية اللغة.'
          : 'Signed Play Store AAB/APK bundle, offline sync architecture, and bilingual RTL/LTR UI.',
    },
    web: {
      title: lang === 'ar' ? 'موقع إلكتروني أو منصة ويب متكاملة' : 'Full-Stack Web Platform',
      stack: 'React 19 · TypeScript · Tailwind CSS · Node.js / Express',
      duration: lang === 'ar' ? '2 – 8 أسابيع' : '2 – 8 Weeks',
      deliverables:
        lang === 'ar'
          ? 'منصة ويب متجاوبة وسريعة، تهيئة محركات البحث (SEO)، ولوحة إدارة محتوى آمنة.'
          : 'High-speed responsive web application, technical SEO & Schema.org metadata, and admin portal.',
    },
    tool: {
      title: lang === 'ar' ? 'أداة برمجية أو إضافة لمحرك Unity' : 'Custom Software or Unity Editor SDK',
      stack: 'C# · Unity UI Toolkit · TypeScript · Node.js',
      duration: lang === 'ar' ? '2 – 6 أسابيع' : '2 – 6 Weeks',
      deliverables:
        lang === 'ar'
          ? 'حزمة برمجية قابلة لإعادة الاستخدام مع توثيق تقني كامل واختبارات أداء.'
          : 'Reusable SDK/Plugin package with API documentation and automated test suite.',
    },
  };

  const activeRecommendation = scopeRecommendations[selectedScope];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-20">
      {/* Page Header */}
      <div className="space-y-4 border-b border-white/10 pb-8">
        <div className="text-xs font-semibold text-[#F5B700]">{t.servicesSection.kicker}</div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight text-balance">
          {t.servicesSection.title}
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          {t.servicesSection.subtitle}
        </p>
      </div>

      {/* Detailed Services Breakdown */}
      <div className="space-y-8">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#070709] border border-white/10 flex items-center justify-center">
                  {renderServiceIcon(service.iconKey)}
                </div>
                <span className="text-lg font-mono-tabular font-bold text-[#F5B700]">
                  {service.number}.
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white">{service.title[lang]}</h2>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {service.detailedDescription[lang]}
              </p>

              <div className="pt-2 space-y-1.5">
                <div className="text-xs font-semibold text-zinc-400">
                  {t.servicesSection.techStackLabel}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular text-[#F5B700]">
                  {service.technologies.map((tech, idx) => (
                    <React.Fragment key={tech}>
                      {idx > 0 && <span className="text-zinc-600">·</span>}
                      <span>{tech}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Deliverables */}
            <div className="lg:col-span-7 bg-[#0B0C11] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white">
                {t.servicesSection.deliverablesLabel}
              </h3>

              <ul className="space-y-3">
                {service.deliverables[lang].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-[#F5B700] shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#F5B700] hover:underline cursor-pointer"
                >
                  <span>
                    {lang === 'ar' ? 'اطلب هذه الخدمة لمشروعك' : 'Request This Capability'}
                  </span>
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Architecture & Scope Recommender */}
      <div className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono-tabular text-[#F5B700]">ARCHITECTURE ADVISOR</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {lang === 'ar'
              ? 'مخطط المعمارية التقنية المقترحة لمشروعك'
              : 'Interactive Project Architecture & Scope Advisor'}
          </h2>
          <p className="text-sm text-zinc-400">
            {lang === 'ar'
              ? 'اختر فئة المشروع لمعاينة الحزمة التقنية والمخرجات الهندسية المعتمدة في دبور ستيديو.'
              : 'Select your target project type to inspect our recommended technical stack and engineering deliverables.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'game', labelAr: 'لعبة Unity 6', labelEn: 'Unity 6 Game' },
              { id: 'mobile', labelAr: 'تطبيق Android', labelEn: 'Android App' },
              { id: 'web', labelAr: 'موقع / منصة ويب', labelEn: 'Web Platform' },
              { id: 'tool', labelAr: 'أداة برمجية / SDK', labelEn: 'Dev Tool / SDK' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedScope(tab.id)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                selectedScope === tab.id
                  ? 'bg-[#F5B700] text-[#070709]'
                  : 'bg-[#0A0B0F] text-zinc-300 border border-white/10 hover:text-white'
              }`}
            >
              {lang === 'ar' ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        <div className="bg-[#0A0B0F] border border-white/10 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">
              {lang === 'ar' ? 'الحزمة التقنية المعتمدة' : 'Recommended Tech Stack'}
            </div>
            <div className="text-sm font-mono-tabular font-semibold text-[#F5B700]">
              {activeRecommendation.stack}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-zinc-400">
              {lang === 'ar' ? 'المدى الزمني التقديري' : 'Typical Sprint Horizon'}
            </div>
            <div className="text-sm font-mono-tabular font-semibold text-white">
              {activeRecommendation.duration}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-zinc-400">
              {lang === 'ar' ? 'المخرجات الأساسية' : 'Primary Deliverables'}
            </div>
            <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {activeRecommendation.deliverables}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('/contact')}
            className="px-6 py-3 text-sm font-bold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] rounded-xl transition-colors cursor-pointer"
          >
            {t.nav.startProject}
          </button>
        </div>
      </div>
    </div>
  );
};
