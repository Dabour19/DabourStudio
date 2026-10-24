import { AlertCircle, CheckCircle2, Clock, Globe2, Mail, Send } from 'lucide-react';
import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';

export const ContactPage: React.FC = () => {
  const { lang, t } = useStudio();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState(
    t.contactPage.projectTypes[0]?.value || 'game_unity'
  );
  const [budget, setBudget] = useState('');
  const [details, setDetails] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<{
    referenceCode: string;
    createdAt: string;
  } | null>(null);

  const validateClientSide = (): string | null => {
    if (name.trim().length < 2) {
      return lang === 'ar'
        ? 'يرجى إدخال الاسم الكامل (حرفان على الأقل).'
        : 'Please enter your full name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return lang === 'ar'
        ? 'يرجى إدخال عنوان بريد إلكتروني صحيح.'
        : 'Please enter a valid email address.';
    }
    if (!projectType) {
      return lang === 'ar' ? 'يرجى اختيار نوع المشروع.' : 'Please select a project category.';
    }
    if (details.trim().length < 15) {
      return lang === 'ar'
        ? 'يرجى كتابة تفاصيل كافية عن المشروع (15 حرفًا على الأقل).'
        : 'Please provide at least 15 characters describing your project.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validationError = validateClientSide();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const selectedTypeObj = t.contactPage.projectTypes.find((pt) => pt.value === projectType);
      const selectedBudgetObj = t.contactPage.budgetOptions.find((b) => b.value === budget);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          projectType: selectedTypeObj ? selectedTypeObj.label : projectType,
          budget: selectedBudgetObj && budget ? selectedBudgetObj.label : '',
          details: details.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok || !data?.submission?.referenceCode) {
        throw new Error(
          data?.error ||
            (lang === 'ar'
              ? 'تعذر حفظ الطلب على الخادم حاليًا. يرجى المحاولة مرة أخرى أو مراسلتنا عبر البريد الإلكتروني.'
              : 'Could not persist your request on the server. Please retry or email us directly.')
        );
      }

      setSubmittedRef({
        referenceCode: data.submission.referenceCode,
        createdAt: data.submission.createdAt,
      });
      setName('');
      setEmail('');
      setBudget('');
      setDetails('');
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : lang === 'ar'
          ? 'حدث خطأ غير متوقع أثناء إرسال الطلب.'
          : 'An unexpected error occurred while sending your inquiry.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
      {/* Header */}
      <div className="space-y-4 border-b border-white/10 pb-8">
        <div className="text-xs font-semibold text-[#F5B700]">{t.contactPage.kicker}</div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight text-balance">
          {t.contactPage.title}
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          {t.contactPage.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-10">
          {submittedRef ? (
            <div className="py-8 space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F5B700]/15 border border-[#F5B700]/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#F5B700]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">{t.contactPage.successTitle}</h2>
                <p className="text-sm text-zinc-300 max-w-md mx-auto">
                  {t.contactPage.successDesc}
                </p>
              </div>

              <div className="inline-block bg-[#08090D] border border-[#F5B700]/50 rounded-xl px-6 py-4">
                <div className="text-xs text-zinc-400">REFERENCE TICKET ID</div>
                <div className="text-2xl font-bold font-mono-tabular text-[#F5B700] mt-1">
                  {submittedRef.referenceCode}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setSubmittedRef(null)}
                  className="px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
                >
                  {t.contactPage.sendAnother}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {errorMsg && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-zinc-300">
                    {t.contactPage.nameLabel}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.contactPage.namePlaceholder}
                    className="w-full px-4 py-3 bg-[#090A0F] border border-white/15 focus:border-[#F5B700] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-zinc-300">
                    {t.contactPage.emailLabel}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.contactPage.emailPlaceholder}
                    className="w-full px-4 py-3 bg-[#090A0F] border border-white/15 focus:border-[#F5B700] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Project Type */}
                <div className="space-y-2">
                  <label htmlFor="contact-type" className="block text-xs font-semibold text-zinc-300">
                    {t.contactPage.projectTypeLabel}
                  </label>
                  <select
                    id="contact-type"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-4 py-3 bg-[#090A0F] border border-white/15 focus:border-[#F5B700] rounded-xl text-sm text-white outline-none transition-colors"
                  >
                    {t.contactPage.projectTypes.map((pt) => (
                      <option key={pt.value} value={pt.value} className="bg-[#090A0F] text-white">
                        {pt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estimated Budget */}
                <div className="space-y-2">
                  <label htmlFor="contact-budget" className="block text-xs font-semibold text-zinc-300">
                    {t.contactPage.budgetLabel}
                  </label>
                  <select
                    id="contact-budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-3 bg-[#090A0F] border border-white/15 focus:border-[#F5B700] rounded-xl text-sm text-white outline-none transition-colors"
                  >
                    {t.contactPage.budgetOptions.map((b) => (
                      <option key={b.value} value={b.value} className="bg-[#090A0F] text-white">
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-2">
                <label htmlFor="contact-details" className="block text-xs font-semibold text-zinc-300">
                  {t.contactPage.detailsLabel}
                </label>
                <textarea
                  id="contact-details"
                  rows={5}
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t.contactPage.detailsPlaceholder}
                  className="w-full px-4 py-3 bg-[#090A0F] border border-white/15 focus:border-[#F5B700] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 text-sm font-bold text-[#070709] bg-[#F5B700] hover:bg-[#ffc414] disabled:opacity-50 rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {submitting ? t.contactPage.submittingButton : t.contactPage.submitButton}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Studio Direct Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#101218] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white">
              {t.contactPage.directChannelsTitle}
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#090A0F] border border-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#F5B700]" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-zinc-400">
                    {lang === 'ar' ? 'البريد الإلكتروني الرسمي' : 'Direct Studio Email'}
                  </div>
                  <a
                    href="mailto:H.Dabour19@gmail.com"
                    className="text-sm font-mono-tabular font-semibold text-white hover:text-[#F5B700] transition-colors"
                  >
                    H.Dabour19@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#090A0F] border border-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#F5B700]" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-zinc-400">{t.contactPage.responseTimeLabel}</div>
                  <div className="text-sm font-semibold text-white">
                    {t.contactPage.responseTimeValue}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#090A0F] border border-white/10 flex items-center justify-center shrink-0">
                  <Globe2 className="w-5 h-5 text-[#F5B700]" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-zinc-400">{t.contactPage.workingHoursLabel}</div>
                  <div className="text-sm font-semibold text-white">
                    {t.contactPage.workingHoursValue}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0D0F15] border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="text-xs font-mono-tabular text-[#F5B700]">PRIVACY &amp; NDA</div>
            <h3 className="text-sm font-bold text-white">
              {lang === 'ar'
                ? 'سرية الأفكار والمشاريع البرمجية'
                : 'Strict Confidentiality & IP Protection'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {lang === 'ar'
                ? 'جميع الأفكار والمستندات التقنية التي تشاركها مع دبور ستيديو تُعامل بسرية تامة، مع إمكانية توقيع اتفاقية عدم إفصاح (NDA) قبل بدء مرحلة التحليل التفصيلي.'
                : 'All game concepts, source code, and technical specifications shared with DabourStudio are treated with strict confidentiality, with mutual NDAs available prior to deep discovery.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
