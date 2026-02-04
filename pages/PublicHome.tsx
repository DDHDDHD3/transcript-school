import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Download, Search, XCircle } from 'lucide-react';
import { getStudentByRegId, getConfig, getStudentAttendanceHistory } from '../services/api';
import { Student, CertificateConfig, AttendanceRecord } from '../types';
import { generateCertificatePDF } from '../utils/pdfGenerator';
import { generateAttendancePDF } from '../utils/attendancePdfGenerator';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CertificateTemplates from '../components/CertificateTemplates';

const PublicHome = () => {
  const { t, i18n } = useTranslation();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Student | null>(null);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<CertificateConfig | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [perceivedMonth, setPerceivedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [previewScale, setPreviewScale] = useState(0.25);

  const certificateRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    getConfig().then(setConfig);
    const params = new URLSearchParams(location.search);
    const idParam = params.get('id');
    if (idParam) {
      setSearchId(idParam);
      handleVerify(idParam);
    }

    const handleResize = () => {
      const width = window.innerWidth;
      const availableWidth = width - 40;
      let scale = availableWidth / 2480;
      if (scale > 0.45) scale = 0.45;
      if (scale < 0.13) scale = 0.13;
      setPreviewScale(scale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.search]);

  const handleVerify = async (idToVerify = searchId) => {
    if (!idToVerify.trim()) return;

    setLoading(true);
    setResult(null);
    setAttendanceHistory([]);
    setError('');

    try {
      const student = await getStudentByRegId(idToVerify);
      if (student) {
        setResult(student);
        const history = await getStudentAttendanceHistory(student.studentId);
        setAttendanceHistory(history);
      } else {
        setError(t('home.errorNotFound'));
      }
    } catch (err) {
      setError(t('home.errorSystem'));
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level: string) => {
    if (level.startsWith('level')) {
      return t(`students.levels.${level}`);
    }
    // Handle cases where the level name might be stored in a specific language
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
    // 1. Try to find in Dynamic Config by ID first (e.g. 'tafsir')
    if (config?.subjects) {
      const foundById = config.subjects.find(s => s.id === name);
      if (foundById) {
        if (i18n.language === 'ar') return foundById.nameAr;
        if (i18n.language === 'so') return foundById.nameSo;
        return foundById.nameEn;
      }

      // 2. Try to find by Arabic Name (legacy data might have "التفسير")
      const foundByNameAr = config.subjects.find(s => s.nameAr === name);
      if (foundByNameAr) {
        if (i18n.language === 'ar') return foundByNameAr.nameAr;
        if (i18n.language === 'so') return foundByNameAr.nameSo;
        return foundByNameAr.nameEn;
      }
    }

    const mapping: Record<string, string> = {
      'التفسير': 'tafsir',
      'السيرة': 'sira',
      'الحديث': 'hadith',
      'القراءة والكتابة': 'reading',
      'الفقه': 'fiqh',
      'اللغة العربية': 'arabic',
      'الأذكار': 'adhkar',
      'الرياضيات': 'math',
      'اللغة الصومالية': 'somali'
    };
    const key = mapping[name] || mapping[name.trim()];
    return key ? t(key) : name;
  };

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
      await generateAttendancePDF('public-attendance-report', filename, i18n.language);
      setLoading(false);
    }
  };

  return (
    <div dir={i18n.dir()} className="flex flex-col items-center min-h-[calc(100vh-64px)] bg-slate-50 font-sans overflow-x-hidden relative">

      {/* Search Section */}
      {!result && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-lg mt-10 md:mt-20 px-4 mb-10"
        >
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4 animate-pulse">
              {t('home.publicPortal')}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-qabas-purple mb-4 font-cairo leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-slate-500 font-almarai text-lg max-w-md mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
          </div>

          <div className="flex flex-col md:flex-row shadow-2xl shadow-purple-200/50 rounded-2xl bg-white overflow-hidden p-2 border border-purple-100 gap-2">
            <input
              type="text"
              placeholder={t('home.placeholder')}
              className={`flex-1 px-4 md:px-6 py-3 md:py-4 outline-none text-slate-800 placeholder:text-slate-300 font-bold text-lg md:text-xl text-center ${i18n.dir() === 'rtl' ? 'md:text-right' : 'md:text-left'} font-cairo tracking-wide rounded-xl md:rounded-none`}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              className="bg-gradient-to-r from-qabas-purple to-purple-800 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 font-cairo w-full md:w-auto"
            >
              {loading ? <Loader2 className="animate-spin" /> : t('home.verifyBtn')}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center justify-center gap-2 border border-red-100 font-bold font-almarai"
            >
              <XCircle size={20} /> {error}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Result View */}
      <AnimatePresence>
        {result && config && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center"
          >
            {/* Action Bar */}
            <div className="sticky top-0 md:top-20 z-40 bg-white/95 backdrop-blur-md w-full border-b border-purple-100 p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-12 rounded-b-2xl">
              <button
                onClick={() => { setResult(null); setSearchId(''); }}
                className="text-slate-500 hover:text-qabas-orange font-bold text-sm font-cairo transition-colors order-2 md:order-1"
              >
                {t('home.newSearch')}
              </button>
              <div className="flex gap-2 order-1 md:order-2 w-full md:w-auto">
                <button
                  onClick={downloadPDF}
                  disabled={loading}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-qabas-orange to-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-200 transition-transform hover:scale-105 active:scale-[0.98] font-cairo"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                  {t('home.downloadPDF')}
                </button>
                <button
                  onClick={downloadAttendancePDF}
                  disabled={loading}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-qabas-purple border-2 border-qabas-purple px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 active:scale-[0.98] font-cairo"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                  {t('nav.attendance')}
                </button>
              </div>
            </div>

            {/* Scrollable Preview Container */}
            <div className="w-full overflow-x-auto bg-slate-200/50 p-6 md:p-12 flex justify-center items-start min-h-[600px]" dir="ltr">
              <div
                className="bg-white shadow-[0_30px_60px_rgba(0,0,0,0.2)] relative transition-all duration-500 overflow-hidden"
                style={{
                  width: `${2480 * previewScale}px`,
                  height: `${3508 * previewScale}px`,
                }}
              >

                <div
                  id="certificate-view"
                  ref={certificateRef}
                  className="bg-white absolute top-0 left-0 overflow-hidden text-slate-900 leading-relaxed font-amiri"
                  dir={i18n.dir()}
                  lang={i18n.language}
                  style={{
                    width: '2480px',
                    height: '3508px',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                    textRendering: 'geometricPrecision',
                    letterSpacing: 'normal'
                  }}
                >
                  <CertificateTemplates
                    student={result}
                    config={config}
                    getLevelLabel={getLevelLabel}
                    getSubjectLabel={getSubjectLabel}
                  />
                </div>
              </div>
            </div>

            {/* Attendance Summary for Parents */}
            <div className="w-full max-w-[2480px] bg-slate-50 py-12 px-4 md:px-20">
              <div
                className="max-w-4xl mx-auto bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-slate-100"
                style={{ direction: i18n.dir() }}
              >
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 flex items-center gap-4">
                  <div className="w-3 h-12 bg-qabas-purple rounded-full" />
                  {t('nav.attendanceRecord')}
                </h3>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 bg-slate-50 p-6 rounded-[30px] border border-slate-100">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{t('nav.selectMonth')}</label>
                    <input
                      type="month"
                      value={perceivedMonth}
                      onChange={(e) => setPerceivedMonth(e.target.value)}
                      className="bg-white border-2 border-slate-200 rounded-2xl px-6 py-3 font-bold text-slate-800 outline-none focus:border-qabas-purple transition-all shadow-sm"
                    />
                  </div>

                  <div className="flex gap-4 flex-1 w-full">
                    <div className="flex-1 bg-green-100/50 p-4 rounded-2xl border border-green-100 text-center">
                      <div className="text-2xl font-black text-green-700">
                        {attendanceHistory.filter(r => r.status === 'present' && r.date.startsWith(perceivedMonth)).length}
                      </div>
                      <div className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">{t('nav.presentDays')}</div>
                    </div>
                    <div className="flex-1 bg-red-100/50 p-4 rounded-2xl border border-red-100 text-center">
                      <div className="text-2xl font-black text-red-700">
                        {attendanceHistory.filter(r => r.status === 'absent' && r.date.startsWith(perceivedMonth)).length}
                      </div>
                      <div className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">{t('nav.absentDays')}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {attendanceHistory.filter(r => r.date.startsWith(perceivedMonth)).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attendanceHistory
                        .filter(r => r.date.startsWith(perceivedMonth))
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((rec) => (
                          <div key={rec.id} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 hover:shadow-lg hover:border-purple-100 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-50 transition-colors shadow-inner text-slate-400 font-black font-mono text-lg">
                                {rec.date.split('-')[2]}
                              </div>
                              <div>
                                <div className="font-black text-slate-800 text-lg">{rec.date}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{rec.session === 'morning' ? t('nav.sessions.morning') : t('nav.sessions.afternoon')}</div>
                              </div>
                            </div>
                            <div className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${rec.status === 'present' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-red-600 text-white shadow-lg shadow-red-100'}`}>
                              {rec.status === 'present' ? t('nav.status.present') : t('nav.status.absent')}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200">
                      <p className="text-slate-400 font-black italic text-xl">{t('nav.noAttendance', { month: perceivedMonth })}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden PDF Template for Parent Attendance Report - Positioned off-screen */}
      {
        result && config && (
          <div
            id="public-attendance-report"
            className="bg-white p-[60px] w-[2480px]"
            style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
            dir={i18n.dir()}
            lang={i18n.language}
          >
            <div className="flex flex-col gap-10">
              {/* Header Branded Section - Large & Clear */}
              <div className={`flex ${i18n.dir() === 'rtl' ? 'flex-row' : 'flex-row-reverse'} justify-between items-center border-b-[8px] border-qabas-purple pb-10`}>
                <div className={i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}>
                  <h1 className="text-[85px] font-black text-slate-900 leading-none">{config.schoolName}</h1>
                  <p className="text-[45px] text-slate-600 font-bold uppercase tracking-wider">{config.schoolNameEn}</p>
                </div>
                {config.logoUrl && <img src={config.logoUrl} className="h-[280px] w-auto object-contain drop-shadow-xl" alt="Logo" />}
              </div>

              {/* Report Title Section - Prominent */}
              <div className="text-center space-y-4 mt-6">
                <h2 className="text-[80px] font-black text-qabas-purple uppercase tracking-widest font-amiri underline decoration-qabas-orange decoration-[6px] underline-offset-[15px]">
                  {t('pdf.attendanceTitle')}
                </h2>
                <div className="flex items-center justify-center gap-20 mt-10 bg-slate-50 py-8 rounded-[40px] border-[2px] border-slate-200 px-20">
                  <p className="text-[65px] font-black text-slate-900 font-amiri">{result.fullName}</p>
                  <div className="flex items-center gap-8">
                    <span className="text-[45px] font-bold text-slate-500 uppercase tracking-widest">{t('pdf.studentId')}:</span>
                    <span className="text-[60px] font-black text-qabas-orange font-mono tracking-widest">{result.studentId}</span>
                  </div>
                </div>
              </div>

              {/* Stats Summary - Large Impact Cards */}
              <div className="grid grid-cols-2 gap-12 mt-6">
                <div className="bg-green-50/50 p-10 rounded-[40px] border-[4px] border-green-100 flex items-center justify-between px-16 shadow-sm">
                  <div className="text-[45px] font-bold text-green-700 uppercase tracking-widest">
                    {t('pdf.presentDays')} {t('pdf.monthSelect')} {perceivedMonth}
                  </div>
                  <div className="text-[110px] font-black text-green-600 leading-none">
                    {attendanceHistory.filter(r => r.status === 'present' && r.date.startsWith(perceivedMonth)).length}
                  </div>
                </div>
                <div className="bg-red-50/50 p-10 rounded-[40px] border-[4px] border-red-100 flex items-center justify-between px-16 shadow-sm">
                  <div className="text-[45px] font-bold text-red-700 uppercase tracking-widest">
                    {t('pdf.absentDays')} {t('pdf.monthSelect')} {perceivedMonth}
                  </div>
                  <div className="text-[110px] font-black text-red-600 leading-none">
                    {attendanceHistory.filter(r => r.status === 'absent' && r.date.startsWith(perceivedMonth)).length}
                  </div>
                </div>
              </div>

              {/* Attendance Table - High Scaled Density */}
              <div className="mt-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-900">
                      <th className={`p-6 text-center text-[45px] font-black text-white border border-slate-800 ${i18n.dir() === 'rtl' ? 'rounded-tr-[30px]' : 'rounded-tl-[30px]'}`}>
                        {t('pdf.date')}
                      </th>
                      <th className="p-6 text-center text-[45px] font-black text-white border border-slate-800">
                        {t('attendance.table.status')}
                      </th>
                      <th className={`p-6 text-center text-[45px] font-black text-white border border-slate-800 ${i18n.dir() === 'rtl' ? 'rounded-tl-[30px]' : 'rounded-tr-[30px]'}`}>
                        {t('attendance.table.notes')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceHistory
                      .filter(r => r.date.startsWith(perceivedMonth))
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((rec, idx) => (
                        <tr key={rec.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                          <td className="p-5 border border-slate-100 font-bold font-mono text-center text-[45px] text-slate-700">{rec.date}</td>
                          <td className="p-5 border border-slate-100 text-center font-black text-[50px]">
                            <span className={rec.status === 'present' ? 'text-green-600' : 'text-red-600'}>
                              {rec.status === 'present' ? t('pdf.present') : t('pdf.absent')}
                            </span>
                          </td>
                          <td className={`p-5 border border-slate-100 ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'} text-[35px] text-slate-400 font-medium px-10`}>
                            {rec.notes || t('pdf.noNotes')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Footer / Signature Section - Balanced */}
              <div className="mt-12 flex justify-between items-end border-t-4 border-slate-100 pt-12 px-12 pb-10">
                <div className="text-center space-y-4">
                  <p className="text-[45px] font-black text-slate-800 font-amiri">{t('pdf.recordedDate')}</p>
                  <p className="text-[40px] font-mono font-bold text-slate-500 bg-slate-50 py-4 px-12 rounded-[30px] border border-slate-200">
                    {new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB')}
                  </p>
                </div>

                <div className="relative -mb-10">
                  {config.stampUrl && <img src={config.stampUrl} className="h-[320px] w-auto object-contain opacity-90 rotate-[-12deg] drop-shadow-2xl" alt="Stamp" />}
                </div>

                <div className="text-center space-y-4">
                  <p className="text-[45px] font-black text-slate-800 font-amiri">{t('pdf.signature')}</p>
                  <div className="h-[180px] flex items-end justify-center min-w-[350px]">
                    {config.managerSignatureUrl && <img src={config.managerSignatureUrl} className="h-full object-contain" alt="Signature" />}
                  </div>
                  <p className="text-[40px] font-black text-slate-600 border-t-[4px] border-slate-200 pt-5 mt-4">
                    {config.managerName || t('pdf.signature')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default PublicHome;
