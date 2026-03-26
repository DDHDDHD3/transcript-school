import React, { useEffect, useState } from 'react';
import { getAnalytics, getSchoolBilling, getAttendance } from '../services/api';
import { Analytics, BillingDetails } from '../types';
import { Users, GraduationCap, Activity, TrendingUp, MessageSquare, CreditCard, ArrowRight, Zap, Target, Calendar, BookOpen, Award, UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AIChatHelper from '../components/AIChatHelper';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Analytics | null>(null);
  const [billing, setBilling] = useState<BillingDetails | null>(null);
  const [attendanceToday, setAttendanceToday] = useState<number | null>(null);

  useEffect(() => {
    getAnalytics().then(setStats);
    getSchoolBilling().then(setBilling);
    const today = new Date().toISOString().split('T')[0];
    getAttendance(today).then(records => {
      const uniqueStudents = new Set(records.map(r => r.studentId));
      setAttendanceToday(uniqueStudents.size);
    });
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
    ...(attendanceToday !== null ? [{
      title: t('nav.attendance') || 'Attendance Today',
      value: attendanceToday,
      icon: Calendar,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-500/10',
      border: 'border-teal-100 dark:border-teal-500/20',
    }] : []),
    ...(billing ? [{
      title: t('dashboard.remainingCredits'),
      value: billing.credits,
      icon: Zap,
      color: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      border: 'border-orange-100 dark:border-orange-500/20',
    }] : []),
    ...(billing && billing.subStatus === 'active' ? [{
      title: t('dashboard.subscriptionExpiry'),
      value: new Date(billing.subExpiry).toLocaleDateString(),
      icon: Target,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-100 dark:border-emerald-500/20',
    }] : []),
  ];

  const quickLinks = [
    { label: t('nav.students'), path: '/admin/students', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20' },
    { label: t('nav.attendance'), path: '/admin/attendance', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20' },
    { label: t('nav.teachers') || 'Teachers', path: '/admin/teachers', icon: UserCog, color: 'text-teal-600', bg: 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/10 dark:hover:bg-teal-500/20' },
    { label: t('nav.settings'), path: '/admin/settings', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[var(--text-main)]">{t('dashboard.title')}</h1>
        <p className="text-[var(--text-muted)] mt-1 font-medium">{t('dashboard.subtitle')}</p>
      </div>

      {/* Billing Alert Banner */}
      {billing && ((billing.feeType === 'paid' && Number(billing.balance || 0) > 0) || billing.billingMessage) && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-qabas-orange opacity-10 blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-qabas-orange shrink-0">
                  {billing.billingMessage ? <MessageSquare size={24} /> : <CreditCard size={24} />}
                </div>
                <div>
                  <h4 className="text-white font-bold flex items-center gap-2">
                    {t('settings.billing.title')}
                    {billing.feeType === 'paid' && billing.subStatus !== 'active' && (
                      <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {t('settings.billing.expired')}
                      </span>
                    )}
                  </h4>
                  <p className="text-slate-400 text-sm">
                    {billing.billingMessage || (billing.feeType === 'paid' && `${t('settings.billing.balance')}: $${Number(billing.balance || 0).toFixed(2)}`)}
                  </p>
                </div>
              </div>
              {billing.feeType === 'paid' && Number(billing.balance || 0) > 0 && (
                <Link
                  to="/admin/settings"
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all shrink-0"
                >
                  {t('settings.billing.payNow')}
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
        </div>
      )}

      {/* Stats Grid */}
      <div id="tour-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`bg-[var(--bg-card)] rounded-2xl border ${card.border} p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon size={26} className={card.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 truncate">{card.title}</p>
              <h3 className="text-3xl font-black text-[var(--text-main)]">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row: Quick Links + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
          <h3 className="font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
            <ArrowRight size={18} className="text-qabas-purple" />
            {t('dashboard.quickActions') || 'Quick Actions'}
          </h3>
          <div className="space-y-3">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 p-3.5 rounded-xl ${link.bg} transition-all`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${link.color}`}>
                  <link.icon size={18} />
                </div>
                <span className={`font-bold text-sm ${link.color}`}>{link.label}</span>
                <ArrowRight size={14} className={`ml-auto ${link.color} opacity-60`} />
              </Link>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-qabas-purple" />
            <h3 className="font-bold text-[var(--text-main)]">{t('dashboard.systemStatus')}</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: t('dashboard.verificationPortal'), status: t('dashboard.online') },
              { label: t('dashboard.database'), status: t('dashboard.online') },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <span className="font-medium text-[var(--text-secondary)] text-sm">{item.label}</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AIChatHelper context="dashboard" />
    </div>
  );
};

export default AdminDashboard;
