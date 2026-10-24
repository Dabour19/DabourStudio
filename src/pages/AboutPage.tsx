import { Code2, Cpu, Layers, ShieldCheck, Terminal } from 'lucide-react';
import React from 'react';
import { HornetMark } from '../components/HornetLogo';
import { useStudio } from '../context/StudioContext';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { lang } = useStudio();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-20">
      {/* Studio Story Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-b border-white/10 pb-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="text-xs font-semibold text-[#F5B700]">
            {lang === 'ar' ? 'من نحن · الهوية والرؤية' : 'ABOUT DABOURSTUDIO · VISION & CRAFT'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight text-balance">
            {lang === 'ar'
              ? 'DabourStudio | دبور ستيديو — حيث تلتقي هندسة البرمجيات بصناعة الألعاب'
              : 'DabourStudio | دبور ستيديو — Where Software Engineering Meets Game Craft'}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
            {lang === 'ar'
              ? 'تأسس دبور ستيديو ليكون مساحة تقنية وإبداعية متخصصة في بناء الألعاب الإلكترونية باستخدام Unity وUnity 6، إلى جانب تطوير تطبيقات Android، مواقع الويب، والأنظمة البرمجية المخصصة. نستلهم هويتنا من الدبور الهندسي: الدقة في البناء، السرعة في الأداء، والتنظيم المتقن.'
              : 'DabourStudio was created as a specialized technical and creative studio dedicated to building video games in Unity and Unity 6 alongside Android applications, web platforms, and custom software tools. Our geometric hornet identity reflects architectural precision, speed, and structured execution.'}
          </p>
        </div>

        <div className="lg:col-span-4 bg-[#101218] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
          <HornetMark className="w-20 h-20" />
          <div className="space-y-1">
            <div className="text-xl font-bold text-white">DabourStudio</div>
            <div className="text-sm text-[#F5B700] font-semibold">دبور ستيديو</div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {lang === 'ar'
              ? 'هوية هندسية تجمع بين خلايا النحل الرقمية وبكسلات الألعاب الحديثة.'
              : 'Geometric studio identity uniting hexagonal system architecture with digital precision.'}
          </p>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-3">
          <Cpu className="w-6 h-6 text-[#F5B700]" />
          <h2 className="text-xl font-bold text-white">
            {lang === 'ar' ? 'تخصص عميق في Unity 6' : 'Unity 6 Engine Mastery'}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {lang === 'ar'
              ? 'نوظف أحدث تقنيات محرك Unity 6 مثل URP وHDRP وShader Graph وأنظمة DOTS لبناء ألعاب ثنائية وثلاثية الأبعاد تعمل بسلاسة على الكمبيوتر والهواتف.'
              : 'We leverage Unity 6 advancements including URP/HDRP rendering pipelines, Shader Graph, and data-oriented design to deliver smooth 2D and 3D games across PC and mobile.'}
          </p>
        </div>

        <div className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-3">
          <Layers className="w-6 h-6 text-[#F5B700]" />
          <h2 className="text-xl font-bold text-white">
            {lang === 'ar' ? 'تطبيقات ومواقع عالية الاعتمادية' : 'Resilient Mobile & Web Systems'}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {lang === 'ar'
              ? 'نصمم تطبيقات Android ومنصات ويب بواجهات تدعم العربية والإنجليزية بشكل أصيل، مع بنية برمجية قابلة للصيانة والتوسع المستقبلي.'
              : 'We build Android applications and full-stack web platforms with native-grade RTL/LTR support, clean APIs, and maintainable TypeScript/Kotlin codebases.'}
          </p>
        </div>

        <div className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-3">
          <ShieldCheck className="w-6 h-6 text-[#F5B700]" />
          <h2 className="text-xl font-bold text-white">
            {lang === 'ar' ? 'الشفافية والجودة الهندسية' : 'Transparency & Code Quality'}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {lang === 'ar'
              ? 'نلتزم بكتابة كود منظم وموثق، مع اختبارات مستمرة للأداء، وتسليم المشاريع وفق مراحل واضحة يمكن للعميل متابعتها وتجربتها أولاً بأول.'
              : 'We adhere to strict code organization, profiling budgets, and milestone-based delivery so clients can inspect and test every stage of development.'}
          </p>
        </div>
      </div>

      {/* Technology Matrix */}
      <div className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="flex items-center gap-3">
          <Code2 className="w-6 h-6 text-[#F5B700]" />
          <h2 className="text-2xl font-bold text-white">
            {lang === 'ar' ? 'منظومة التقنيات والأدوات المعتمدة' : 'Studio Technology Stack'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0A0B0F] border border-white/10 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono-tabular text-[#F5B700]">GAME DEVELOPMENT</div>
            <div className="text-base font-bold text-white">Unity &amp; Unity 6</div>
            <p className="text-xs text-zinc-400 font-mono-tabular">
              C# · URP / HDRP · Shader Graph · VFX Graph · Cinemachine · Netcode
            </p>
          </div>

          <div className="bg-[#0A0B0F] border border-white/10 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono-tabular text-[#F5B700]">MOBILE ENGINEERING</div>
            <div className="text-base font-bold text-white">Android Platform</div>
            <p className="text-xs text-zinc-400 font-mono-tabular">
              Kotlin · Jetpack Compose · Android SDK · Room SQLite · Coroutines
            </p>
          </div>

          <div className="bg-[#0A0B0F] border border-white/10 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono-tabular text-[#F5B700]">WEB &amp; FRONTEND</div>
            <div className="text-base font-bold text-white">Modern Web Apps</div>
            <p className="text-xs text-zinc-400 font-mono-tabular">
              React 19 · TypeScript · Vite · Tailwind CSS · HTML5 / SVG Canvas
            </p>
          </div>

          <div className="bg-[#0A0B0F] border border-white/10 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono-tabular text-[#F5B700]">BACKEND &amp; TOOLS</div>
            <div className="text-base font-bold text-white">Systems &amp; SDKs</div>
            <p className="text-xs text-zinc-400 font-mono-tabular">
              Node.js · Express · REST APIs · Unity Editor API · Git CI/CD
            </p>
          </div>
        </div>
      </div>

      {/* Local Execution & Custom Domain (dabourstudio.dev) Deployment Guide */}
      <div className="bg-[#0D0F16] border border-white/10 rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-[#F5B700]" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {lang === 'ar'
              ? 'دليل ربط ورفع الموقع على النطاق الرسمي dabourstudio.dev'
              : 'Deploying & Mapping to Custom Domain: dabourstudio.dev'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#070709] border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#F5B700]">
              {lang === 'ar' ? '1. التشغيل والبناء (Build & Run)' : '1. Build & Production Run'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {lang === 'ar'
                ? 'الموقع مهيأ بالكامل بملفات SEO وSitemap وDockerfile للنطاق dabourstudio.dev:'
                : 'Pre-configured with canonical URLs, sitemap.xml, and Dockerfile for dabourstudio.dev:'}
            </p>
            <pre
              dir="ltr"
              className="text-xs font-mono-tabular text-zinc-200 bg-[#101218] p-3.5 rounded-lg overflow-x-auto"
            >
{`npm install
npm run build
npm run start`}
            </pre>
          </div>

          <div className="bg-[#070709] border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#F5B700]">
              {lang === 'ar' ? '2. الرفع على Google Cloud Run' : '2. Cloud Run Domain Mapping'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {lang === 'ar'
                ? 'لنشر الحاوية وربط الدومين dabourstudio.dev مع شهادة SSL تلقائية:'
                : 'Deploy container and map dabourstudio.dev with automatic managed SSL:'}
            </p>
            <pre
              dir="ltr"
              className="text-xs font-mono-tabular text-zinc-200 bg-[#101218] p-3.5 rounded-lg overflow-x-auto"
            >
{`gcloud run deploy dabourstudio \\
  --source . --region europe-west2 \\
  --allow-unauthenticated

gcloud beta run domain-mappings create \\
  --service dabourstudio \\
  --domain dabourstudio.dev \\
  --region europe-west2`}
            </pre>
          </div>

          <div className="bg-[#070709] border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#F5B700]">
              {lang === 'ar' ? '3. إعدادات DNS لدومين dabourstudio.dev' : '3. DNS Records for dabourstudio.dev'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {lang === 'ar'
                ? 'أضف سجلات DNS التالية في لوحة تحكم النطاق (Cloudflare / Namecheap / Google):'
                : 'Add these DNS records at your registrar (note: .dev requires HTTPS/SSL enabled):'}
            </p>
            <pre
              dir="ltr"
              className="text-xs font-mono-tabular text-zinc-200 bg-[#101218] p-3.5 rounded-lg overflow-x-auto"
            >
{`Type   Host   Value (Cloud Run)
A      @      216.239.32.21
A      @      216.239.34.21
A      @      216.239.36.21
A      @      216.239.38.21
CNAME  www    ghs.googlehosted.com.`}
            </pre>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
          <p className="text-xs text-zinc-400">
            {lang === 'ar'
              ? 'يمكنك أيضًا إدارة المشاريع والخدمات وطلبات العملاء مباشرة عبر لوحة الإدارة المدمجة.'
              : 'You can also manage projects, cover art, hero copy, and client inquiries directly via the built-in Studio CMS.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-lg cursor-pointer"
            >
              {lang === 'ar' ? 'فتح لوحة الإدارة' : 'Open Studio CMS'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="px-4 py-2 text-xs font-semibold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] rounded-lg cursor-pointer"
            >
              {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
