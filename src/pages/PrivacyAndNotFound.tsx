import { ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import React from 'react';
import { HornetMark } from '../components/HornetLogo';
import { useStudio } from '../context/StudioContext';

export const PrivacyPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { lang, isRtl } = useStudio();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-10">
      <div className="space-y-3 border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F5B700]">
          <Shield className="w-4 h-4" />
          <span>{lang === 'ar' ? 'الخصوصية وحماية البيانات' : 'DATA PROTECTION & PRIVACY'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          {lang === 'ar' ? 'سياسة الخصوصية — DabourStudio' : 'Privacy Policy — DabourStudio'}
        </h1>
        <p className="text-xs font-mono-tabular text-zinc-400">
          {lang === 'ar' ? 'آخر تحديث: أكتوبر 2026' : 'Last Updated: October 2026'}
        </p>
      </div>

      <div className="space-y-8 text-sm sm:text-base text-zinc-300 leading-relaxed">
        <section className="bg-[#101218] border border-white/10 rounded-2xl p-6 space-y-2">
          <h2 className="text-lg font-bold text-white">
            {lang === 'ar' ? '1. البيانات التي نجمعها' : '1. Information We Collect'}
          </h2>
          <p>
            {lang === 'ar'
              ? 'عند استخدامك لنموذج التواصل في موقع دبور ستيديو (DabourStudio)، نقوم بجمع البيانات التي تزودنا بها طوعًا فقط: الاسم، البريد الإلكتروني، نوع المشروع، الميزانية التقديرية، وتفاصيل المشروع بهدف دراسة طلبك والتواصل معك.'
              : 'When you submit a project inquiry on DabourStudio, we collect only the information you voluntarily provide: your name, email address, project category, optional budget range, and project description to evaluate your request and respond to you.'}
          </p>
        </section>

        <section className="bg-[#101218] border border-white/10 rounded-2xl p-6 space-y-2">
          <h2 className="text-lg font-bold text-white">
            {lang === 'ar'
              ? '2. حماية سرية الأفكار والمشاريع البرمجية'
              : '2. Confidentiality of Game & Software Concepts'}
          </h2>
          <p>
            {lang === 'ar'
              ? 'نلتزم في دبور ستيديو بالحفاظ على سرية كافة الأفكار، وثائق تصميم الألعاب (GDD)، والمواصفات البرمجية التي يشاركها العملاء معنا، ولا يتم مشاركتها مع أي طرف ثالث تحت أي ظرف.'
              : 'DabourStudio treats all game concepts, Game Design Documents (GDD), and software specifications submitted through our platform as strictly confidential and never sells or shares them with third parties.'}
          </p>
        </section>

        <section className="bg-[#101218] border border-white/10 rounded-2xl p-6 space-y-2">
          <h2 className="text-lg font-bold text-white">
            {lang === 'ar' ? '3. ملفات تعريف الارتباط والتخزين المحلي' : '3. Local Storage & Preferences'}
          </h2>
          <p>
            {lang === 'ar'
              ? 'يستخدم الموقع التخزين المحلي للمتصفح لحفظ تفضيل اللغة (العربية أو الإنجليزية) فقط لضمان تجربة تصفح سلسة، دون استخدام أي أدوات تتبع إعلانية خارجية.'
              : 'Our website uses browser storage strictly to remember your language preference (Arabic RTL or English LTR) and authenticated admin sessions, without invasive third-party ad tracking.'}
          </p>
        </section>
      </div>

      <div>
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#F5B700] hover:underline cursor-pointer"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{lang === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Return to Home'}</span>
        </button>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { lang } = useStudio();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
      <div className="bg-[#101218] border border-white/10 rounded-2xl p-10 sm:p-14 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-hex-grid opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <HornetMark className="w-16 h-16" />
          <div className="text-4xl sm:text-6xl font-bold font-mono-tabular text-[#F5B700]">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {lang === 'ar'
              ? 'الصفحة المطلوبة خارج نطاق الخلية الرقمية'
              : 'Coordinates Outside the Studio Hive'}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed">
            {lang === 'ar'
              ? 'عذرًا، الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله. يمكنك العودة إلى الصفحة الرئيسية أو استكشاف مشاريعنا.'
              : 'The page you are looking for does not exist or has moved. Return to the main studio hub or explore our projects.'}
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-6 py-3 text-sm font-bold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] rounded-xl transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/projects')}
              className="px-6 py-3 text-sm font-semibold text-white bg-white/10 hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'استكشف مشاريعنا' : 'Explore Projects'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
