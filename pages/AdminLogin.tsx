import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, syncClerkUser } from '../services/api';
import { Loader2, Lock, Home, Eye, EyeOff, AlertCircle, Shield, ArrowLeft, Phone, MapPin, GraduationCap, Star, ChevronRight, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useUser, useClerk } from "@clerk/clerk-react";

// ─── Platform Info ─────────────────────────────────────────────────────────────
const PLATFORM = {
  name: 'Aqooni Digital',
  tagline: 'School Management Platform',
  website: 'aqoonidigital.com',
  support: '+252 061 416 3362',
  logo: '/logo.jpg',
};

// ─── Animated Background Blobs ───────────────────────────────────────────────
const BackgroundFX = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <motion.div
      animate={{ x: [0, 80, 0], y: [0, 60, 0], scale: [1, 1.3, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className="absolute -top-[20%] -left-[15%] w-[60%] h-[60%] bg-violet-200/40 blur-[140px] rounded-full"
    />
    <motion.div
      animate={{ x: [0, -60, 0], y: [0, 80, 0], scale: [1.2, 0.9, 1.2] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] bg-amber-200/30 blur-[120px] rounded-full"
    />
    <motion.div
      animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      className="absolute top-[40%] left-[35%] w-[30%] h-[30%] bg-purple-500/15 blur-[100px] rounded-full"
    />
    {/* Grid */}
    <div
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '70px 70px',
      }}
    />
  </div>
);

// ─── Left Branding Panel ──────────────────────────────────────────────────────
const BrandPanel = () => (
  <motion.div
    initial={{ opacity: 0, x: -40 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
    className="hidden lg:flex flex-col justify-center items-start gap-8 flex-1 pr-12"
  >
    {/* Logo */}
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-amber-400/30 blur-3xl rounded-full scale-150" />
      <div className="relative w-28 h-28 rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-white/10 ring-offset-4 ring-offset-transparent">
        <img src={PLATFORM.logo} alt="Aqooni Digital Logo" className="w-full h-full object-cover" />
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg"
      >
        <Star size={14} fill="currentColor" className="text-slate-900" />
      </motion.div>
    </motion.div>

    {/* Name */}
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/15 border border-amber-400/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-widest mb-4"
      >
        <GraduationCap size={12} />
        {PLATFORM.tagline}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-5xl xl:text-6xl font-black text-slate-900 leading-tight mb-3"
      >
        {PLATFORM.name}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-slate-500 font-bold text-lg leading-tight mb-6"
      >
        The smart way to manage your school.
      </motion.p>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-3 text-black font-bold">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Phone size={14} className="text-amber-500" />
          </div>
          <span className="text-sm" dir="ltr">{PLATFORM.support}</span>
        </div>
        <div className="flex items-center gap-3 text-black font-bold">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <MapPin size={14} className="text-amber-500" />
          </div>
          <span className="text-sm">{PLATFORM.website}</span>
        </div>
      </motion.div>
    </div>

    {/* Stats row */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="flex items-center gap-6"
    >
      {[
        { label: 'Secure', icon: <Shield size={16} className="text-violet-500" /> },
        { label: 'Cloud-Based', icon: <Star size={16} className="text-amber-500" /> },
        { label: 'Multi-School', icon: <GraduationCap size={16} className="text-emerald-500" /> },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-slate-400 text-xs font-bold">
          {item.icon}
          {item.label}
        </div>
      ))}
    </motion.div>
  </motion.div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false); // toggle between Clerk panel & admin form

  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn, openSignUp, signOut } = useClerk();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ── If a Clerk session is already active → sync to DB and redirect ───────
  // NOTE: syncClerkUser() enforces that Clerk can NEVER produce a super_admin
  // role (see services/api.ts). Only the System Administrator form can do that.
  const syncAttempted = React.useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    if (syncAttempted.current) return; // prevent double-sync on Clerk user object updates
    syncAttempted.current = true;

    const sync = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await syncClerkUser(user);
        if (result?.success) {
          // syncClerkUser never returns super_admin — always goes to dashboard.
          navigate('/admin/dashboard');
        } else {
          setError('Failed to sync account. Please sign out and try again.');
          syncAttempted.current = false; // allow retry on error
        }
      } catch {
        setError('Connection error. Please try again.');
        syncAttempted.current = false;
      } finally {
        setLoading(false);
      }
    };
    sync();
  }, [isLoaded, isSignedIn, user, navigate]);

  // ── System Administrator login — the ONLY path that reaches /super ────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.success) {
      localStorage.setItem('cv_user_email', email);
      localStorage.setItem('cv_has_onboarded', result.hasOnboarded ? 'true' : 'false');
      if (result.role === 'super_admin') navigate('/super');
      else navigate('/admin/dashboard');
    } else {
      setError(result.error || t('login.errors.invalid'));
      setLoading(false);
    }
  };

  return (
    <div
      dir={i18n.dir()}
      className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden p-4"
    >
      <BackgroundFX />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center gap-0 lg:gap-8">

        {/* ── Left: Branding (desktop only) ── */}
        <BrandPanel />

        {/* ── Right: Auth Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 90 }}
          className="w-full max-w-md shrink-0"
        >
          {/* Glow ring */}
          <div className="absolute -inset-px bg-gradient-to-br from-violet-500/10 via-transparent to-amber-500/10 rounded-[2.5rem] blur-sm pointer-events-none" />

          <div className="relative bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 via-purple-400 to-amber-400" />

            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center pt-8 pb-2 px-8">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl ring-2 ring-slate-100 mb-3">
                <img src={PLATFORM.logo} alt="Aqooni Digital" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-lg font-black text-slate-900 text-center">{PLATFORM.name}</h2>
              <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                <MapPin size={10} className="text-amber-500" /> {PLATFORM.website}
              </div>
            </div>

            {/* ── Card Header ── */}
            <div className="pt-8 pb-4 px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h2 className="text-2xl font-black text-slate-900 font-cairo leading-tight">
                  Welcome to Aqooni Digital
                </h2>
                <p className="text-slate-400 text-sm font-bold mt-1">
                  School Administration Portal
                </p>
              </motion.div>
            </div>

            {/* ── Card Body ── */}
            <div className="px-8 pb-8">

              {/* ── Clerk session active → syncing spinner ── */}
              {isLoaded && isSignedIn ? (
                <div className="flex flex-col items-center gap-5 py-6">
                  {error ? (
                    <>
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-center w-full">
                        <AlertCircle className="w-7 h-7 mx-auto mb-2" />
                        <p className="font-bold text-sm">{error}</p>
                      </div>
                      <button
                        onClick={() => signOut()}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-bold py-3 px-6 rounded-xl transition-all text-sm"
                      >
                        Sign Out &amp; Try Again
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 bg-violet-500 blur-2xl opacity-30 rounded-full animate-pulse" />
                        <Loader2 className="w-10 h-10 text-violet-400 animate-spin relative z-10" />
                      </div>
                      <div className="text-center">
                        <p className="text-slate-500 font-bold text-sm mb-1">Setting up your dashboard…</p>
                        <p className="text-violet-500 font-medium text-xs">{user?.primaryEmailAddress?.emailAddress}</p>
                      </div>
                      <button
                        onClick={() => setShowAdminForm(false)}
                        className="flex items-center gap-2 text-slate-400 hover:text-violet-500 transition-all font-black text-xs uppercase tracking-widest mb-6 group"
                      >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Selection
                      </button>
                    </>
                  )}
                </div>
              ) : (
                /* ── Not signed in → show both login paths ── */
                <AnimatePresence mode="wait">

                  {/* ══ PANEL A: School Admin login via Clerk (default) ══ */}
                  {!showAdminForm ? (
                    <motion.div
                      key="clerk-panel"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      {/* School label */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                          <GraduationCap size={15} className="text-amber-400" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-black text-sm">School Administrator</p>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Register or sign in to manage your school</p>
                        </div>
                      </div>

                      {/* PRIMARY: Get Started (Sign Up) */}
                      <motion.button
                        type="button"
                        onClick={() => openSignUp({ fallbackRedirectUrl: '/#/admin/dashboard' })}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-amber-500/30 transition-all flex justify-center items-center gap-2 text-base tracking-wide"
                      >
                        <GraduationCap size={20} />
                        Get Started — Register School
                        <ChevronRight size={16} />
                      </motion.button>

                      <p className="text-center text-slate-400 text-xs font-bold py-0.5">
                        New schools must register before logging in
                      </p>

                      {/* SECONDARY: Already registered → Sign In */}
                      <motion.button
                        type="button"
                        onClick={() => openSignIn({ fallbackRedirectUrl: '/#/admin/dashboard' })}
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-violet-400/50 text-slate-900 font-bold py-4 rounded-2xl transition-all flex justify-center items-center gap-2 text-sm"
                      >
                        <Lock size={16} className="text-violet-400" />
                        Already registered? Sign In
                      </motion.button>

                      {/* Divider */}
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-3 text-slate-400 font-bold tracking-widest">
                            Administration
                          </span>
                        </div>
                      </div>

                      {/* Link to System Administrator form */}
                      <motion.button
                        type="button"
                        onClick={() => { setShowAdminForm(true); setError(''); }}
                        whileHover={{ scale: 1.01 }}
                        className="w-full text-slate-400 hover:text-violet-500 text-xs font-bold transition-colors flex items-center justify-center gap-2 py-2"
                      >
                        <Shield size={13} />
                        System Administrator Access
                      </motion.button>
                    </motion.div>

                  ) : (

                    /* ══ PANEL B: System Administrator Login ══ */
                    <motion.form
                      key="admin-form"
                      onSubmit={handleLogin}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                          <Shield size={15} className="text-violet-400" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-black text-sm">System Administrator</p>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Restricted Access</p>
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">
                          Administrator Email
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Mail size={18} />
                          </div>
                          <input
                            id="sys_acc_identifier"
                            name="sys_acc_identifier"
                            type="email"
                            required
                            className="w-full px-4 py-4 pl-12 rounded-xl bg-slate-50 border border-slate-100 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 outline-none transition-all text-left font-medium text-slate-900 placeholder-slate-300 text-sm"
                            dir="ltr"
                            placeholder="admin@example.com"
                            autoComplete="off"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Lock size={18} />
                          </div>
                          <input
                            id="sys_acc_credential"
                            name="sys_acc_credential"
                            type={showPassword ? 'text' : 'password'}
                            required
                            className="w-full px-4 py-4 pl-12 rounded-xl bg-slate-50 border border-slate-100 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 outline-none transition-all text-left font-medium text-slate-900 placeholder-slate-300 pr-12 text-sm"
                            dir="ltr"
                            placeholder="••••••••••••"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-qabas-purple/25 hover:text-qabas-purple/60 p-1 transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 text-red-400 text-sm font-bold bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl"
                          >
                            <AlertCircle size={15} className="shrink-0" />
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-qabas-purple font-black py-4 rounded-2xl shadow-xl shadow-violet-900/40 transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                          <><Lock size={15} /> Sign In</>
                        )}
                      </motion.button>

                      {/* Back to school login */}
                      <button
                        type="button"
                        onClick={() => { setShowAdminForm(false); setError(''); setEmail(''); setPassword(''); }}
                        className="w-full text-qabas-purple/25 hover:text-violet-300 font-bold py-2 transition-all flex justify-center items-center gap-2 text-xs"
                      >
                        <ArrowLeft size={13} />
                        Back to School Login
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              )}

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full text-qabas-purple/25 hover:text-amber-300 font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2 text-xs hover:bg-white/5"
                >
                  <Home size={13} />
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
