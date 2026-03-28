import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Search, Shield, Cloud, Database, Users,
  Headphones, CheckCircle2, Star, Zap, ChevronDown, Download
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AIChatHelper from '../components/AIChatHelper';
import ContactForm from '../components/ContactForm';

const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const resetTimeout = setTimeout(() => {
        setDisplayText('');
        setIndex(0);
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }
  }, [index, text]);

  return (
    <span className="text-[var(--text-main)] font-black tracking-widest uppercase text-sm md:text-base inline-flex items-center">
      {displayText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="ml-1 w-1 h-4 md:h-5 bg-amber-400"
      />
    </span>
  );
};

const PublicHome = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    { icon: <Shield className="text-amber-400" />, label: t('Secure100Percent'), desc: t('SecureDescription') },
    { icon: <Cloud className="text-amber-400" />, label: t('CloudBased'), desc: t('CloudDescription') },
    { icon: <Database className="text-amber-400" />, label: t('BackupSystem'), desc: t('BackupDescription') },
    { icon: <Headphones className="text-amber-400" />, label: t('Support247'), desc: t('SupportDescription') },
    { icon: <Shield className="text-amber-400" />, label: t('MultiSchoolManagement'), desc: t('MultiSchoolDescription') },
    { icon: <Zap className="text-amber-400" />, label: t('RoleBasedDashboards'), desc: t('RoleBasedDescription') },
    { icon: <Download className="text-amber-400" />, label: t('CertificateGeneration'), desc: t('CertificateDescription') },
    { icon: <CheckCircle2 className="text-amber-400" />, label: t('AttendanceMonitoring'), desc: t('AttendanceDescription') }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [features.length]);

  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          const offset = 100;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const handleVerify = () => {
    // Sanitize input: Remove all invisible characters, newlines, and non-printable chars
    // This prevents "black screen" crashes caused by bidi characters or newlines from mobile paste
    const sanitizedId = searchId.replace(/[\s\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '').trim();
    
    if (!sanitizedId) return;
    setLoading(true);
    // Add a slight delay for "fast-loading" feel with feedback
    setTimeout(() => {
      // Use encodeURIComponent to ensure slashes or special characters don't break routing
      navigate(`/v/${encodeURIComponent(sanitizedId)}`);
      setLoading(false);
    }, 400);
  };

  return (
    <div dir={i18n.dir()} className="flex flex-col items-center bg-[var(--bg-main)] text-[var(--text-main)] font-sans overflow-x-hidden relative transition-colors duration-300">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-amber-400/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[5%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] bg-blue-500/10 blur-[110px] rounded-full"
        />
      </div>

      {/* Hero Section */}
      <section id="home" className="w-full relative py-12 md:py-20 lg:py-32 px-4 overflow-hidden hero-gradient wave-bg bg-slate-950">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm"
              >
                <Star size={14} className="fill-amber-400" />
                {t('VerificationTitle') || 'Official Academic Portal'}
              </motion.div>

                <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-6xl lg:text-7xl font-black text-white mb-6 font-cairo leading-tight"
              >
                Aqooni Digital <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                  School Management
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 font-almarai text-lg md:text-xl max-w-2xl lg:mx-0 mx-auto leading-relaxed mb-10"
              >
                {t('LandingHeroSubtitle')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/admin/login" className="px-10 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-400/20 hover:shadow-amber-400/40 transition-all flex items-center justify-center gap-2 text-lg no-underline uppercase tracking-widest w-full sm:w-auto">
                    {t('nav.getStarted')}
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a href="#verify" className="px-10 py-4 bg-white/5 border border-white/10 text-white font-black rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm text-lg no-underline flex items-center justify-center uppercase tracking-widest w-full sm:w-auto">
                    {t('VerifyNow')}
                  </a>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              whileHover={{ rotateY: 5, rotateX: -5 }}
              transition={{ delay: 0.4, duration: 1, type: "spring", stiffness: 100 }}
              className="flex-1 relative w-full perspective-1000"
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl bg-white/5 backdrop-blur-sm"
              >
                <img src="/image.png" alt="Preview" className="w-full h-auto brightness-110" />
              </motion.div>

              {/* Decorative Floating Blobs around image */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 w-12 h-12 bg-amber-400 rounded-2xl blur-xl opacity-30"
              />
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 w-16 h-16 bg-purple-500 rounded-full blur-xl opacity-20"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="w-full py-16 md:py-24 px-4 bg-[var(--bg-main)] relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[var(--text-main)] mb-4 font-cairo uppercase">
              {t('features')}
            </h2>
            <div className="w-24 h-1.5 bg-amber-400 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                transition={{ delay: idx * 0.1 }}
                className={`p-8 rounded-[2.5rem] border transition-all duration-500 bg-[var(--bg-card)] border-[var(--border-color)] group cursor-pointer ${activeFeature === idx
                  ? 'border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.15)] scale-[1.03] z-10'
                  : 'hover:border-amber-400/50'
                  }`}
              >
                <motion.div
                  animate={activeFeature === idx ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${activeFeature === idx ? 'bg-amber-400 text-slate-950' : 'bg-amber-400/10 text-amber-400'
                    }`}
                >
                  {React.cloneElement(f.icon as React.ReactElement, { size: 32 })}
                </motion.div>
                <h3 className={`text-xl font-black uppercase tracking-widest font-cairo mb-2 transition-colors duration-500 ${activeFeature === idx ? 'text-amber-500' : 'text-[var(--text-main)]'
                  }`}>
                  {f.label}
                </h3>
                <p className="text-sm text-[var(--text-muted)] font-bold">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Modules Section */}
      <motion.section
        id="modules"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="w-full py-16 md:py-24 px-4 bg-[var(--bg-secondary)] relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-7xl font-black text-[var(--text-main)] mb-6 font-cairo uppercase tracking-tight">
              {t('modules')}
            </h2>
            <div className="w-24 h-1.5 bg-amber-400 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 'Student', icon: <Users className="text-amber-400" /> },
              { id: 'Teacher', icon: <Users className="text-amber-400" /> },
              { id: 'Admin', icon: <Shield className="text-amber-400" /> },
              { id: 'Certificate', icon: <Download className="text-amber-400" /> },
              { id: 'Attendance', icon: <CheckCircle2 className="text-amber-400" /> }
            ].map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.1,
                  type: 'spring',
                  stiffness: 100
                }}
                className="p-8 rounded-[3rem] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-amber-400/40 transition-all hover:shadow-[0_20px_40px_rgba(251,191,36,0.1)] group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-amber-400/10 transition-colors" />

                <div className="flex flex-col gap-6 mb-8 relative z-10 items-start">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="w-16 h-16 bg-amber-400/10 text-amber-400 rounded-3xl flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-all duration-500 shadow-xl shadow-amber-400/0 group-hover:shadow-amber-400/20"
                  >
                    {React.cloneElement(m.icon as React.ReactElement, { size: 32 })}
                  </motion.div>
                  <motion.span
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="text-[13px] bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl uppercase tracking-[1.5px] shadow-2xl shadow-amber-400/20 border-2 border-amber-500/10"
                  >
                    {t(`${m.id}ModulePurpose`)}
                  </motion.span>
                </div>
                <h3 className="text-2xl font-black text-[var(--text-main)] font-cairo mb-3 relative z-10 group-hover:text-amber-500 transition-colors">
                  {t(`${m.id}Module`)}
                </h3>
                <p className="text-[var(--text-muted)] text-sm font-bold leading-relaxed mb-6 relative z-10">
                  {t(`${m.id}ModuleCapabilities`)}
                </p>
                <div className="pt-6 border-t border-[var(--border-color)] flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-widest relative z-10">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  {t('Online')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        id="pricing"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="w-full py-16 md:py-24 px-4 bg-[var(--bg-main)] relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[var(--text-main)] mb-4 font-cairo uppercase">
              {t('pricing')}
            </h2>
            <div className="w-24 h-1.5 bg-amber-400 mx-auto rounded-full" />
            <p className="mt-8 text-[var(--text-muted)] font-bold text-lg max-w-2xl mx-auto">
              {t('BillingCycleDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { id: 'Monthly', icon: <Zap className="text-amber-400" />, popular: false },
              { id: 'Yearly', icon: <Star className="text-amber-400" />, popular: true }
            ].map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.01 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-10 rounded-[3.5rem] bg-[var(--bg-card)] border-2 transition-all duration-500 ${p.popular ? 'border-amber-400 scale-105 shadow-2xl shadow-amber-400/20' : 'border-[var(--border-color)] hover:border-amber-400/30'} flex flex-col group`}
              >
                {p.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-amber-400 text-slate-950 text-xs font-black rounded-full uppercase tracking-widest shadow-xl">
                    {t('nav.mostPopular') || 'Most Popular'}
                  </span>
                )}
                <div className="w-16 h-16 bg-amber-400/10 text-amber-400 rounded-3xl flex items-center justify-center mb-8">
                  {React.cloneElement(p.icon as React.ReactElement, { size: 32 })}
                </div>
                <h3 className="text-3xl font-black text-[var(--text-main)] font-cairo mb-4 uppercase">
                  {t(`${p.id}Plan`)}
                </h3>
                <p className="text-[var(--text-muted)] font-bold mb-8 flex-1">
                  {t(`${p.id}Description`)}
                </p>
                <Link to="/admin/login" className={`w-full py-5 rounded-2xl font-black text-center transition-all uppercase tracking-widest ${p.popular ? 'bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-xl' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                  {t('ActivatePlan')}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 p-8 rounded-[3rem] bg-amber-400/5 border border-amber-400/20 max-w-4xl mx-auto text-center">
            <h4 className="text-xl font-black text-amber-500 uppercase tracking-widest mb-2 font-cairo">
              {t('EducationalValueTitle')}
            </h4>
            <p className="text-[var(--text-muted)] font-bold italic">
              " {t('EducationalValueDescription')} "
            </p>
          </div>
        </div>
      </motion.section>

      {/* Search / Verification Section */}
      <motion.section
        id="verify"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="w-full py-16 md:py-32 px-4 bg-[var(--bg-secondary)] relative z-10"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-[var(--text-main)] mb-6 font-cairo">
            {t('VerificationTitle')}
          </h2>
          <p className="text-[var(--text-muted)] text-lg mb-12 font-bold">
            {t('VerificationSubtitle')}
          </p>

          <div className="flex flex-col md:flex-row shadow-2xl shadow-amber-400/10 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-2 gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder={t('VerificationPlaceholder')}
                className={`w-full pl-12 pr-6 py-4 bg-transparent outline-none text-[var(--text-main)] font-black text-lg font-cairo`}
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>
            <motion.button
              onClick={handleVerify}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 px-8 py-4 rounded-xl font-black hover:shadow-lg hover:shadow-amber-400/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 font-cairo z-10"
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : t('VerifyNow')}
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        id="faqs"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="w-full py-16 md:py-24 px-4 bg-[var(--bg-main)] relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[var(--text-main)] mb-4 font-cairo uppercase">
              {t('FAQsTitle')}
            </h2>
            <div className="w-24 h-1.5 bg-amber-400 mx-auto rounded-full" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between"
                >
                  <span className="text-lg font-black text-[var(--text-main)] font-cairo">
                    {t(`FAQ${i}_Question`)}
                  </span>
                  <ChevronDown className={`text-amber-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="p-6 border-t border-[var(--border-color)] text-[var(--text-muted)] font-bold">
                        {t(`FAQ${i}_Answer`)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="w-full py-32 px-4 bg-slate-950 relative overflow-hidden z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-amber-900/20 opacity-50" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 p-12 md:p-20 rounded-[4rem] text-center shadow-[0_32px_120px_rgba(0,0,0,0.4)]"
          >
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 font-cairo uppercase">
              {t('ContactTitle')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xl mb-16 font-bold max-w-2xl mx-auto leading-relaxed">
              {t('ContactSubtitle')}
            </p>

            <div className="mt-12">
              <ContactForm />
            </div>

            <div className="mt-16 pt-16 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-center gap-10">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold font-cairo">
                <CheckCircle2 className="text-amber-500" size={20} />
                <span>Mogadishu, Somalia</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold font-cairo">
                <CheckCircle2 className="text-amber-500" size={20} />
                <span>Enterprise SLA</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold font-cairo">
                <CheckCircle2 className="text-amber-500" size={20} />
                <span>Secure Infrastructure</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
      <AIChatHelper context="public" />
    </div>
  );
};

export default PublicHome;
