import React, { useState, useEffect } from 'react';
import { getConfig, saveConfig, changeAdminPassword, getSchoolBilling, recordPayment, getUserSession, getStudents } from '../services/api';
import { CertificateConfig } from '../types';
import { Save, Upload, Lock, Shield, CreditCard, AlertTriangle, MessageSquare, X, CheckCircle2, Plus, Trash2, Palette, Layout, Check, Users, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateTemplates, { TEMPLATE_DESIGNS } from '../components/CertificateTemplates';
import { Student } from '../types';

const MOCK_STUDENT: Student = {
  id: 'mock-id',
  studentId: 'cd-alhuda',
  fullName: 'Yaasir Ali Ahmed',
  academicYear: '2026',
  classLevel: 'level3',
  subjects: [
    { name: 'tafsir', fullMarks: 100, studentMarks: 57, result: 'Pass', assessments: { 'Monthly Exam 1': 15, 'Midterm Exam': 15, 'Monthly Exam 2': 15, 'Final Exam': 12 } },
    { name: 'sira', fullMarks: 100, studentMarks: 87, result: 'Pass', assessments: { 'Monthly Exam 1': 22, 'Midterm Exam': 22, 'Monthly Exam 2': 22, 'Final Exam': 21 } },
    { name: 'hadith', fullMarks: 100, studentMarks: 64, result: 'Pass', assessments: { 'Monthly Exam 1': 18, 'Midterm Exam': 8, 'Monthly Exam 2': 29, 'Final Exam': 9 } },
    { name: 'reading', fullMarks: 100, studentMarks: 73, result: 'Pass', assessments: { 'Monthly Exam 1': 29, 'Midterm Exam': 22, 'Monthly Exam 2': 20, 'Final Exam': 2 } },
    { name: 'fiqh', fullMarks: 100, studentMarks: 72, result: 'Pass', assessments: { 'Monthly Exam 1': 18, 'Midterm Exam': 18, 'Monthly Exam 2': 18, 'Final Exam': 18 } },
    { name: 'arabic', fullMarks: 100, studentMarks: 76, result: 'Pass', assessments: { 'Monthly Exam 1': 19, 'Midterm Exam': 19, 'Monthly Exam 2': 19, 'Final Exam': 19 } },
    { name: 'adhkar', fullMarks: 100, studentMarks: 86, result: 'Pass', assessments: { 'Monthly Exam 1': 21, 'Midterm Exam': 22, 'Monthly Exam 2': 21, 'Final Exam': 22 } },
    { name: 'math', fullMarks: 100, studentMarks: 68, result: 'Pass', assessments: { 'Monthly Exam 1': 17, 'Midterm Exam': 17, 'Monthly Exam 2': 17, 'Final Exam': 17 } },
    { name: 'somali', fullMarks: 100, studentMarks: 65, result: 'Pass', assessments: { 'Monthly Exam 1': 16, 'Midterm Exam': 16, 'Monthly Exam 2': 16, 'Final Exam': 17 } },
  ],
  total: 542,
  percentage: 60,
  finalResult: '60% (Pass)',
  createdAt: new Date().toISOString()
};

const AdminSettings = () => {
  const { t, i18n } = useTranslation();
  const [config, setConfig] = useState<CertificateConfig | null>(null);
  const [billing, setBilling] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMonths, setPaymentMonths] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Student Data Integration State
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Preview Scale State for responsive preview
  const [previewScale, setPreviewScale] = useState(0.2419);
  const previewContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConfig().then(setConfig);
    getSchoolBilling().then(setBilling);
    loadAllStudents();

    // Handle preview scaling on resize
    const handlePreviewResize = () => {
      if (previewContainerRef.current) {
        // Get the parent container width (the scrollable container)
        const parentElement = previewContainerRef.current.parentElement;
        if (parentElement) {
          const containerWidth = parentElement.offsetWidth;
          // Certificate is 2480px wide, calculate scale to fit
          let scale = containerWidth / 2480;
          // Limit scale to reasonable bounds
          if (scale > 0.3) scale = 0.3;
          if (scale < 0.1) scale = 0.1;
          setPreviewScale(scale);
        }
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(handlePreviewResize, 100);
    window.addEventListener('resize', handlePreviewResize);
    return () => window.removeEventListener('resize', handlePreviewResize);
  }, []);

  const loadAllStudents = async () => {
    setStudentsLoading(true);
    try {
      const data = await getStudents();
      setAllStudents(data);

      // Auto-select Yaasir Ali Ahmed if found in database
      const yaasir = data.find(s => s.fullName.toLowerCase().includes('yaasir ali ahmed'));
      if (yaasir) {
        setSelectedLevel(yaasir.classLevel);
        setSelectedStudent(yaasir);
      }
    } catch (e) {
      console.error("Failed to load students for designer", e);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Delete Confirmation State
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ show: boolean; idx: number | null }>({
    show: false,
    idx: null
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    try {
      await saveConfig(config);
      showToast(t('settings.success'), 'success');
    } catch (error) {
      console.error("Save Settings Error:", error);
      showToast(t('settings.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (idx: number) => {
    setConfirmDeleteModal({ show: true, idx });
  };

  const confirmDelete = () => {
    if (confirmDeleteModal.idx !== null && config) {
      const newCols = (config.assessmentColumns || []).filter((_, i) => i !== confirmDeleteModal.idx);
      setConfig({ ...config, assessmentColumns: newCols });
      setConfirmDeleteModal({ show: false, idx: null });
      showToast(t('settings.success'), 'success'); // Optional: notify user of deletion
    }
  };

  const handleFileChange = (field: keyof CertificateConfig, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && config) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert(t('settings.security.minLength'));
      return;
    }
    setPasswordLoading(true);
    const success = await changeAdminPassword(newPassword);
    setPasswordLoading(false);

    if (success) {
      alert(t('settings.security.success'));
      setNewPassword('');
    } else {
      alert(t('settings.security.error'));
    }
  };

  const handlePayment = async () => {
    const session = getUserSession();
    if (!session.schoolId || paymentAmount <= 0) return;

    setPaymentLoading(true);
    const success = await recordPayment(session.schoolId, paymentAmount, paymentMonths);
    setPaymentLoading(false);

    if (success) {
      setIsPaymentModalOpen(false);
      getSchoolBilling().then(setBilling);
      alert(t('settings.success'));
    } else {
      alert(t('settings.security.error'));
    }
  };

  if (!config) return <div className="p-8 text-center text-slate-500">{t('settings.loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto" dir={i18n.dir()}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{t('settings.title')}</h1>
        <p className="text-slate-500">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-8">
        {/* --- BILLING SECTION --- */}
        {billing && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <CreditCard className="text-qabas-orange" />
                <div>
                  <h2 className="font-bold text-lg">{t('settings.billing.title')}</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                    {billing.feeType === 'free' ? t('settings.billing.free') : t('settings.billing.paid')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${billing.subStatus === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {billing.subStatus === 'active' ? t('settings.billing.active') : t('settings.billing.expired')}
                </div>
              </div>
            </div>

            <div className="p-6 grid md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">{t('settings.billing.balance')}</p>
                <p className={`text-2xl font-black ${Number(billing.balance || 0) > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                  ${Number(billing.balance || 0).toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">{t('settings.billing.credits')}</p>
                <p className="text-2xl font-black text-slate-800">
                  {billing.credits}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">{t('settings.billing.studentCount')}</p>
                <p className="text-2xl font-black text-slate-800">
                  {billing.studentCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">{t('settings.billing.expiry')}</p>
                <p className="text-lg font-bold text-slate-700">
                  {new Date(billing.subExpiry).toLocaleDateString()}
                </p>
              </div>
              {billing.feeType === 'paid' && (
                <button
                  onClick={() => {
                    setPaymentAmount(Number(billing.balance || 0));
                    setIsPaymentModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl border border-blue-100 transition-all active:scale-[0.98] text-left group"
                >
                  <p className="text-[10px] font-black uppercase mb-1 flex items-center gap-2">
                    <CreditCard size={12} />
                    {t('settings.billing.payNow')}
                  </p>
                  <p className="text-[10px] text-blue-50 font-medium leading-tight group-hover:text-white transition-colors">
                    {t('settings.billing.payMsg')}
                  </p>
                </button>
              )}
            </div>

            {billing.billingMessage && (
              <div className="px-6 pb-6 pt-2">
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-qabas-orange shadow-sm shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{t('settings.billing.message')}</p>
                    <p className="text-sm font-bold text-slate-800 italic leading-relaxed">
                      "{billing.billingMessage}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- SECURITY SECTION --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
            <Shield className="text-qabas-purple" />
            <h2 className="font-bold text-lg text-slate-800">{t('settings.security.title')}</h2>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1">
              <label className="text-sm font-medium text-slate-700">{t('settings.security.newPasswordLabel')}</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-qabas-purple focus:ring-2 focus:ring-purple-50"
                placeholder={t('settings.security.placeholder')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
              />
              <p className="text-xs text-slate-400">{t('settings.security.hint')}</p>
            </div>
            <button
              type="submit"
              disabled={!newPassword || passwordLoading}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2 h-[42px]"
            >
              <Lock size={16} />
              {passwordLoading ? t('settings.security.loading') : t('settings.security.button')}
            </button>
          </form>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* --- CERTIFICATE TEMPLATE SECTION --- */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-qabas-purple/10 rounded-xl flex items-center justify-center text-qabas-purple">
                  <Palette size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-slate-800">{t('settings.template.title') || 'Certificate Customization'}</h2>
                  <p className="text-sm text-slate-400 font-medium">Design and personalize your school's official documents</p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              {/* Main Preview Area */}
              <div className="bg-slate-50 rounded-[32px] p-4 sm:p-6 md:p-8 border border-slate-100">
                <div className="mb-6 md:mb-8 p-3 sm:p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3 md:mb-4">
                    <Users size={14} className="md:w-4 md:h-4" /> <span className="text-[10px] md:text-xs">Student Data Integration</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Step 1: Select Academic Level</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-qabas-purple/20 transition-all cursor-pointer"
                        value={selectedLevel}
                        onChange={(e) => {
                          setSelectedLevel(e.target.value);
                          setSelectedStudent(null);
                        }}
                      >
                        <option value="">{t('students.searchPlaceholder') || 'Select Level'}</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                          <option key={num} value={`level${num}`}>{t(`students.levels.level${num}`)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Step 2: Select Student</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-qabas-purple/20 transition-all cursor-pointer disabled:opacity-50"
                        value={selectedStudent?.id || ''}
                        disabled={!selectedLevel}
                        onChange={(e) => {
                          const student = allStudents.find(s => s.id === e.target.value);
                          setSelectedStudent(student || null);
                        }}
                      >
                        <option value="">Select Student</option>
                        {allStudents
                          .filter(s => s.classLevel === selectedLevel)
                          .map(student => (
                            <option key={student.id} value={student.id}>{student.fullName} ({student.studentId})</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layout size={14} className="md:w-4 md:h-4" /> <span className="text-[10px] md:text-xs">Live Master Preview</span>
                  </h3>
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: config.primaryColor }} />
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: config.secondaryColor }} />
                  </div>
                </div>

                {/* Responsive scrollable container that adapts to all screen sizes */}
                <div className="w-full overflow-x-auto bg-slate-100 rounded-lg">
                  <div
                    ref={previewContainerRef}
                    className="mx-auto bg-white shadow-2xl rounded-lg border border-slate-200 overflow-hidden"
                    style={{
                      width: `${2480 * previewScale}px`,
                      height: `${3508 * previewScale}px`,
                      minWidth: '100%'
                    }}
                  >
                    <div
                      className="origin-top-left pointer-events-none"
                      style={{
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top left',
                        width: '2480px',
                        height: '3508px'
                      }}
                    >
                      <CertificateTemplates
                        student={selectedStudent || MOCK_STUDENT}
                        config={config}
                        getLevelLabel={(l) => t(`students.levels.${l}`) || l}
                        getSubjectLabel={(s) => {
                          // 1. Try to find in Dynamic Config by ID or Name
                          if (config?.subjects) {
                            const found = config.subjects.find(sub => sub.id === s || sub.nameAr === s || sub.nameEn === s);
                            if (found) {
                              if (i18n.language === 'ar') return found.nameAr;
                              if (i18n.language === 'so') return found.nameSo;
                              return found.nameEn;
                            }
                          }
                          // 2. Fallback to existing translations (for Mock data 'tafsir' etc)
                          return t(s.toLowerCase()) || s;
                        }}
                        useCustomColors={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-12">
                {/* Color Customization - Circle Interface */}
                <div className="lg:col-span-1 space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-4">
                    {t('settings.template.brandPalette')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: t('settings.template.primary') || 'Primary', field: 'primaryColor' as const, default: '#5b21b6' },
                      { label: t('settings.template.secondary') || 'Secondary', field: 'secondaryColor' as const, default: '#ea580c' },
                      { label: t('settings.template.accent') || 'Accent', field: 'accentColor' as const, default: '#d97706' },
                      { label: t('settings.template.text') || 'Text', field: 'textColor' as const, default: '#0f172a' }
                    ].map(color => (
                      <div key={color.field} className="group flex flex-col items-center gap-3 p-4 rounded-3xl bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                        <div className="relative w-16 h-16 rounded-full shadow-lg overflow-hidden border-4 border-white ring-2 ring-slate-100">
                          <input
                            type="color"
                            value={config[color.field] || color.default}
                            onChange={e => setConfig({ ...config, [color.field]: e.target.value })}
                            className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{color.label}</p>
                          <input
                            type="text"
                            value={config[color.field] || color.default}
                            onChange={e => setConfig({ ...config, [color.field]: e.target.value })}
                            className="w-16 bg-transparent border-none outline-none font-mono text-[10px] uppercase text-slate-600 text-center font-bold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dedicated Logo Upload Space */}
                  <div className="mt-8 p-6 bg-slate-900 rounded-[32px] text-white shadow-xl shadow-slate-200/50">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-qabas-purple animate-pulse" />
                      {t('settings.template.schoolLogo')}
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="w-28 h-28 bg-white/5 border-2 border-dashed border-white/20 rounded-3xl flex items-center justify-center overflow-hidden transition-all hover:border-white/40">
                        {config.logoUrl ? (
                          <img src={config.logoUrl} className="w-full h-full object-contain p-2" alt="L" />
                        ) : (
                          <Layout className="text-white/10" size={32} />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-xs text-white/50 leading-relaxed">
                          {t('settings.template.logoDescription')}
                        </p>
                        <label className="inline-flex cursor-pointer bg-white text-slate-900 hover:bg-slate-50 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                          {t('settings.media.upload') || 'Upload Logo'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('logoUrl', e)} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Selection Grid */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-4">
                    {t('settings.template.select') || 'Design Library'}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          const templateId = `template${num}` as keyof typeof TEMPLATE_DESIGNS;
                          const design = TEMPLATE_DESIGNS[templateId];
                          setConfig({
                            ...config,
                            templateId,
                            primaryColor: design.primary,
                            secondaryColor: design.secondary,
                            textColor: design.text
                          });
                        }}
                        className={`relative group h-[180px] overflow-hidden rounded-[24px] border-2 transition-all ${config.templateId === `template${num}` ? 'border-qabas-purple ring-4 ring-purple-50 shadow-xl' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg'}`}
                      >
                        {/* Live Miniature Preview */}
                        <div className="absolute inset-0 bg-white" style={{ transform: 'scale(0.0806)', transformOrigin: i18n.dir() === 'rtl' ? 'top right' : 'top left', width: '2480px', height: '3508px' }}>
                          <CertificateTemplates
                            student={MOCK_STUDENT}
                            config={{ ...config, templateId: `template${num}` }}
                            getLevelLabel={(l) => t(`students.levels.${l}`) || l}
                            getSubjectLabel={(s) => t(s.toLowerCase()) || s}
                            useCustomColors={false}
                          />
                        </div>

                        <div className={`absolute inset-0 transition-opacity flex items-center justify-center ${config.templateId === `template${num}` ? 'bg-qabas-purple/10' : 'bg-black/0 group-hover:bg-black/5'}`}>
                          {config.templateId === `template${num}` && (
                            <div className="bg-qabas-purple text-white p-2 rounded-full shadow-2xl scale-110 animate-in zoom-in duration-200">
                              <Check size={16} strokeWidth={4} />
                            </div>
                          )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-sm border-t border-slate-50">
                          <p className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
                            {t('settings.template.design')} {num}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* General Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="font-bold text-lg text-slate-800 mb-4 pb-2 border-b border-slate-50">{t('settings.school.title')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('settings.school.nameAr')}</label>
                <input required type="text" className={`w-full px-3 py-2 border border-slate-200 rounded-lg ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`} value={config.schoolName} onChange={e => setConfig({ ...config, schoolName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('settings.school.nameEn')}</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-left" dir="ltr" value={config.schoolNameEn} onChange={e => setConfig({ ...config, schoolNameEn: e.target.value })} />
              </div>
            </div>
          </div>

          {/* --- SUBJECTS MANAGEMENT SECTION --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="text-qabas-purple" />
                <h2 className="font-bold text-lg text-slate-800">{t('settings.subjects.title') || 'School Subjects'}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newSubject = {
                    id: `subj_${Date.now()}`,
                    nameAr: 'مادة جديدة',
                    nameEn: 'New Subject',
                    nameSo: 'Cashar Cusub',
                    maxMarks: 100,
                    active: true
                  };
                  setConfig({ ...config, subjects: [...(config.subjects || []), newSubject] });
                }}
                className="text-sm bg-purple-50 text-qabas-purple hover:bg-purple-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
              >
                <Plus size={16} /> {t('settings.subjects.add') || 'Add Subject'}
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-6">{t('settings.subjects.subtitle') || 'Manage the subjects taught at your school. These will appear in student forms and certificates.'}</p>

            <div className="border rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-right text-sm min-w-[700px]">
                <thead className="bg-slate-50 font-bold text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">#</th>
                    <th className="px-4 py-3">{t('settings.subjects.nameAr') || 'Arabic Name'}</th>
                    <th className="px-4 py-3">{t('settings.subjects.nameEn') || 'English Name'}</th>
                    <th className="px-4 py-3">{t('settings.subjects.nameSo') || 'Somali Name'}</th>
                    <th className="px-4 py-3 w-24 text-center">{t('settings.subjects.maxMarks') || 'Max'}</th>
                    <th className="px-4 py-3 w-24 text-center">{t('settings.subjects.active') || 'Active'}</th>
                    <th className="px-4 py-3 text-center w-20">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(config.subjects || []).map((subj, idx) => (
                    <tr key={subj.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          dir="rtl"
                          className="w-full bg-transparent border-b border-transparent focus:border-qabas-purple outline-none py-1 font-medium text-slate-700"
                          value={subj.nameAr}
                          onChange={(e) => {
                            const newSubjects = [...(config.subjects || [])];
                            newSubjects[idx] = { ...newSubjects[idx], nameAr: e.target.value };
                            setConfig({ ...config, subjects: newSubjects });
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full bg-transparent border-b border-transparent focus:border-qabas-purple outline-none py-1 font-medium text-slate-700 text-left"
                          value={subj.nameEn}
                          onChange={(e) => {
                            const newSubjects = [...(config.subjects || [])];
                            newSubjects[idx] = { ...newSubjects[idx], nameEn: e.target.value };
                            setConfig({ ...config, subjects: newSubjects });
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full bg-transparent border-b border-transparent focus:border-qabas-purple outline-none py-1 font-medium text-slate-700 text-left"
                          value={subj.nameSo}
                          onChange={(e) => {
                            const newSubjects = [...(config.subjects || [])];
                            newSubjects[idx] = { ...newSubjects[idx], nameSo: e.target.value };
                            setConfig({ ...config, subjects: newSubjects });
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="w-full bg-transparent border-b border-transparent focus:border-qabas-purple outline-none py-1 font-mono text-center"
                          value={subj.maxMarks}
                          onChange={(e) => {
                            const newSubjects = [...(config.subjects || [])];
                            newSubjects[idx] = { ...newSubjects[idx], maxMarks: Number(e.target.value) };
                            setConfig({ ...config, subjects: newSubjects });
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const newSubjects = [...(config.subjects || [])];
                            newSubjects[idx] = { ...newSubjects[idx], active: !subj.active };
                            setConfig({ ...config, subjects: newSubjects });
                          }}
                          className={`w-8 h-5 rounded-full p-1 transition-colors ${subj.active ? 'bg-green-100' : 'bg-slate-200'}`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${subj.active ? 'translate-x-[2px] bg-green-500' : '-translate-x-[2px] bg-slate-400'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            // Simple delete for now
                            const newSubjects = (config.subjects || []).filter((_, i) => i !== idx);
                            setConfig({ ...config, subjects: newSubjects });
                          }}
                          className="text-red-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- GRADING STRUCTURE SECTION --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Shield className="text-qabas-orange" />
                <h2 className="font-bold text-lg text-slate-800">{t('settings.grading.title')}</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('settings.grading.methodTitle')}</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-qabas-orange"
                  value={config.gradingMethod || 'sum'}
                  onChange={e => setConfig({ ...config, gradingMethod: e.target.value as 'sum' | 'average' })}
                >
                  <option value="sum">{t('settings.grading.methodSum')}</option>
                  <option value="average">{t('settings.grading.methodAvg')}</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  {config.gradingMethod === 'average'
                    ? t('settings.grading.methodAvgDesc')
                    : t('settings.grading.methodSumDesc')}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('settings.grading.thresholdTitle')}</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-qabas-orange"
                  value={config.passThreshold || 50}
                  onChange={e => setConfig({ ...config, passThreshold: Number(e.target.value) })}
                />
                <p className="text-[10px] text-slate-400">{t('settings.grading.thresholdDesc')}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-700">{t('settings.grading.columns')}</h3>
              <button
                type="button"
                onClick={() => {
                  const newCol = { id: `col_${Date.now()}`, name: 'New Column', maxMarks: 100, type: 'number' as const };
                  setConfig({ ...config, assessmentColumns: [...(config.assessmentColumns || []), newCol] });
                }}
                className="text-sm bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
              >
                <Plus size={16} /> {t('settings.grading.addColumn')}
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">{t('settings.grading.subtitle')}</p>

            <div className="border rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-right text-sm min-w-[500px]">
                <thead className="bg-slate-50 font-bold text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-center w-16">#</th>
                    <th className="px-4 py-3">{t('settings.grading.columnName')}</th>
                    <th className="px-4 py-3 w-32">{t('settings.grading.maxMarks')}</th>
                    <th className="px-4 py-3 w-32">{t('settings.grading.type')}</th>
                    <th className="px-4 py-3 text-center w-24">{t('settings.grading.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(config.assessmentColumns || []).map((col, idx) => (
                    <tr key={col.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full bg-transparent border-b border-transparent focus:border-royal-400 outline-none py-1 font-medium text-slate-700"
                          value={col.name}
                          onChange={(e) => {
                            const newCols = [...(config.assessmentColumns || [])];
                            newCols[idx].name = e.target.value;
                            setConfig({ ...config, assessmentColumns: newCols });
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="w-full bg-transparent border-b border-transparent focus:border-royal-400 outline-none py-1 font-mono"
                          value={col.maxMarks}
                          onChange={(e) => {
                            const newCols = [...(config.assessmentColumns || [])];
                            newCols[idx].maxMarks = Number(e.target.value);
                            setConfig({ ...config, assessmentColumns: newCols });
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="bg-transparent outline-none text-slate-600 w-full"
                          value={col.type}
                          onChange={(e) => {
                            const newCols = [...(config.assessmentColumns || [])];
                            newCols[idx].type = e.target.value as 'number' | 'text';
                            setConfig({ ...config, assessmentColumns: newCols });
                          }}
                        >
                          <option value="number">{t('settings.grading.number')}</option>
                          <option value="text">{t('settings.grading.text')}</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(idx)}
                          className="text-red-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & Images */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="font-bold text-lg text-slate-800 mb-4 pb-2 border-b border-slate-50">{t('settings.media.title')}</h2>
            <div className="grid md:grid-cols-3 gap-8">

              {/* Stamp Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">{t('settings.media.stamp')}</label>
                <div className="flex flex-col items-center gap-3 border p-4 rounded-lg bg-slate-50">
                  <div className="w-24 h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {config.stampUrl ? <img src={config.stampUrl} className="w-full h-full object-contain" /> : <span className="text-xs text-slate-400">{t('settings.media.noImage')}</span>}
                  </div>
                  <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Upload size={16} /> {t('settings.media.upload')}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('stampUrl', e)} />
                  </label>
                </div>
              </div>

              {/* Signature Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">{t('settings.media.signature')}</label>
                <div className="flex flex-col items-center gap-3 border p-4 rounded-lg bg-slate-50">
                  <div className="w-32 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {config.managerSignatureUrl ? <img src={config.managerSignatureUrl} className="w-full h-full object-contain" /> : <span className="text-xs text-slate-400">{t('settings.media.noImage')}</span>}
                  </div>
                  <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Upload size={16} /> {t('settings.media.upload')}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('managerSignatureUrl', e)} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-royal-900 hover:bg-royal-800 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? t('settings.saving') : t('settings.save')}
            </button>
          </div>
        </form>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPaymentModalOpen(false)} />
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 px-8 py-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-qabas-orange rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-orange-500/20">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t('settings.billing.payNow')}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('settings.billing.paymentModal.secureHeader')}</p>
                </div>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white p-2 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-500">{t('settings.billing.paymentModal.currBalance')}</p>
                  <p className="text-xl font-black text-slate-900">${Number(billing.balance || 0).toFixed(2)}</p>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-500">{t('settings.billing.paymentModal.svcExpiry')}</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(billing.subExpiry || 0).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('settings.billing.paymentModal.amountLabel')}</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-qabas-purple focus:ring-4 focus:ring-purple-50 transition-all font-bold text-lg"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('settings.billing.paymentModal.renewLabel')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 6, 12].map(m => (
                      <button
                        key={m}
                        onClick={() => setPaymentMonths(m)}
                        className={`py-3 rounded-xl text-sm font-bold transition-all ${paymentMonths === m ? 'bg-qabas-purple text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {m} {m === 1 ? t('settings.billing.paymentModal.month') : t('settings.billing.paymentModal.months')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={paymentLoading || paymentAmount <= 0}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 text-lg"
              >
                {paymentLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={24} />
                    {t('settings.billing.paymentModal.confirmBtn')}
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-400 text-center font-medium italic">
                {t('settings.billing.paymentModal.mockNote')}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteModal({ show: false, idx: null })}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{t('settings.grading.confirmDelete')}</h3>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                This action cannot be undone. Any student grades associated with this column will be permanently removed.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmDeleteModal({ show: false, idx: null })}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all hover:scale-105"
                >
                  Delete Column
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

export default AdminSettings;
