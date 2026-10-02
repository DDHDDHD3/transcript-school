'use client';

import React, { useState, useEffect } from 'react';
import { getConfig, saveConfig, changeAdminPassword, getSchoolBilling, recordPayment, getUserSession, getStudents, requestCredits } from '../services/api';
import { CertificateConfig } from '../types';
import { Save, Upload, Lock, Shield, CreditCard, AlertTriangle, MessageSquare, X, CheckCircle2, Plus, Trash2, Palette, Layout, Check, Users, BookOpen, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateTemplates, { TEMPLATE_DESIGNS } from '../components/CertificateTemplates';
import { Student } from '../types';
import { getLevelLabel } from '../utils/levelUtils';

const MOCK_STUDENT: Student = {
  id: 'mock-id',
  studentId: 'cd-alhuda',
  registrationNumber: 'cd-alhuda',
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

  // Credit Request state
  const [isCreditRequestModalOpen, setIsCreditRequestModalOpen] = useState(false);
  const [creditRequestAmount, setCreditRequestAmount] = useState(100);
  const [creditRequestNotes, setCreditRequestNotes] = useState('');
  const [creditRequestLoading, setCreditRequestLoading] = useState(false);

  useEffect(() => {
    getConfig().then(data => {
      if (data) {
        // Migration: If no levels, add Level 1-6 as per user agreement
        if (!data.classLevels || data.classLevels.length === 0) {
          const defaults = [1, 2, 3, 4, 5, 6].map(num => ({
            id: `level${num}`,
            nameAr: `المستوى ${num}`,
            nameEn: `Level ${num}`,
            nameSo: `Heerka ${num}`
          }));
          const updated = { ...data, classLevels: defaults };
          setConfig(updated);
          // Auto-save this migration if it's the first time
          saveConfig(updated);
        } else {
          setConfig(data);
        }
      }
    });
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
      window.dispatchEvent(new CustomEvent('brandingUpdated'));
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
  }


  const handleRequestCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreditRequestLoading(true);
    const result = await requestCredits(creditRequestAmount, creditRequestNotes);
    setCreditRequestLoading(false);
    if (result.success) {
      showToast('Credit request submitted successfully!', 'success');
      setIsCreditRequestModalOpen(false);
      setCreditRequestNotes('');
    } else {
      showToast('Failed to submit credit request.', 'error');
    }
  };

  if (!config) return <div className="p-8 text-center text-slate-500">{t('settings.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" dir={i18n.dir()}>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">{t('settings.title')}</h1>
        <p className="text-[var(--text-muted)]">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-8">
        {/* --- BILLING SECTION --- */}
        {billing && (
          <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
            <div className="bg-[var(--bg-card)] px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3 text-[var(--text-main)]">
                <CreditCard className="text-orange-500" />
                <div>
                  <h2 className="font-bold text-lg">{t('settings.billing.title')}</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                    {billing.feeType === 'free' ? t('settings.billing.free') : t('settings.billing.paid')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${billing.subStatus === 'active' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                  {billing.subStatus === 'active' ? t('settings.billing.active') : t('settings.billing.expired')}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-1">
                <p className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase">{t('settings.billing.balance')}</p>
                <p className={`text-2xl font-black ${Number(billing.balance || 0) > 0 ? 'text-red-600' : 'text-[var(--text-main)]'}`}>
                  ${Number(billing.balance || 0).toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase">{t('settings.billing.credits')}</p>
                <p className="text-2xl font-black text-[var(--text-main)]">
                  {billing.credits}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase">{t('settings.billing.studentCount')}</p>
                <p className="text-2xl font-black text-[var(--text-main)]">
                  {billing.studentCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase">{t('settings.billing.expiry')}</p>
                <p className="text-lg font-bold text-[var(--text-secondary)]">
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
              <button
                type="button"
                onClick={() => setIsCreditRequestModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl border border-purple-100 transition-all active:scale-[0.98] text-left group"
              >
                <p className="text-[10px] font-black uppercase mb-1 flex items-center gap-2">
                  <Plus size={12} />
                  Top-up Credits
                </p>
                <p className="text-[10px] text-purple-50 font-medium leading-tight group-hover:text-white transition-colors">
                  Request more certificate credits for your school.
                </p>
              </button>
            </div>

            {billing.billingMessage && (
              <div className="px-6 pb-6 pt-2">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 flex gap-4">
                  <div className="w-10 h-10 bg-[var(--bg-card)] rounded-xl flex items-center justify-center text-[var(--qabas-orange)] shadow-sm shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{t('settings.billing.message')}</p>
                    <p className="text-sm font-bold text-[var(--text-main)] italic leading-relaxed">
                      "{billing.billingMessage}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- SECURITY SECTION --- */}
        <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-sm border border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border-color)]">
            <Shield className="text-[var(--qabas-purple)]" />
            <h2 className="font-bold text-lg text-[var(--text-main)]">{t('settings.security.title')}</h2>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col sm:flex-row gap-4 items-end max-w-full">
            <div className="flex-1 w-full space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">{t('settings.security.newPasswordLabel')}</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-lg outline-none focus:border-[var(--qabas-purple)] focus:ring-2 focus:ring-purple-500/20 bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-main)]"
                placeholder={t('settings.security.placeholder')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
              />
              <p className="text-xs text-[var(--text-muted)]">{t('settings.security.hint')}</p>
            </div>
            <button
              type="submit"
              disabled={!newPassword || passwordLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2 h-[42px] shrink-0 whitespace-nowrap shadow-md"
            >
              <Lock size={16} />
              {passwordLoading ? t('settings.security.loading') : t('settings.security.button')}
            </button>
          </form>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* --- CERTIFICATE TEMPLATE SECTION --- */}
          <div id="tour-template-section" className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-sm border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--qabas-purple)]/10 rounded-xl flex items-center justify-center text-[var(--qabas-purple)]">
                  <Palette size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-[var(--text-main)]">{t('settings.template.title') || 'Certificate Customization'}</h2>
                  <p className="text-sm text-[var(--text-muted)] font-medium">Design and personalize your school's official documents</p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              {/* Main Preview Area */}
              <div className="bg-slate-50 rounded-[32px] p-4 sm:p-6 md:p-8 border border-slate-100">
                <div className="mb-6 md:mb-8 p-3 sm:p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3 md:mb-4">
                    <Users size={14} className="md:w-4 md:h-4" /> <span className="text-[10px] md:text-xs">{t('settings.tab.integration')}</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Step 1: Select Academic Level</label>
                      <select
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-main)] outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
                        value={selectedLevel}
                        onChange={(e) => {
                          setSelectedLevel(e.target.value);
                          setSelectedStudent(null);
                        }}
                      >
                        <option value="">{t('students.searchPlaceholder') || 'Select Level'}</option>
                        {config?.classLevels && config.classLevels.length > 0 ? (
                          config.classLevels.map(level => (
                            <option key={level.id} value={level.id}>
                              {i18n.language === 'ar' ? level.nameAr : (i18n.language === 'so' ? level.nameSo : level.nameEn)}
                            </option>
                          ))
                        ) : (
                          [1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={`level${num}`}>{t(`students.levels.level${num}`)}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Step 2: Select Student</label>
                      <select
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-main)] outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
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
                    <Layout size={14} className="md:w-4 md:h-4" /> <span className="text-[10px] md:text-xs">{t('settings.tab.preview')}</span>
                  </h3>
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: config.primaryColor }} />
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: config.secondaryColor }} />
                  </div>
                </div>

                {/* Responsive scrollable container that adapts to all screen sizes */}
                <div className="w-full overflow-x-auto bg-slate-100 rounded-lg p-2 sm:p-4">
                  <div
                    ref={previewContainerRef}
                    className="mx-auto bg-white shadow-2xl rounded-lg border border-slate-200 overflow-hidden shrink-0"
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
                            className="w-16 bg-transparent border-none outline-none font-mono text-[10px] uppercase text-black text-center font-bold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Template Selection Grid */}
                <div className="lg:col-span-3 space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-4">
                    {t('settings.template.select') || 'Design Library'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            getLevelLabel={(l) => getLevelLabel(l, config, i18n.language, t)}
                            getSubjectLabel={(s) => t(s.toLowerCase()) || s}
                            useCustomColors={false}
                          />
                        </div>

                        <div className={`absolute inset-0 transition-opacity flex items-center justify-center ${config.templateId === `template${num}` ? 'bg-purple-600/20' : 'bg-black/0 group-hover:bg-black/5'}`}>
                          {config.templateId === `template${num}` && (
                            <div className="bg-purple-600 text-white p-2 rounded-full shadow-2xl scale-110 animate-in zoom-in duration-200">
                              <Check size={16} strokeWidth={4} />
                            </div>
                          )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-sm border-t border-slate-50">
                          <p className="text-[10px] font-black uppercase text-black tracking-wider">
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
          <div className="bg-[var(--bg-card)] p-5 sm:p-8 rounded-2xl shadow-sm border border-[var(--border-color)]">
            <h2 className="font-bold text-lg text-[var(--text-main)] mb-6 pb-2 border-b border-[var(--border-color)]">{t('settings.school.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-black dark:text-black">{t('settings.school.nameAr')}</label>
                <input required type="text" className={`w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-[var(--text-main)] ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`} value={config.schoolName} onChange={e => setConfig({ ...config, schoolName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-black dark:text-black">{t('settings.school.nameEn')}</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-left bg-white dark:bg-white/5 text-[var(--text-main)]" dir="ltr" value={config.schoolNameEn} onChange={e => setConfig({ ...config, schoolNameEn: e.target.value })} />
              </div>
            </div>
          </div>

          {/* --- SUBJECTS MANAGEMENT SECTION --- */}
          <div id="tour-subjects-section" className="bg-[var(--bg-card)] p-6 rounded-xl shadow-sm border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <BookOpen className="text-[var(--qabas-purple)]" />
                <h2 className="font-bold text-lg text-[var(--text-main)]">{t('settings.subjects.title') || 'School Subjects'}</h2>
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
                className="text-sm bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
              >
                <Plus size={16} /> {t('settings.subjects.add') || 'Add Subject'}
              </button>
            </div>

            <p className="text-[10px] sm:text-sm text-slate-500 mb-6 font-medium">{t('settings.subjects.subtitle') || 'Manage the subjects taught at your school. These will appear in student forms and certificates.'}</p>

            <div className="border border-[var(--border-color)] rounded-xl overflow-hidden overflow-x-auto custom-scrollbar shadow-inner bg-[var(--bg-secondary)]">
              <table className="w-full text-right text-xs sm:text-sm min-w-[700px] sm:min-w-[800px]">
                <thead className="bg-[var(--bg-secondary)] font-black text-[var(--text-muted)] uppercase tracking-tighter text-[10px]">
                  <tr>
                    <th className="px-3 py-4 text-center w-12">#</th>
                    <th className="px-3 py-4">{t('settings.subjects.nameAr') || 'Arabic Name'}</th>
                    <th className="px-3 py-4">{t('settings.subjects.nameEn') || 'English Name'}</th>
                    <th className="px-4 py-4">{t('settings.subjects.nameSo') || 'Somali Name'}</th>
                    <th className="px-3 py-4 w-24 text-center">{t('settings.subjects.maxMarks') || 'Max'}</th>
                    <th className="px-3 py-4 w-24 text-center">{t('settings.subjects.active') || 'Active'}</th>
                    <th className="px-3 py-4 text-center w-20">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-[var(--bg-card)]">
                  {(config.subjects || []).map((subj, idx) => (
                    <tr key={subj.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-3 py-3 text-center font-mono text-slate-400 text-[10px]">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          dir="rtl"
                          className="w-full bg-transparent border-b border-transparent focus:border-purple-600 outline-none py-1 font-medium text-[var(--text-main)]"
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
                          className="w-full bg-transparent border-b border-transparent focus:border-purple-600 outline-none py-1 font-medium text-[var(--text-main)] text-left"
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
                          className="w-full bg-transparent border-b border-transparent focus:border-purple-600 outline-none py-1 font-medium text-[var(--text-main)] text-left"
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
          <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-sm border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Shield className="text-qabas-orange" />
                <h2 className="font-bold text-lg text-[var(--text-main)]">{t('settings.grading.title')}</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1">
                <label className="text-sm font-medium text-black dark:text-black">{t('settings.grading.methodTitle')}</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-qabas-orange bg-white dark:bg-white/5 text-[var(--text-main)]"
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
                <label className="text-sm font-medium text-black dark:text-black">{t('settings.grading.thresholdTitle')}</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-qabas-orange bg-white dark:bg-white/5 text-[var(--text-main)]"
                  value={config.passThreshold || 50}
                  onChange={e => setConfig({ ...config, passThreshold: Number(e.target.value) })}
                />
                <p className="text-[10px] text-slate-400">{t('settings.grading.thresholdDesc')}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-6 border-t border-[var(--border-color)]">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-secondary)] mb-1">{t('settings.grading.methodTitle') || 'Grading Method'}</h3>
                <p className="text-xs text-[var(--text-muted)]">{t('settings.grading.methodDesc') || 'Choose how final grades are calculated'}</p>
              </div>
              <div className="flex items-center gap-3 bg-[var(--bg-secondary)] p-1.5 rounded-xl border border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, gradingMethod: 'sum' })}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${config.gradingMethod !== 'average' ? 'bg-[var(--bg-card)] text-[var(--qabas-purple)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  {t('settings.grading.methodSum') || 'Sum (Obtained/Total)'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, gradingMethod: 'average' })}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${config.gradingMethod === 'average' ? 'bg-[var(--bg-card)] text-[var(--qabas-purple)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  {t('settings.grading.methodAverage') || 'Average (Mean Score)'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-black dark:text-black">{t('settings.grading.columns')}</h3>
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

            <div className="border border-[var(--border-color)] rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-right text-sm min-w-[500px]">
                <thead className="bg-[var(--bg-secondary)] font-bold text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 text-center w-16">#</th>
                    <th className="px-4 py-3 text-[var(--text-muted)]">{t('settings.grading.columnName')}</th>
                    <th className="px-4 py-3 w-32 text-[var(--text-muted)]">{t('settings.grading.maxMarks')}</th>
                    <th className="px-4 py-3 w-32 text-[var(--text-muted)]">{t('settings.grading.type')}</th>
                    <th className="px-4 py-3 text-center w-24 text-[var(--text-muted)]">{t('settings.grading.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(config.assessmentColumns || []).map((col, idx) => (
                    <tr key={col.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full bg-transparent border-b border-transparent focus:border-purple-600 outline-none py-1 font-medium text-[var(--text-main)]"
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
                          className="bg-transparent outline-none text-[var(--text-secondary)] w-full"
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
          <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-sm border border-[var(--border-color)]">
            <h2 className="font-bold text-lg text-[var(--text-main)] mb-4 pb-2 border-b border-[var(--border-color)]">{t('settings.media.title')}</h2>
            <div className="grid md:grid-cols-3 gap-8">

              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--text-secondary)]">{t('settings.media.logo')}</label>
                <div className="flex flex-col items-center gap-3 border border-[var(--border-color)] p-4 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="w-24 h-24 bg-white border border-[var(--border-color)] rounded-lg flex items-center justify-center overflow-hidden">
                    {config.logoUrl ? <img src={config.logoUrl} className="w-full h-full object-contain" /> : <span className="text-xs text-[var(--text-muted)]">{t('settings.media.noImage')}</span>}
                  </div>
                  <label className="cursor-pointer bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all active:scale-95">
                    <Upload size={16} /> {t('settings.media.upload')}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('logoUrl', e)} />
                  </label>
                </div>
              </div>

              {/* Stamp Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--text-secondary)]">{t('settings.media.stamp')}</label>
                <div className="flex flex-col items-center gap-3 border border-[var(--border-color)] p-4 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="w-24 h-24 bg-white border border-[var(--border-color)] rounded-lg flex items-center justify-center overflow-hidden">
                    {config.stampUrl ? <img src={config.stampUrl} className="w-full h-full object-contain" /> : <span className="text-xs text-[var(--text-muted)]">{t('settings.media.noImage')}</span>}
                  </div>
                  <label className="cursor-pointer bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all active:scale-95">
                    <Upload size={16} /> {t('settings.media.upload')}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('stampUrl', e)} />
                  </label>
                </div>
              </div>

              {/* Signature Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--text-secondary)]">{t('settings.media.signature')}</label>
                <div className="flex flex-col items-center gap-3 border border-[var(--border-color)] p-4 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="w-24 h-24 bg-white border border-[var(--border-color)] rounded-lg flex items-center justify-center overflow-hidden">
                    {config.managerSignatureUrl ? <img src={config.managerSignatureUrl} className="w-full h-full object-contain" /> : <span className="text-xs text-[var(--text-muted)]">{t('settings.media.noImage')}</span>}
                  </div>
                  <label className="cursor-pointer bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all active:scale-95">
                    <Upload size={16} /> {t('settings.media.upload')}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('managerSignatureUrl', e)} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* --- STUDENT & ATTENDANCE CONFIGURATION --- */}
          <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-sm border border-[var(--border-color)]">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-[var(--border-color)]">
              <Users className="text-[var(--qabas-purple)]" />
              <h2 className="font-bold text-lg text-[var(--text-main)]">{t('settings.studentConfig.title') || 'Student & Attendance Configuration'}</h2>
            </div>

            <div className="space-y-8">
              {/* Student ID Prefix */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">{t('settings.studentConfig.prefixLabel') || 'Student ID Prefix'}</label>
                <input
                  type="text"
                  className="w-full max-w-xs px-3 py-2 border border-[var(--border-color)] rounded-lg outline-none focus:border-[var(--qabas-purple)] focus:ring-2 focus:ring-purple-500/20 bg-[var(--bg-secondary)] text-[var(--text-main)]"
                  placeholder="e.g. AQ-"
                  value={config.studentPrefix || ''}
                  onChange={(e) => setConfig({ ...config, studentPrefix: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-[var(--text-muted)]">{t('settings.studentConfig.prefixHint') || 'This prefix will be added to all newly generated student IDs.'}</p>
              </div>

              {/* Class Levels Manager */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--text-secondary)]">{t('settings.studentConfig.levelsTitle') || 'Class Levels'}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newLevel = {
                        id: `level_${Date.now()}`,
                        nameAr: 'مستوى جديد',
                        nameEn: 'New Level',
                        nameSo: 'Heerka Cusub'
                      };
                      setConfig({ ...config, classLevels: [...(config.classLevels || []), newLevel] });
                    }}
                    className="text-xs bg-[var(--qabas-purple)]/10 text-[var(--qabas-purple)] hover:bg-[var(--qabas-purple)]/20 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus size={14} /> {t('settings.studentConfig.addLevel') || 'Add Level'}
                  </button>
                </div>
                <div className="border border-[var(--border-color)] rounded-xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-right text-xs min-w-[500px]">
                    <thead className="bg-[var(--bg-secondary)] font-bold text-[var(--text-muted)]">
                      <tr>
                        <th className="px-4 py-2 text-center w-12">#</th>
                        <th className="px-4 py-2">{t('settings.studentConfig.nameAr') || 'Arabic'}</th>
                        <th className="px-4 py-2">{t('settings.studentConfig.nameEn') || 'English'}</th>
                        <th className="px-4 py-2">{t('settings.studentConfig.nameSo') || 'Somali'}</th>
                        <th className="px-4 py-2 text-center w-20">{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {(config.classLevels || []).map((level, idx) => (
                        <tr key={level.id}>
                          <td className="px-4 py-2 text-center text-[var(--text-muted)]">{idx + 1}</td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              dir="rtl"
                              className="w-full bg-transparent border-b border-transparent focus:border-qabas-purple outline-none py-1"
                              value={level.nameAr}
                              onChange={(e) => {
                                const newLevels = [...(config.classLevels || [])];
                                newLevels[idx] = { ...newLevels[idx], nameAr: e.target.value };
                                setConfig({ ...config, classLevels: newLevels });
                              }}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              dir="ltr"
                              className="w-full bg-transparent border-b border-transparent focus:border-qabas-purple outline-none py-1"
                              value={level.nameEn}
                              onChange={(e) => {
                                const newLevels = [...(config.classLevels || [])];
                                newLevels[idx] = { ...newLevels[idx], nameEn: e.target.value };
                                setConfig({ ...config, classLevels: newLevels });
                              }}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              dir="ltr"
                              className="w-full bg-transparent border-b border-transparent focus:border-qabas-purple outline-none py-1"
                              value={level.nameSo}
                              onChange={(e) => {
                                const newLevels = [...(config.classLevels || [])];
                                newLevels[idx] = { ...newLevels[idx], nameSo: e.target.value };
                                setConfig({ ...config, classLevels: newLevels });
                              }}
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const newLevels = (config.classLevels || []).filter((_, i) => i !== idx);
                                setConfig({ ...config, classLevels: newLevels });
                              }}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>


            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--qabas-purple)] hover:bg-[var(--qabas-purple-light)] text-qabas-purple px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? t('settings.saving') : t('settings.save')}
            </button>
          </div>
        </form >
      </div >


      {/* --- MODALS & NOTIFICATIONS --- */}
      <AnimatePresence>
        {/* Credit Request Modal */}
        {
          isCreditRequestModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-black dark:text-qabas-purple">Request More Credits</h3>
                    <button onClick={() => setIsCreditRequestModalOpen(false)} className="text-slate-400 hover:text-black">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleRequestCredits} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Amount</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[50, 100, 500].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCreditRequestAmount(amt)}
                            className={`py-3 rounded-xl border-2 font-bold transition-all ${creditRequestAmount === amt ? 'border-qabas-purple bg-purple-50 text-qabas-purple' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                          >
                            {amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Additional Notes</label>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-200 transition-all h-24"
                        placeholder="e.g. Need more credits for the upcoming final exams..."
                        value={creditRequestNotes}
                        onChange={(e) => setCreditRequestNotes(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creditRequestLoading}
                      className="w-full bg-qabas-purple hover:bg-purple-700 text-qabas-purple font-bold py-4 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
                    >
                      {creditRequestLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                      Submit Request
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )
        }

        {/* Payment Modal */}
        {
          isPaymentModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-3 text-slate-900 dark:text-qabas-purple">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center p-2.5 shadow-inner border border-slate-100 overflow-hidden">
                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{t('settings.billing.payNow')}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('settings.billing.paymentModal.secureHeader')}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-black p-2 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-500">{t('settings.billing.paymentModal.currBalance')}</p>
                      <p className="text-xl font-black text-slate-900 dark:text-qabas-purple">${Number(billing.balance || 0).toFixed(2)}</p>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-500">{t('settings.billing.paymentModal.svcExpiry')}</p>
                      <p className="text-sm font-bold text-black dark:text-black">{new Date(billing.subExpiry || 0).toLocaleDateString()}</p>
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
                            type="button"
                            onClick={() => setPaymentMonths(m)}
                            className={`py-3 rounded-xl text-sm font-bold transition-all ${paymentMonths === m ? 'bg-qabas-purple text-qabas-purple shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
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
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-qabas-purple font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 text-lg"
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
                </div>
              </motion.div>
            </div>
          )
        }

        {/* Confirm Delete Modal */}
        {
          confirmDeleteModal.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 text-center"
              >
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">{t('settings.grading.confirmDelete')}</h3>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                  This action cannot be undone. Any student grades associated with this column will be permanently removed.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setConfirmDeleteModal({ show: false, idx: null })}
                    className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-black font-bold hover:bg-slate-50 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-qabas-purple font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all hover:scale-105"
                  >
                    Delete Column
                  </button>
                </div>
              </motion.div>
            </div>
          )
        }

        {/* Toast Notification */}
        {
          toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 z-50 flex items-center gap-3 ${toast.type === 'success' ? 'bg-slate-900 text-qabas-purple' : 'bg-red-600 text-qabas-purple'}`}
            >
              {toast.type === 'success' ? <CheckCircle2 size={24} className="text-green-400" /> : <AlertTriangle size={24} />}
              <span className="font-bold tracking-wide">{toast.message}</span>
              <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-2 hover:opacity-75 transition-opacity">
                <X size={18} />
              </button>
            </motion.div>
          )
        }
      </AnimatePresence >
    </div >
  );
};

export default AdminSettings;

