import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getSystemSettings, syncClerkUser } from '../services/api';
import { Loader2, Lock, Home, Eye, EyeOff, UserCircle, AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useUser, SignInButton, SignUpButton, SignedIn, SignedOut, SignOutButton } from "@clerk/clerk-react";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState('/logo.jpg');
  const [platformName, setPlatformName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);

  const { isLoaded, isSignedIn, user } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSystemSettings();
      if (settings) {
        setLogoUrl(settings.logo || '/logo.jpg');
        setPlatformName(settings.name);
      }
    };
    fetchSettings();
  }, []);

  // Sync Clerk user with our database
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const sync = async () => {
        setLoading(true);
        setError('');
        try {
          const result = await syncClerkUser(user);
          if (result?.success) {
            setTimeout(() => {
              if (result.role === 'super_admin') {
                navigate('/super');
              } else {
                navigate('/admin/dashboard');
              }
            }, 500);
          } else {
            console.error("Sync failed:", result);
            setError("Failed to sync user data. Please try again.");
          }
        } catch (err) {
          console.error("Sync error:", err);
          setError("Connection error during sync.");
        } finally {
          setLoading(false);
        }
      };
      sync();
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.success) {
      localStorage.setItem('cv_user_email', email);
      localStorage.setItem('cv_has_onboarded', result.hasOnboarded ? 'true' : 'false');
      if (result.role === 'super_admin') {
        navigate('/super');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError(result.error || t('login.errors.invalid'));
      setLoading(false);
    }
  };

  return (
    <div
      dir={i18n.dir()}
      className="min-h-screen bg-[#0a051d] flex items-center justify-center relative overflow-hidden"
    >
      {/* === Animated Background === */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, 60, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%] bg-violet-700/20 blur-[130px] rounded-full"
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 80, 0], scale: [1.2, 0.9, 1.2] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[10%] -right-[5%] w-[45%] h-[45%] bg-orange-600/15 blur-[110px] rounded-full"
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[40%] left-[30%] w-[25%] h-[25%] bg-purple-500/10 blur-[100px] rounded-full"
        />
        {/* Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* === Main Card === */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card glow ring */}
        <div className="absolute -inset-px bg-gradient-to-br from-violet-500/40 via-transparent to-orange-500/30 rounded-[2rem] blur-sm pointer-events-none" />

        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 via-purple-400 to-orange-400" />

          {/* Header */}
          <div className="pt-10 pb-6 px-8 text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-5"
            >
              {logoUrl ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-400/30 blur-2xl rounded-3xl" />
                  <img
                    src={logoUrl}
                    alt="Aqooni Logo"
                    className="w-32 h-32 object-contain relative z-10 rounded-[2rem] shadow-2xl ring-2 ring-white/10"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-violet-700 rounded-full flex items-center justify-center text-white font-bold text-xs leading-tight px-2 shadow-2xl">
                  {platformName || 'Aqooni'}
                </div>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-black font-cairo text-white"
            >
              {platformName || t('common.instituteName')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-orange-400 mt-1 font-bold font-almarai text-sm tracking-wide"
            >
              {t('login.subtitle')}
            </motion.p>
          </div>

          {/* Body */}
          <div className="px-8 pb-8">
            <SignedOut>
              <AnimatePresence mode="wait">
                {!showLegacy ? (
                  <motion.div
                    key="clerk-panel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {/* Sign In via Clerk */}
                    <SignInButton mode="modal">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white text-qabas-purple font-black py-4 rounded-2xl shadow-xl shadow-purple-900/40 transition-all flex justify-center items-center gap-2 text-base tracking-wide border-2 border-transparent hover:border-purple-200"
                      >
                        <UserCircle size={20} />
                        {t('login.loginBtn')}
                      </motion.button>
                    </SignInButton>

                    {/* Sign Up via Clerk */}
                    <SignUpButton mode="modal">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-400/50 text-white font-bold py-4 rounded-2xl transition-all flex justify-center items-center gap-2 text-base mt-3"
                      >
                        <Shield size={18} className="text-orange-400" />
                        {t('login.registerAqooniDigital')}
                      </motion.button>
                    </SignUpButton>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-transparent px-3 text-white/30 font-bold">
                          {t('login.or') || 'OR'}
                        </span>
                      </div>
                    </div>

                    {/* Super Admin switch */}
                    <motion.button
                      type="button"
                      onClick={() => setShowLegacy(true)}
                      whileHover={{ scale: 1.01 }}
                      className="w-full text-white/40 hover:text-violet-300 text-sm font-bold transition-colors flex items-center justify-center gap-2 py-2"
                    >
                      <Shield size={15} />
                      {t('adminLogin') || 'AdminLogin'}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="legacy-form"
                    onSubmit={handleLogin}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-black text-white/50 mb-1.5 uppercase tracking-widest">
                        {t('login.email')}
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 outline-none transition-all text-left font-medium text-white placeholder-white/20"
                        dir="ltr"
                        placeholder="super@control.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-black text-white/50 mb-1.5 uppercase tracking-widest">
                        {t('login.password')}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 outline-none transition-all text-left font-medium text-white placeholder-white/20 pr-12"
                          dir="ltr"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 p-1 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 text-red-400 text-sm font-bold bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl"
                        >
                          <AlertCircle size={16} className="shrink-0" />
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-violet-900/40 transition-all flex justify-center items-center gap-2 text-base disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                          <Lock size={16} />
                          {t('login.loginBtn')}
                        </>
                      )}
                    </motion.button>

                    {/* Back */}
                    <button
                      type="button"
                      onClick={() => { setShowLegacy(false); setError(''); }}
                      className="w-full text-white/30 hover:text-violet-300 font-bold py-2 transition-all flex justify-center items-center gap-2 text-sm"
                    >
                      <ArrowLeft size={14} />
                      {t('login.backToAqooniDigital')}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </SignedOut>

            <SignedIn>
              {error ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-center w-full">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">{error || 'Authentication Sync Failed'}</p>
                    <p className="text-xs mt-1 text-white/40">Please contact support or try again.</p>
                  </div>
                  <SignOutButton>
                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all">
                      Sign Out & Try Again
                    </button>
                  </SignOutButton>
                </div>
              ) : (
                  <div className="flex flex-col items-center gap-6 py-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-violet-500 blur-2xl opacity-30 rounded-full animate-pulse" />
                      <Loader2 className="w-12 h-12 text-violet-400 animate-spin relative z-10" />
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 font-bold mb-1">
                        {t('loading')}
                      </p>
                      <p className="text-violet-400 font-medium text-sm">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                    <SignOutButton>
                      <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-400/40 text-white/50 hover:text-violet-300 font-bold py-3 px-6 rounded-xl transition-all flex justify-center items-center gap-2 text-sm">
                        <ArrowLeft size={14} />
                        Login with another method
                      </button>
                    </SignOutButton>
                  </div>
              )}
            </SignedIn>

            {/* Back to Home */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <motion.button
                type="button"
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-400/40 text-white/50 hover:text-orange-300 font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 text-sm"
              >
                <Home size={16} />
                {t('login.backHome')}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
