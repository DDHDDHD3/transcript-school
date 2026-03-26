export interface AssessmentColumn {
  id: string;
  name: string;
  maxMarks: number;
  type: 'number' | 'text';
}

export interface SubjectConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  nameSo: string;
  maxMarks: number;
  active: boolean;
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
  schoolId?: string;
  createdAt: string;
}

export interface ClassLevel {
  id: string;
  nameAr: string;
  nameEn: string;
  nameSo: string;
}

export interface AttendanceSession {
  id: string;
  nameAr: string;
  nameEn: string;
  nameSo: string;
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
  subjects?: SubjectConfig[];
  gradingMethod: 'sum' | 'average';
  passThreshold: number; // e.g., 50 (for 50%) or 100 (for total sum >= 100)
  studentPrefix?: string;
  classLevels?: ClassLevel[];
  attendanceSessions?: AttendanceSession[];

  // New Template Features
  templateId: string;
  attendanceTemplateId?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  customStyles?: Record<string, React.CSSProperties>;
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
  teacherId?: string;    // Added for teacher connection
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
  teacherName?: string; // Added for report display
}

export interface Teacher {
  id: string;
  fullName: string;
  fullNameAr?: string;
  email?: string;
  phoneNumber?: string;
  subjects?: string[];
  assignedClasses?: string[];
  schoolId: string;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  subStatus: 'active' | 'expired' | 'pending';
  subExpiry: string;
  credits: number;
  studentCount: number;
  feeType: 'free' | 'paid';
  balance: number;
  billingMessage?: string;
  planType: 'monthly' | 'yearly';
  totalPaid: number;
  location?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  status?: string; // e.g., 'active', 'suspended', 'pending_onboarding'
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

export interface CreditRequest {
  id: string;
  school_id: string; // Using snake_case to match DB
  schoolName?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  processedAt?: string;
}

export interface ContactInquiry {
  id: string;
  fullName: string;
  schoolName: string;
  location: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'archived';
  createdAt: string;
}