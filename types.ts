export interface AssessmentColumn {
  id: string;
  name: string;
  maxMarks: number;
  type: 'number' | 'text';
}

export interface Subject {
  name: string;            // المادة
  fullMarks: number;       // الدرجة الكاملة (Total Max)
  studentMarks: number;    // درجة الطالب (Total Obtained)
  result: string;          // النتيجة (ناجح / راسب)
  assessments?: Record<string, number | string>; // dynamic scores/values by column id
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
  assessmentColumns?: AssessmentColumn[];
  gradingMethod: 'sum' | 'average';
  passThreshold: number; // e.g., 50 (for 50%) or 100 (for total sum >= 100)
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

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  schoolId: string;
  date: string;          // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
  session?: string;      // Optional: morning/afternoon
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface AttendanceReport {
  studentId: string;
  studentName: string;
  classLevel: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}

export interface School {
  id: string;
  name: string;
  subStatus: 'active' | 'expired';
  subExpiry: string;
  credits: number;
  studentCount: number;
  feeType: 'free' | 'paid';
  balance: number;
  billingMessage?: string;
  planType: 'monthly' | 'yearly';
  totalPaid: number;
  createdAt: string;
}

export interface BillingDetails {
  feeType: 'free' | 'paid';
  balance: number;
  billingMessage: string;
  subExpiry: string;
  subStatus: 'active' | 'expired';
  credits: number;
  studentCount: number;
}