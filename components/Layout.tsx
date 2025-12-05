import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, FileBadge, Settings, LogOut, LayoutDashboard, Home, Menu, X } from 'lucide-react';
import { logout } from '../services/mockBackend';

// Mini Logo Component
const QahiLogoMini = () => (
  <svg viewBox="0 0 500 500" className="w-full h-full">
    <defs>
      <linearGradient id="grad1-mini" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#f97316', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#ea580c', stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="grad2-mini" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#7c3aed', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#5b21b6', stopOpacity:1}} />
      </linearGradient>
    </defs>
    <path d="M250 80 L60 270 L250 460 L210 490 L10 270 L210 40 Z" fill="url(#grad1-mini)" />
    <path d="M250 80 L440 270 L250 460 L290 490 L490 270 L290 40 Z" fill="url(#grad2-mini)" />
    <path d="M250 130 L390 270 L250 410 L110 270 Z" fill="#ffffff" opacity="0.9"/>
    <path d="M250 180 C220 180 200 200 200 230 C200 260 220 280 250 280 C280 280 300 260 300 230 C300 200 280 180 250 180 Z M250 200 C265 200 275 215 275 230 C275 245 265 260 250 260 C235 260 225 245 225 230 C225 215 235 200 250 200 Z" fill="#5b21b6" />
    <path d="M150 330 Q250 380 350 330 L350 350 Q250 400 150 350 Z" fill="#5b21b6" />
    <path d="M150 355 Q250 405 350 355 L350 375 Q250 425 150 375 Z" fill="#ea580c" />
  </svg>
);

// --- ADMIN LAYOUT ---

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', path: '/admin/dashboard' },
    { icon: <Users size={20} />, label: 'الطلاب والدرجات', path: '/admin/students' },
    { icon: <Settings size={20} />, label: 'الإعدادات', path: '/admin/settings' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-slate-100 justify-center">
        <div className="w-10 h-10">
          <QahiLogoMini />
        </div>
        <span className="font-bold text-lg text-slate-800 font-cairo">نظام الشهادات</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-gradient-to-l from-qabas-purple/10 to-transparent text-qabas-purple border-r-4 border-qabas-purple' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-qabas-orange'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <Link to="/" className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 hover:text-qabas-purple text-sm font-medium transition-colors hover:bg-purple-50 rounded-xl">
            <Home size={20} />
            العودة للرئيسية
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors hover:bg-red-50 rounded-xl">
          <LogOut size={20} />
          تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-30 border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8">
             <QahiLogoMini />
           </div>
           <span className="font-bold text-slate-800">نظام الشهادات</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-l border-slate-200 shadow-xl z-20 hidden md:flex flex-col fixed h-full right-0 top-0">
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
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-72 bg-white z-50 md:hidden shadow-2xl flex flex-col"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto min-h-screen bg-slate-50/50">
        {children}
      </main>
    </div>
  );
};

// --- PUBLIC LAYOUT ---

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 flex flex-col font-sans">
      <nav className="bg-white/90 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4" dir="rtl">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 transition-transform group-hover:scale-110">
              <QahiLogoMini />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-qabas-purple font-cairo leading-none">معهد قبس الهدى</span>
              <span className="text-xs text-qabas-orange font-bold font-almarai tracking-wider">QAHI</span>
            </div>
          </Link>

          <div className="flex flex-wrap justify-center items-center gap-4">
             <Link to="/verify" className="text-sm font-bold text-slate-600 hover:text-qabas-orange transition-colors hidden sm:block">
              التحقق من الشهادة
            </Link>
            <Link to="/admin/dashboard" className="px-5 py-2 bg-gradient-to-r from-qabas-purple to-purple-800 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center gap-2">
              <FileBadge size={16} />
              دخول الإدارة
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm font-almarai">
          &copy; {new Date().getFullYear()} نظام الشهادات الرقمية - معهد قبس الهدى (QAHI)
        </div>
      </footer>
    </div>
  );
};