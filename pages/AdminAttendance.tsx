import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    AlertTriangle,
    Save,
    BarChart3,
    ChevronRight,
    ChevronLeft,
    Search,
    Filter,
    Download,
    FileSpreadsheet,
    Loader2,
    ArrowLeft,
    Edit2,
    X,
    Search as SearchIcon,
    AlertTriangle as WarningIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Student, AttendanceRecord, AttendanceReport, CertificateConfig } from '../types';
import { generateAttendancePDF } from '../utils/attendancePdfGenerator';
import { normalizeArabic } from '../utils/stringUtils';
import {
    getStudents,
    getAttendance,
    saveAttendance,
    getAttendanceReport,
    getMonthlyAttendance,
    getConfig
} from '../services/mockBackend';

const AdminAttendance = () => {
    const { t, i18n } = useTranslation();
    const [view, setView] = useState<'record' | 'reports' | 'monthly'>('record');
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSession, setSelectedSession] = useState<'morning' | 'afternoon'>('morning');
    const [classFilter, setClassFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [reportData, setReportData] = useState<AttendanceReport[]>([]);
    const [reportRange, setReportRange] = useState({
        start: new Date(new Date().setDate(1)).toISOString().split('T')[0], // Start of month
        end: new Date().toISOString().split('T')[0]
    });
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [monthlyData, setMonthlyData] = useState<AttendanceRecord[]>([]);
    const [isMonthlyEditing, setIsMonthlyEditing] = useState(false);
    const [tempMonthlyData, setTempMonthlyData] = useState<AttendanceRecord[]>([]);
    const [monthlyBrush, setMonthlyBrush] = useState<'present' | 'absent' | null>('present');
    const [config, setConfig] = useState<CertificateConfig | null>(null);

    // Toast State
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const classLevels = Array.from(new Set(students.map(s => s.classLevel))).sort();

    const filteredStudents = students.filter(s => {
        const matchesClass = s.classLevel === classFilter;
        const normalizedSearch = normalizeArabic(searchTerm);
        const matchesSearch = !searchTerm ||
            normalizeArabic(s.fullName).includes(normalizedSearch) ||
            s.studentId.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesClass && matchesSearch;
    });

    const globalMatches = searchTerm ? students.filter(s => {
        const normalizedSearch = normalizeArabic(searchTerm);
        return normalizeArabic(s.fullName).includes(normalizedSearch) ||
            s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    }) : [];

    const hasResultsInOtherClasses = searchTerm && filteredStudents.length === 0 && globalMatches.length > 0;

    useEffect(() => {
        loadStudents();
        getConfig().then(setConfig);
    }, []);

    useEffect(() => {
        if (view === 'record') {
            loadAttendance();
        } else if (view === 'monthly') {
            loadMonthly();
        }
    }, [date, classFilter, view, selectedSession, selectedMonth]);

    const loadStudents = async () => {
        setLoading(true);
        const data = await getStudents();
        setStudents(data);
        if (data.length > 0 && !classFilter) {
            setClassFilter(data[0].classLevel);
        }
        setLoading(false);
    };

    const loadAttendance = async () => {
        setLoading(true);
        // Note: mockBackend getAttendance needs to be updated or we handle filtering here
        const data = await getAttendance(date, classFilter);
        const attendanceMap: Record<string, AttendanceRecord> = {};
        data.forEach(rec => {
            if (rec.session === selectedSession || !rec.session) {
                attendanceMap[rec.studentId] = rec;
            }
        });
        setAttendance(attendanceMap);
        setLoading(false);
    };

    const loadReport = async () => {
        setLoading(true);
        const data = await getAttendanceReport(reportRange.start, reportRange.end, classFilter);
        setReportData(data);
        setLoading(false);
    };

    const loadMonthly = async () => {
        setLoading(true);
        const [year, month] = selectedMonth.split('-').map(Number);
        const data = await getMonthlyAttendance(year, month, classFilter);
        setMonthlyData(data);
        setTempMonthlyData(data);
        setLoading(false);
    };

    const handleMonthlyCellClick = (studentId: string, date: string) => {
        if (!isMonthlyEditing) return;

        let nextStatus: 'present' | 'absent' | null;

        if (monthlyBrush) {
            nextStatus = monthlyBrush;
        } else {
            const currentRecords = tempMonthlyData.filter(r => r.studentId === studentId && r.date === date);
            const currentStatus = currentRecords.length > 0 ? currentRecords[0].status : null;
            if (!currentStatus) nextStatus = 'present';
            else if (currentStatus === 'present') nextStatus = 'absent';
            else nextStatus = null;
        }

        const newTemp = tempMonthlyData.filter(r => !(r.studentId === studentId && r.date === date));

        if (nextStatus) {
            newTemp.push({
                id: '',
                studentId,
                schoolId: '',
                date,
                status: nextStatus as 'present' | 'absent',
                recordedBy: 'Admin',
                createdAt: new Date().toISOString()
            });
        }

        setTempMonthlyData(newTemp);
    };

    const handleSaveMonthly = async () => {
        setLoading(true);
        const success = await saveAttendance(tempMonthlyData);
        if (success) {
            showToast(t('attendance.messages.saveSuccess'), 'success');
            setMonthlyData(tempMonthlyData);
            setIsMonthlyEditing(false);
        } else {
            showToast(t('attendance.messages.saveError'), 'error');
        }
        setLoading(false);
    };

    const handlePrevDay = () => {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        setDate(d.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        setDate(d.toISOString().split('T')[0]);
    };

    const handleExportPDF = async () => {
        if (!config) return;
        setLoading(true);
        const success = await generateAttendancePDF('attendance-report-template', `Attendance_Report_${selectedMonth}`, i18n.language);
        if (!success) showToast(t('attendance.messages.pdfError'), 'error');
        setLoading(false);
    };

    const handleExportExcel = () => {
        if (reportData.length === 0) {
            showToast(t('students.messages.noRecords'), 'error');
            return;
        }
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
            showToast(t('attendance.messages.xlsxError'), 'error');
            return;
        }

        const excelData = reportData.map(r => ({
            [t('attendance.reports.student')]: r.studentName,
            [t('attendance.table.id')]: r.studentId,
            [t('attendance.reports.total')]: r.totalDays,
            [t('attendance.reports.present')]: r.presentDays,
            [t('attendance.reports.absent')]: r.absentDays,
            [t('attendance.reports.rate')]: r.attendanceRate + '%'
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('attendance.reports.title'));
        XLSX.writeFile(workbook, `Attendance_Report_${date}.xlsx`);
    };

    const getSummary = () => {
        const filteredIds = filteredStudents.map(s => s.studentId);
        const counts = {
            total: filteredStudents.length,
            present: 0,
            absent: 0
        };

        filteredIds.forEach(id => {
            const status = attendance[id]?.status;
            if (status === 'present') counts.present++;
            else if (status === 'absent') counts.absent++;
        });

        return counts;
    };

    const summary = getSummary();

    const handleStatusChange = (studentId: string, status: 'present' | 'absent') => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {
                    id: '',
                    studentId,
                    schoolId: '',
                    date,
                    session: selectedSession,
                    recordedBy: 'Admin',
                    createdAt: new Date().toISOString()
                }),
                status,
                session: selectedSession
            }
        }));
    };

    const handleNotesChange = (studentId: string, notes: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {
                    id: '',
                    studentId,
                    schoolId: '',
                    date,
                    status: 'present' as const,
                    session: selectedSession,
                    recordedBy: 'Admin',
                    createdAt: new Date().toISOString()
                }),
                notes,
                session: selectedSession
            }
        }));
    };

    const markAllPresent = () => {
        const newAttendance = { ...attendance };
        filteredStudents.forEach(s => {
            if (!newAttendance[s.studentId]) {
                newAttendance[s.studentId] = {
                    id: '',
                    studentId: s.studentId,
                    schoolId: '',
                    date,
                    status: 'present' as const,
                    session: selectedSession,
                    recordedBy: 'Admin',
                    createdAt: new Date().toISOString()
                };
            } else {
                newAttendance[s.studentId].status = 'present' as const;
                newAttendance[s.studentId].session = selectedSession;
            }
        });
        setAttendance(newAttendance);
    };

    const markAllAbsent = () => {
        const newAttendance = { ...attendance };
        filteredStudents.forEach(s => {
            if (!newAttendance[s.studentId]) {
                newAttendance[s.studentId] = {
                    id: '',
                    studentId: s.studentId,
                    schoolId: '',
                    date,
                    status: 'absent' as const,
                    session: selectedSession,
                    recordedBy: 'Admin',
                    createdAt: new Date().toISOString()
                };
            } else {
                newAttendance[s.studentId].status = 'absent' as const;
                newAttendance[s.studentId].session = selectedSession;
            }
        });
        setAttendance(newAttendance);
    };

    const handleSave = async () => {
        setLoading(true);
        const recordsToSave: AttendanceRecord[] = filteredStudents.map(s => ({
            ...(attendance[s.studentId] || {
                id: '',
                studentId: s.studentId,
                schoolId: '',
                date,
                status: 'present' as const, // Default to present if not marked
                session: selectedSession,
                recordedBy: 'Admin',
                createdAt: new Date().toISOString()
            }),
            date, // Ensure date is correct
            session: selectedSession // Ensure session is correct
        }));

        const success = await saveAttendance(recordsToSave);
        if (success) {
            showToast(t('attendance.messages.saveSuccess'), 'success');
        } else {
            showToast(t('attendance.messages.saveError'), 'error');
        }
        setLoading(false);
    };



    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto" dir={i18n.dir()}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Calendar className="text-qabas-purple" size={32} />
                        {t('attendance.title')}
                    </h1>
                    <p className="text-slate-500 mt-1">{t('attendance.subtitle')}</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setView('record')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'record' ? 'bg-white text-qabas-purple shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t('attendance.recordBtn')}
                    </button>
                    <button
                        onClick={() => { setView('reports'); loadReport(); }}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'reports' ? 'bg-white text-qabas-purple shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t('attendance.reportsBtn')}
                    </button>
                    <button
                        onClick={() => { setView('monthly'); loadMonthly(); }}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'monthly' ? 'bg-white text-qabas-purple shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t('attendance.monthlyBtn')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Filter size={18} className="text-qabas-purple" />
                            {t('nav.settings')}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">{t('attendance.selectDate')}</label>
                                <div className="flex items-center gap-1">
                                    <button onClick={handlePrevDay} className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"><ChevronLeft size={16} /></button>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-qabas-purple outline-none text-xs"
                                    />
                                    <button onClick={handleNextDay} className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"><ChevronRight size={16} /></button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">{t('attendance.session.label')}</label>
                                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                                    <button
                                        onClick={() => setSelectedSession('morning')}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedSession === 'morning' ? 'bg-white text-qabas-purple shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {t('attendance.session.morning')}
                                    </button>
                                    <button
                                        onClick={() => setSelectedSession('afternoon')}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedSession === 'afternoon' ? 'bg-white text-qabas-purple shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {t('attendance.session.afternoon')}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">{t('attendance.selectClass')}</label>
                                <select
                                    value={classFilter}
                                    onChange={(e) => setClassFilter(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-qabas-purple outline-none"
                                >
                                    {classLevels.map(level => (
                                        <option key={level} value={level}>
                                            {level.startsWith('level') ? t(`students.levels.${level}`) : level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {view === 'reports' && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4">{t('attendance.reports.period')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">From</label>
                                    <input
                                        type="date"
                                        value={reportRange.start}
                                        onChange={(e) => setReportRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">To</label>
                                    <input
                                        type="date"
                                        value={reportRange.end}
                                        onChange={(e) => setReportRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                    />
                                </div>
                                <button
                                    onClick={loadReport}
                                    className="w-full py-3 bg-qabas-purple text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    {t('attendance.reports.generate')}
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'monthly' && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4">{t('attendance.selectMonth')}</h3>
                            <div className="space-y-4">
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                />
                                <button
                                    onClick={loadMonthly}
                                    className="w-full py-3 bg-qabas-purple text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    {t('attendance.reports.generate')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {view === 'record' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: t('attendance.summary.total'), value: summary.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: t('attendance.summary.present'), value: summary.present, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: t('attendance.summary.absent'), value: summary.absent, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                            <stat.icon size={20} />
                                        </div>
                                        <span className="text-2xl font-black text-slate-800">{stat.value}</span>
                                    </div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {view === 'record' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder={t('students.searchPlaceholder')}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-qabas-purple outline-none text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full md:w-auto px-8 py-2 bg-gradient-to-r from-qabas-purple to-purple-800 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    {t('attendance.saveAttendance')}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-sm font-bold border-b border-slate-100">
                                            <th className="px-6 py-4 text-left">{t('attendance.table.name')}</th>
                                            <th className="px-6 py-4 text-center">{t('attendance.table.status')}</th>
                                            <th className="px-6 py-4 text-left">{t('attendance.table.notes')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => {
                                                const isMarked = !!attendance[student.studentId];
                                                return (
                                                    <tr key={student.id} className={`hover:bg-slate-50/50 transition-colors ${!isMarked ? 'bg-amber-50/20' : ''}`}>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {!isMarked && <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />}
                                                                <div>
                                                                    <div className="font-bold text-slate-800">{student.fullName}</div>
                                                                    <div className="text-xs text-slate-400 font-mono">{student.studentId}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-3 bg-slate-100 p-1 rounded-xl w-fit mx-auto shadow-inner">
                                                                <button
                                                                    onClick={() => handleStatusChange(student.studentId, 'present')}
                                                                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${attendance[student.studentId]?.status === 'present' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                                                                >
                                                                    <CheckCircle2 size={18} />
                                                                    <span className="text-[10px] font-bold uppercase">{t('attendance.status.present')}</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(student.studentId, 'absent')}
                                                                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${attendance[student.studentId]?.status === 'absent' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                                                                >
                                                                    <XCircle size={18} />
                                                                    <span className="text-[10px] font-bold uppercase">{t('attendance.status.absent')}</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="text"
                                                                value={attendance[student.studentId]?.notes || ''}
                                                                onChange={(e) => handleNotesChange(student.studentId, e.target.value)}
                                                                placeholder="..."
                                                                className="w-full bg-transparent border-b border-transparent focus:border-slate-200 outline-none text-sm px-2 py-1"
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ) : hasResultsInOtherClasses ? (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center bg-amber-50/30">
                                                    <WarningIcon size={48} className="mx-auto mb-4 text-amber-500 opacity-50" />
                                                    <p className="text-amber-700 font-bold mb-1">
                                                        {i18n.dir() === 'rtl' ? 'تم العثور على طالب في فصول أخرى!' : 'Student found in other classes!'}
                                                    </p>
                                                    <p className="text-slate-500 text-sm">
                                                        {i18n.dir() === 'rtl' ? 'موجود في: ' : 'Located in: '}
                                                        {Array.from(new Set(globalMatches.map(m => t(`students.levels.${m.classLevel}`)))).join(', ')}
                                                    </p>
                                                    <div className="mt-4 flex justify-center gap-2">
                                                        {Array.from(new Set(globalMatches.map(m => m.classLevel))).map(lvl => (
                                                            <button
                                                                key={lvl}
                                                                onClick={() => setClassFilter(lvl)}
                                                                className="text-xs bg-white border border-amber-200 text-amber-700 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors font-bold"
                                                            >
                                                                {t(`students.levels.${lvl}`)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                                    {t('students.noRecords')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center sticky bottom-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={markAllPresent}
                                            className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={16} />
                                            {t('attendance.markAllPresent')}
                                        </button>
                                        <button
                                            onClick={markAllAbsent}
                                            className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                                        >
                                            <XCircle size={16} />
                                            {t('attendance.markAllAbsent')}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="w-full md:w-auto px-10 py-3 bg-qabas-purple text-white rounded-xl font-black shadow-xl hover:shadow-purple-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        {t('attendance.saveAttendance').toUpperCase()}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : view === 'reports' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">{t('attendance.reports.title')}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleExportPDF}
                                        className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors border border-purple-100"
                                    >
                                        <Download size={16} />
                                        {t('nav.attendance')} PDF
                                    </button>
                                    <button
                                        onClick={handleExportExcel}
                                        className="flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg transition-colors border border-green-100"
                                    >
                                        <FileSpreadsheet size={16} />
                                        {t('attendance.reports.export')}
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-sm font-bold border-b border-slate-100">
                                            <th className="px-6 py-4 text-left">{t('attendance.reports.student')}</th>
                                            <th className="px-6 py-4 text-center">{t('attendance.reports.total')}</th>
                                            <th className="px-6 py-4 text-center text-green-600">{t('attendance.reports.present')}</th>
                                            <th className="px-6 py-4 text-center text-red-600">{t('attendance.reports.absent')}</th>
                                            <th className="px-6 py-4 text-center">{t('attendance.reports.rate')} %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {reportData.length > 0 ? (
                                            reportData.map((row) => (
                                                <tr key={row.studentId} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800">{row.studentName}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{row.studentId}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-600">{row.totalDays}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-green-600">{row.presentDays}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-red-600">{row.absentDays}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${row.attendanceRate > 80 ? 'bg-green-500' : row.attendanceRate > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${row.attendanceRate}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="font-black text-slate-800">{row.attendanceRate}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                                    {t('students.noRecords')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">{t('attendance.monthlyBtn')} - {selectedMonth}</h3>
                                <div className="flex gap-2">
                                    {!isMonthlyEditing ? (
                                        <button
                                            onClick={() => setIsMonthlyEditing(true)}
                                            className="px-4 py-1.5 bg-qabas-purple text-white rounded-lg text-sm font-bold hover:shadow-md transition-all"
                                        >
                                            <Edit2 size={14} className="inline mr-1" />
                                            {t('common.edit')}
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setIsMonthlyEditing(false); setTempMonthlyData(monthlyData); }}
                                                className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition-all"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                            <button
                                                onClick={handleSaveMonthly}
                                                className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-md transition-all"
                                            >
                                                <Save size={14} className="inline mr-1" />
                                                {t('common.save')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                            <th className="px-4 py-3 text-left min-w-[180px] sticky left-0 bg-slate-50 z-20 border-r border-slate-200">{t('attendance.table.name')}</th>
                                            {Array.from({ length: new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]), 0).getDate() }, (_, i) => (
                                                <th key={i} className="px-2 py-3 text-center min-w-[40px] border-r border-slate-100">{i + 1}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => {
                                                const daysInMonth = new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]), 0).getDate();
                                                return (
                                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-4 py-3 font-bold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="whitespace-nowrap">{student.fullName}</span>
                                                                {isMonthlyEditing && (
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            onClick={() => {
                                                                                const daysInMonth = new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]), 0).getDate();
                                                                                let newTemp = tempMonthlyData.filter(r => r.studentId !== student.studentId);
                                                                                for (let i = 1; i <= daysInMonth; i++) {
                                                                                    newTemp.push({
                                                                                        id: '', studentId: student.studentId, schoolId: '',
                                                                                        date: `${selectedMonth}-${String(i).padStart(2, '0')}`,
                                                                                        status: 'present', recordedBy: 'Admin', createdAt: new Date().toISOString()
                                                                                    });
                                                                                }
                                                                                setTempMonthlyData(newTemp);
                                                                            }}
                                                                            className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded border border-green-100 hover:bg-green-100"
                                                                        >
                                                                            {t('attendance.bulk.allPresent')}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const daysInMonth = new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]), 0).getDate();
                                                                                let newTemp = tempMonthlyData.filter(r => r.studentId !== student.studentId);
                                                                                for (let i = 1; i <= daysInMonth; i++) {
                                                                                    newTemp.push({
                                                                                        id: '', studentId: student.studentId, schoolId: '',
                                                                                        date: `${selectedMonth}-${String(i).padStart(2, '0')}`,
                                                                                        status: 'absent', recordedBy: 'Admin', createdAt: new Date().toISOString()
                                                                                    });
                                                                                }
                                                                                setTempMonthlyData(newTemp);
                                                                            }}
                                                                            className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded border border-red-100 hover:bg-red-100"
                                                                        >
                                                                            {t('attendance.bulk.allAbsent')}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        {Array.from({ length: daysInMonth }, (_, i) => {
                                                            const dayDate = `${selectedMonth}-${String(i + 1).padStart(2, '0')}`;
                                                            const records = (isMonthlyEditing ? tempMonthlyData : monthlyData).filter(r => r.studentId === student.studentId && r.date === dayDate);
                                                            const isPresent = records.some(r => r.status === 'present');
                                                            const isAbsent = records.some(r => r.status === 'absent');
                                                            const isLate = records.some(r => r.status === 'late');
                                                            const isExcused = records.some(r => r.status === 'excused');

                                                            return (
                                                                <td
                                                                    key={i}
                                                                    className={`px-1 py-3 text-center border-r border-slate-100 transition-all ${isMonthlyEditing ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                                                                    onClick={() => handleMonthlyCellClick(student.studentId, dayDate)}
                                                                >
                                                                    <div className="flex items-center justify-center min-h-[20px]">
                                                                        {isPresent ? (
                                                                            <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                                                                        ) : isAbsent ? (
                                                                            <XCircle size={16} className="text-red-500 mx-auto" />
                                                                        ) : (
                                                                            <span className="text-slate-200">·</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={40} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                                    {t('students.noRecords')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* HIDDEN BRANDED TEMPLATE FOR PDF GENERATION */}
            <div id="attendance-report-template" className="hidden bg-white p-12 w-[1200px]" dir="rtl">
                {config && (
                    <div className="flex flex-col gap-8">
                        {/* Header Section */}
                        <div className="flex justify-between items-center border-b-4 border-qabas-purple pb-6">
                            <div className="text-right space-y-2">
                                <h1 className="text-3xl font-black text-slate-900">{config.schoolName}</h1>
                                <p className="text-xl text-slate-600 font-bold">{config.schoolNameEn}</p>
                            </div>
                            {config.logoUrl && <img src={config.logoUrl} className="h-40 w-auto object-contain" alt="Logo" />}
                        </div>

                        {/* Report Title */}
                        <div className="text-center space-y-2 mt-4">
                            <h2 className="text-4xl font-black text-qabas-purple uppercase tracking-widest">تقرير الحضور الشهري</h2>
                            <p className="text-2xl font-bold text-slate-500">{t('attendance.selectMonth')}: {selectedMonth}</p>
                            <p className="text-xl font-bold text-slate-500">{t('attendance.selectClass')}: {classFilter}</p>
                        </div>

                        {/* Statistics Summary */}
                        <div className="grid grid-cols-3 gap-6 mt-6">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                                <div className="text-4xl font-black text-slate-800">{reportData.length}</div>
                                <div className="text-lg font-bold text-slate-500 uppercase">{t('attendance.reports.total')}</div>
                            </div>
                            <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center">
                                <div className="text-4xl font-black text-green-600">
                                    {Math.round(reportData.reduce((acc, curr) => acc + curr.attendanceRate, 0) / (reportData.length || 1))}%
                                </div>
                                <div className="text-lg font-bold text-green-600 uppercase">متوسط الحضور</div>
                            </div>
                            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center">
                                <div className="text-4xl font-black text-red-600">
                                    {reportData.reduce((acc, curr) => acc + curr.absentDays, 0)}
                                </div>
                                <div className="text-lg font-bold text-red-600 uppercase">إجمالي الغيابات</div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <table className="w-full border-collapse mt-8 text-xl">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="p-6 text-right border border-slate-800 rounded-tr-3xl">اسم الطالب</th>
                                    <th className="p-6 text-center border border-slate-800">إجمالي الأيام</th>
                                    <th className="p-6 text-center border border-slate-800 text-green-400">حضور</th>
                                    <th className="p-6 text-center border border-slate-800 text-red-400">غياب</th>
                                    <th className="p-6 text-center border border-slate-800 rounded-tl-3xl">النسبة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((row, idx) => (
                                    <tr key={row.studentId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className="p-6 border border-slate-100 font-bold">{row.studentName}</td>
                                        <td className="p-6 border border-slate-100 text-center font-bold font-mono">{row.totalDays}</td>
                                        <td className="p-6 border border-slate-100 text-center font-bold font-mono text-green-600">{row.presentDays}</td>
                                        <td className="p-6 border border-slate-100 text-center font-bold font-mono text-red-600">{row.absentDays}</td>
                                        <td className="p-6 border border-slate-100 text-center font-black">{row.attendanceRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer / Signature Section */}
                        <div className="mt-20 flex justify-between items-end px-12">
                            <div className="text-center space-y-4">
                                <p className="text-2xl font-bold text-slate-800">التاريخ</p>
                                <p className="text-xl font-mono text-slate-600 border-b-2 border-slate-300 pb-2 px-8">
                                    {new Date().toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                            <div className="text-center space-y-4">
                                <p className="text-2xl font-bold text-slate-800">ختم المدرسة</p>
                                <div className="h-40 w-40 border-2 border-slate-200 border-dashed rounded-full flex items-center justify-center">
                                    {config.stampUrl && <img src={config.stampUrl} className="h-32 w-32 object-contain opacity-50 rotate-12" />}
                                </div>
                            </div>
                            <div className="text-center space-y-4">
                                <p className="text-2xl font-bold text-slate-800">توقيع المسؤول</p>
                                <div className="h-20 flex items-end justify-center min-w-[200px]">
                                    {config.managerSignatureUrl && <img src={config.managerSignatureUrl} className="h-full object-contain" />}
                                </div>
                                <p className="text-xl font-bold text-slate-600 border-t-2 border-slate-200 pt-2">{config.managerName || '________________'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`fixed bottom-8 ${i18n.dir() === 'rtl' ? 'left-8' : 'right-8'} z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 ${toast.type === 'success'
                            ? 'bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 text-white shadow-emerald-900/20'
                            : 'bg-gradient-to-r from-red-900/90 to-red-800/90 text-white shadow-red-900/20'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'
                            }`}>
                            {toast.type === 'success' ? <CheckCircle2 size={18} strokeWidth={3} /> : <AlertTriangle size={18} strokeWidth={3} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
                            <p className="text-xs opacity-90 font-medium">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast(prev => ({ ...prev, show: false }))}
                            className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAttendance;
