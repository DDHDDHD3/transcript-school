import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, Save, User, Mail, Phone, BookOpen, GraduationCap } from 'lucide-react';
import { getTeachers, saveTeacher, deleteTeacher, generateUUID, getConfig } from '../services/api';
import { Teacher, CertificateConfig } from '../types';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const AdminTeachers = () => {
  const { t, i18n } = useTranslation();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<CertificateConfig | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Teacher>>({});

  useEffect(() => {
    loadTeachers();
    getConfig().then(setConfig);
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (e) {
      console.error("Error loading teachers", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({ ...teacher });
    } else {
      setEditingTeacher(null);
      setFormData({
        id: generateUUID(),
        fullName: '',
        fullNameAr: '',
        email: '',
        phoneNumber: '',
        subjects: [],
        assignedClasses: [],
        schoolId: '',
      });
    }
    setIsModalOpen(true);
  };

  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ show: boolean; id: string | null }>({
    show: false,
    id: null
  });

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteModal({ show: true, id });
  };

  const confirmDeleteTeacher = async () => {
    if (!confirmDeleteModal.id) return;
    const id = confirmDeleteModal.id;

    try {
      await deleteTeacher(id);
      setTeachers(prev => prev.filter(t => t.id !== id));
      setConfirmDeleteModal({ show: false, id: null });
    } catch (err) {
      alert(t('common.error') || 'Error deleting teacher');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) {
      alert(t('common.fillRequired') || 'Please fill required fields');
      return;
    }

    try {
      await saveTeacher(formData as Teacher);
      setIsModalOpen(false);
      loadTeachers();
    } catch (error) {
      alert(t('common.error') || 'Error saving teacher');
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.fullNameAr && teacher.fullNameAr.includes(searchTerm)) ||
    (teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div dir={i18n.dir()} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)] flex items-center gap-2">
            <GraduationCap className="text-qabas-purple" size={28} />
            {t('nav.teachers', { defaultValue: 'Teachers' })}
          </h1>
          <p className="text-[var(--text-muted)] font-medium uppercase text-[10px] tracking-widest mt-1">
            {t('teachers.subtitle', { defaultValue: 'Manage academic staff and assignments' })}
          </p>
        </div>

        <button 
          onClick={() => handleOpenModal()} 
          className="bg-[var(--qabas-purple)] hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95 font-bold text-sm"
        >
          <Plus size={20} /> {t('teachers.addTeacher', { defaultValue: 'Add New Teacher' })}
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm flex items-center gap-4 px-6 py-3 transition-all focus-within:ring-2 focus-within:ring-qabas-purple/20">
        <Search className="text-[var(--text-muted)]" size={20} />
        <input
          type="text"
          placeholder={t('teachers.searchPlaceholder', { defaultValue: 'Search by name or email...' })}
          className="flex-1 outline-none bg-transparent text-[var(--text-main)] font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
            {t('common.loading')}...
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-[var(--bg-card)] border border-dashed border-[var(--border-color)] rounded-3xl">
            <User className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-bold">{t('teachers.noTeachers', { defaultValue: 'No teachers found' })}</p>
          </div>
        ) : (
          filteredTeachers.map((teacher) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={teacher.id} 
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-qabas-purple/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-qabas-purple to-purple-800 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <User size={32} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(teacher)} className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteClick(teacher.id)} className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-[var(--text-main)] mb-1">{i18n.language === 'ar' && teacher.fullNameAr ? teacher.fullNameAr : teacher.fullName}</h3>
                <p className="text-[10px] text-qabas-purple font-black uppercase tracking-widest mb-4">{teacher.email || 'No email set'}</p>

                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <Phone size={14} className="text-slate-400" />
                    <span className="font-bold">{teacher.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <BookOpen size={14} className="text-slate-400" />
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        teacher.subjects.slice(0, 2).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[10px] font-bold">{s}</span>
                        ))
                      ) : (
                        <span className="text-[10px] italic">No subjects assigned</span>
                      )}
                      {teacher.subjects && teacher.subjects.length > 2 && (
                        <span className="text-[10px] font-bold">+{teacher.subjects.length - 2} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Teacher Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex justify-between items-center">
                <h2 className="text-2xl font-black text-[var(--text-main)]">
                  {editingTeacher ? t('teachers.editTitle', { defaultValue: 'Edit Teacher' }) : t('teachers.addTitle', { defaultValue: 'Add Teacher' })}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('teachers.fullNameEn', { defaultValue: 'Full Name (English)' })}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required 
                        type="text" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-qabas-purple outline-none transition-all font-bold"
                        value={formData.fullName || ''}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('teachers.fullNameAr', { defaultValue: 'الاسم الكامل (عربي)' })}</label>
                    <input 
                      dir="rtl"
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-qabas-purple outline-none transition-all font-bold text-lg"
                      value={formData.fullNameAr || ''}
                      onChange={e => setFormData({...formData, fullNameAr: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('common.email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-qabas-purple outline-none transition-all font-bold"
                        value={formData.email || ''}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('common.phone')}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-qabas-purple outline-none transition-all font-bold"
                        value={formData.phoneNumber || ''}
                        onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('teachers.assignedSubjects', { defaultValue: 'Subjects Taught' })}</label>
                    <input 
                      type="text" 
                      placeholder={t('teachers.subjectsPlaceholder', { defaultValue: 'e.g. Mathematics, Science (comma separated)' })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-qabas-purple outline-none transition-all font-bold text-sm"
                      value={formData.subjects?.join(', ') || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData({...formData, subjects: val ? val.split(',').map(s => s.trim()) : []});
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase text-slate-400">{t('teachers.assignedClasses', { defaultValue: 'Assigned Classes' })}</span>
                      <span className="text-[10px] text-slate-500 font-bold mt-1">Select classes this teacher manages</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {config?.classLevels?.map(level => {
                      const isSelected = formData.assignedClasses?.includes(level.id);
                      return (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => {
                            const current = formData.assignedClasses || [];
                            const next = isSelected 
                              ? current.filter(id => id !== level.id)
                              : [...current, level.id];
                            setFormData({...formData, assignedClasses: next});
                          }}
                          className={`p-3 rounded-xl border-2 transition-all text-xs font-bold text-center ${
                            isSelected 
                            ? 'bg-qabas-purple/10 border-qabas-purple text-qabas-purple' 
                            : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          {i18n.language === 'ar' ? level.nameAr : (i18n.language === 'so' ? level.nameSo : level.nameEn)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </form>

              <div className="px-8 py-6 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex justify-end gap-4">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-800 transition-colors uppercase text-xs tracking-widest">{t('common.cancel')}</button>
                <button 
                  onClick={handleSubmit} 
                  className="px-10 py-2.5 bg-qabas-purple hover:bg-purple-800 text-white rounded-2xl font-black shadow-xl shadow-purple-900/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Save size={20} /> {t('common.save') || 'Save Teacher'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteModal.show && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDeleteModal({ show: false, id: null })} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 p-8 text-center">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-[var(--text-main)] mb-2">{t('common.confirmDelete') || 'Are you sure?'}</h3>
              <p className="text-slate-500 mb-8 font-medium">This action cannot be undone. Teacher data will be removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDeleteModal({ show: false, id: null })} className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 font-bold hover:bg-slate-200 transition-all uppercase text-xs tracking-widest">{t('common.cancel')}</button>
                <button onClick={confirmDeleteTeacher} className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 shadow-xl shadow-red-500/30 transition-all uppercase text-xs tracking-widest">{t('common.delete')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTeachers;
