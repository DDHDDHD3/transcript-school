import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, FileBadge, Settings, LogOut, LayoutDashboard, Home, Menu, X, Shield, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { logout, getUserSession, trackActivity, getSystemSettings } from '../services/mockBackend';
import LanguageSwitcher from './LanguageSwitcher';

// --- LOGO COMPONENT ---

const AqooniLogoMini: React.FC<{ src?: string }> = ({ src }) => {
  return (
    <div className="w-full h-full">
      {src ? (
        <img src={src} alt="Logo" className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full bg-qabas-purple rounded-lg flex items-center justify-center text-white font-bold text-[8px]">AQ</div>
      )}
    </div>
  );
};

// --- ADMIN LAYOUT ---

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const session = getUserSession();

  const [systemName, setSystemName] = useState('Aqooni Digital');
  const [systemLogo, setSystemLogo] = useState('/logo.png');

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSystemSettings();
      if (settings) {
        setSystemName(settings.name);
        setSystemLogo(settings.logo);
      }
    };
    fetchSettings();

    const email = localStorage.getItem('cv_user_email');
    if (email) {
      // Immediate track on mount
      trackActivity(email);

      // Heartbeat every 30 seconds
      const interval = setInterval(() => {
        trackActivity(email);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: t('nav.dashboard'), path: '/admin/dashboard' },
    { icon: <Users size={20} />, label: t('nav.students'), path: '/admin/students' },
    { icon: <Calendar size={20} />, label: t('nav.attendance'), path: '/admin/attendance' },
    { icon: <Settings size={20} />, label: t('nav.settings'), path: '/admin/settings' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-slate-100 justify-center">
        <div className="w-10 h-10">
          <img src={systemLogo} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 leading-none">
            {session.role === 'super_admin' ? t('nav.superAdmin') : systemName}
          </span>
          <span className="text-[10px] text-qabas-orange font-bold uppercase truncate max-w-[120px]">
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
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                ? `bg-gradient-to-${i18n.dir() === 'rtl' ? 'r' : 'l'} from-qabas-purple/10 to-transparent text-qabas-purple border-${i18n.dir() === 'rtl' ? 'l' : 'r'}-4 border-qabas-purple`
                : 'text-slate-500 hover:bg-slate-50 hover:text-qabas-orange'
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
              ? `bg-purple-100 text-qabas-purple border-${i18n.dir() === 'rtl' ? 'l' : 'r'}-4 border-qabas-purple`
              : 'text-qabas-purple bg-purple-50 hover:bg-purple-100'
              } ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
          >
            <Shield size={20} />
            <span className="flex-1">{t('nav.superPanel')}</span>
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <Link to="/" className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 hover:text-qabas-purple text-sm font-medium transition-colors hover:bg-purple-50 rounded-xl">
          <Home size={20} />
          {t('nav.backToHome')}
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors hover:bg-red-50 rounded-xl">
          <LogOut size={20} />
          {t('nav.logout')}
        </button>
      </div>
    </>
  );

  return (
    <div dir={i18n.dir()} className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden max-w-full">

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8">
            <AqooniLogoMini src={systemLogo} />
          </div>
          <span className="font-bold text-slate-800 text-sm xs:text-base">{t('common.certificateSystem')}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg active:scale-90 transition-transform">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`w-64 bg-white border-${i18n.dir() === 'rtl' ? 'l' : 'r'} border-slate-200 shadow-xl z-20 hidden md:flex flex-col fixed h-full ${i18n.dir() === 'rtl' ? 'right-0' : 'left-0'} top-0`}>
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
              className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: i18n.dir() === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: i18n.dir() === 'rtl' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0' : 'left-0'} w-64 bg-white z-50 md:hidden shadow-2xl flex flex-col`}
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className={`absolute top-4 ${i18n.dir() === 'rtl' ? 'left-4' : 'right-4'} p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full`}
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 w-full ${i18n.dir() === 'rtl' ? 'md:mr-64' : 'md:ml-64'} p-4 md:p-8 pt-[72px] md:pt-8 overflow-y-auto min-h-screen bg-slate-50/50`}>
        {location.pathname !== '/super' && (
          <div className="hidden md:flex justify-end mb-6">
            <LanguageSwitcher />
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

// --- PUBLIC LAYOUT ---

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [systemLogo, setSystemLogo] = useState('/logo.png');

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSystemSettings();
      if (settings) {
        setSystemLogo(settings.logo);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div dir={i18n.dir()} className="min-h-screen bg-gradient-to-br from-white to-purple-50 flex flex-col font-sans">
      <nav className="bg-white/90 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4">

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 transition-transform group-hover:scale-110">
              <AqooniLogoMini src={systemLogo} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-qabas-purple font-cairo leading-none">{t('common.instituteName')}</span>
              <span className="text-xs text-qabas-orange font-bold font-almarai tracking-wider">{t('common.qahi')}</span>
            </div>
          </Link>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <LanguageSwitcher />
            <Link to="/verify" className="text-sm font-bold text-slate-600 hover:text-qabas-orange transition-colors hidden sm:block">
              {t('nav.verify')}
            </Link>
            <Link to="/admin/dashboard" className="px-5 py-2 bg-gradient-to-r from-qabas-purple to-purple-800 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center gap-2">
              <FileBadge size={16} />
              {t('nav.admin')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm font-almarai">
          &copy; {new Date().getFullYear()} {t('common.digitalCertificateSystem')} - {t('common.instituteName')} ({t('common.qahi')})
        </div>
      </footer>
    </div>
  );
};
