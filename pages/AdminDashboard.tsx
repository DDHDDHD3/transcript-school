import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../services/mockBackend';
import { Analytics } from '../types';
import { Users, GraduationCap, Activity, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState<Analytics | null>(null);

  useEffect(() => {
    getAnalytics().then(setStats);
  }, []);

  if (!stats) return <div className="p-8">Loading stats...</div>;

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
       <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
       </div>
       <div className={`p-3 rounded-xl ${color}`}>
          {icon}
       </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">لوحة المعلومات</h1>
        <p className="text-slate-500">نظرة عامة على نظام الشهادات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="إجمالي الطلاب" 
          value={stats.totalStudents} 
          icon={<Users className="text-blue-600" />} 
          color="bg-blue-50" 
        />
        <StatCard 
          title="الشهادات المصدرة (ناجح)" 
          value={stats.passed} 
          icon={<GraduationCap className="text-green-600" />} 
          color="bg-green-50" 
        />
        <StatCard 
          title="التحققات (24 ساعة)" 
          value={stats.recentVerifications} 
          icon={<Activity className="text-purple-600" />} 
          color="bg-purple-50" 
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
           <TrendingUp className="text-royal-600" />
           <h3 className="font-bold text-lg text-slate-800">حالة النظام</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
           <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-right">
              <span className="text-xs font-bold text-green-600 uppercase tracking-wide">متصل</span>
              <p className="font-medium text-slate-700 mt-1">بوابة التحقق</p>
           </div>
           <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-right">
              <span className="text-xs font-bold text-green-600 uppercase tracking-wide">متصل</span>
              <p className="font-medium text-slate-700 mt-1">قاعدة البيانات (المحلية)</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;