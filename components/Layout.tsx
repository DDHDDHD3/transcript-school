'use client';

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Shield,
  Home,
  LogOut,
  Menu,
  X,
  FileBadge,
  Download,
  Sun,
  Moon,
  Zap,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserSession, logout, getSystemSettings, getConfig, trackActivity } from "../services/api";
import { UserButton, useClerk, useUser, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import LanguageSwitcher from "./LanguageSwitcher";
import OnboardingTour from "./OnboardingTour";
import Footer from "./Footer";
import PWAInstallButton from "./PWAInstallButton";
import PWAInstallPrompt from "./PWAInstallPrompt";

import { useTheme } from "./ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group flex items-center gap-2"
      title="Dark Mode"
    >
      {isDark ? (
        <Sun size={20} className="group-hover:rotate-45 transition-transform" />
      ) : (
        <div className="relative">
          <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
        </div>
      )}
      <span className="hidden lg:inline text-xs font-black uppercase tracking-tighter">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
};

const AqooniLogoMini: React.FC<{ src?: string; fallbackText?: string }> = ({ src, fallbackText }) => {
  return (
    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center text-violet-600 overflow-hidden shadow-sm group-hover:scale-110 transition-transform border border-violet-200/50">
      {src ? (
        <img src={src} alt="Logo" className="w-full h-full object-contain scale-110" />
      ) : (
        <span className="font-black text-lg tracking-tighter">{fallbackText?.substring(0, 1).toUpperCase() || 'A'}Q</span>
      )}
    </div>
  );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const session = getUserSession();
  const { isLoaded, isSignedIn, user } = useUser();
  const { isDark } = useTheme();

  const [systemName, setSystemName] = useState('Aqooni Digital');
  const [systemLogo, setSystemLogo] = useState('/logo.jpg');
  const [showTour, setShowTour] = useState(false);

  const fetchSettings = async () => {
    const settings = await getSystemSettings();
    let name = settings?.name || 'Aqooni Digital';
    let logo = settings?.logo || '/logo.jpg';

    // If school admin, override with school details
    if (session.schoolId) {
      const schoolConfig = await getConfig(session.schoolId);
      if (schoolConfig) {
        logo = schoolConfig.logoUrl || '';
        name = schoolConfig.schoolNameEn || schoolConfig.schoolName || t('common.schoolName');
      } else {
        logo = '';
        name = t('common.schoolName');
      }
    }

    setSystemName(name);
    setSystemLogo(logo);
  };

  useEffect(() => {
    fetchSettings();

    // Check if tour should be shown
    if (session.isAuthenticated && session.role === 'school_admin' && !session.hasOnboarded) {
      setShowTour(true);
    }

    // Listen for branding updates from AdminSettings
    window.addEventListener('brandingUpdated', fetchSettings);

    const email = localStorage.getItem('cv_user_email');
    if (email) {
      trackActivity(email);
      const interval = setInterval(() => trackActivity(email), 30000);
      return () => {
        clearInterval(interval);
        window.removeEventListener('brandingUpdated', fetchSettings);
      };
    }

    return () => {
      window.removeEventListener('brandingUpdated', fetchSettings);
    };
  }, []);

  const handleLogout = async () => {
    if (isSignedIn) {
      await signOut();
    }
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'tour-dashboard', icon: <LayoutDashboard size={20} />, label: t('nav.dashboard'), path: '/admin/dashboard' },
    { id: 'tour-students', icon: <Users size={20} />, label: t('nav.students'), path: '/admin/students' },

    { id: 'tour-settings', icon: <Settings size={20} />, label: t('nav.settings'), path: '/admin/settings' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-white/10 justify-center">
        <div className="w-14 h-14 shrink-0 shadow-2xl">
          <AqooniLogoMini src={systemLogo} fallbackText={systemName} />
        </div>
        <div className="flex flex-col">
          <span 
            className="font-black text-black dark:text-white text-base leading-tight tracking-tight"
            style={{ color: isDark ? '#ffffff' : '#000000', fontWeight: 900, opacity: 1 }}
          >
            {session.role === 'super_admin' ? t('nav.superAdmin') : systemName}
          </span>
          <span className="text-[10px] text-indigo-600 dark:text-amber-400 font-black uppercase tracking-widest mt-0.5 truncate max-w-[120px]">
            {session.schoolId || 'Platform'}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              id={item.id}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                ? `bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-black border-${i18n.dir() === 'rtl' ? 'l' : 'r'}-4 border-purple-600`
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-purple-300'
                } ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}

        {session.role === 'super_admin' && (
          <Link
            to="/super"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${location.pathname === '/super'
              ? `bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-black border-${i18n.dir() === 'rtl' ? 'l' : 'r'}-4 border-purple-600`
              : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              } ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
          >
            <Shield size={20} />
            <span className="flex-1">{t('nav.superPanel')}</span>
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-white/10 space-y-2">
        {isSignedIn && (
          <div className="px-4 py-2 flex items-center gap-3 bg-slate-50 dark:bg-white/5 rounded-xl mb-2">
            <UserButton />
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
          </div>
        )}
        <PWAInstallButton className="mt-2" />
        <Link to="/" className="flex w-full items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-bold transition-colors hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl">
          <Home size={20} />
          {t('nav.backToHome')}
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 text-sm font-bold transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
          <LogOut size={20} />
          {t('nav.logout')}
        </button>
      </div>
    </>
  );

  return (
    <div dir={i18n.dir()} className="h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex font-sans transition-colors duration-300 overflow-hidden">

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-[var(--bg-card)] z-50 border-b border-[var(--border-color)] px-3 xs:px-4 py-2 flex items-center justify-between shadow-sm pt-[calc(0.5rem+env(safe-area-inset-top,0px))] gap-2">
        <div className="flex items-center gap-2 shrink-0 overflow-hidden">
          <div className="w-9 h-9 xs:w-12 xs:h-12 shrink-0">
            <AqooniLogoMini src={systemLogo} fallbackText={systemName} />
          </div>
          <span 
            className="font-black text-black dark:text-white text-sm xs:text-base tracking-tight leading-none truncate max-w-[100px] xs:max-w-[150px]"
            style={{ color: isDark ? '#ffffff' : '#000000', fontWeight: 900, opacity: 1 }}
          >
            {session.role === 'super_admin' ? t('nav.superAdmin') : systemName}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <ThemeToggle />
          <LanguageSwitcher />
          {isSignedIn && <UserButton afterSignOutUrl="/admin/login" />}
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg active:scale-90 transition-transform">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`w-64 bg-[var(--sidebar-bg)] border-${i18n.dir() === 'rtl' ? 'l' : 'r'} border-[var(--sidebar-border)] shadow-xl z-20 hidden md:flex flex-col fixed h-full ${i18n.dir() === 'rtl' ? 'right-0' : 'left-0'} top-0`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: i18n.dir() === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: i18n.dir() === 'rtl' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0' : 'left-0'} w-64 bg-[var(--sidebar-bg)] z-50 md:hidden shadow-2xl flex flex-col`}
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className={`absolute top-4 ${i18n.dir() === 'rtl' ? 'left-4' : 'right-4'} p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full`}
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main id="admin-layout-main" className={`flex-1 bg-[var(--bg-main)] ${i18n.dir() === 'rtl' ? 'md:mr-64' : 'md:ml-64'} h-full flex flex-col overflow-hidden`}>
        <div id="main-scroll-container" className="flex-1 flex flex-col min-h-0 w-full max-w-screen-2xl mx-auto p-3 md:p-4 pt-[80px] md:pt-4 overflow-y-auto custom-scrollbar">
          {location.pathname !== '/super' && (
            <div className="hidden md:flex justify-end items-center gap-4 mb-6">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Onboarding Tour */}
      {showTour && session.email && (
        <OnboardingTour
          userEmail={session.email}
          onComplete={() => setShowTour(false)}
        />
      )}
    </div>
  );
};

// --- PUBLIC LAYOUT ---

const scrollToSection = (key: string) => {
  const el = document.getElementById(key);
  if (el) {
    const offset = 100;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

const PublicNav: React.FC<{ t: any; i18n: any }> = ({ t }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [systemName, setSystemName] = useState('Aqooni');
  const [systemLogo, setSystemLogo] = useState('/logo.jpg');

  useEffect(() => {
    const fetchBranding = async () => {
      const settings = await getSystemSettings();
      if (settings) {
        setSystemName(settings.name || 'Aqooni');
        setSystemLogo(settings.logo || '/logo.jpg');
      }
    };
    fetchBranding();
  }, []);

  const navLinks = [
    { key: 'home', label: t('nav.home') },
    { key: 'features', label: t('nav.features') },
    { key: 'modules', label: t('nav.modules') },
    { key: 'verify', label: t('Verify') || 'Verify' },
    { key: 'pricing', label: t('nav.pricing') },
    { key: 'contact', label: t('nav.contact') },
    { key: 'faqs', label: t('nav.faqs') }
  ];

  const handleNavClick = (key: string) => {
    setIsMobileMenuOpen(false);
    if (key === 'home') {
      if (location.pathname !== '/' && location.pathname !== '/verify') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (location.pathname !== '/' && location.pathname !== '/verify') {
      if (key === 'verify') {
        navigate('/verify');
      } else {
        navigate('/');
      }
      setTimeout(() => scrollToSection(key), 300);
    } else {
      if (key === 'verify' && location.pathname !== '/verify') {
        navigate('/verify');
        setTimeout(() => scrollToSection(key), 100);
      } else {
        scrollToSection(key);
      }
    }
  };

  return (
    <>
      <nav
        className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky z-50 shadow-sm mx-1 sm:mx-4 lg:mx-auto max-w-7xl rounded-2xl md:h-20"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
      >
        <div className="max-w-7xl mx-auto px-1.5 sm:px-6 lg:px-8 py-2 md:py-3 h-full flex items-center justify-between gap-1 sm:gap-4">

          <Link to="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0">
            <div className="w-8 h-8 sm:w-14 sm:h-14 shrink-0 transition-transform group-hover:scale-110 shadow-2xl">
              <AqooniLogoMini src={systemLogo} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xs sm:text-xl text-slate-900 font-cairo leading-none">{systemName}</span>
              <span className="text-[7px] sm:text-[10px] text-amber-600 font-bold font-almarai tracking-wider uppercase leading-none mt-0.5">{t('common.tagline')}</span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Only show on Extra Large screens */}
          <div className="hidden xl:flex items-center gap-4 xl:gap-6">
            {navLinks.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className="text-xs xl:text-sm font-bold text-slate-600 hover:text-amber-600 transition-colors bg-transparent border-none cursor-pointer uppercase tracking-wide"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 xl:gap-3 shrink-0">
            <ThemeToggle />
            <LanguageSwitcher />

            <PWAInstallButton variant="nav" className="hidden sm:flex" />

            <SignedOut>
              <SignInButton mode="modal">
              <button className="hidden 2xl:block text-xs font-bold text-slate-600 hover:text-qabas-orange transition-colors bg-transparent border-none cursor-pointer">
                {t('Login') || 'Login'}
              </button>
              </SignInButton>

              <SignUpButton mode="modal">
              <button className="hidden lg:flex px-4 py-2 xl:px-5 xl:py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-xs font-bold rounded-xl hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all items-center gap-2 transform hover:scale-105 active:scale-95 whitespace-nowrap overflow-hidden border-none cursor-pointer">
                {t('GetStarted') || 'Get Started'}
                <span className="text-base">→</span>
              </button>
              </SignUpButton>
            </SignedOut>

            {/* Mobile Hamburger Button - Show on everything below XL */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-1.5 xs:p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 mt-2 mx-1 sm:mx-0 bg-white backdrop-blur-3xl border border-slate-100 rounded-2xl shadow-2xl overflow-y-auto custom-scrollbar z-50"
              style={{ maxHeight: 'calc(100vh - 100px)' }}
            >
              <div className="px-4 py-5 flex flex-col gap-1.5">
                {navLinks.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className="text-sm font-semibold text-slate-200 hover:text-amber-400 hover:bg-white/5 transition-colors bg-transparent border-none cursor-pointer text-left w-full px-4 py-3 rounded-xl"
                  >
                    {item.label}
                  </button>
                ))}

                <div className="h-px w-full bg-white/10 my-2"></div>

                <div className="flex flex-col gap-2 pb-2">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex justify-center w-full text-sm font-bold text-slate-600 hover:text-qabas-orange transition-colors px-4 py-3 hover:bg-slate-50 rounded-xl border border-slate-100 bg-transparent cursor-pointer"
                      >
                        {t('Login') || 'Login'}
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex justify-center w-full text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-600 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all px-4 py-3 rounded-xl border-none cursor-pointer"
                      >
                        {t('GetStarted') || 'Get Started'}
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <div className="mt-1">
                    <PWAInstallButton variant="nav" className="w-full justify-center py-3 border border-white/5 bg-white/5 hover:bg-white/10 rounded-xl" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <div dir={i18n.dir()} className="min-h-screen bg-[var(--bg-main)] transition-colors duration-300">
      <PublicNav t={t} i18n={i18n} />

      <main className="flex-1">
        {children}
      </main>

      <PWAInstallPrompt />
      <Footer />
    </div>
  );
};
