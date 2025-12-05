export interface Subject {
  name: string;            // المادة
  fullMarks: number;       // الدرجة الكاملة
  studentMarks: number;    // درجة الطالب
  result: string;          // النتيجة (ناجح / راسب)
}

export interface Student {
  id: string; // Internal UUID
  studentId: string; // رقم الطالب (12 digits)
  fullName: string; // اسم الطالب
  academicYear: string; // العام الدراسي
  classLevel: string; // المستوى
  
  // Marks
  subjects: Subject[];
  
  // Summary
  total: number; // المجموع
  percentage: number; // النسبة المئوية
  finalResult: string; // النتيجة النهائية
  
  // Meta
  createdAt: string;
}

export interface CertificateConfig {
  schoolName: string;
  schoolNameEn: string;
  logoUrl: string;
  stampUrl: string; // Gold stamp
  managerName: string;
  managerSignatureUrl: string;
  themeColor: string;
}

export interface AdminUser {
  email: string;
  name: string;
}

export interface Analytics {
  totalStudents: number;
  passed: number;
  failed: number;
  recentVerifications: number;
}