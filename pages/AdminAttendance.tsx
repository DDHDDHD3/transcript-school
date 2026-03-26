import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
    RefreshCw,
    Search as SearchIcon,
    AlertTriangle as WarningIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Student, AttendanceRecord, AttendanceReport, CertificateConfig, Teacher } from '../types';
import { generateAttendancePDF } from '../utils/attendancePdfGenerator';

import AttendanceTemplates from '../components/AttendanceTemplates';
import { normalizeArabic } from '../utils/stringUtils';

import {
    getStudents,
    getAttendance,
    saveAttendance,
    getAttendanceReport,
    getMonthlyAttendance,
    getConfig,
    getTeachers
} from '../services/api';

const AdminAttendance = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [view, setView] = useState<'record' | 'reports' | 'monthly'>('record');
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<string, Record<string, AttendanceRecord>>>({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSession, setSelectedSession] = useState<string>('morning'); // Legacy compat, but will use dynamic sessions mostly
    const [classFilter, setClassFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dailyBrush, setDailyBrush] = useState<'present' | 'absent' | 'late' | 'toggle' | null>('present');
    const [reportData, setReportData] = useState<AttendanceReport[]>([]);
    const [reportRange, setReportRange] = useState({
        start: new Date(new Date().setDate(1)).toISOString().split('T')[0], // Start of month
        end: new Date().toISOString().split('T')[0]
    });
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [monthlyData, setMonthlyData] = useState<AttendanceRecord[]>([]);
    const [isMonthlyEditing, setIsMonthlyEditing] = useState(false);
    const [tempMonthlyData, setTempMonthlyData] = useState<AttendanceRecord[]>([]);
    const [monthlyBrush, setMonthlyBrush] = useState<'present' | 'absent' | 'late' | 'toggle' | null>('present');
    const [config, setConfig] = useState<CertificateConfig | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<'daily' | 'monthly' | 'summary'>('daily');
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

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
        const matchesClass = classFilter === 'all' || s.classLevel === classFilter;
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

    async function loadStudents() {
        setLoading(true);
        const data = await getStudents();
        setStudents(data);
        if (data.length > 0 && classFilter === '') {
            setClassFilter('all');
        }
        setLoading(false);
    }

    async function loadTeachers() {
        const data = await getTeachers();
        setTeachers(data);
        if (data.length > 0) setSelectedTeacherId(data[0].id);
    }

    async function loadAttendance() {
        setLoading(true);
        const data = await getAttendance(date, classFilter === 'all' ? undefined : classFilter);
        const attendanceMap: Record<string, Record<string, AttendanceRecord>> = {};

        data.forEach(rec => {
            if (!attendanceMap[rec.studentId]) {
                attendanceMap[rec.studentId] = {};
            }
            const sesId = rec.session || 'morning';
            attendanceMap[rec.studentId][sesId] = rec;
        });

        setAttendance(attendanceMap);
        setLoading(false);
    }

    async function loadReport() {
        setLoading(true);
        const data = await getAttendanceReport(reportRange.start, reportRange.end, classFilter === 'all' ? undefined : classFilter);
        setReportData(data);
        setLoading(false);
    }

    async function loadMonthly() {
        setLoading(true);
        const [year, month] = selectedMonth.split('-').map(Number);
        const data = await getMonthlyAttendance(year, month, classFilter === 'all' ? '' : classFilter);
        setMonthlyData(data);
        setTempMonthlyData(data);
        setLoading(false);
    }

    useEffect(() => {
        loadStudents();
        getConfig().then(setConfig);
        loadTeachers();
        // If navigated here from Students page with a studentId, pre-search
        const state = location.state as { studentId?: string; studentName?: string } | undefined;
        if (state?.studentId) {
            setSearchTerm(state.studentId);
        } else if (state?.studentName) {
            setSearchTerm(state.studentName);
        }
    }, []);

    useEffect(() => {
        const container = document.getElementById('main-scroll-container');
        if (container) container.scrollTo({ top: 0, behavior: 'auto' });
    }, [view]);

    useEffect(() => {
        if (view === 'record') {
            loadAttendance();
        } else if (view === 'monthly') {
            loadMonthly();
        }
        // Ensure scroll to top on view change
        const mainContent = document.querySelector('.flex-1.overflow-auto.custom-scrollbar');
        if (mainContent) mainContent.scrollTop = 0;
    }, [date, classFilter, view, selectedSession, selectedMonth]);


    const handleMonthlyCellClick = (studentId: string, date: string) => {
        if (!isMonthlyEditing) return;

        const currentRecords = tempMonthlyData.filter(r => r.studentId === studentId && r.date === date);
        const currentStatus = currentRecords.length > 0 ? currentRecords[0].status : null;

        let nextStatus: 'present' | 'absent' | 'late' | null;

        if (monthlyBrush && monthlyBrush !== 'toggle') {
            // If clicking a cell that already has the brush status, toggle it to the other status
            if (currentStatus === monthlyBrush) {
                if (monthlyBrush === 'late') {
                    nextStatus = 'absent';
                } else {
                    nextStatus = currentStatus === 'present' ? 'absent' : 'present';
                }
            } else {
                nextStatus = monthlyBrush as any;
            }
        } else {
            if (!currentStatus) nextStatus = 'present';
            else if (currentStatus === 'present') nextStatus = 'absent';
            else if (currentStatus === 'absent') nextStatus = 'late';
            else nextStatus = 'present';
        }

        const newTemp = tempMonthlyData.filter(r => !(r.studentId === studentId && r.date === date));

        if (nextStatus) {
            newTemp.push({
                id: '',
                studentId,
                schoolId: '',
                date,
                status: nextStatus as 'present' | 'absent' | 'late',
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
        // Ensure data is loaded for the current view
        if (selectedTemplate === 'summary' || selectedTemplate === 'daily') {
            await loadReport();
        } else if (selectedTemplate === 'monthly') {
            await loadMonthly();
        }

        const filename = `Attendance_${selectedTemplate}_${classFilter === 'all' ? 'All' : classFilter}_${date}`;
        const orientation = selectedTemplate === 'monthly' ? 'landscape' : 'portrait';
        const success = await generateAttendancePDF('attendance-hidden-export', filename, i18n.language, orientation);
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
            absent: 0,
            late: 0
        };

        filteredIds.forEach(id => {
            const studentRecords = attendance[id] || {};
            const records = Object.values(studentRecords);
            const isPresent = records.some(r => r.status === 'present');
            const isAbsent = records.some(r => r.status === 'absent') && !isPresent;
            const isLate = records.some(r => r.status === 'late');

            if (isPresent) counts.present++;
            else if (isAbsent) counts.absent++;
            if (isLate) counts.late++;
        });

        return counts;
    };

    const reportSummary = useMemo(() => {
        if (!reportData || reportData.length === 0) return { total: 0, present: 0, absent: 0, late: 0 };
        
        let presentStudents = 0, absentStudents = 0, lateStudents = 0;
        
        reportData.forEach(r => {
            const p = r.presentDays || 0;
            const a = r.absentDays || 0;
            const l = r.lateDays || 0;
            
            if (p >= a && p >= l) {
                presentStudents++;
            } else if (a > p && a > l) {
                absentStudents++;
            } else {
                lateStudents++;
            }
        });

        return {
            total: reportData.length,
            present: presentStudents,
            absent: absentStudents,
            late: lateStudents
        };
    }, [reportData]);

    const summary = (view === 'reports' && selectedTemplate === 'summary') ? reportSummary : getSummary();

    const handleCellClick = (studentId: string, sessionId: string) => {
        const currentRecord = attendance[studentId]?.[sessionId];
        const currentStatus = currentRecord?.status;

        let nextStatus: 'present' | 'absent' | 'late' | null;

        if (dailyBrush && dailyBrush !== 'toggle') {
            if (currentStatus === dailyBrush) {
                if (dailyBrush === 'late') {
                    nextStatus = 'absent';
                } else {
                    nextStatus = currentStatus === 'present' ? 'absent' : 'present';
                }
            } else {
                nextStatus = dailyBrush as any;
            }
        } else {
            if (!currentStatus) nextStatus = 'present';
            else if (currentStatus === 'present') nextStatus = 'absent';
            else if (currentStatus === 'absent') nextStatus = 'late';
            else nextStatus = 'present';
        }

        const newAttendance = { ...attendance };
        if (!newAttendance[studentId]) newAttendance[studentId] = {};

        if (nextStatus) {
            newAttendance[studentId][sessionId] = {
                ...(currentRecord || {
                    id: '',
                    studentId,
                    schoolId: '',
                    date,
                    session: sessionId,
                    recordedBy: 'Admin',
                    createdAt: new Date().toISOString()
                }),
                status: nextStatus as 'present' | 'absent' | 'late'
            };
        } else {
            delete newAttendance[studentId][sessionId];
        }

        setAttendance(newAttendance);
    };

    const handleNotesChange = (studentId: string, notes: string) => {
        const newAttendance = { ...attendance };
        if (!newAttendance[studentId]) newAttendance[studentId] = {};

        // Find any session record to attach notes to, or create a stub if none exists
        const sessions = Object.keys(newAttendance[studentId]);
        if (sessions.length > 0) {
            sessions.forEach(s => {
                newAttendance[studentId][s] = { ...newAttendance[studentId][s], notes };
            });
        } else {
            // If no sessions marked yet, we'll store notes in a temp session or wait?
            // Usually notes are per student-day.
            // Let's create a stub record for 'morning' if needed or just handle it on save.
            newAttendance[studentId]['_notes_only'] = {
                id: '',
                studentId,
                schoolId: '',
                date,
                status: 'present', // dummy
                session: '',
                recordedBy: 'Admin',
                createdAt: new Date().toISOString(),
                notes
            };
        }
        setAttendance(newAttendance);
    };

    const fillSession = (sessionId: string, status: 'present' | 'absent' | 'late') => {
        const newAttendance = { ...attendance };
        filteredStudents.forEach(s => {
            if (!newAttendance[s.studentId]) newAttendance[s.studentId] = {};
            newAttendance[s.studentId][sessionId] = {
                ...(newAttendance[s.studentId][sessionId] || {
                    id: '',
                    studentId: s.studentId,
                    schoolId: '',
                    date,
                    session: sessionId,
                    recordedBy: 'Admin',
                    createdAt: new Date().toISOString()
                }),
                status
            };
        });
        setAttendance(newAttendance);
    };

    const markAllPresent = () => {
        const sessions = config?.attendanceSessions && config.attendanceSessions.length > 0
            ? config.attendanceSessions.map(s => s.id)
            : ['morning', 'afternoon'];

        const newAttendance = { ...attendance };
        filteredStudents.forEach(s => {
            if (!newAttendance[s.studentId]) newAttendance[s.studentId] = {};
            sessions.forEach(sesId => {
                newAttendance[s.studentId][sesId] = {
                    ...(newAttendance[s.studentId][sesId] || {
                        id: '',
                        studentId: s.studentId,
                        schoolId: '',
                        date,
                        session: sesId,
                        recordedBy: 'Admin',
                        createdAt: new Date().toISOString()
                    }),
                    status: 'present' as const
                };
            });
        });
        setAttendance(newAttendance);
    };

    const markAllAbsent = () => {
        const sessions = config?.attendanceSessions && config.attendanceSessions.length > 0
            ? config.attendanceSessions.map(s => s.id)
            : ['morning', 'afternoon'];

        const newAttendance = { ...attendance };
        filteredStudents.forEach(s => {
            if (!newAttendance[s.studentId]) newAttendance[s.studentId] = {};
            sessions.forEach(sesId => {
                newAttendance[s.studentId][sesId] = {
                    ...(newAttendance[s.studentId][sesId] || {
                        id: '',
                        studentId: s.studentId,
                        schoolId: '',
                        date,
                        session: sesId,
                        recordedBy: 'Admin',
                        createdAt: new Date().toISOString()
                    }),
                    status: 'absent' as const
                };
            });
        });
        setAttendance(newAttendance);
    };

    const markAllLate = () => {
        const sessions = config?.attendanceSessions && config.attendanceSessions.length > 0
            ? config.attendanceSessions.map(s => s.id)
            : ['morning', 'afternoon'];

        const newAttendance = { ...attendance };
        filteredStudents.forEach(s => {
            if (!newAttendance[s.studentId]) newAttendance[s.studentId] = {};
            sessions.forEach(sesId => {
                newAttendance[s.studentId][sesId] = {
                    ...(newAttendance[s.studentId][sesId] || {
                        id: '',
                        studentId: s.studentId,
                        schoolId: '',
                        date,
                        session: sesId,
                        recordedBy: 'Admin',
                        createdAt: new Date().toISOString()
                    }),
                    status: 'late' as const
                };
            });
        });
        setAttendance(newAttendance);
    };

    const handleSave = async () => {
        setLoading(true);
        const recordsToSave: AttendanceRecord[] = [];

        filteredStudents.forEach(s => {
            const studentSessions = attendance[s.studentId] || {};
            const notes = studentSessions['_notes_only']?.notes || Object.values(studentSessions).find(r => r.notes)?.notes || '';

            const sessions = config?.attendanceSessions && config.attendanceSessions.length > 0
                ? config.attendanceSessions.map(ses => ses.id)
                : ['morning', 'afternoon'];

            sessions.forEach(sesId => {
                const rec = studentSessions[sesId];
                recordsToSave.push({
                    ...(rec || {
                        id: '',
                        studentId: s.studentId,
                        schoolId: '',
                        date,
                        status: 'present' as const,
                        session: sesId,
                        recordedBy: 'Admin',
                        createdAt: new Date().toISOString()
                    }),
                    notes,
                    date,
                    session: sesId,
                    teacherId: selectedTeacherId
                });
            });
        });

        const success = await saveAttendance(recordsToSave);
        if (success) {
            showToast(t('attendance.messages.saveSuccess'), 'success');
            loadAttendance();
        } else {
            showToast(t('attendance.messages.saveError'), 'error');
        }
        setLoading(false);
    };



    return (
        <div className="h-full flex flex-col min-h-0 space-y-3 overflow-hidden" dir={i18n.dir()}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0">
                <div>
                    <h1 className="text-xl font-black text-[var(--text-main)] flex items-center gap-2">
                        <Calendar className="text-qabas-purple dark:text-purple-400" size={20} />
                        {t('attendance.title')}
                    </h1>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest leading-none">{t('attendance.subtitle')}</p>
                </div>

                <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg shrink-0">
                    <button
                        onClick={() => setView('record')}
                        className={`px-4 py-1.5 rounded-md font-bold text-xs transition-all ${view === 'record' ? 'bg-[var(--bg-card)] text-[var(--qabas-purple)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                        {t('attendance.recordBtn')}
                    </button>
                    <button
                        onClick={() => { setView('reports'); loadReport(); }}
                        className={`px-4 py-1.5 rounded-md font-bold text-xs transition-all ${view === 'reports' ? 'bg-[var(--bg-card)] text-[var(--qabas-purple)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                        {t('attendance.reportsBtn')}
                    </button>
                    <button
                        onClick={() => { setView('monthly'); loadMonthly(); }}
                        className={`px-4 py-1.5 rounded-md font-bold text-xs transition-all ${view === 'monthly' ? 'bg-[var(--bg-card)] text-[var(--qabas-purple)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                        {t('attendance.monthlyBtn')}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Filters Sidebar */}
                <div className="w-full lg:w-[280px] shrink-0 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-xl p-4">
                        <h3 id="tour-attendance-filters" className="font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
                            <Filter size={18} className="text-qabas-purple dark:text-purple-400" />
                            {t('nav.settings')}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">{t('attendance.selectDate')}</label>
                                <div className="flex items-center gap-1">
                                    <button onClick={handlePrevDay} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors"><ChevronLeft size={16} /></button>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-2 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--qabas-purple)] outline-none text-xs text-[var(--text-main)] transition-all"
                                    />
                                    <button onClick={handleNextDay} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors"><ChevronRight size={16} /></button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase text-[var(--text-muted)] mb-2 tracking-wider">
                                    {t('attendance.brush.title')}
                                </label>
                                <p className="text-[10px] text-[var(--text-muted)] mb-2 leading-tight">
                                    {t('attendance.brush.desc')}
                                </p>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-2.5">
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <button
                                            onClick={() => setDailyBrush('present')}
                                            className={`py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${dailyBrush === 'present' ? 'bg-green-600 text-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <CheckCircle2 size={14} /> {t('attendance.status.present')}
                                        </button>
                                        <button
                                            onClick={() => setDailyBrush('absent')}
                                            className={`py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${dailyBrush === 'absent' ? 'bg-red-600 text-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <XCircle size={14} /> {t('attendance.status.absent')}
                                        </button>
                                        <button
                                            onClick={() => setDailyBrush('late')}
                                            className={`py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${dailyBrush === 'late' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <Clock size={14} /> {t('attendance.status.late')}
                                        </button>
                                        <button
                                            onClick={() => setDailyBrush('toggle')}
                                            className={`py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${dailyBrush === 'toggle' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <RefreshCw size={14} /> {t('common.toggle') || 'Toggle'}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-center font-medium leading-tight px-2 mt-2">
                                        {t('attendance.brush.description') || 'Select a status and click/drag over cells to mark them quickly.'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">{t('attendance.selectClass')}</label>
                                <select
                                    value={classFilter}
                                    onChange={(e) => setClassFilter(e.target.value)}
                                    className="w-full px-4 py-2 bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-main)]"
                                >
                                    <option value="all">{t('common.allClasses', 'All Classes')}</option>
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
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-xl p-4">
                            <h3 className="font-bold text-[var(--text-main)] mb-4">{t('attendance.reports.period')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('attendance.label.from')}</label>
                                    <input
                                        type="date"
                                        value={reportRange.start}
                                        onChange={(e) => setReportRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-xl outline-none dark:text-slate-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('attendance.label.to')}</label>
                                    <input
                                        type="date"
                                        value={reportRange.end}
                                        onChange={(e) => setReportRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-xl outline-none dark:text-slate-100"
                                    />
                                </div>
                                <button
                                    onClick={loadReport}
                                    className="w-full py-3 bg-qabas-purple dark:bg-royal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    {t('attendance.reports.generate')}
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'monthly' && (
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-xl p-4">
                            <h3 className="font-bold text-[var(--text-main)] mb-4">{t('attendance.selectMonth')}</h3>
                            <div className="space-y-4">
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-xl outline-none dark:text-slate-100"
                                />
                                <button
                                    onClick={loadMonthly}
                                    className="w-full py-3 bg-qabas-purple dark:bg-royal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    {t('attendance.reports.generate')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>{/* End Filters Sidebar */}
                {/* Main Content Area */}
                <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden space-y-4">
                    {view === 'record' && (
                        <div id="tour-attendance-summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
                            {[
                                { label: t('attendance.summary.total'), value: summary.total, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                                { label: t('attendance.summary.present'), value: summary.present, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
                                { label: t('attendance.summary.absent'), value: summary.absent, icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
                                { label: t('attendance.summary.late'), value: summary.late, icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-[var(--bg-card)] p-3 rounded-xl shadow-sm border border-[var(--border-color)] flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
                                            <stat.icon size={14} />
                                        </div>
                                        <span className="text-lg font-black text-[var(--text-main)]">{stat.value}</span>
                                    </div>
                                    <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tight">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {view === 'record' ? (
                        <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-xl overflow-hidden">
                            <div className="p-2 border-b border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center gap-2 bg-[var(--bg-secondary)] shrink-0">
                                <div className="flex items-center gap-4">
                                    <h2 className="font-bold text-[var(--text-main)] text-xs flex items-center gap-2">
                                        <Users size={16} className="text-[var(--qabas-purple)]" />
                                        {t('attendance.recordBtn')}
                                    </h2>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 rounded-lg border border-[var(--border-color)]">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('teachers.title')}:</span>
                                        <select
                                            value={selectedTeacherId}
                                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                                        >
                                            <option value="">{t('common.select')}</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>{t.fullName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <span className="px-1.5 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded text-[9px] font-bold uppercase tracking-widest border border-[var(--border-color)]">{date}</span>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full md:w-auto px-6 py-1.5 bg-gradient-to-r from-qabas-purple to-purple-800 text-white rounded-lg text-xs font-black shadow-md hover:shadow-purple-200 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    {t('attendance.saveAttendance')}
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-20 bg-[var(--bg-card)] shadow-md">
                                        <tr className="bg-slate-100 dark:bg-white/10 text-[var(--text-main)] text-xs font-black border-b border-slate-200 dark:border-white/20 uppercase tracking-widest">
                                            <th className="px-4 py-2 text-left min-w-[180px] sticky left-0 bg-slate-100 dark:bg-[#1e293b] z-30 border-r border-slate-200 dark:border-white/20">{t('attendance.table.name')}</th>
                                            {(config?.attendanceSessions && config.attendanceSessions.length > 0 ? config.attendanceSessions : [
                                                { id: 'morning', nameAr: t('attendance.session.morning'), nameEn: 'Morning', nameSo: 'Subax' },
                                                { id: 'afternoon', nameAr: t('attendance.session.afternoon'), nameEn: 'Afternoon', nameSo: 'Galab' }
                                            ]).map(session => (
                                                <th key={session.id} className="px-2 py-2 text-center min-w-[110px] border-r border-slate-200 dark:border-white/20 sticky top-0 bg-slate-100 dark:bg-[#1e293b] z-20">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span className="text-[9px] font-black">{i18n.language === 'ar' ? session.nameAr : (i18n.language === 'so' ? session.nameSo : session.nameEn)}</span>
                                                        <div className="flex gap-1.5">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); fillSession(session.id, 'present'); }}
                                                                className="w-5 h-5 rounded bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30 flex items-center justify-center transition-colors border border-green-200 dark:border-green-500/30"
                                                                title={t('attendance.bulk.allPresent')}
                                                            >
                                                                <CheckCircle2 size={12} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); fillSession(session.id, 'absent'); }}
                                                                className="w-5 h-5 rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 flex items-center justify-center transition-colors border border-red-200 dark:border-red-500/30"
                                                                title={t('attendance.bulk.allAbsent')}
                                                            >
                                                                <XCircle size={12} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); fillSession(session.id, 'late'); }}
                                                                className="w-5 h-5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30 flex items-center justify-center transition-colors border border-amber-200 dark:border-amber-500/30"
                                                                title={t('attendance.bulk.allLate')}
                                                            >
                                                                <Clock size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="px-4 py-2 text-left min-w-[140px] sticky top-0 bg-slate-100 dark:bg-[#1e293b] z-20">{t('attendance.table.notes')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => {
                                                const sessions = config?.attendanceSessions && config.attendanceSessions.length > 0 ? config.attendanceSessions : [
                                                    { id: 'morning', nameAr: t('attendance.session.morning'), nameEn: 'Morning', nameSo: 'Subax' },
                                                    { id: 'afternoon', nameAr: t('attendance.session.afternoon'), nameEn: 'Afternoon', nameSo: 'Galab' }
                                                ];
                                                const studentRecords = attendance[student.studentId] || {};
                                                const notes = studentRecords['_notes_only']?.notes || Object.values(studentRecords).find(r => r.notes)?.notes || '';

                                                return (
                                                    <tr key={student.id} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors group">
                                                        <td className="px-4 py-3 font-black text-[var(--text-main)] sticky left-0 bg-white dark:bg-[#0f172a] group-hover:bg-slate-50 dark:group-hover:bg-white/5 z-10 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="whitespace-nowrap font-bold text-xs">{student.fullName}</span>
                                                                <span className="text-[9px] text-slate-400 font-mono tracking-tight">{student.studentId}</span>
                                                            </div>
                                                        </td>
                                                        {sessions.map(session => {
                                                            const record = studentRecords[session.id];
                                                            const status = record?.status;
                                                            return (
                                                                <td
                                                                    key={session.id}
                                                                    className="px-1.5 py-3 text-center"
                                                                >
                                                                    <button
                                                                        onClick={() => handleCellClick(student.studentId, session.id)}
                                                                        className={`w-full py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 ${status === 'present' ? 'bg-green-600 text-white shadow-lg shadow-green-100 dark:shadow-none' :
                                                                            status === 'absent' ? 'bg-red-600 text-white shadow-lg shadow-red-100 dark:shadow-none' :
                                                                                status === 'late' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100 dark:shadow-none' :
                                                                                    'bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-dashed border-slate-200 dark:border-white/10'
                                                                            }`}
                                                                    >
                                                                        {status === 'present' ? <CheckCircle2 size={12} /> : status === 'absent' ? <XCircle size={12} /> : status === 'late' ? <Clock size={12} /> : <div className="h-3 w-3" />}
                                                                        <span className="text-[7px] font-black uppercase tracking-tighter">
                                                                            {status ? t(`attendance.status.${status}`) : '---'}
                                                                        </span>
                                                                    </button>
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={notes}
                                                                onChange={(e) => handleNotesChange(student.studentId, e.target.value)}
                                                                placeholder="..."
                                                                className="w-full bg-transparent border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-white/10 outline-none text-[10px] px-2 py-1 transition-all focus:border-qabas-purple rounded text-slate-700 dark:text-slate-200"
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ) : hasResultsInOtherClasses ? (
                                            <tr>
                                                <td colSpan={((config?.attendanceSessions?.length || 2) + 2)} className="px-6 py-12 text-center bg-amber-50/30">
                                                    <WarningIcon size={48} className="mx-auto mb-4 text-amber-500 opacity-50" />
                                                    <p className="text-amber-700 font-bold mb-1">
                                                        {t('attendance.messages.studentFoundOtherClasses')}
                                                    </p>
                                                    <p className="text-slate-500 text-sm">
                                                        {t('attendance.messages.locatedIn')}
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
                                                <td colSpan={((config?.attendanceSessions?.length || 2) + 2)} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                                    {t('students.noRecords')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-[#0f172a] border-t border-slate-100 dark:border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={markAllPresent}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={14} />
                                        {t('attendance.status.present')}
                                    </button>
                                    <button
                                        onClick={markAllAbsent}
                                        className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-700 transition-all flex items-center gap-2"
                                    >
                                        <XCircle size={14} />
                                        {t('attendance.status.absent')}
                                    </button>
                                    <button
                                        onClick={markAllLate}
                                        className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-amber-600 transition-all flex items-center gap-2"
                                    >
                                        <Clock size={14} />
                                        {t('attendance.status.late')}
                                    </button>
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-white dark:bg-white/5 px-3 py-1 rounded-full border border-slate-100 dark:border-white/10">
                                    {filteredStudents.length} {t('attendance.reports.student')}
                                </div>
                            </div>
                        </div>
                    ) : view === 'reports' ? (
                        <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-2xl overflow-hidden">
                            <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)] shrink-0">
                                <h3 className="font-black text-[var(--text-main)] flex items-center gap-2">
                                    <BarChart3 size={18} className="text-[var(--qabas-purple)]" />
                                    {t('attendance.reports.title')}
                                </h3>
                                <div className="flex gap-2 items-center">
                                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                                        {(['daily', 'monthly', 'summary'] as const).map((tId) => (
                                            <button
                                                key={tId}
                                                onClick={() => setSelectedTemplate(tId)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedTemplate === tId
                                                        ? 'bg-white dark:bg-white/10 text-qabas-purple shadow-sm'
                                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                                    }`}
                                            >
                                                {tId}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleExportPDF}
                                        className="flex items-center gap-2 text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors border border-purple-100"
                                    >
                                        <Download size={14} />
                                        PDF
                                    </button>
                                    <button
                                        onClick={handleExportExcel}
                                        className="flex items-center gap-2 text-[10px] font-bold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg transition-colors border border-green-100"
                                    >
                                        <FileSpreadsheet size={14} />
                                        {t('attendance.reports.export')}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-20 bg-[var(--bg-card)] shadow-md">
                                        <tr className="bg-slate-100 dark:bg-white/10 text-[var(--text-main)] text-[10px] font-black border-b border-slate-200 dark:border-white/20 uppercase tracking-widest">
                                            <th className="px-4 py-2 text-left sticky left-0 bg-slate-100 dark:bg-[#1e293b] z-30 border-r border-slate-200 dark:border-white/20 top-0">{t('attendance.reports.student')}</th>
                                            <th className="px-3 py-2 text-center border-r border-slate-200 dark:border-white/20 sticky top-0 bg-slate-100 dark:bg-[#1e293b]">{t('attendance.reports.total')}</th>
                                            <th className="px-3 py-2 text-center text-green-700 dark:text-green-400 border-r border-slate-200 dark:border-white/20 sticky top-0 bg-slate-100 dark:bg-[#1e293b]">{t('attendance.reports.present')}</th>
                                            <th className="px-3 py-2 text-center text-red-700 dark:text-red-400 border-r border-slate-200 dark:border-white/20 sticky top-0 bg-slate-100 dark:bg-[#1e293b]">{t('attendance.reports.absent')}</th>
                                            <th className="px-3 py-2 text-center text-amber-700 dark:text-amber-400 border-r border-slate-200 dark:border-white/20 sticky top-0 bg-slate-100 dark:bg-[#1e293b]">{t('pdf.lateDays')}</th>
                                            <th className="px-3 py-2 text-center sticky top-0 bg-slate-100 dark:bg-[#1e293b]">{t('attendance.reports.rate')} %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                        {reportData.length > 0 ? (
                                            reportData.map((row) => (
                                                <tr key={row.studentId} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 sticky left-0 bg-white dark:bg-[#0f172a] group-hover:bg-slate-50 dark:group-hover:bg-white/5 z-10 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                                        <div className="font-bold text-[var(--text-main)] text-xs">{row.studentName}</div>
                                                        <div className="text-[9px] text-slate-400 font-mono">{row.studentId}</div>
                                                    </td>
                                                    <td className="px-3 py-3 text-center font-bold text-slate-600 dark:text-slate-400 text-xs">{row.totalDays}</td>
                                                    <td className="px-3 py-3 text-center font-bold text-green-600 dark:text-green-400 text-xs">{row.presentDays}</td>
                                                    <td className="px-3 py-3 text-center font-bold text-red-600 dark:text-red-400 text-xs">{row.absentDays}</td>
                                                    <td className="px-3 py-3 text-center font-bold text-amber-600 dark:text-amber-400 text-xs">{row.lateDays || 0}</td>
                                                    <td className="px-3 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-12 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${row.attendanceRate > 80 ? 'bg-green-500' : row.attendanceRate > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${row.attendanceRate}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="font-black text-[var(--text-main)] text-[10px]">{row.attendanceRate}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                                    {t('students.noRecords')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-2xl overflow-hidden">
                            <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)] shrink-0">
                                <h3 className="font-black text-[var(--text-main)] flex items-center gap-2">
                                    <Calendar size={18} className="text-[var(--qabas-purple)]" />
                                    {t('attendance.monthlyBtn')} - {selectedMonth}
                                </h3>
                                <div className="flex gap-2">
                                    {!isMonthlyEditing ? (
                                        <button
                                            onClick={() => setIsMonthlyEditing(true)}
                                            className="px-4 py-1.5 bg-qabas-purple text-white rounded-lg text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-2"
                                        >
                                            <Edit2 size={12} />
                                            {t('common.edit')}
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setIsMonthlyEditing(false); setTempMonthlyData(monthlyData); }}
                                                className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-300 transition-all"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                            <button
                                                onClick={handleSaveMonthly}
                                                className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 shadow-md transition-all flex items-center gap-2"
                                            >
                                                <Save size={12} />
                                                {t('common.save')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-20 bg-[var(--bg-card)] shadow-md">
                                        <tr className="bg-slate-100 dark:bg-white/10 text-[var(--text-main)] font-black border-b border-slate-200 dark:border-white/20">
                                            <th className="px-3 py-2 text-left min-w-[150px] sticky left-0 bg-slate-100 dark:bg-[#1e293b] z-30 border-r border-slate-200 dark:border-white/20 text-[10px] uppercase tracking-widest top-0">{t('attendance.table.name')}</th>
                                            {Array.from({ length: new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]), 0).getDate() }, (_, i) => (
                                                <th key={i} className="px-1 py-1 text-center min-w-[30px] border-r border-slate-100 dark:border-white/10 font-mono text-[9px] text-slate-500 bg-slate-50 sticky top-0">{i + 1}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => {
                                                const daysInMonth = new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]), 0).getDate();
                                                return (
                                                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                                        <td className="px-3 py-3 font-bold text-slate-700 dark:text-slate-100 sticky left-0 bg-white dark:bg-[#0f172a] group-hover:bg-slate-50 dark:group-hover:bg-white/5 z-10 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="whitespace-nowrap text-xs">{student.fullName}</span>
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
                                                                            className="text-[8px] px-1 py-0.5 bg-green-50 text-green-600 rounded border border-green-100 hover:bg-green-100 font-bold"
                                                                        >
                                                                            P
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
                                                                            className="text-[8px] px-1 py-0.5 bg-red-50 text-red-600 rounded border border-red-100 hover:bg-red-100 font-bold"
                                                                        >
                                                                            A
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const daysInMonth = new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]), 0).getDate();
                                                                                let newTemp = tempMonthlyData.filter(r => r.studentId !== student.studentId);
                                                                                for (let i = 1; i <= daysInMonth; i++) {
                                                                                    newTemp.push({
                                                                                        id: '', studentId: student.studentId, schoolId: '',
                                                                                        date: `${selectedMonth}-${String(i).padStart(2, '0')}`,
                                                                                        status: 'late', recordedBy: 'Admin', createdAt: new Date().toISOString()
                                                                                    });
                                                                                }
                                                                                setTempMonthlyData(newTemp);
                                                                            }}
                                                                            className="text-[8px] px-1 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-100 hover:bg-amber-100 font-bold"
                                                                        >
                                                                            L
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

                                                            return (
                                                                <td
                                                                    key={i}
                                                                    className={`px-0 py-2 text-center border-r border-slate-100 dark:border-white/10 transition-all ${isMonthlyEditing ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10' : ''}`}
                                                                    onClick={() => handleMonthlyCellClick(student.studentId, dayDate)}
                                                                >
                                                                    <div className="flex items-center justify-center min-h-[14px]">
                                                                        {isPresent ? (
                                                                            <CheckCircle2 size={12} className="text-green-500 mx-auto" strokeWidth={3} />
                                                                        ) : isAbsent ? (
                                                                            <XCircle size={12} className="text-red-500 mx-auto" strokeWidth={3} />
                                                                        ) : isLate ? (
                                                                            <Clock size={12} className="text-amber-500 mx-auto" strokeWidth={3} />
                                                                        ) : (
                                                                            <span className="text-slate-200 dark:text-slate-800">·</span>
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

            {/* Hidden Templates for PDF Generation */}
            <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
                <div
                    id="attendance-hidden-export"
                    className="bg-white"
                    style={{
                        width: selectedTemplate === 'monthly' ? '3508px' : '2480px',
                        height: selectedTemplate === 'monthly' ? '2480px' : '3508px',
                        overflow: 'hidden'
                    }}
                >
                    {config && (
                        <AttendanceTemplates
                            type={selectedTemplate}
                            date={date}
                            classLevel={classFilter === 'all' ? '' : classFilter}
                            reports={reportData || []}
                            monthlyData={monthlyData}
                            selectedMonth={selectedMonth}
                            teacherName={teachers.find(t => t.id === selectedTeacherId)?.fullName}
                            summary={summary}
                            config={config}
                        />
                    )}
                </div>
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
                            <h4 className="font-bold text-sm">{toast.type === 'success' ? t('common.success') : t('common.error')}</h4>
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
