import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, Download, Shield, CheckCircle2,
    XCircle, Search, ExternalLink, Calendar,
    User, GraduationCap, Award, MapPin
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getStudentByRegId, getConfig, getStudentAttendanceHistory, getSystemSettings } from '../services/api';
import { Student, CertificateConfig, AttendanceRecord } from '../types';
import { generateCertificatePDF } from '../utils/pdfGenerator';
import { generateAttendancePDF } from '../utils/attendancePdfGenerator';
import AttendanceTemplates from '../components/AttendanceTemplates';
import CertificateTemplates from '../components/CertificateTemplates';

const StandaloneVerify = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<Student | null>(null);
    const [config, setConfig] = useState<CertificateConfig | null>(null);
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
    const [error, setError] = useState('');
    const [perceivedMonth, setPerceivedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [previewScale, setPreviewScale] = useState(0.25);
    const [systemName, setSystemName] = useState('Aqooni Digital');
    const [systemLogo, setSystemLogo] = useState('/logo.jpg');

    useEffect(() => {
        const fetchBranding = async () => {
            const settings = await getSystemSettings();
            if (settings) {
                setSystemName(settings.name || 'Aqooni Digital');
                setSystemLogo(settings.logo || '/logo.jpg');
            }
        };
        fetchBranding();

        if (id) {
            handleVerify(id);
        }
    }, [id]);

    const handleVerify = async (regId: string) => {
        setLoading(true);
        setError('');
        try {
            const sanitizedId = regId.trim();
            if (!sanitizedId) return;

            const student = await getStudentByRegId(sanitizedId);
            if (student) {
                setResult(student);
                if (student.schoolId) {
                    const schoolConfig = await getConfig(student.schoolId);
                    setConfig(schoolConfig);
                }
                const history = await getStudentAttendanceHistory(student.studentId, student.schoolId);
                // Normalize history to use RegID for template compatibility
                const normalizedHistory = Array.isArray(history) ? history.map(rec => ({
                    ...rec,
                    studentId: student.studentId
                })) : [];
                setAttendanceHistory(normalizedHistory);
                if (normalizedHistory.length > 0 && normalizedHistory[0]?.date) {
                    setPerceivedMonth(normalizedHistory[0].date.substring(0, 7));
                }
            } else {
                setError(t('ErrorNotFound') || 'Records not found for this ID.');
            }
        } catch (err) {
            setError(t('ErrorSystem') || 'System error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // Width calculation - Use more of the screen
            const containerWidth = Math.min(width, 1600);
            const contentWidth = containerWidth - 20; // Reduced padding
            const availableWidth = contentWidth - 40;

            // Prioritize width-based scaling for "Full Zoom" effect
            const scaleW = availableWidth / 2480;

            // Still calculate height scale but prioritize W unless it's extremely tall
            const scaleH = (height - 40) / 3508;

            // Apply width-based scale mostly, but allow it to be larger than viewport height
            // This fulfills the "increased size and full zoom" request
        let scale = scaleW;

        // Ensure it's not too small, ridiculously large, or NaN/Infinity
        // On some mobile browsers, if window.innerWidth is reported incorrectly, it could lead to NaN
        if (isNaN(scale) || !isFinite(scale)) scale = 0.5; 
        if (scale > 1.5) scale = 1.5;
        if (scale < 0.1) scale = 0.1;

        setPreviewScale(scale);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const downloadPDF = async () => {
        if (result && config) {
            setLoading(true);
            await new Promise(r => setTimeout(r, 100));
            await generateCertificatePDF(result, 'certificate-view');
            setLoading(false);
        }
    };
    const downloadAttendancePDF = async () => {
        if (result && config) {
            setLoading(true);
            const filename = `Attendance_${result.studentId}_${perceivedMonth}`;
            await generateAttendancePDF('public-attendance-report', filename, i18n.language, 'portrait');
            setLoading(false);
        }
    };


    const getLevelLabel = (level: string) => {
        if (!level) return '';
        if (level.startsWith('level')) {
            return t(`students.levels.${level}`);
        }
        const arabicLevels: Record<string, string> = {
            'المستوى الأول': 'level1', 'المستوى الثاني': 'level2', 'المستوى الثالث': 'level3',
            'المستوى الرابع': 'level4', 'المستوى الخامس': 'level5', 'المستوى السادس': 'level6',
            'المستوى السابع': 'level7', 'المستوى الثامن': 'level8', 'المستوى التاسع': 'level9',
            'المستوى العاشر': 'level10', 'المستوى الحادي عشر': 'level11', 'المستوى الثاني عشر': 'level12'
        };
        const key = arabicLevels[level];
        if (key) return t(`students.levels.${key}`);
        return level;
    };

    const getSubjectLabel = (name: string) => {
        if (config?.subjects) {
            const foundById = config.subjects.find(s => s.id === name);
            if (foundById) {
                if (i18n.language === 'ar') return foundById.nameAr;
                if (i18n.language === 'so') return foundById.nameSo;
                return foundById.nameEn;
            }
            const foundByNameAr = config.subjects.find(s => s.nameAr === name);
            if (foundByNameAr) {
                if (i18n.language === 'ar') return foundByNameAr.nameAr;
                if (i18n.language === 'so') return foundByNameAr.nameSo;
                return foundByNameAr.nameEn;
            }
        }
        const mapping: Record<string, string> = {
            'التفسير': 'tafsir', 'السيرة': 'sira', 'الحديث': 'hadith',
            'القراءة والكتابة': 'reading', 'الفقه': 'fiqh', 'اللغة العربية': 'arabic',
            'الأذكار': 'adhkar', 'الرياضيات': 'math', 'اللغة الصومالية': 'somali',
            'Tafsiir': 'tafsir', 'Siirada': 'sira', 'Xadiis': 'hadith',
            'Akhris & Qoris': 'reading', 'Fiqi': 'fiqh', 'Luuqadda Carabiga': 'arabic',
            'Adkaar': 'adhkar', 'Xisaab': 'math', 'Luuqadda Soomaaliga': 'somali'
        };
        const key = mapping[name] || mapping[name?.trim()];
        return key ? t(key) : name;
    };

    if (loading && !result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="relative">
                        <div className="w-20 h-20 border-core border-4 border-amber-400/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-amber-500 rounded-full animate-spin"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-qabas-purple to-purple-900 flex items-center justify-center text-white overflow-hidden shadow-lg border border-white/20">
                            <img src={systemLogo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-black text-[var(--text-main)] font-cairo uppercase tracking-tighter mb-1">Verifying Credentials</p>
                        <p className="text-sm text-[var(--text-muted)] font-bold">Connecting to academic blockchain...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)] p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-[var(--bg-card)] border border-red-500/20 p-10 rounded-[2.5rem] shadow-2xl text-center"
                >
                    <div className="w-24 h-24 bg-red-500/5 p-4 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/10">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-qabas-purple to-purple-900 flex items-center justify-center text-white overflow-hidden shadow-xl border border-white/20">
                            <img src={systemLogo} alt="Logo" className="w-full h-full object-contain scale-110" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-[var(--text-main)] mb-4 font-cairo">
                        {error.includes('not found') ? 'ID Not Found' : 'Verification Failed'}
                    </h2>
                    <p className="text-[var(--text-muted)] font-bold mb-8 leading-relaxed">{error}</p>
                    <Link to="/#verify" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--bg-secondary)] text-[var(--text-main)] rounded-2xl font-black uppercase tracking-widest hover:bg-[var(--bg-card)] border border-[var(--border-color)] transition-all">
                        Return to Search
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div dir={i18n.dir()} className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans transition-colors duration-300">
            {/* Action Bar */}
            {/* Hidden top bar - navigation completely hidden as requested */}

            <div className="max-w-[1600px] mx-auto px-1 py-2">
                <div className="flex flex-col gap-8">
                    {/* Student Profile Card */}
                    <div className="w-full max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                        <User size={16} />
                                        Student Profile
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={downloadPDF}
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 px-4 py-2 rounded-xl font-black transition-all hover:scale-105 active:scale-95 text-xs shadow-lg"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={12} /> : <Download size={12} />}
                                            {t('DownloadPDF')}
                                        </button>
                                        <button
                                            onClick={downloadAttendancePDF}
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2 rounded-xl font-black transition-all hover:scale-105 active:scale-95 text-xs shadow-lg hover:bg-amber-400 hover:text-slate-950"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={12} /> : <Calendar size={12} />}
                                            {t('attendance.reports.export')}
                                        </button>
                                    </div>
                                </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Full Academic Name</p>
                                    <p className="text-lg font-black text-[var(--text-main)] font-cairo leading-tight">{result.fullName}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Student ID</p>
                                        <p className="text-sm font-bold text-[var(--text-main)]">{result.studentId}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Academic Level</p>
                                        <p className="text-sm font-bold text-[var(--text-main)]">{getLevelLabel(result.classLevel)}</p>
                                    </div>
                                </div>

                                {result.schoolId && config && (
                                    <div className="pt-4 border-t border-[var(--border-color)]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Issued By</p>
                                        <div className="flex items-center gap-3">
                                            {config.logoUrl && (
                                                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center p-3 border border-slate-100 relative group overflow-hidden shrink-0">
                                                    <img src={config.logoUrl} alt="School Logo" className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs font-black text-[var(--text-main)] leading-none">{config.schoolNameEn}</p>
                                                <p className="text-[9px] font-bold text-slate-400">Official Record</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <div className="bg-amber-400 p-5 rounded-2xl shadow-lg text-slate-900">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Award size={14} />
                                Verified
                            </h3>
                            <p className="text-sm font-black leading-tight mb-0.5 font-cairo">Fully validated by {systemName}.</p>
                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest leading-none">Key: {result.studentId?.substring(0, 12).toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Certificate Preview */}
                    <div className="w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                        >
                            <div className="hidden">
                                <h2 className="text-lg font-black text-[var(--text-main)] font-cairo uppercase tracking-tight">Preview</h2>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Record</span>
                                </div>
                            </div>

                            <div
                                className="flex justify-center overflow-hidden rounded-2xl"
                                style={{ height: `${3508 * previewScale}px` }}
                            >
                                <div
                                    id="certificate-view"
                                    style={{
                                        transform: `scale(${previewScale})`,
                                        transformOrigin: 'top center',
                                        width: '2480px',
                                        height: '3508px',
                                        flexShrink: 0
                                    }}
                                >
                                    {config && (
                                        <CertificateTemplates
                                            student={result}
                                            config={config}
                                            getLevelLabel={getLevelLabel}
                                            getSubjectLabel={getSubjectLabel}
                                        />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Attendance Record Section */}
                <div className="mt-20">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                            <h3 className="text-2xl md:text-4xl font-black text-[var(--text-main)] flex items-center gap-4 font-cairo">
                                <div className="w-3 h-10 bg-amber-400 rounded-full" />
                                {t('AttendanceRecord')}
                            </h3>

                            <div className="flex gap-4 items-center">
                                <div className="flex flex-col gap-1 w-full md:w-64">
                                    <input
                                        type="month"
                                        value={perceivedMonth}
                                        onChange={(e) => setPerceivedMonth(e.target.value)}
                                        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 font-bold text-[var(--text-main)] outline-none focus:border-amber-400 transition-all w-full"
                                    />
                                </div>
                                <button
                                    onClick={downloadAttendancePDF}
                                    className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] rounded-xl hover:bg-amber-400 hover:text-slate-950 transition-colors"
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="bg-emerald-500/10 p-8 rounded-3xl border border-emerald-500/20 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('attendance.reports.present')}</div>
                                    <CheckCircle2 size={24} className="text-emerald-500/40" />
                                </div>
                                <div className="text-4xl font-black text-[var(--text-main)] font-cairo">
                                    {attendanceHistory.filter(r => r.status === 'present' && r.date.startsWith(perceivedMonth)).length}
                                </div>
                            </div>

                            <div className="bg-rose-500/10 p-8 rounded-3xl border border-rose-500/20 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{t('attendance.reports.absent')}</div>
                                    <XCircle size={24} className="text-rose-500/40" />
                                </div>
                                <div className="text-4xl font-black text-[var(--text-main)] font-cairo">
                                    {attendanceHistory.filter(r => r.status === 'absent' && r.date.startsWith(perceivedMonth)).length}
                                </div>
                            </div>

                            <div className="bg-amber-500/10 p-8 rounded-3xl border border-amber-500/20 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{t('attendance.reports.late')}</div>
                                    <Calendar size={24} className="text-amber-500/40" />
                                </div>
                                <div className="text-4xl font-black text-[var(--text-main)] font-cairo">
                                    {attendanceHistory.filter(r => r.status === 'late' && r.date.startsWith(perceivedMonth)).length}
                                </div>
                            </div>

                            <div className="bg-purple-500/10 p-8 rounded-3xl border border-purple-500/20 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest">{t('attendance.reports.attendanceRate')}</div>
                                    <Award size={24} className="text-purple-500/40" />
                                </div>
                                <div className="text-4xl font-black text-[var(--text-main)] font-cairo">
                                    {(() => {
                                        const m = attendanceHistory.filter(r => r.date.startsWith(perceivedMonth));
                                        const p = m.filter(r => r.status === 'present').length;
                                        const l = m.filter(r => r.status === 'late').length;
                                        const exc = m.filter(r => r.status === 'excused').length;
                                        const abs = m.filter(r => r.status === 'absent').length;
                                        const t = p + l + exc + abs;
                                        return t > 0 ? Math.round(((p + l) / t) * 100) : 0;
                                    })()}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Templates for PDF */}
            <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
                {result && config && (
                    <div 
                        id="public-attendance-report" 
                        className="bg-white"
                        style={{ width: '2480px', height: '3508px', overflow: 'hidden' }}
                    >
                        <AttendanceTemplates
                            type="student"
                            selectedMonth={perceivedMonth}
                            config={config}
                            classLevel={result.classLevel}
                            monthlyData={attendanceHistory.filter(r => r.date.startsWith(perceivedMonth))}
                            summary={(() => {
                                const monthRecords = attendanceHistory.filter(r => r.date.startsWith(perceivedMonth));
                                return {
                                    total: monthRecords.length,
                                    present: monthRecords.filter(r => r.status === 'present').length,
                                    absent: monthRecords.filter(r => r.status === 'absent').length,
                                    late: monthRecords.filter(r => r.status === 'late').length
                                };
                            })()}
                            reports={[{
                                studentId: result.studentId,
                                studentName: result.fullName,
                                classLevel: result.classLevel,
                                totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0, excusedDays: 0, attendanceRate: 0
                            }]}
                        />
                    </div>
                )}
            </div>

            {/* Footer Branding */}
            <div className="w-full py-12 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] mt-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[4px] mb-4">Powered by</p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center p-4 shadow-inner">
                            {systemLogo ? <img src={systemLogo} alt="Logo" className="w-full h-full object-contain" /> : <Shield className="text-white" size={40} />}
                        </div>
                        <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">{systemName}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StandaloneVerify;
