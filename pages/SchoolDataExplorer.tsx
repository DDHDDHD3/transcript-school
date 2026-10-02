import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    School, Search, Users, UserCog, Calendar, Activity, ArrowLeft,
    Download, Loader2, ChevronDown, CheckCircle2, XCircle, Clock,
    BookOpen, Phone, Mail, Hash, MapPin, CreditCard, Zap, Filter,
    TrendingUp, AlertTriangle, RefreshCw, Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSchools, getSchoolFullData } from '../services/api';

type Tab = 'overview' | 'students' | 'teachers' | 'attendance' | 'activity';

const STATUS_STYLES: Record<string, string> = {
    present:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    absent:   'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    late:     'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    excused:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    active:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const Pill = ({ value }: { value: string }) => (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[value?.toLowerCase()] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
        {value || '—'}
    </span>
);

const SchoolDataExplorer = () => {
    const navigate = useNavigate();

    // Schools list for selector
    const [schools, setSchools] = useState<any[]>([]);
    const [schoolSearch, setSchoolSearch] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<any>(null);

    // Full data for selected school
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // UI state
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [attendanceSearch, setAttendanceSearch] = useState('');
    const [attendanceMonth, setAttendanceMonth] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [teacherSearch, setTeacherSearch] = useState('');

    useEffect(() => {
        getSchools().then(setSchools);
    }, []);

    const filteredSchools = useMemo(() =>
        schools.filter(s => s.name.toLowerCase().includes(schoolSearch.toLowerCase())),
        [schools, schoolSearch]
    );

    const loadSchoolData = async (school: any) => {
        setSelectedSchool(school);
        setDropdownOpen(false);
        setActiveTab('overview');
        setData(null);
        setLoading(true);
        const result = await getSchoolFullData(school.id);
        setData(result);
        setLoading(false);
    };

    // Filtered attendance
    const filteredAttendance = useMemo(() => {
        if (!data?.attendance) return [];
        return data.attendance.filter((r: any) => {
            const matchesSearch = !attendanceSearch ||
                r.studentName?.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
                r.classLevel?.toLowerCase().includes(attendanceSearch.toLowerCase());
            const matchesMonth = !attendanceMonth || r.date?.startsWith(attendanceMonth);
            return matchesSearch && matchesMonth;
        });
    }, [data?.attendance, attendanceSearch, attendanceMonth]);

    // Attendance summary by status
    const attendanceSummary = useMemo(() => {
        if (!data?.attendance) return {};
        return data.attendance.reduce((acc: any, r: any) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
        }, {});
    }, [data?.attendance]);

    const exportCSV = (rows: any[], filename: string) => {
        if (!rows.length) return;
        const headers = Object.keys(rows[0]).join(',');
        const body = rows.map(r => Object.values(r).map(v => `"${v ?? ''}"`).join(',')).join('\n');
        const blob = new Blob([`${headers}\n${body}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const TABS: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
        { id: 'overview',    label: 'Overview',    icon: School },
        { id: 'students',    label: 'Students',    icon: Users,     count: data?.students?.length },
        { id: 'teachers',    label: 'Teachers',    icon: UserCog,   count: data?.teachers?.length },
        { id: 'attendance',  label: 'Attendance',  icon: Calendar,  count: data?.attendance?.length },
        { id: 'activity',    label: 'Activity Log',icon: Activity,  count: data?.activity?.length },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-6 md:p-10 transition-colors">
            <div className="max-w-7xl mx-auto">

                {/* ── Header ─────────────────────────────── */}
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => navigate('/super')}
                        className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-[var(--text-main)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-3">
                            <Database className="text-indigo-600 dark:text-indigo-400" size={24} />
                            School Data Explorer
                        </h1>
                        <p className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-widest mt-0.5">
                            Super Admin · Complete School Data Access
                        </p>
                    </div>
                </div>

                {/* ── School Selector ─────────────────────── */}
                <div className="relative mb-8">
                    <div
                        onClick={() => setDropdownOpen(v => !v)}
                        className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl px-5 py-4 flex items-center justify-between gap-4 cursor-pointer shadow-sm hover:border-indigo-300 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <School className="text-indigo-600 dark:text-indigo-400" size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Select School</p>
                                <p className="text-sm font-black text-[var(--text-main)]">
                                    {selectedSchool?.name || 'Choose a school by name…'}
                                </p>
                            </div>
                        </div>
                        <ChevronDown size={18} className={`text-[var(--text-muted)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 mt-2 w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden"
                            >
                                <div className="p-3 border-b border-[var(--border-color)]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search by school name…"
                                            value={schoolSearch}
                                            onChange={e => setSchoolSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl text-sm font-bold text-[var(--text-main)] focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {filteredSchools.length > 0 ? filteredSchools.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => loadSchoolData(s)}
                                            className="w-full text-left px-5 py-3.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-between gap-4 border-b border-[var(--border-color)] last:border-0"
                                        >
                                            <div>
                                                <p className="font-black text-[var(--text-main)] text-sm">{s.name}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-bold">{s.id}</p>
                                            </div>
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${s.sub_status === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300'}`}>
                                                {s.sub_status}
                                            </span>
                                        </button>
                                    )) : (
                                        <div className="py-8 text-center text-[var(--text-muted)] text-sm font-bold">No schools found</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Loading ────────────────────────────── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={40} />
                        <p className="text-[var(--text-muted)] text-[11px] font-black uppercase tracking-widest">
                            Fetching complete data for {selectedSchool?.name}…
                        </p>
                    </div>
                )}

                {/* ── No school selected ─────────────────── */}
                {!selectedSchool && !loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)]">
                        <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center">
                            <Database className="text-[var(--text-muted)]" size={36} />
                        </div>
                        <p className="text-lg font-black text-[var(--text-main)] uppercase tracking-widest">Select a school to explore its data</p>
                    </div>
                )}

                {/* ── Data Explorer ──────────────────────── */}
                {data && !loading && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                        {/* Tab Bar */}
                        <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-1.5 mb-8 shadow-sm flex-wrap">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-black'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'
                                    }`}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* ── OVERVIEW TAB ───────────────────── */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* School Profile Card */}
                                <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] p-8 shadow-sm">
                                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6">School Profile</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { icon: School,    label: 'Name',         value: data.school?.name || '—' },
                                            { icon: Hash,      label: 'School ID',     value: data.school?.id || '—' },
                                            { icon: MapPin,    label: 'Location',      value: data.school?.location || '—' },
                                            { icon: Phone,     label: 'Phone',         value: data.school?.phone_number || data.school?.phone || '—' },
                                            { icon: Calendar,  label: 'Sub Expiry',    value: data.school?.sub_expiry ? new Date(data.school.sub_expiry).toLocaleDateString() : '—' },
                                            { icon: CheckCircle2, label: 'Status',     value: data.school?.status || data.school?.sub_status || '—' },
                                            { icon: CreditCard, label: 'Plan',         value: data.school?.plan_type || '—' },
                                            { icon: Zap,       label: 'Credits',       value: data.school?.credits ?? 0 },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl">
                                                <div className="w-8 h-8 bg-[var(--bg-card)] rounded-lg flex items-center justify-center shadow-sm">
                                                    <Icon size={14} className="text-indigo-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</p>
                                                    <p className="text-sm font-black text-[var(--text-main)] truncate max-w-[180px]">{String(value)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="flex flex-col gap-4">
                                    {[
                                        { label: 'Total Students', value: data.school?.student_count ?? data.students?.length, icon: Users, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
                                        { label: 'Total Teachers', value: data.school?.teacher_count ?? data.teachers?.length, icon: UserCog, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
                                        { label: 'Attendance Records', value: data.school?.attendance_count ?? data.attendance?.length, icon: Calendar, color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
                                        { label: 'Activity Events', value: data.activity?.length, icon: Activity, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-[var(--bg-card)] rounded-[1.5rem] border border-[var(--border-color)] p-6 shadow-sm flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                                                <s.icon size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{s.label}</p>
                                                <p className="text-2xl font-black text-[var(--text-main)]">{s.value ?? 0}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Attendance Breakdown */}
                                <div className="lg:col-span-3 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] p-8 shadow-sm">
                                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6">Attendance Breakdown (All Records)</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {[
                                            { status: 'present', label: 'Present', color: 'bg-emerald-500' },
                                            { status: 'absent',  label: 'Absent',  color: 'bg-rose-500' },
                                            { status: 'late',    label: 'Late',    color: 'bg-amber-500' },
                                            { status: 'excused', label: 'Excused', color: 'bg-indigo-500' },
                                        ].map(({ status, label, color }) => {
                                            const count = attendanceSummary[status] || 0;
                                            const total = data.attendance?.length || 1;
                                            const pct   = Math.round((count / total) * 100);
                                            return (
                                                <div key={status} className="flex-1 min-w-[160px] p-5 bg-[var(--bg-secondary)] rounded-2xl">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
                                                        <span className="text-xs font-black text-[var(--text-main)]">{pct}%</span>
                                                    </div>
                                                    <p className="text-3xl font-black text-[var(--text-main)] mb-3">{count}</p>
                                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STUDENTS TAB ───────────────────── */}
                        {activeTab === 'students' && (
                            <div className="bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] shadow-sm overflow-hidden">
                                <div className="px-8 py-5 border-b border-[var(--border-color)] flex items-center justify-between gap-4 flex-wrap">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Search students…"
                                            value={studentSearch}
                                            onChange={e => setStudentSearch(e.target.value)}
                                            className="pl-9 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-main)] focus:outline-none w-72"
                                        />
                                    </div>
                                    <button
                                        onClick={() => exportCSV(data.students, `${selectedSchool?.name}_students.csv`)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all"
                                    >
                                        <Download size={14} /> Export CSV
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                                            <tr>
                                                {['#','Student ID','Full Name','Arabic Name','Class','Parent','Phone','Status'].map(h => (
                                                    <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-color)]">
                                            {data.students
                                                .filter((s: any) => !studentSearch ||
                                                    s.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                                    s.studentId?.toLowerCase().includes(studentSearch.toLowerCase()))
                                                .map((s: any, i: number) => (
                                                <tr key={s.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                                    <td className="px-6 py-4 text-[11px] font-bold text-[var(--text-muted)]">{i + 1}</td>
                                                    <td className="px-6 py-4 text-[11px] font-black text-indigo-600 dark:text-indigo-400 font-mono">{s.studentId}</td>
                                                    <td className="px-6 py-4 text-sm font-black text-[var(--text-main)]">{s.fullName}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-[var(--text-main)] text-right" dir="rtl">{s.fullNameAr || '—'}</td>
                                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-main)] rounded-lg text-[10px] font-black uppercase">{s.classLevel || '—'}</span></td>
                                                    <td className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)]">{s.parentName || '—'}</td>
                                                    <td className="px-6 py-4 text-[11px] font-bold text-[var(--text-muted)]">{s.parentPhone || '—'}</td>
                                                    <td className="px-6 py-4"><Pill value={s.status || 'active'} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {data.students.length === 0 && (
                                        <div className="py-16 text-center text-[var(--text-muted)] font-black text-sm uppercase">No students enrolled</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── TEACHERS TAB ───────────────────── */}
                        {activeTab === 'teachers' && (
                            <div className="bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] shadow-sm overflow-hidden">
                                <div className="px-8 py-5 border-b border-[var(--border-color)] flex items-center justify-between gap-4 flex-wrap">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Search teachers…"
                                            value={teacherSearch}
                                            onChange={e => setTeacherSearch(e.target.value)}
                                            className="pl-9 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-main)] focus:outline-none w-72"
                                        />
                                    </div>
                                    <button
                                        onClick={() => exportCSV(data.teachers, `${selectedSchool?.name}_teachers.csv`)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                                    >
                                        <Download size={14} /> Export CSV
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                                            <tr>
                                                {['#','Full Name','Arabic Name','Email','Phone','Assigned Classes'].map(h => (
                                                    <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-color)]">
                                            {data.teachers
                                                .filter((t: any) => !teacherSearch ||
                                                    t.fullName?.toLowerCase().includes(teacherSearch.toLowerCase()))
                                                .map((t: any, i: number) => (
                                                <tr key={t.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                                    <td className="px-6 py-4 text-[11px] font-bold text-[var(--text-muted)]">{i + 1}</td>
                                                    <td className="px-6 py-4 text-sm font-black text-[var(--text-main)]">{t.fullName}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-[var(--text-main)] text-right" dir="rtl">{t.fullNameAr || '—'}</td>
                                                    <td className="px-6 py-4 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">{t.email || '—'}</td>
                                                    <td className="px-6 py-4 text-[11px] font-bold text-[var(--text-muted)]">{t.phone || '—'}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {(Array.isArray(t.assignedClasses) ? t.assignedClasses : (t.assignedClasses ? [t.assignedClasses] : [])).map((c: string) => (
                                                                <span key={c} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase">{c}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {data.teachers.length === 0 && (
                                        <div className="py-16 text-center text-[var(--text-muted)] font-black text-sm uppercase">No teachers registered</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── ATTENDANCE TAB ─────────────────── */}
                        {activeTab === 'attendance' && (
                            <div className="bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] shadow-sm overflow-hidden">
                                <div className="px-8 py-5 border-b border-[var(--border-color)] flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search by student or class…"
                                                value={attendanceSearch}
                                                onChange={e => setAttendanceSearch(e.target.value)}
                                                className="pl-9 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-main)] focus:outline-none w-64"
                                            />
                                        </div>
                                        <div className="relative flex items-center gap-2">
                                            <Filter size={14} className="text-[var(--text-muted)]" />
                                            <input
                                                type="month"
                                                value={attendanceMonth}
                                                onChange={e => setAttendanceMonth(e.target.value)}
                                                className="px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-main)] focus:outline-none"
                                            />
                                            {attendanceMonth && (
                                                <button onClick={() => setAttendanceMonth('')} className="text-[10px] font-black text-rose-500">Clear</button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase">
                                            Showing {filteredAttendance.length} of {data.attendance?.length} records
                                        </span>
                                        <button
                                            onClick={() => exportCSV(filteredAttendance, `${selectedSchool?.name}_attendance.csv`)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                                        >
                                            <Download size={14} /> Export CSV
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                                            <tr>
                                                {['Date','Student','Class','Teacher','Status','Session','Notes'].map(h => (
                                                    <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-color)]">
                                            {filteredAttendance.slice(0, 200).map((r: any, i: number) => (
                                                <tr key={r.id || i} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                                    <td className="px-6 py-3 text-[11px] font-black text-[var(--text-main)] font-mono whitespace-nowrap">{r.date}</td>
                                                    <td className="px-6 py-3 text-sm font-bold text-[var(--text-main)] whitespace-nowrap">{r.studentName || r.studentId}</td>
                                                    <td className="px-6 py-3"><span className="px-2 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-main)] rounded text-[9px] font-black uppercase">{r.classLevel || '—'}</span></td>
                                                    <td className="px-6 py-3 text-[11px] font-bold text-[var(--text-secondary)] whitespace-nowrap">{r.teacherName || '—'}</td>
                                                    <td className="px-6 py-3"><Pill value={r.status} /></td>
                                                    <td className="px-6 py-3 text-[10px] font-bold text-[var(--text-muted)] uppercase">{r.session || '—'}</td>
                                                    <td className="px-6 py-3 text-[11px] text-[var(--text-secondary)] max-w-[180px] truncate">{r.notes || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredAttendance.length === 0 && (
                                        <div className="py-16 text-center text-[var(--text-muted)] font-black text-sm uppercase">No attendance records match</div>
                                    )}
                                    {filteredAttendance.length > 200 && (
                                        <div className="px-8 py-4 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-widest text-center">
                                            Showing first 200 of {filteredAttendance.length} records. Use the month filter or export CSV for full data.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── ACTIVITY TAB ───────────────────── */}
                        {activeTab === 'activity' && (
                            <div className="bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] shadow-sm overflow-hidden">
                                <div className="px-8 py-5 border-b border-[var(--border-color)]">
                                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Activity Log — Last 100 Events</h3>
                                </div>
                                <div className="divide-y divide-[var(--border-color)]">
                                    {data.activity.length > 0 ? data.activity.map((act: any, i: number) => (
                                        <div key={i} className="px-8 py-4 flex items-center gap-4 hover:bg-[var(--bg-secondary)] transition-colors">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                act.type === 'Login'   ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                                act.type === 'Student' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                                                         'bg-[var(--bg-secondary)] text-[var(--text-main)]'
                                            }`}>
                                                <Activity size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-[var(--text-main)] truncate">{act.action}</p>
                                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                                                    {act.userEmail} · {act.type}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-black text-[var(--text-muted)] whitespace-nowrap">
                                                {act.timestamp ? new Date(act.timestamp).toLocaleString() : '—'}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="py-16 text-center text-[var(--text-muted)] font-black text-sm uppercase">No activity logged yet</div>
                                    )}
                                </div>
                            </div>
                        )}

                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SchoolDataExplorer;
