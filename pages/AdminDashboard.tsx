import React, { useEffect, useState } from 'react';
import { getAnalytics, getSchoolBilling } from '../services/mockBackend';
import { Analytics, BillingDetails } from '../types';
import { Users, GraduationCap, Activity, TrendingUp, AlertTriangle, MessageSquare, CreditCard, ArrowRight, Zap, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Analytics | null>(null);
  const [billing, setBilling] = useState<BillingDetails | null>(null);

  useEffect(() => {
    getAnalytics().then(setStats);
    getSchoolBilling().then(setBilling);
  }, []);

  if (!stats) return <div className="p-8">{t('common.loading')}</div>;

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4 min-w-0">
      <div className="min-w-0 flex-1">
        <p className="text-slate-500 text-xs md:text-sm font-medium mb-1 truncate">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 truncate px-0.5">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-0 overflow-hidden">
        <h1 className="text-2xl font-bold text-slate-800">{t('dashboard.title')}</h1>
        <p className="text-slate-500">{t('dashboard.subtitle')}</p>
      </div>

      {/* Billing Alert Banner */}
      {(billing && (
        (billing.feeType === 'paid' && Number(billing.balance || 0) > 0) ||
        billing.billingMessage
      )) && (
          <div className="my-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-qabas-orange opacity-10 blur-3xl group-hover:opacity-20 transition-opacity" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-qabas-orange shadow-inner">
                  {billing.billingMessage ? <MessageSquare size={28} /> : <CreditCard size={28} />}
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    {t('settings.billing.title')}
                    {billing.feeType === 'paid' && billing.subStatus !== 'active' && (
                      <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {t('settings.billing.expired')}
                      </span>
                    )}
                  </h4>
                  <p className="text-slate-400 text-sm font-medium">
                    {billing.billingMessage || (billing.feeType === 'paid' && `${t('settings.billing.balance')}: $${Number(billing.balance || 0).toFixed(2)}`)}
                  </p>
                </div>
              </div>

              {billing.feeType === 'paid' && Number(billing.balance || 0) > 0 && (
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 group/btn"
                >
                  {t('settings.billing.payNow')}
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        )}

      <div className="mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <StatCard
          title={t('dashboard.totalStudents')}
          value={stats.totalStudents}
          icon={<Users className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title={t('dashboard.passedStudents')}
          value={stats.passed}
          icon={<GraduationCap className="text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          title={t('dashboard.recentVerifications')}
          value={stats.recentVerifications}
          icon={<Activity className="text-purple-600" />}
          color="bg-purple-50"
        />
        {billing && (
          <StatCard
            title={'Remaining Credits'}
            value={billing.credits}
            icon={<Zap className="text-orange-500" />}
            color="bg-orange-50"
          />
        )}
        {billing && billing.subStatus === 'active' && (
          <StatCard
            title={'Subscription Expiry'}
            value={new Date(billing.subExpiry).toLocaleDateString()}
            icon={<Target className="text-emerald-600" />}
            color="bg-emerald-50"
          />
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-royal-600" />
          <h3 className="font-bold text-lg text-slate-800">{t('dashboard.systemStatus')}</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs font-bold text-green-600 uppercase tracking-wide">{t('dashboard.online')}</span>
            <p className="font-medium text-slate-700 mt-1">{t('dashboard.verificationPortal')}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs font-bold text-green-600 uppercase tracking-wide">{t('dashboard.online')}</span>
            <p className="font-medium text-slate-700 mt-1">{t('dashboard.database')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;