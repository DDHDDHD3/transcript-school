'use client';

import React, { useEffect, useState } from 'react';
import { getAnalytics, getSchoolBilling } from '../services/api';
import { Analytics, BillingDetails } from '../types';
import { Users, GraduationCap, Activity, TrendingUp, MessageSquare, CreditCard, ArrowRight, Zap, Target, Calendar, BookOpen, Award, UserCog, CheckCircle2, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AIChatHelper from '../components/AIChatHelper';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Analytics | null>(null);
  const [billing, setBilling] = useState<BillingDetails | null>(null);
  useEffect(() => {
    getAnalytics().then(setStats);
    getSchoolBilling().then(setBilling);
  }, []);
  if (!stats) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-qabas-purple border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--text-muted)] text-sm font-medium">{t('common.loading')}</p>
      </div>
    </div>
  );

  const statCards = [
    {
      title: t('dashboard.totalStudents'),
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-100 dark:border-blue-500/20',
    },
    {
      title: t('dashboard.passedStudents'),
      value: stats.passed,
      icon: GraduationCap,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-500/10',
      border: 'border-green-100 dark:border-green-500/20',
    },
    {
      title: t('dashboard.recentVerifications'),
      value: stats.recentVerifications,
      icon: Activity,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      border: 'border-purple-100 dark:border-purple-500/20',
    },

    ...(billing ? [{
      title: t('dashboard.remainingCredits'),
      value: billing.credits,
      icon: Zap,
      color: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      border: 'border-orange-100 dark:border-orange-500/20',
    }] : []),
  ];

  const quickLinks = [
    { label: t('nav.students'), path: '/admin/students', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20' },

    { label: t('nav.settings'), path: '/admin/settings', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20' },
  ];

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto pb-20">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-main)] uppercase tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium">{t('dashboard.subtitle')}</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black text-black dark:text-black uppercase tracking-widest">System Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-600 uppercase">Secure Cloud Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div id="tour-stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-[var(--bg-card)] rounded-3xl border ${card.border} p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all active:scale-[0.98]`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center`}>
                <card.icon size={24} className={card.color} />
              </div>
              <div className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-lg">
                <TrendingUp size={14} className="text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-black dark:text-black uppercase tracking-widest mb-1">{card.title}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-qabas-purple italic">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Data & Trends */}
        <div className="lg:col-span-2 space-y-8">
            {/* School Profile Summary (Complete Information) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Zap size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">School Profile</h3>
                            <p className="text-[10px] font-black text-black uppercase tracking-widest">Complete Registration Identity</p>
                        </div>
                    </div>
                    <Link to="/admin/settings" className="px-6 py-2 bg-slate-50 hover:bg-slate-100 text-black text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 transition-all">Edit details</Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-black">
                                <Users size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-0.5">School Official Name</p>
                                <p className="text-sm font-black text-black">{billing?.name || 'Loading...'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-black">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-0.5">Physical Location</p>
                                <p className="text-sm font-black text-black">{billing?.location || 'Mogadishu, Somalia'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-black">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-0.5">Primary Contact</p>
                                <p className="text-sm font-black text-black">{billing?.phoneNumber || 'Not Set'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-black">
                                <Target size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-0.5">Subscription Tier</p>
                                <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${billing?.feeType === 'free' ? 'bg-slate-100 text-black' : 'bg-amber-100 text-amber-700'}`}>
                                    {billing?.feeType || 'Free'} Plan
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-black">
                                <Zap size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-0.5">Available Credits</p>
                                <p className="text-sm font-black text-black">{billing?.credits || 0} / 5,000</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-black">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-0.5">Service Expiry</p>
                                <p className="text-sm font-black text-black">{billing?.subExpiry ? new Date(billing.subExpiry).toLocaleDateString() : 'Active'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>

        {/* Right Column: Quick Actions & Status */}
        <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 text-slate-900 border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 opacity-5 blur-3xl group-hover:opacity-10 transition-opacity" />
                <h3 className="font-black uppercase tracking-widest text-[10px] text-black dark:text-black mb-6 relative z-10">Quick Launch</h3>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-[1.5rem] border border-slate-100 dark:border-white/5 transition-all active:scale-95"
                        >
                            <link.icon size={24} className={`mb-2 ${link.color}`} />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-black dark:text-black">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 flex items-center gap-4 group cursor-pointer hover:border-emerald-500 transition-all shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-qabas-purple uppercase">System Health</h4>
                    <p className="text-[10px] font-black text-black dark:text-black uppercase">Security Protocols Active</p>
                </div>
                <ArrowRight size={18} className="ml-auto text-black dark:text-black group-hover:text-emerald-500 transition-all" />
            </div>

            {/* Setup Progress (Helpful for first-time users) */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-qabas-purple shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-4">Activation Progress</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-[11px] font-black uppercase tracking-tight">Profile Registered</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-[11px] font-black uppercase tracking-tight">Account Synchronized</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tight">Waiting for Super Review</span>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-[10px] font-bold leading-relaxed text-indigo-100">
                        Your system is currently in a verified status. You can explore all modules while we finalize your cloud synchronization.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <AIChatHelper context="dashboard" />
    </div>
  );
};

export default AdminDashboard;
