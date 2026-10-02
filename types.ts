import React from 'react';

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

export interface Course {
  id: string;
  institutionId: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  courseId: string;
  courseCode?: string;
  courseName?: string;
  creditHours?: number;
  semester: string;
  academicYear: string;
  grade: string;
  gradePoint: number;
}

export interface IssuedDocument {
  id: string;
  studentId: string;
  institutionId: string;
  documentType: 'transcript' | 'certificate';
  status: 'draft' | 'issued' | 'revoked';
  issuedAt?: string;
  revokedAt?: string;
  qrCodeHash?: string;
}

export interface Student {
  id: string;
  registrationNumber?: string;
  fullName: string;
  faculty?: string;
  program?: string;
  enrollmentYear?: string;
  graduationDate?: string;
  cgpa?: number;
  institutionId?: string;
  createdAt: string;

  // Legacy fields for smooth migration
  name?: string;
  studentId?: string;
  academicYear?: string;
  classLevel?: string;
  class?: string;
  schoolId?: string;
  subjects?: Subject[];
  total?: number;
  percentage?: number;
  finalResult?: string;
  teacherId?: string;
}

export interface ClassLevel {
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

  // New Template Features
  templateId: string;
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
  totalTeachers?: number;
  attendanceToday?: number;
  passed: number;
  failed?: number;
  recentVerifications: number;
  totalCertificates?: number;
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
  name?: string;
  location?: string;
  phoneNumber?: string;
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