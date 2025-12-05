
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, RefreshCw, PlusCircle, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { getStudents, saveStudent, deleteStudent, SUBJECT_LIST, generateUUID } from '../services/api';
import { Student, Subject } from '../types';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    XLSX: any;
  }
}

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({});

  useEffect(() => {
    loadStudents();
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

  // --- CALCULATION LOGIC MOVED UP ---
  const calculateResults = (currentData: Partial<Student>) => {
    if (!currentData.subjects) return currentData;

    let totalMarks = 0;

    // We calculate individual subject results
    // Note: Individual failures do NOT force the final result to fail anymore (based on new rules)
    const updatedSubjects = currentData.subjects.map(sub => {
      // Individual pass check (usually 50% of subject marks)
      const isPass = sub.studentMarks >= (sub.fullMarks / 2);

      totalMarks += Number(sub.studentMarks);
      // Removed totalFullMarks accumulation for percentage base from here
      return {
        ...sub,
        result: isPass ? 'ناجح' : 'راسب'
      };
    });

    // Calculate percentage based on total marks vs (Number of Subjects * 100)
    // This ensures that even if a subject is marked out of 30, it's weight in the percentage is standardized if that's the requirement.
    // User Request: 518.73 / 700 = 74.1% (where 700 is 7 subjects * 100)
    const standardizedFullMarks = currentData.subjects.length * 100;

    const percentageRaw = standardizedFullMarks > 0 ? (totalMarks / standardizedFullMarks) * 100 : 0;
    // Round to 1 decimal place (e.g., 74.1)
    const percentage = Number(percentageRaw.toFixed(1));

    // FINAL RESULT LOGIC:
    // If Percentage >= 50%, then Passed (ناجح). Otherwise Failed (راسب).
    const finalResult = percentage >= 50 ? 'ناجح' : 'راسب';

    return {
      ...currentData,
      subjects: updatedSubjects,
      total: Number(totalMarks.toFixed(2)), // Ensure total is also clean
      percentage,
      finalResult
    };
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      // FIX: Recalculate immediately when opening to fix old data (e.g., 50% failing)
      const recalculated = calculateResults(student);
      setFormData(JSON.parse(JSON.stringify(recalculated)));
    } else {
      setEditingStudent(null);
      // Init empty marks
      const initialSubjects: Subject[] = SUBJECT_LIST.map(name => ({
        name,
        fullMarks: 100,
        studentMarks: 0,
        result: 'راسب'
      }));

      // Initial state is also calculated to be safe
      const initialData = {
        studentId: generateRandomId(),
        academicYear: `${new Date().getFullYear() - 1} / ${new Date().getFullYear()}`,
        subjects: initialSubjects,
        classLevel: 'المستوى الأول',
        total: 0,
        percentage: 0,
        finalResult: 'راسب'
      };

      const calculatedInitial = calculateResults(initialData);
      setFormData(calculatedInitial);
    }
    setIsModalOpen(true);
  };

  const generateRandomId = () => {
    // Generate 12 digits
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!id) {
      alert("خطأ: معرف الطالب غير موجود");
      return;
    }

    if (!window.confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟')) {
      return;
    }

    // 1. Optimistic Update
    const previousStudents = [...students];
    setStudents(prev => prev.filter(s => s.id !== id));

    try {
      // 2. Perform API Call
      await deleteStudent(id);
      // 3. Sync to be sure
      setTimeout(() => loadStudents(), 500);
    } catch (err) {
      // 4. Revert on failure
      console.error("Deletion failed in UI", err);
      alert("فشل في حذف الطالب. تأكد من الاتصال بالإنترنت.");
      setStudents(previousStudents);
    }
  };

  const handleSubjectChange = (index: number, field: keyof Subject, value: any) => {
    if (!formData.subjects) return;
    const newSubjects = [...formData.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };

    // Auto calc result for this subject
    if (field === 'studentMarks' || field === 'fullMarks') {
      const marks = field === 'studentMarks' ? Number(value) : newSubjects[index].studentMarks;
      const full = field === 'fullMarks' ? Number(value) : newSubjects[index].fullMarks;
      newSubjects[index].result = marks >= (full / 2) ? 'ناجح' : 'راسب';
    }

    const updatedFormData = calculateResults({ ...formData, subjects: newSubjects });
    setFormData(updatedFormData);
  };

  const handleSubjectNameChange = (index: number, newName: string) => {
    if (!formData.subjects) return;
    const newSubjects = [...formData.subjects];
    newSubjects[index] = { ...newSubjects[index], name: newName };
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleAddSubject = () => {
    const newSubjects = [...(formData.subjects || [])];
    newSubjects.push({
      name: 'مادة جديدة',
      fullMarks: 100,
      studentMarks: 0,
      result: 'راسب'
    });
    // Fix: Recalculate results immediately so the footer updates
    const updatedFormData = calculateResults({ ...formData, subjects: newSubjects });
    setFormData(updatedFormData);
  };

  const handleDeleteSubject = (index: number) => {
    if (!formData.subjects) return;
    const newSubjects = formData.subjects.filter((_, i) => i !== index);
    const updatedFormData = calculateResults({ ...formData, subjects: newSubjects });
    setFormData(updatedFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.studentId) return;

    // Final calc check
    const finalData = calculateResults(formData);

    const studentToSave: Student = {
      ...finalData as Student,
      // Use robust UUID generator
      id: editingStudent ? editingStudent.id : generateUUID(),
      createdAt: editingStudent ? editingStudent.createdAt : new Date().toISOString()
    };

    try {
      await saveStudent(studentToSave);
      setIsModalOpen(false);
      loadStudents();
    } catch (err: any) {
      alert("حدث خطأ أثناء الحفظ: " + err.message);
    }
  };

  // --- EXCEL HANDLERS ---
  const handleExportExcel = () => {
    if (students.length === 0) {
      alert("لا يوجد بيانات لتصديرها");
      return;
    }
    const XLSX = window.XLSX;
    if (!XLSX) return;

    // Flatten data for Excel
    const excelData = students.map(s => {
      const row: any = {
        'اسم الطالب': s.fullName,
        'رقم الطالب': s.studentId,
        'المستوى': s.classLevel,
        'العام الدراسي': s.academicYear,
        'المجموع': s.total,
        'النسبة': s.percentage + '%',
        'النتيجة النهائية': s.finalResult
      };
      s.subjects.forEach(sub => {
        row[sub.name] = sub.studentMarks;
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الطلاب");
    XLSX.writeFile(workbook, `سجل_الطلاب_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const XLSX = window.XLSX;
    if (!XLSX) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target?.result;
        // Use read 'array' type for better robustness with arrayBuffer
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("الملف فارغ!");
          setIsImporting(false);
          return;
        }

        // VALIDATION: Check Headers
        const firstRow = data[0] as object;
        const headers = Object.keys(firstRow).map(h => h.trim());

        // Check for the most critical column
        if (!headers.includes('اسم الطالب')) {
          const foundHeaders = headers.join(', ');
          alert(`خطأ: لم يتم العثور على عمود "اسم الطالب" في الملف.\n\nالأعمدة التي تم العثور عليها:\n${foundHeaders}\n\nيرجى التأكد من تطابق عناوين الأعمدة.`);
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        let importedCount = 0;
        let failedCount = 0;
        let firstError = '';

        // Loop through rows
        for (const row of data as any[]) {
          try {
            // Safe Trim helper
            const getVal = (key: string) => row[key] ? row[key].toString().trim() : '';

            const fullName = getVal('اسم الطالب');

            // If name missing, skip
            if (!fullName) continue;

            const studentId = getVal('رقم الطالب') || generateRandomId();
            const classLevel = getVal('المستوى') || 'المستوى الأول';
            const academicYear = getVal('العام الدراسي') || `${new Date().getFullYear() - 1} / ${new Date().getFullYear()}`;

            const subjects: Subject[] = [];
            SUBJECT_LIST.forEach(subName => {
              // Check exact name or trimmed name
              let val = row[subName];
              if (val === undefined) {
                // Try finding key with extra spaces
                const fuzzyKey = Object.keys(row).find(k => k.trim() === subName);
                if (fuzzyKey) val = row[fuzzyKey];
              }

              if (val !== undefined) {
                const marks = Number(val) || 0;
                subjects.push({
                  name: subName,
                  fullMarks: 100,
                  studentMarks: marks,
                  result: marks >= 50 ? 'ناجح' : 'راسب'
                });
              }
            });

            if (subjects.length === 0) {
              SUBJECT_LIST.forEach(name => {
                subjects.push({ name, fullMarks: 100, studentMarks: 0, result: 'راسب' });
              });
            }

            const rawStudent: Partial<Student> = {
              id: generateUUID(), // Generates a temporary ID, but backend will handle upsert via studentId
              studentId,
              fullName,
              classLevel,
              academicYear,
              subjects,
              createdAt: new Date().toISOString()
            };

            const calculatedStudent = calculateResults(rawStudent) as Student;
            await saveStudent(calculatedStudent);
            importedCount++;
          } catch (err: any) {
            console.error("Failed to import row:", row, err);
            failedCount++;
            if (!firstError) firstError = err.message || JSON.stringify(err);
          }
        }

        let msg = `تم استيراد/تحديث ${importedCount} طالب بنجاح!`;
        if (failedCount > 0) {
          msg += `\n(فشل ${failedCount} سجل)`;
          if (firstError) msg += `\nسبب الخطأ الأول: ${firstError}`;
        }
        alert(msg);

        // Force reload
        await loadStudents();

      } catch (error) {
        console.error("Import Error", error);
        alert("حدث خطأ أثناء قراءة الملف. تأكد من الصيغة.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    // Use readAsArrayBuffer for better compatibility
    reader.readAsArrayBuffer(file);
  };


  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    s.studentId.includes(filter)
  );

  return (
    <div dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">سجل الطلاب</h1>
          <p className="text-slate-500">إدارة الدرجات والشهادات</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm font-bold"
          >
            <Download size={18} /> تصدير إكسل
          </button>

          <label className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer text-sm font-bold">
            {isImporting ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
            <span>{isImporting ? 'جاري الاستيراد...' : 'استيراد إكسل'}</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImportExcel}
              disabled={isImporting}
            />
          </label>

          <button
            onClick={() => handleOpenModal()}
            className="flex-1 md:flex-none bg-royal-900 hover:bg-royal-800 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg text-sm font-bold"
          >
            <Plus size={18} /> إضافة طالب
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          placeholder="بحث بالاسم أو رقم الطالب..."
          className="flex-1 outline-none text-slate-700 text-right"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">اسم الطالب</th>
                <th className="px-6 py-4">رقم الطالب</th>
                <th className="px-6 py-4">المستوى</th>
                <th className="px-6 py-4">النتيجة النهائية</th>
                <th className="px-6 py-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">جاري التحميل...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">لا توجد سجلات.</td></tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">{student.fullName}</td>
                    <td className="px-6 py-4 font-mono text-slate-600">{student.studentId}</td>
                    <td className="px-6 py-4 text-slate-600">{student.classLevel}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${student.finalResult === 'ناجح' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {student.finalResult}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex justify-end gap-3 relative z-10">
                        <button
                          onClick={() => handleOpenModal(student)}
                          className="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-colors cursor-pointer"
                          title="تعديل الطالب"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(e, student.id);
                          }}
                          className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors cursor-pointer"
                          title="حذف الطالب"
                        >
                          <span className="pointer-events-none">
                            <Trash2 size={18} />
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4 md:my-8 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editingStudent ? 'تعديل طالب' : 'إضافة طالب جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-slate-700" /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">رقم الطالب (تلقائي)</label>
                  <div className="flex gap-2">
                    <input readOnly type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-mono" value={formData.studentId || ''} />
                    <button type="button" onClick={() => setFormData({ ...formData, studentId: generateRandomId() })} className="p-2 bg-slate-100 rounded hover:bg-slate-200"><RefreshCw size={18} /></button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">اسم الطالب</label>
                  <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-royal-500" value={formData.fullName || ''} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">المستوى</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-royal-500" value={formData.classLevel || 'المستوى الأول'} onChange={e => setFormData({ ...formData, classLevel: e.target.value })}>
                    <option>المستوى الأول</option>
                    <option>المستوى الثاني</option>
                    <option>المستوى الثالث</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">العام الدراسي</label>
                  <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-royal-500" value={formData.academicYear || ''} onChange={e => setFormData({ ...formData, academicYear: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h4 className="font-bold text-slate-800">درجات المواد</h4>
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="text-sm text-royal-600 hover:text-royal-800 flex items-center gap-1 font-medium bg-royal-50 px-3 py-1.5 rounded-lg"
                >
                  <PlusCircle size={16} /> إضافة مادة
                </button>
              </div>

              <div className="border rounded-lg overflow-hidden mb-6 overflow-x-auto">
                <table className="w-full text-right text-sm min-w-[600px]">
                  <thead className="bg-slate-50 font-medium text-slate-600">
                    <tr>
                      <th className="px-4 py-3">المادة</th>
                      <th className="px-4 py-3">الدرجة الكاملة</th>
                      <th className="px-4 py-3">درجة الطالب</th>
                      <th className="px-4 py-3">النتيجة</th>
                      <th className="px-4 py-3 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.subjects?.map((subject, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded text-right focus:border-royal-400 outline-none"
                            value={subject.name}
                            onChange={(e) => handleSubjectNameChange(idx, e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border rounded text-center"
                            value={subject.fullMarks}
                            onChange={(e) => handleSubjectChange(idx, 'fullMarks', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border rounded text-center focus:ring-2 ring-royal-200 outline-none"
                            value={subject.studentMarks}
                            onChange={(e) => handleSubjectChange(idx, 'studentMarks', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${subject.result === 'ناجح' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {subject.result}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteSubject(idx)}
                            className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold">
                    <tr>
                      <td className="px-4 py-3">المجموع الكلي</td>
                      <td className="px-4 py-3 text-center">-</td>
                      <td className="px-4 py-3 text-center">{formData.total}</td>
                      <td className="px-4 py-3" colSpan={2}>
                        {formData.percentage}% ({formData.finalResult})
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </form>

            <div className="p-4 md:p-6 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">إلغاء</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-royal-900 hover:bg-royal-800 text-white rounded-lg font-medium shadow flex items-center gap-2">
                <Save size={18} /> حفظ السجل
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
