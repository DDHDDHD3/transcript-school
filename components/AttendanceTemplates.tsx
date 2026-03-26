import React from 'react';
import { AttendanceReport, CertificateConfig, AttendanceRecord } from '../types';
import { useTranslation } from 'react-i18next';
import { Clock, Book, Pencil, Calendar, Calculator, Leaf } from 'lucide-react';

interface AttendanceTemplateProps {
    reports?: AttendanceReport[];
    config: CertificateConfig;
    selectedMonth?: string;
    type?: 'daily' | 'monthly' | 'summary' | 'student';
    date?: string;
    classLevel?: string;
    monthlyData?: AttendanceRecord[];
    teacherName?: string;
    summary?: {
        total: number;
        present: number;
        absent: number;
        late: number;
    };
}

// Premium Blue Header Illustration
const IllustrationHeader: React.FC<{ title: string }> = ({ title }) => {
    return (
        <div className="relative w-full h-[450px] bg-[#f1f5f9] flex flex-col items-center justify-center border-b-[8px] border-[#5b21b6]">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 border-4 border-blue-400 rounded-full" />
                <div className="absolute bottom-20 right-20 w-32 h-32 border-8 border-blue-300 rounded-3xl rotate-12" />
                <div className="absolute top-40 right-10 w-16 h-16 bg-blue-200 rounded-full blur-xl" />
            </div>

            {/* Main Illustration Group */}
            <div className="relative flex items-end justify-center gap-4 mb-12 scale-110">
                {/* Left Plant */}
                <div className="flex flex-col items-center -mb-2">
                    <div className="flex gap-1 mb-1">
                        <Leaf className="text-green-600 rotate-[-15deg]" size={24} fill="currentColor" />
                        <Leaf className="text-green-500 rotate-[5deg] -mt-2" size={28} fill="currentColor" />
                    </div>
                    <div className="w-12 h-12 bg-blue-800 rounded-b-lg rounded-t-sm" />
                </div>

                {/* Clock */}
                <div className="w-28 h-28 bg-white rounded-full border-[6px] border-blue-800 shadow-xl flex items-center justify-center relative">
                    <div className="w-1.5 h-10 bg-blue-800 rounded-full absolute top-[14px]" />
                    <div className="w-8 h-1.5 bg-blue-800 rounded-full absolute right-[14px] top-1/2 -translate-y-1/2" />
                    <div className="w-3 h-3 bg-blue-900 rounded-full" />
                    {/* Tick marks */}
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="absolute inset-2" style={{ transform: `rotate(${i * 30}deg)` }}>
                            <div className="w-1 h-2 bg-blue-200 mx-auto" />
                        </div>
                    ))}
                </div>

                {/* Notebook */}
                <div className="w-32 h-40 bg-white rounded-xl border-[4px] border-blue-800 shadow-2xl relative flex flex-col p-4 gap-3 overflow-hidden">
                    <div className="absolute top-0 left-4 w-1 h-full bg-blue-100" />
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-1 w-full bg-slate-100 rounded-full" />
                    ))}
                </div>

                {/* Pencil */}
                <div className="w-4 h-32 bg-amber-400 rounded-full rotate-12 -mb-2 shadow-lg relative border-2 border-blue-800 flex flex-col items-center">
                   <div className="w-full h-6 bg-amber-200 rounded-t-full mb-auto" />
                   <div className="w-full h-4 bg-slate-300 absolute -bottom-1 rounded-b-full" />
                </div>

                {/* Right Calendar/Calc */}
                <div className="w-24 h-24 bg-blue-600 rounded-xl border-[4px] border-blue-800 shadow-xl flex flex-col p-2 gap-2 relative">
                    <div className="flex justify-between">
                        <div className="w-3 h-3 bg-white/20 rounded-full" />
                        <div className="w-3 h-3 bg-white/20 rounded-full" />
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-1.5">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="w-4 h-4 bg-white/30 rounded-sm" />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Right Plant */}
                <div className="flex flex-col items-center -mb-2">
                    <div className="flex gap-1 mb-1">
                        <Leaf className="text-green-500 rotate-[-5deg] mb-1" size={26} fill="currentColor" />
                        <Leaf className="text-green-600 rotate-[15deg]" size={22} fill="currentColor" />
                    </div>
                    <div className="w-10 h-10 bg-blue-800 rounded-b-lg rounded-t-sm" />
                </div>
            </div>

            {/* Title Section */}
            <div className="bg-white px-24 py-10 rounded-[3rem] shadow-2xl border-4 border-[#5b21b6] transform translate-y-24 z-20">
                <h1 className="text-7xl font-black text-[#1e293b] tracking-tighter text-center uppercase">{title}</h1>
            </div>

            {/* Wave effect bottom */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                <svg className="relative block w-[calc(100%+1.3px)] h-[80px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FFFFFF"></path>
                </svg>
            </div>
        </div>
    );
};

// 1. Daily Attendance Report
const DailyAttendanceReport: React.FC<AttendanceTemplateProps> = ({ reports, config, date, classLevel, teacherName }) => {
    const { t } = useTranslation();
    return (
        <div className="w-full min-h-full bg-white font-sans text-slate-800 flex flex-col p-0 text-left ltr:text-left rtl:text-right">
            <IllustrationHeader title={t('attendance.reports.dailyTitle')} />
            
            <div className="px-24 pt-32 pb-16 flex justify-between items-end border-b-8 border-[#f1f5f9]">
                <div className="space-y-6">
                    <div className="flex items-center gap-6 text-6xl font-bold">
                        <span className="text-[#5b21b6] uppercase tracking-[0.2em] text-4xl font-black">{t('attendance.reports.dateLabel')} :</span>
                        <span className="text-[#1e293b]">{date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-6 text-6xl font-bold">
                        <span className="text-[#5b21b6] uppercase tracking-[0.2em] text-4xl font-black">{t('attendance.reports.classLabel')} :</span>
                        <span className="text-[#1e293b]">{classLevel}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[#5b21b6] font-black text-8xl">{config.schoolNameEn}</p>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-3xl mt-4 font-black">{t('attendance.reports.officialRecord')}</p>
                </div>
            </div>

            <div className="p-24 flex-grow">
                <table className="w-full border-collapse rounded-[3rem] overflow-hidden shadow-2xl border-4 border-[#5b21b6]/20">
                    <thead>
                        <tr className="bg-[#5b21b6] text-white">
                            <th className="p-10 text-left font-black uppercase tracking-widest text-4xl border-r border-white/20 w-32">{t('attendance.reports.no')}</th>
                            <th className="p-10 text-left font-black uppercase tracking-widest text-4xl border-r border-white/20">{t('attendance.reports.student')}</th>
                            <th className="p-10 text-center font-black uppercase tracking-widest text-4xl border-r border-white/20 w-48">{t('attendance.reports.present')}</th>
                            <th className="p-10 text-center font-black uppercase tracking-widest text-4xl border-r border-white/20 w-48">{t('attendance.reports.absent')}</th>
                            <th className="p-10 text-center font-black uppercase tracking-widest text-4xl border-r border-white/20 w-48">{t('attendance.reports.late')}</th>
                            <th className="p-10 text-left font-black uppercase tracking-widest text-4xl w-64">{t('attendance.reports.remarks')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-[#f1f5f9]">
                        {(reports || []).map((r, i) => (
                            <tr key={r.studentId} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]/50'}>
                                <td className="p-10 font-bold text-slate-400 border-r-4 border-[#f1f5f9] text-4xl">{i + 1}</td>
                                <td className="p-10 font-black text-[#1e293b] border-r-4 border-[#f1f5f9] text-6xl">{r.studentName}</td>
                                <td className="p-10 text-center border-r-4 border-[#f1f5f9]">
                                    {r.presentDays > 0 && <span className="text-6xl text-[#5b21b6] font-black">✓</span>}
                                </td>
                                <td className="p-10 text-center border-r-4 border-[#f1f5f9]">
                                    {r.absentDays > 0 && <span className="text-6xl text-rose-600 font-black">✓</span>}
                                </td>
                                <td className="p-10 text-center border-r-4 border-[#f1f5f9]">
                                    {r.lateDays > 0 && <span className="text-6xl text-amber-500 font-black">✓</span>}
                                </td>
                                <td className="p-10 font-bold text-slate-400 text-3xl italic uppercase tracking-wider">
                                   {r.absentDays > 0 ? (r.excusedDays > 0 ? t('attendance.reports.excused') : t('attendance.reports.unexcused')) : (r.lateDays > 0 ? t('attendance.reports.arrivedLate') : t('attendance.reports.onTime'))}
                                </td>
                            </tr>
                        ))}
                        {[...Array(Math.max(0, 5 - (reports?.length || 0)))].map((_, i) => (
                            <tr key={i} className={((reports?.length || 0) + i) % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}>
                                <td className="p-6 border-r border-blue-50 h-20"></td>
                                <td className="p-6 border-r border-blue-50"></td>
                                <td className="p-6 border-r border-blue-50"></td>
                                <td className="p-6 border-r border-blue-50"></td>
                                <td className="p-6 border-r border-blue-50"></td>
                                <td className="p-6"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-16 pb-24 mt-12">
                <div className="flex justify-between items-end border-t-8 border-blue-900 pt-16">
                    <p className="text-5xl font-black text-blue-900 uppercase">{t('attendance.reports.preparedBy')} : <span className="ml-8 text-[#1e293b]">{teacherName || '____________________'}</span></p>
                </div>
            </div>
            <div className="h-6 w-full bg-blue-900" />
        </div>
    );
};

// 2. Monthly Attendance Sheet
const MonthlyAttendanceSheet: React.FC<AttendanceTemplateProps> = ({ reports, config, selectedMonth, classLevel, monthlyData, teacherName }) => {
    const { t } = useTranslation();
    const [year, month] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [...Array(daysInMonth)].map((_, i) => i + 1);

    return (
        <div className="w-full min-h-full bg-white font-sans text-slate-800 flex flex-col p-0 overflow-hidden text-left ltr:text-left rtl:text-right">
            <IllustrationHeader title={t('attendance.reports.monthlyTitle')} />
            
            <div className="px-20 pt-24 pb-12 flex justify-between items-end border-b-8 border-[#f1f5f9]">
                <div className="space-y-8">
                    <div className="flex items-center gap-12 text-6xl font-bold">
                        <span className="text-[#5b21b6] uppercase tracking-[0.2em] text-4xl font-black">{t('attendance.reports.monthLabel')} :</span>
                        <span className="text-[#1e293b]">{selectedMonth || 'June 2023'}</span>
                    </div>
                    <div className="flex items-center gap-12 text-6xl font-bold">
                        <span className="text-[#5b21b6] uppercase tracking-[0.2em] text-4xl font-black">{t('attendance.reports.classLabel')} :</span>
                        <span className="text-[#1e293b]">{classLevel}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[#5b21b6] font-black text-8xl">{config.schoolNameEn}</p>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-3xl mt-4 font-black">{t('attendance.reports.officialSummary')}</p>
                </div>
            </div>

            <div className="p-20 flex-grow">
                <table className="w-full border-collapse rounded-[2rem] overflow-hidden shadow-2xl border-4 border-[#5b21b6]/20">
                    <thead>
                        <tr className="bg-[#5b21b6] text-white">
                            <th className="p-4 text-center font-black uppercase text-4xl border-r border-white/20 w-24">{t('attendance.reports.no')}</th>
                            <th className="p-8 text-left font-black uppercase text-7xl border-r border-white/20 min-w-[500px]">{t('attendance.reports.student')}</th>
                            {days.map(d => (
                                <th key={d} className="p-2 text-center border-r border-white/20 text-4xl font-black">{d}</th>
                            ))}
                            <th className="p-4 text-center font-black uppercase text-4xl border-l border-white/20 w-32">{t('attendance.reports.rate')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[#f1f5f9]">
                        {(reports || []).map((r, i) => (
                            <tr key={r.studentId} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/20'}>
                                <td className="p-4 text-center font-black text-slate-600 border-r border-blue-50 text-6xl">{i + 1}</td>
                                <td className="p-8 font-black text-slate-900 border-r border-blue-50 text-8xl break-words">{r.studentName}</td>
                                {days.map(d => {
                                    const dayStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
                                    const studentRecords = monthlyData?.filter(rec => rec.studentId === r.studentId && rec.date === dayStr) || [];
                                    const status = studentRecords.length > 0 ? (studentRecords[0].status === 'present' ? 'A' : studentRecords[0].status === 'absent' ? 'X' : 'L') : '';
                                    return (
                                        <td key={d} className={`p-4 text-center border-r border-[#f1f5f9] font-black text-5xl ${status === 'X' ? 'text-rose-600' : status === 'L' ? 'text-amber-500' : 'text-[#5b21b6]'}`}>
                                            {status}
                                        </td>
                                    );
                                })}
                                <td className="p-4 text-center font-black text-slate-400 border-l border-blue-50 text-4xl">{r.attendanceRate}%</td>
                            </tr>
                        ))}
                        {[...Array(6)].map((_, i) => (
                            <tr key={i} className={((reports?.length || 0) + i) % 2 === 0 ? 'bg-white' : 'bg-blue-50/20'}>
                                <td className="p-3 border-r border-blue-50"></td>
                                <td className="p-3 border-r border-blue-50"></td>
                                {days.map(d => <td key={d} className="p-3 border-r border-blue-50"></td>)}
                                <td className="p-3 border-l border-blue-50"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-12 pb-24 mt-8">
                <div className="flex justify-between items-center py-12 border-t-8 border-blue-900">
                    <div className="flex items-center gap-8">
                        <span className="text-blue-900 font-black uppercase text-4xl">{t('attendance.reports.preparedBy')} :</span>
                        <span className="text-[#1e293b] font-bold text-4xl">{teacherName || '____________________'}</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <span className="text-blue-900 font-black uppercase text-4xl">{t('attendance.reports.dateLabel')} :</span>
                        <div className="w-80 border-b-4 border-blue-200" />
                    </div>
                </div>
            </div>
            <div className="h-4 w-full bg-blue-900" />
        </div>
    );
};

// 3. Attendance Summary Report
const AttendanceSummaryReport: React.FC<AttendanceTemplateProps> = ({ reports, config, selectedMonth, classLevel, summary, teacherName }) => {
    const { t } = useTranslation();
    const stats = summary || {
        total: 30,
        present: 25,
        absent: 4,
        late: 3
    };

    const presentRate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    const absentRate = stats.total > 0 ? (stats.absent / stats.total) * 100 : 0;
    const lateRate = stats.total > 0 ? (stats.late / stats.total) * 100 : 0;

    return (
        <div className="w-full min-h-full bg-white font-sans text-slate-800 flex flex-col p-0 text-left ltr:text-left rtl:text-right">
            <IllustrationHeader title={t('attendance.reports.summaryTitle')} />
            
            <div className="p-24 space-y-16">
                <div className="grid grid-cols-2 gap-16">
                    <div className="space-y-8">
                         <div className="flex gap-6 items-baseline">
                            <span className="text-[#5b21b6] font-black text-4xl uppercase min-w-[180px]">{t('attendance.reports.classLabel')} :</span>
                            <span className="text-[#1e293b] text-4xl font-bold">{classLevel || t('common.allClasses', 'All Classes')}</span>
                        </div>
                        <div className="flex gap-6 items-baseline">
                            <span className="text-[#5b21b6] font-black text-4xl uppercase min-w-[180px]">{t('attendance.reports.periodLabel')} :</span>
                            <span className="text-[#1e293b] text-4xl font-bold">{selectedMonth || 'June 2023'}</span>
                        </div>
                        <div className="flex gap-6 items-baseline">
                            <span className="text-[#5b21b6] font-black text-4xl uppercase min-w-[180px]">{t('attendance.reports.preparedBy', 'TEACHER')} :</span>
                            <span className="text-[#1e293b] text-4xl font-bold">{teacherName || '—'}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[#5b21b6] font-black text-9xl">{config.schoolNameEn}</p>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-4xl mt-8 font-black">{t('attendance.reports.executiveOverview')}</p>
                    </div>
                </div>

                <div className="space-y-12">
                    <h3 className="text-6xl font-black text-[#5b21b6] border-b-8 border-[#f1f5f9] pb-8 uppercase tracking-wider">{t('attendance.reports.overview')}:</h3>
                    <ul className="space-y-10 text-5xl font-bold text-[#1e293b] ml-12">
                        <li className="flex items-center gap-8"><div className="w-10 h-10 bg-[#5b21b6] rounded-full" /> {t('attendance.reports.total')} STUDENTS: {reports?.length || 0}</li>
                        <li className="flex items-center gap-8"><div className="w-10 h-10 bg-green-500 rounded-full" /> {t('attendance.reports.present')} STUDENTS: {stats.present}</li>
                        <li className="flex items-center gap-8"><div className="w-10 h-10 bg-red-500 rounded-full" /> {t('attendance.reports.absent')} STUDENTS: {stats.absent}</li>
                        <li className="flex items-center gap-8"><div className="w-10 h-10 bg-amber-500 rounded-full" /> {t('attendance.reports.late')} STUDENTS: {stats.late}</li>
                    </ul>
                </div>

                <div className="space-y-16">
                    <h3 className="text-5xl font-black text-blue-900 uppercase tracking-wider">{t('attendance.reports.attendanceStats')}</h3>
                    <div className="grid grid-cols-3 gap-16">
                        <div className="bg-blue-900 text-white rounded-[4rem] p-16 text-center shadow-2xl transform hover:scale-105 transition-transform">
                            <p className="text-9xl font-black mb-6">{presentRate}%</p>
                            <p className="text-3xl font-bold uppercase tracking-widest opacity-80">{t('attendance.reports.present')}</p>
                        </div>
                        <div className="bg-blue-800 text-white rounded-[4rem] p-16 text-center shadow-2xl transform hover:scale-105 transition-transform">
                            <p className="text-9xl font-black mb-6">{absentRate}%</p>
                            <p className="text-3xl font-bold uppercase tracking-widest opacity-80">{t('attendance.reports.absent')}</p>
                        </div>
                        <div className="bg-blue-700 text-white rounded-[4rem] p-16 text-center shadow-2xl transform hover:scale-105 transition-transform">
                            <p className="text-9xl font-black mb-6">{lateRate}%</p>
                            <p className="text-3xl font-bold uppercase tracking-widest opacity-80">{t('attendance.reports.late')}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    <h3 className="text-6xl font-black text-[#5b21b6] border-b-8 border-[#f1f5f9] pb-8 uppercase tracking-wider">{t('attendance.reports.remarks')}:</h3>
                    <ul className="space-y-10 text-5xl font-bold text-slate-500 ml-12">
                        <li className="flex items-center gap-8 font-black tracking-tight text-[#1e293b]">• {t('attendance.reports.remarksGood')}</li>
                        <li className="flex items-center gap-8 font-black tracking-tight text-[#1e293b]">• {t('attendance.reports.remarksImprovePunctuality')}</li>
                        <li className="flex items-center gap-8 font-black tracking-tight text-[#1e293b]">• {t('attendance.reports.remarksMonitorAbsences')}</li>
                    </ul>
                </div>
            </div>

            <div className="px-16 pb-32 mt-auto">
                <div className="flex justify-between items-center py-16 border-t-8 border-blue-900">
                    <div className="flex items-center gap-10">
                        <span className="text-blue-900 font-black uppercase text-5xl">{t('attendance.reports.preparedBy')} :</span>
                        <span className="text-[#1e293b] font-bold text-5xl">{teacherName || '____________________'}</span>
                    </div>
                    <div className="flex items-center gap-10">
                        <span className="text-blue-900 font-black uppercase text-5xl">{t('attendance.reports.dateLabel')} :</span>
                        <div className="w-96 border-b-6 border-blue-200" />
                    </div>
                </div>
            </div>
            <div className="h-8 w-full bg-blue-900" />
        </div>
    );
};

// Minimalist Header for Student Report
const MinimalistHeader: React.FC<{ title: string }> = ({ title }) => {
    return (
        <div className="w-full h-[400px] bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
             {/* Simple Illustration Groups */}
             <div className="flex items-center justify-center gap-16 mb-12 scale-110">
                 {/* Left circles */}
                 <div className="relative w-32 h-32">
                     <div className="absolute top-0 right-0 w-20 h-20 bg-[#22c55e]/80 rounded-full" />
                     <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#22c55e]/90 rounded-full" />
                 </div>
                 {/* Center Notebook */}
                 <div className="relative w-40 h-56 bg-white border-[8px] border-[#1e293b]/20 rounded-xl shadow-xl flex flex-col p-6 gap-4">
                     <div className="absolute top-0 left-0 w-full h-full rounded-xl border-[8px] border-[#1e293b]/5 -z-10 translate-x-4 translate-y-4" />
                     <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 border-[10px] border-[#1e293b]/10 rounded-full" />
                     {[...Array(6)].map((_, i) => (
                         <div key={i} className="h-2 w-full bg-slate-100 rounded-full" />
                     ))}
                 </div>
                 {/* Right Calendar */}
                 <div className="w-32 h-32 bg-[#6366f1] rounded-3xl flex items-center justify-center shadow-2xl relative">
                    <div className="absolute -top-4 left-6 w-4 h-10 bg-slate-200 rounded-full" />
                    <div className="absolute -top-4 right-6 w-4 h-10 bg-slate-200 rounded-full" />
                    <span className="text-white text-6xl font-black">31</span>
                 </div>
             </div>

             {/* Title in Rounded Box */}
             <div className="w-[2000px] border-[8px] border-[#5b21b6]/20 py-10 rounded-[5rem] text-center shadow-sm">
                <h1 className="text-7xl font-black text-[#1e293b] uppercase tracking-widest">{title}</h1>
             </div>
        </div>
    );
};

// 4. Individual Student Comprehensive Report
const IndividualStudentReport: React.FC<AttendanceTemplateProps> = ({ reports, config, selectedMonth, classLevel, monthlyData, summary, teacherName }) => {
    const { t } = useTranslation();
    const r = reports?.[0] || { studentId: 'N/A', studentName: 'N/A', classLevel: 'N/A' };
    
    // Monthly Grid data
    const [year, month] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [...Array(daysInMonth)].map((_, i) => i + 1);

    // Filter to exactly this student
    const studentMonthlyData = monthlyData?.filter(rec => rec.studentId === r.studentId) || [];

    // Chart Data Preparation
    let uniquePresent = 0;
    let uniqueAbsent = 0;
    let uniqueLate = 0;
    const weeklyPresent = [0, 0, 0, 0];
    
    days.forEach(d => {
        const dayStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
        const rec = studentMonthlyData.find(rec => rec.date === dayStr);
        
        if (rec) {
            if (rec.status === 'present') uniquePresent++;
            else if (rec.status === 'absent') uniqueAbsent++;
            else if (rec.status === 'late') uniqueLate++;
        }
        
        const w = Math.floor((d-1) / 7);
        if (w < 4 && rec?.status === 'present') weeklyPresent[w]++;
    });

    const stats = {
        total: daysInMonth, // Force total to literal days equivalent
        present: uniquePresent,
        absent: uniqueAbsent,
        late: uniqueLate
    };

    const presentRate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    const absentRate = stats.total > 0 ? (stats.absent / stats.total) * 100 : 0;
    const lateRate = stats.total > 0 ? (stats.late / stats.total) * 100 : 0;

    const formatRate = (rate: number) => {
        return rate % 1 === 0 ? rate.toString() : rate.toFixed(1);
    };

    return (
        <div className="w-full h-full bg-white font-sans text-slate-800 flex flex-col p-0 text-left ltr:text-left rtl:text-right">
             <MinimalistHeader title={t('attendance.reports.studentReportTitle', 'STUDENT ATTENDANCE REPORT')} />
             
             <div className="p-16 flex-grow space-y-12">
                {/* 1. Student Identity Card */}
                <div className="p-8 flex justify-between items-start border-b-2 border-slate-100 pb-12">
                     <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                             <span className="text-slate-400 font-bold text-2xl uppercase tracking-tighter">{t('attendance.reports.studentCardLabel', 'STUDENT')} :</span>
                             <span className="text-8xl font-black text-[#1e293b] leading-tight">{r.studentName}</span>
                        </div>
                        <div className="flex gap-10 text-2xl font-bold text-slate-400 pt-2">
                            <span>ID : <span className="text-[#1e293b] font-black">{r.studentId}</span></span>
                            <span>Class : <span className="text-[#1e293b] font-black">{classLevel || r.classLevel}</span></span>
                        </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                        <span className="text-slate-400 font-bold text-2xl uppercase tracking-tighter">SCHOOL NAME :</span>
                        <p className="text-[#5b21b6] font-black text-6xl leading-tight">{config.schoolNameEn}</p>
                        <p className="text-slate-300 font-bold text-4xl uppercase tracking-widest">{selectedMonth}</p>
                    </div>
                </div>

                {/* 2. Summary Boxes */}
                <div className="grid grid-cols-3 gap-12 pt-6">
                    <div className="bg-[#5b21b6] text-white rounded-[4rem] p-12 py-24 text-center shadow-2xl border-b-[20px] border-black/10 flex flex-col items-center justify-center min-h-[420px]">
                        <p className="text-[10rem] font-black leading-none mb-10">{formatRate(presentRate)}%</p>
                        <p className="text-5xl font-black uppercase tracking-widest opacity-90">{t('attendance.reports.present', 'PRESENT')}</p>
                    </div>
                    <div className="bg-[#f43f5e] text-white rounded-[4rem] p-12 py-24 text-center shadow-2xl border-b-[20px] border-black/10 flex flex-col items-center justify-center min-h-[420px]">
                        <p className="text-[10rem] font-black leading-none mb-10">{formatRate(absentRate)}%</p>
                        <p className="text-5xl font-black uppercase tracking-widest opacity-90">{t('attendance.reports.absent', 'ABSENT')}</p>
                    </div>
                    <div className="bg-[#fbbf24] text-white rounded-[4rem] p-12 py-24 text-center shadow-2xl border-b-[20px] border-black/10 flex flex-col items-center justify-center min-h-[420px]">
                        <p className="text-[10rem] font-black leading-none mb-10">{formatRate(lateRate)}%</p>
                        <p className="text-5xl font-black uppercase tracking-widest opacity-90 leading-tight">{t('attendance.reports.late', 'LATE')}</p>
                    </div>
                </div>

                {/* 3. Monthly Sheet */}
                <div className="space-y-8 pt-8">
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-12 bg-[#5b21b6] rounded-full" />
                        <h3 className="text-5xl font-black text-[#1e293b] uppercase tracking-wider">{t('attendance.reports.monthlySheetTitle', 'MONTHLY ATTENDANCE SHEET')}</h3>
                    </div>
                    <div className="flex gap-2 text-2xl font-bold px-4 py-2 bg-slate-50/50 rounded-xl overflow-x-auto">
                        {days.map(d => {
                            const dayStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
                            const rec = studentMonthlyData.find(rec => rec.date === dayStr);
                            const status = rec ? (rec.status === 'present' ? 'A' : rec.status === 'absent' ? 'X' : 'L') : '';
                            return (
                                <div key={d} className="flex flex-col items-center gap-3 flex-grow min-w-[55px] p-2 bg-white rounded-lg shadow-sm">
                                    <span className="text-slate-400 text-xl font-bold">{d}</span>
                                    <span className={`text-5xl font-black ${status === 'X' ? 'text-[#f43f5e]' : status === 'L' ? 'text-[#fbbf24]' : status === 'A' ? 'text-[#5b21b6]' : 'text-slate-100'}`}>{status || '·'}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-16 text-2xl font-bold px-4 pt-4">
                        <div className="flex items-center gap-3"><span className="text-[#5b21b6] font-black text-4xl">A</span> <span className="text-slate-400">{t('attendance.reports.present', 'Present')}</span></div>
                        <div className="flex items-center gap-3"><span className="text-[#f43f5e] font-black text-4xl">X</span> <span className="text-slate-400">{t('attendance.reports.absent', 'Absent')}</span></div>
                        <div className="flex items-center gap-3"><span className="text-[#fbbf24] font-black text-4xl">L</span> <span className="text-slate-400">{t('attendance.reports.late', 'Late')}</span></div>
                    </div>
                </div>

                {/* 4. Text Summary Summary */}
                <div className="space-y-6 pt-12">
                   <div className="flex justify-center gap-24 py-8 border-t border-slate-100">
                        <div className="flex items-center gap-4 text-4xl font-bold text-slate-700">
                            <div className="w-8 h-8 bg-[#5b21b6] rounded-full" />
                            <span><span className="text-[#1e293b] font-black">{stats.present}</span> {t('attendance.reports.daysPresent', 'days present')}.</span>
                        </div>
                        <div className="flex items-center gap-4 text-4xl font-bold text-slate-700">
                            <div className="w-8 h-8 bg-[#f43f5e] rounded-full" />
                            <span><span className="text-[#1e293b] font-black">{stats.absent}</span> {t('attendance.reports.daysAbsent', 'days absent')}.</span>
                        </div>
                        <div className="flex items-center gap-4 text-4xl font-bold text-slate-700">
                            <div className="w-8 h-8 bg-[#fbbf24] rounded-full" />
                            <span><span className="text-[#1e293b] font-black">{stats.late}</span> {t('attendance.reports.daysLate', 'days late')}.</span>
                        </div>
                    </div>

                    {/* Attendance Status Banner */}
                    <div className={`p-8 rounded-[2rem] border-4 flex items-center justify-center gap-6 text-4xl font-black shadow-sm ${(presentRate + lateRate) >= 80 ? 'bg-green-50/50 border-green-400/30 text-green-700' : 'bg-red-50/50 border-red-400/30 text-red-700'}`}>
                        <span>{(presentRate + lateRate) >= 80 ? '✓' : '⚠'}</span>
                        <span className="uppercase tracking-tight">
                            {(presentRate + lateRate) >= 80 
                                ? 'Attendance is GOOD — above the 80% recommended threshold' 
                                : 'Attendance is LOW — below the 80% recommended threshold'}
                        </span>
                    </div>
                </div>

                {/* 5. ATTENDANCE CHARTS */}
                <div className="space-y-12 pt-8">
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-12 bg-[#5b21b6] rounded-full" />
                        <h3 className="text-5xl font-black text-[#1e293b] uppercase tracking-wider">{t('attendance.reports.attendanceCharts', 'ATTENDANCE CHARTS')}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-10">
                        {/* Donut Chart Box */}
                        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-10 flex flex-col gap-8 shadow-sm">
                            <h4 className="text-2xl font-black text-slate-400 uppercase tracking-widest pl-4">{t('attendance.reports.breakdown', 'BREAKDOWN')}</h4>
                            <div className="flex items-center justify-around">
                                <div className="relative w-64 h-64">
                                     <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="15" />
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#5b21b6" strokeWidth="15" strokeDasharray={`${(stats.present/stats.total)*251} 251`} />
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="15" strokeDasharray={`${(stats.late/stats.total)*251} 251`} strokeDashoffset={`${-(stats.present/stats.total)*251}`} />
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e" strokeWidth="15" strokeDasharray={`${(stats.absent/stats.total)*251} 251`} strokeDashoffset={`${-((stats.present+stats.late)/stats.total)*251}`} />
                                     </svg>
                                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-6xl font-black text-[#1e293b] leading-tight">{stats.total}</span>
                                        <span className="text-xl font-bold text-slate-400 uppercase">DAYS</span>
                                     </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between w-48 gap-4">
                                        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-[#5b21b6]" /><span className="text-2xl font-bold text-slate-400">{t('attendance.reports.present')}</span></div>
                                        <span className="text-3xl font-black text-[#5b21b6]">{stats.present}</span>
                                    </div>
                                    <div className="flex items-center justify-between w-48 gap-4">
                                        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-[#fbbf24]" /><span className="text-2xl font-bold text-slate-400">{t('attendance.reports.late', 'Late')}</span></div>
                                        <span className="text-3xl font-black text-[#fbbf24]">{stats.late}</span>
                                    </div>
                                    <div className="flex items-center justify-between w-48 gap-4">
                                        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-[#f43f5e]" /><span className="text-2xl font-bold text-slate-400">{t('attendance.reports.absent')}</span></div>
                                        <span className="text-3xl font-black text-[#f43f5e]">{stats.absent}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Bar Chart Box */}
                        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-10 flex flex-col gap-8 shadow-sm">
                            <h4 className="text-2xl font-black text-slate-400 uppercase tracking-widest pl-4">{t('attendance.reports.weeklyPresentDays', 'WEEKLY PRESENT DAYS')}</h4>
                            <div className="flex items-end justify-between px-10 h-64 border-b border-slate-100 pb-2">
                                {weeklyPresent.map((val, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                         <span className="text-2xl font-black text-[#5b21b6] mb-1">{val}</span>
                                         <div className="w-16 bg-slate-50 rounded-lg relative overflow-hidden" style={{ height: '180px' }}>
                                             <div className="absolute bottom-0 w-full" style={{ height: `${(val/7)*100}%`, backgroundColor: i === 0 ? '#f43f5e' : (i < 3 ? '#5b21b6' : '#fbbf24') }} />
                                         </div>
                                         <span className="text-xl font-bold text-slate-400 mt-2 uppercase">W{i+1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Daily Pattern Line Chart Box */}
                    <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-10 flex flex-col gap-6 shadow-sm">
                         <h4 className="text-2xl font-black text-slate-400 uppercase tracking-widest pl-4">{t('attendance.reports.dailyPattern', 'DAILY PATTERN')} — {selectedMonth?.toUpperCase()}</h4>
                         <div className="w-full h-[220px] relative px-10">
                            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full opacity-10">
                                <path d="M0 50 L1000 50" stroke="#1e293b" strokeWidth="2" strokeDasharray="5,5" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-between px-10">
                                <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                     <polyline 
                                        fill="none" 
                                        stroke="#5b21b6" 
                                        strokeWidth="3" 
                                        points={days.map((d, i) => {
                                            const dayStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
                                            const rec = monthlyData?.find(rec => rec.date === dayStr);
                                            const y = rec?.status === 'present' ? 20 : (rec?.status === 'late' ? 50 : 80);
                                            return `${(i / (days.length-1)) * 1000},${y}`;
                                        }).join(' ')}
                                     />
                                     {days.map((d, i) => {
                                        const dayStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
                                        const rec = monthlyData?.find(rec => rec.date === dayStr);
                                        const y = rec?.status === 'present' ? 20 : (rec?.status === 'late' ? 50 : 80);
                                        const color = rec?.status === 'present' ? '#5b21b6' : (rec?.status === 'late' ? '#fbbf24' : '#f43f5e');
                                        return (
                                            <circle key={i} cx={(i / (days.length-1)) * 1000} cy={y} r="8" fill={color} stroke="white" strokeWidth="2" />
                                        );
                                     })}
                                </svg>
                            </div>
                         </div>
                    </div>
                </div>

                {/* 6. Footer Signature */}
                <div className="pt-32 flex justify-between items-end border-t-2 border-slate-50 mt-12">
                    <div className="w-1/3 border-b-2 border-slate-100 pb-4">
                        <span className="text-3xl font-black text-[#1e293b] uppercase opacity-70">{t('attendance.reports.preparedBy', 'PREPARED BY')} :</span>
                        <p className="text-5xl font-black text-[#1e293b] pt-4">{teacherName || 'Macallin Axmed Cali'}</p>
                    </div>
                    <div className="text-right space-y-12">
                         <div className="flex items-center gap-4 border-b border-slate-100 pb-2">
                            <span className="text-2xl font-black text-slate-300 uppercase">{t('attendance.reports.dateLabel', 'DATE')}</span>
                            <span className="text-4xl font-bold text-[#1e293b] min-w-[300px]">{new Date().toLocaleDateString()}</span>
                         </div>
                         <div className="pt-10 pr-12">
                            <p className="text-[10rem] font-bold text-slate-200 italic leading-none" style={{ fontFamily: 'cursive', opacity: 0.15 }}>{teacherName || 'Macallin Axmed Cali'}</p>
                         </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

export const ATTENDANCE_TEMPLATES = {
    daily: { name: 'Daily Report', component: DailyAttendanceReport },
    monthly: { name: 'Monthly Sheet', component: MonthlyAttendanceSheet },
    summary: { name: 'Summary Report', component: AttendanceSummaryReport },
    student: { name: 'Student Report', component: IndividualStudentReport },
};

const AttendanceTemplates: React.FC<AttendanceTemplateProps> = (props) => {
    const { config, type = 'daily' } = props;
    
    let templateId = type as keyof typeof ATTENDANCE_TEMPLATES;
    if (!ATTENDANCE_TEMPLATES[templateId]) {
        templateId = 'daily';
    }

    const Template = ATTENDANCE_TEMPLATES[templateId]?.component || DailyAttendanceReport;
    const isLandscape = templateId === 'monthly';

    return (
        <div 
            id="attendance-inner-template" 
            style={{ 
                width: isLandscape ? '3508px' : '2480px', 
                height: isLandscape ? '2480px' : '3508px', 
                backgroundColor: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Template {...props} />
        </div>
    );
};

export default AttendanceTemplates;
