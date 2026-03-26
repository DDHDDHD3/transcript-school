import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter, Download, Edit2, Trash2, X, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, AlertTriangle, RefreshCw, Upload, PlusCircle, Save, Calendar } from 'lucide-react';
import { getStudents, saveStudent, deleteStudent, SUBJECT_LIST, generateUUID, getConfig, saveConfig } from '../services/api';
import { Student, Subject, CertificateConfig } from '../types';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeArabic } from '../utils/stringUtils';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    XLSX: any;
  }
}

const AdminStudents = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [config, setConfig] = useState<CertificateConfig | null>(null);

  useEffect(() => {
    loadStudents();
    getConfig().then(setConfig);
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (e) {
      console.error("Error loading students", e);
    } finally {
      setLoading(false);
    }
  };

  // --- CALCULATION LOGIC ---
  const calculateResults = (currentData: Partial<Student>) => {
    if (!currentData.subjects) return currentData;

    let totalMarks = 0; // Obtained
    const gradingMethod = config?.gradingMethod || 'sum';

    const updatedSubjects = currentData.subjects.map((sub: Subject) => {
      let subObtained = 0;

      if (config?.assessmentColumns && config.assessmentColumns.length > 0) {
        config.assessmentColumns.forEach(col => {
          if (col.type === 'number') {
            const val = Number(sub.assessments?.[col.id] || 0);
            subObtained += val;
          }
        });
      }

      const subFinalScore = subObtained;
      const passThreshold = Number(config?.passThreshold) || 50;
      const isPass = subFinalScore >= passThreshold;

      totalMarks += subFinalScore;

      return {
        ...sub,
        studentMarks: subFinalScore,
        fullMarks: 100,
        displayScore: subFinalScore,
        result: isPass ? 'ناجح' : 'راسب'
      };
    });

    const numberOfSubjects = updatedSubjects.length;
    const totalPossible = numberOfSubjects * 100;

    let finalPercentage = 0;
    if (totalPossible > 0) {
      if (gradingMethod === 'average') {
        finalPercentage = Math.floor(totalMarks / numberOfSubjects);
      } else {
        finalPercentage = Math.floor((totalMarks / totalPossible) * 100);
      }
    }

    const finalPassThreshold = Number(config?.passThreshold) || 50;
    const finalResult = finalPercentage >= finalPassThreshold ? 'ناجح' : 'راسب';

    return {
      ...currentData,
      subjects: updatedSubjects,
      total: totalMarks,
      percentage: finalPercentage,
      finalResult
    };
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      const recalculated = calculateResults(student);
      setFormData(JSON.parse(JSON.stringify(recalculated)));
    } else {
      setEditingStudent(null);
      // Init subjects from Dynamic Config or Fallback
      const subjectsSource = (config?.subjects && config.subjects.length > 0)
        ? config.subjects.filter(s => s.active)
        : (SUBJECT_LIST || []).map(name => ({ id: name, nameAr: name, maxMarks: 100 }));

      const initialSubjects: Subject[] = subjectsSource.map(sub => {
        const assessments: Record<string, any> = {};
        config?.assessmentColumns?.forEach(col => {
          assessments[col.id] = col.type === 'number' ? 0 : '';
        });

        // Use ID if available (new system), else use Name (legacy fallback)
        // ideally we store the ID 'tafsir' in name field for reference? 
        // Or store the display name?
        // To allow translation we should store the ID if possible, but existing code expects name.
        // Let's store the ID if it's a config subject, else the raw string.
        // ACTUALLY: For backward compat, if we change 'name' to 'id', we might break things if specific logic relies on Arabic text.
        // But getSubjectLabel will handle the display.
        const subjectName = (sub as any).id || (sub as any).nameAr || sub;

        return {
          name: subjectName,
          fullMarks: (sub as any).maxMarks || 100,
          studentMarks: 0,
          result: 'راسب',
          assessments
        };
      });

      const initialData = {
        studentId: `${config?.studentPrefix || ''}${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: '',
        academicYear: new Date().getFullYear().toString(),
        classLevel: config?.classLevels?.[0]?.id || 'level1',
        subjects: initialSubjects
      };
      setFormData(calculateResults(initialData));
    }
    setIsModalOpen(true);
  };

  const generateRandomId = () => {
    const prefix = config?.studentPrefix || '';
    const random = Math.floor(100000 + Math.random() * 900000).toString();
    return `${prefix}${random}`;
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

    // 3. Fallback to hardcoded translations for older data not in config
    const translations: Record<string, string> = {
      'التفسير': t('tafsir'),
      'السيرة': t('sira'),
      'الحديث': t('hadith'),
      'القراءة والكتابة': t('reading'),
      'الفقه': t('fiqh'),
      'اللغة العربية': t('arabic'),
      'الأذكار': t('adhkar'),
      'الرياضيات': t('math'),
      'اللغة الصومالية': t('somali'),
      // Somali mappings
      'Tafsiir': t('tafsir'),
      'Siirada': t('sira'),
      'Xadiis': t('hadith'),
      'Akh ris & Qoris': t('reading'),
      'Fiqi': t('fiqh'),
      'Luuqadda Carabiga': t('arabic'),
      'Adkaar': t('adhkar'),
      'Xisaab': t('math'),
      'Luuqadda Soomaaliga': t('somali'),
    };
    return translations[name] || name;
  };

  // Delete Confirmation State
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ show: boolean; id: string | null }>({
    show: false,
    id: null
  });

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteModal({ show: true, id });
  };

  const confirmDeleteStudent = async () => {
    if (!confirmDeleteModal.id) return;
    const id = confirmDeleteModal.id;

    // Optimistic UI Update
    const previousStudents = [...students];
    setStudents(prev => prev.filter(s => s.id !== id));
    setConfirmDeleteModal({ show: false, id: null });

    try {
      await deleteStudent(id);
      setTimeout(() => loadStudents(), 500);
    } catch (err) {
      setStudents(previousStudents);
      alert(t('students.messages.deleteError') || 'Error deleting student');
    }
  };

  // Column Delete Confirmation State
  const [confirmColDeleteModal, setConfirmColDeleteModal] = useState<{ show: boolean; colId: string | null }>({
    show: false,
    colId: null
  });

  const handleColDeleteClick = (colId: string) => {
    setConfirmColDeleteModal({ show: true, colId });
  };

  const confirmDeleteColumn = async () => {
    if (!confirmColDeleteModal.colId || !config) return;
    const colId = confirmColDeleteModal.colId;

    const newCols = (config.assessmentColumns || []).filter(c => c.id !== colId);
    const newConfig = { ...config, assessmentColumns: newCols };

    setConfig(newConfig);
    await saveConfig(newConfig);

    // Refresh formData
    if (formData.subjects) {
      const newSubjects = formData.subjects.map(sub => {
        const assessments = { ...(sub.assessments || {}) };
        delete assessments[colId];
        return { ...sub, assessments };
      });
      setFormData(calculateResults({ ...formData, subjects: newSubjects }));
    }
    setConfirmColDeleteModal({ show: false, colId: null });
  };

  const handleAssessmentChange = (index: number, colId: string, value: any) => {
    if (!formData.subjects) return;
    const newSubjects = [...formData.subjects];
    const assessments = { ...(newSubjects[index].assessments || {}) };
    assessments[colId] = value;
    newSubjects[index] = { ...newSubjects[index], assessments };

    const updatedFormData = calculateResults({ ...formData, subjects: newSubjects });
    setFormData(updatedFormData);
  };

  const handleSubjectNameChange = (index: number, newName: string) => {
    if (!formData.subjects) return;
    const newSubjects = [...formData.subjects];
    newSubjects[index] = { ...newSubjects[index], name: newName };
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleAddAssessmentColumn = async () => {
    const colName = prompt(t('settings.grading.columnName') || 'New Assessment');
    if (!colName || !config) return;

    const newCol = { id: `col_${Date.now()}`, name: colName, maxMarks: 100, type: 'number' as const };
    const newConfig = { ...config, assessmentColumns: [...(config.assessmentColumns || []), newCol] };

    // Save config globally so it reflects for all students
    setConfig(newConfig);
    await saveConfig(newConfig);

    // Refresh formData to include the new column for the current subject rows
    if (formData.subjects) {
      const newSubjects = formData.subjects.map(sub => ({
        ...sub,
        assessments: { ...(sub.assessments || {}), [newCol.id]: 0 }
      }));
      setFormData({ ...formData, subjects: newSubjects });
    }
  };

  const handleDeleteAssessmentColumn = async (colId: string) => {
    if (!config || !window.confirm(t('settings.grading.confirmDelete'))) return;

    const newCols = (config.assessmentColumns || []).filter(c => c.id !== colId);
    const newConfig = { ...config, assessmentColumns: newCols };

    setConfig(newConfig);
    await saveConfig(newConfig);

    // Refresh formData
    if (formData.subjects) {
      const newSubjects = formData.subjects.map(sub => {
        const assessments = { ...(sub.assessments || {}) };
        delete assessments[colId];
        return { ...sub, assessments };
      });
      setFormData(calculateResults({ ...formData, subjects: newSubjects }));
    }
  };

  const handleAddSubject = () => {
    const newSubjects = [...(formData.subjects || [])];
    const assessments: Record<string, any> = {};
    config?.assessmentColumns?.forEach(col => {
      assessments[col.id] = col.type === 'number' ? 0 : '';
    });
    newSubjects.push({
      name: t('students.status.newSubject'),
      fullMarks: 100,
      studentMarks: 0,
      result: 'fail',
      assessments
    });
    setFormData(calculateResults({ ...formData, subjects: newSubjects }));
  };

  const handleDeleteSubject = (index: number) => {
    if (!formData.subjects) return;
    const newSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData(calculateResults({ ...formData, subjects: newSubjects }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.studentId) {
      alert(t('students.messages.fillAll'));
      return;
    }
    const finalData = calculateResults(formData as Student);
    await saveStudent({
      ...finalData,
      id: editingStudent?.id || generateUUID(),
      createdAt: editingStudent?.createdAt || new Date().toISOString(),
    } as Student);
    setIsModalOpen(false);
    loadStudents();
  };

  const handleExportExcel = () => {
    if (!window.XLSX || students.length === 0) return;

    const data = students.map(s => {
      const row: Record<string, any> = {
        [t('students.table.name')]: s.fullName,
        [t('students.table.id')]: s.studentId,
        [t('students.table.level')]: s.classLevel,
        [t('students.modal.academicYear')]: s.academicYear
      };

      // Add dynamic subjects and their assessments
      s.subjects.forEach(sub => {
        if (config?.assessmentColumns && config.assessmentColumns.length > 0) {
          config.assessmentColumns.forEach(col => {
            const key = `${sub.name} - ${col.name}`;
            row[key] = sub.assessments?.[col.id] || 0;
          });
        } else {
          row[`${sub.name} - Marks`] = sub.studentMarks;
        }
      });

      row['Total'] = s.total;
      row['Percentage'] = `${s.percentage}%`;
      row['Result'] = s.finalResult;

      return row;
    });

    const worksheet = window.XLSX.utils.json_to_sheet(data);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    window.XLSX.writeFile(workbook, `students_results_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !window.XLSX) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = window.XLSX.read(bstr, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = window.XLSX.utils.sheet_to_json(worksheet) as any[];

        for (const row of rawData) {
          const studentSubjects: Subject[] = [];

          // Try to rebuild subjects from dynamic columns
          // Column format expected: "SubjectName - AssessmentName"
          const subjectsMap = new Map<string, Subject>();

          Object.keys(row).forEach(key => {
            if (key.includes(' - ')) {
              const [subjectName, assessmentName] = key.split(' - ');
              if (!subjectsMap.has(subjectName)) {
                subjectsMap.set(subjectName, {
                  name: subjectName,
                  fullMarks: 0,
                  studentMarks: 0,
                  result: 'راسب',
                  assessments: {}
                });
              }

              const sub = subjectsMap.get(subjectName)!;
              // Find matching assessment column ID
              const col = config?.assessmentColumns?.find(c => c.name === assessmentName);
              if (col) {
                sub.assessments = sub.assessments || {};
                sub.assessments[col.id] = row[key];
              } else if (assessmentName === 'Marks') {
                sub.studentMarks = Number(row[key] || 0);
              }
            }
          });

          // Map level name back to ID if necessary
          let levelId = row[t('students.table.level')] || 'level1';
          const possibleLevels = [
            'level1', 'level2', 'level3', 'level4', 'level5', 'level6',
            'level7', 'level8', 'level9', 'level10', 'level11', 'level12'
          ];

          const foundLevel = possibleLevels.find(l => t(`students.levels.${l}`) === levelId);
          if (foundLevel) {
            levelId = foundLevel;
          }

          const student: Student = {
            id: generateUUID(),
            studentId: row[t('students.table.id')] || generateRandomId(),
            fullName: row[t('students.table.name')] || 'Unknown',
            academicYear: row[t('students.modal.academicYear')] || new Date().getFullYear().toString(),
            classLevel: levelId,
            subjects: Array.from(subjectsMap.values()),
            total: 0,
            percentage: 0,
            finalResult: 'ناجح',
            createdAt: new Date().toISOString()
          };

          await saveStudent(calculateResults(student) as Student);
        }
        loadStudents();
        alert(t('students.messages.importSuccess'));
      } catch (err) {
        console.error("Import failed", err);
        alert(t('students.messages.importFailed'));
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredStudents = students.filter(s => {
    const normalizedFilter = normalizeArabic(filter);
    return normalizeArabic(s.fullName).includes(normalizedFilter) ||
      s.studentId.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div dir={i18n.dir()}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div id="tour-students-header">
          <h1 className="text-2xl font-bold text-[var(--text-main)]">{t('students.title')}</h1>
          <p className="text-[var(--text-muted)]">{t('students.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={handleExportExcel} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm text-sm font-bold">
            <Download size={18} /> {t('students.exportExcel')}
          </button>
          <label className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer text-sm font-bold">
            {isImporting ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
            <span>{isImporting ? t('students.importing') : t('students.importExcel')}</span>
            <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleImportExcel} disabled={isImporting} />
          </label>
          <button onClick={() => handleOpenModal()} className="flex-1 md:flex-none bg-[var(--qabas-purple)] hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg text-sm font-bold">
            <Plus size={18} /> {t('students.addStudent')}
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm mb-6 flex items-center gap-4 px-4 py-2 transition-all">
        <Search className="text-[var(--text-muted)]" size={20} />
        <input
          type="text"
          placeholder={t('students.searchPlaceholder')}
          className={`flex-1 outline-none bg-transparent text-[var(--text-main)] ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div id="tour-students-table" className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-tighter">
              <tr>
                <th className="px-3 py-3">{t('students.table.name')}</th>
                <th className="px-3 py-3">{t('students.table.id')}</th>
                <th className="px-3 py-3">{t('students.table.level')}</th>
                <th className="px-3 py-3">{t('students.table.result')}</th>
                <th className="px-3 py-3 text-center">{t('nav.attendance') || 'Attendance'}</th>
                <th className="px-3 py-3 text-center">{t('students.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">{t('common.loading')}</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">{t('students.messages.noRecords')}</td></tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[var(--bg-secondary)] transition-colors group border-b border-[var(--border-color)] text-xs">
                    <td className="px-3 py-2 font-bold text-[var(--text-main)]">{student.fullName}</td>
                    <td className="px-3 py-2 font-mono text-[var(--text-secondary)]">{student.studentId}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{student.classLevel}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                        // Support all three languages for pass/fail
                        ['ناجح', 'pass', 'gudbay', 'passed', 'gudbey'].includes(student.finalResult?.toLowerCase()?.trim() || '')
                          ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                          : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                        }`}>
                        {['ناجح', 'pass', 'gudbay', 'passed', 'gudbey'].includes(student.finalResult?.toLowerCase()?.trim() || '')
                          ? t('students.status.pass')
                          : t('students.status.fail')}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        title="View Attendance"
                        onClick={() => navigate('/admin/attendance', { state: { studentId: student.studentId, studentName: student.fullName } })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-bold transition-all"
                      >
                        <Calendar size={14} />
                        <span>{t('nav.attendance') || 'Attendance'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleOpenModal(student)} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 p-2 rounded-xl transition-all cursor-pointer"><Edit2 size={18} /></button>
                        <button onClick={(e) => handleDeleteClick(e, student.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-xl transition-all cursor-pointer"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-card)] rounded-[2rem] shadow-2xl w-full max-w-5xl my-4 md:my-8 overflow-hidden flex flex-col max-h-[95vh] border border-[var(--border-color)]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <h3 className="font-bold text-lg text-[var(--text-main)]">{editingStudent ? t('students.modal.editTitle') : t('students.modal.addTitle')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors"><X className="text-[var(--text-muted)] hover:text-[var(--text-main)]" /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase">{t('students.table.id')}</label>
                  <div className="flex gap-2">
                    <input
                      required
                      type="text"
                      className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-xl focus:ring-2 focus:ring-[var(--qabas-purple)] outline-none text-sm font-mono placeholder:text-[var(--text-muted)] text-[var(--text-main)] transition-all"
                      placeholder="e.g. ID-FIRST-LAST"
                      value={formData.studentId || ''}
                      onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase">{t('students.modal.studentName')}</label>
                  <input required type="text" className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-xl focus:ring-2 focus:ring-[var(--qabas-purple)] outline-none text-sm text-[var(--text-main)] transition-all" value={formData.fullName || ''} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase">{t('students.modal.level')}</label>
                  <select className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-xl focus:ring-2 focus:ring-[var(--qabas-purple)] outline-none text-sm text-[var(--text-main)] transition-all" value={formData.classLevel || (config?.classLevels?.[0]?.id || 'level1')} onChange={e => setFormData({ ...formData, classLevel: e.target.value })}>
                    {config?.classLevels && config.classLevels.length > 0 ? (
                      config.classLevels.map(level => (
                        <option key={level.id} value={level.id}>
                          {i18n.language === 'ar' ? level.nameAr : (i18n.language === 'so' ? level.nameSo : level.nameEn)}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="level1">{t('students.levels.level1')}</option>
                        <option value="level2">{t('students.levels.level2')}</option>
                        <option value="level3">{t('students.levels.level3')}</option>
                        <option value="level4">{t('students.levels.level4')}</option>
                        <option value="level5">{t('students.levels.level5')}</option>
                        <option value="level6">{t('students.levels.level6')}</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase">{t('students.modal.academicYear')}</label>
                  <input required type="text" className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-xl focus:ring-2 focus:ring-[var(--qabas-purple)] outline-none text-sm text-[var(--text-main)] transition-all" value={formData.academicYear || ''} onChange={e => setFormData({ ...formData, academicYear: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                  <h4 className="font-bold text-[var(--text-main)]">{t('students.modal.subjectsTitle')}</h4>
                  <button type="button" onClick={handleAddAssessmentColumn} className="text-[10px] bg-[var(--bg-secondary)] text-orange-600 dark:text-orange-400 hover:bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1 transition-all">
                    <Plus size={12} /> {t('settings.grading.addColumn')}
                  </button>
                </div>
                <button type="button" onClick={handleAddSubject} className="text-xs text-[var(--qabas-purple)] hover:text-purple-700 flex items-center gap-1 font-bold bg-[var(--bg-secondary)] px-3 py-1.5 rounded-xl transition-all active:scale-[0.98] border border-[var(--border-color)]"><PlusCircle size={14} /> {t('students.modal.addSubject')}</button>
              </div>

              <div className="border border-[var(--border-color)] rounded-xl overflow-hidden mb-6 overflow-x-auto shadow-sm bg-[var(--bg-card)]">
                <table className="w-full text-right text-xs min-w-[700px]">
                  <thead className="bg-[var(--bg-secondary)] font-bold text-[var(--text-muted)] border-b border-[var(--border-color)] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 min-w-[150px]">{t('students.modal.table.subject')}</th>
                      {config?.assessmentColumns?.map(col => (
                        <th key={col.id} className="px-4 py-3 text-center group/col relative">
                          <div className="flex items-center justify-center gap-1">
                            <span>{col.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)]">({col.maxMarks})</span>
                            <button
                              type="button"
                              onClick={() => handleColDeleteClick(col.id)}
                              className="opacity-0 group-hover/col:opacity-100 text-red-400 hover:text-red-600 transition-all ml-1"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        </th>
                      )) || (
                          <>
                            <th className="px-4 py-3 text-center">{t('students.modal.table.fullMarks')}</th>
                            <th className="px-4 py-3 text-center">{t('students.modal.table.studentMarks')}</th>
                          </>
                        )}
                      <th className="px-4 py-3 text-center w-24 bg-[var(--bg-secondary)] text-[var(--qabas-purple)] font-black">{t('students.modal.table.total')}</th>
                      <th className="px-4 py-3 text-center w-24">{t('students.modal.table.result')}</th>
                      <th className="px-4 py-3 text-center w-16">{t('students.modal.table.delete')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {formData.subjects?.map((subject, index) => (
                      <tr key={index} className="hover:bg-[var(--bg-secondary)] group">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className={`w-full px-3 py-1.5 border border-transparent group-hover:border-[var(--border-color)] bg-transparent rounded-lg ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'} focus:ring-2 focus:ring-[var(--qabas-purple)] focus:bg-[var(--bg-card)] outline-none font-bold transition-all text-[var(--text-main)]`}
                            value={getSubjectLabel(subject.name)}
                            onChange={(e) => handleSubjectNameChange(index, e.target.value)}
                            readOnly={false}
                          />
                        </td>
                        {config?.assessmentColumns?.map(col => (
                          <td key={col.id} className="px-4 py-2">
                            <input
                              type={col.type === 'number' ? 'number' : 'text'}
                              className="w-full px-2 py-1.5 border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-lg text-center focus:ring-2 focus:ring-[var(--qabas-purple)] outline-none transition-all font-mono text-[var(--text-main)]"
                              value={subject.assessments?.[col.id] || ''}
                              onChange={(e) => handleAssessmentChange(index, col.id, e.target.value)}
                            />
                          </td>
                        )) || (
                            <>
                              <td className="px-4 py-2"><input type="number" className="w-16 px-2 py-1 border border-[var(--border-color)] rounded text-center bg-[var(--bg-secondary)] text-[var(--text-main)]" value={subject.fullMarks} readOnly /></td>
                              <td className="px-4 py-2"><input type="number" className="w-16 px-2 py-1 border border-[var(--border-color)] rounded text-center bg-[var(--bg-secondary)] text-[var(--text-main)]" value={subject.studentMarks} readOnly /></td>
                            </>
                          )}
                        <td className="px-4 py-2 text-center font-black text-[var(--text-main)] bg-[var(--bg-secondary)]">
                          {/* Use calculation result derived 'displayScore' if available, else raw marks */}
                          {(subject as any).displayScore !== undefined ? (subject as any).displayScore : subject.studentMarks}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                            // Support all three languages for pass/fail
                            ['ناجح', 'pass', 'gudbay', 'passed', 'gudbey'].includes(subject.result?.toLowerCase()?.trim() || '')
                              ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                            }`}>
                            {['ناجح', 'pass', 'gudbay', 'passed', 'gudbey'].includes(subject.result?.toLowerCase()?.trim() || '')
                              ? t('students.status.pass')
                              : t('students.status.fail')}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button type="button" onClick={() => handleDeleteSubject(index)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[var(--bg-secondary)] font-bold border-t-2 border-[var(--border-color)]">
                    <tr>
                      <td className="px-4 py-4 text-[var(--text-muted)] uppercase tracking-wider" colSpan={(config?.assessmentColumns?.length || 2) + 1}>{t('students.modal.footer.total')}</td>
                      <td className="px-4 py-4 text-center text-lg font-black text-[var(--text-main)] border-x border-[var(--border-color)]">{formData.total}</td>
                      <td className="px-4 py-4 text-center" colSpan={2}>
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-black text-[var(--qabas-purple)]">{formData.percentage}%</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            // Support all three languages for pass/fail
                            ['ناجح', 'pass', 'gudbay', 'passed', 'gudbey'].includes(formData.finalResult?.toLowerCase()?.trim() || '')
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            }`}>
                            {['ناجح', 'pass', 'gudbay', 'passed', 'gudbey'].includes(formData.finalResult?.toLowerCase()?.trim() || '')
                              ? t('students.status.pass')
                              : t('students.status.fail')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-end gap-3 items-center">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-[var(--text-secondary)] hover:text-[var(--text-main)] font-bold text-sm transition-colors">{t('students.modal.footer.cancel')}</button>
              <button onClick={handleSubmit} className="px-8 py-2.5 bg-[var(--qabas-purple)] hover:bg-purple-700 text-white rounded-xl font-black shadow-xl shadow-purple-900/20 flex items-center gap-2 transition-all active:scale-[0.98] text-sm uppercase tracking-wide border border-white/10">
                <Save size={18} /> {t('students.modal.footer.save')}
              </button>
            </div>
          </motion.div>
        </div>
      )
      }

      {/* Column Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmColDeleteModal.show && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmColDeleteModal({ show: false, colId: null })}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-[var(--text-main)] mb-3">{t('settings.grading.confirmDelete')}</h3>
              <p className="text-[var(--text-muted)] mb-8 text-sm leading-relaxed font-medium">
                Are you sure you want to delete this column? Subject data for this column may be lost.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmColDeleteModal({ show: false, colId: null })}
                  className="px-8 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] font-bold hover:bg-[var(--bg-secondary)] transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={confirmDeleteColumn}
                  className="px-8 py-3 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 shadow-xl shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  {t('common.delete') || 'Delete Column'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteModal({ show: false, id: null })}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-[var(--text-main)] mb-3">{t('students.messages.confirmDelete')}</h3>
              <p className="text-[var(--text-muted)] mb-8 text-sm leading-relaxed font-medium">
                This will permanently remove the student and all their academic records. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmDeleteModal({ show: false, id: null })}
                  className="px-8 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] font-bold hover:bg-[var(--bg-secondary)] transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={confirmDeleteStudent}
                  className="px-8 py-3 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 shadow-xl shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  {t('students.modal.table.delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default AdminStudents;
