import { Student, CertificateConfig, Analytics, Subject, AttendanceRecord, AttendanceReport, CreditRequest, Teacher, ContactInquiry } from '../types';
import sql from '../db';

// Keys for LocalStorage
const STORAGE_KEYS = {
  ADMIN_AUTH: 'cv_admin_auth',
  ADMIN_ROLE: 'cv_admin_role',
  SCHOOL_ID: 'cv_school_id'
};

// Exact subjects list
export const SUBJECT_LIST = [
  'التفسير',
  'السيرة',
  'الحديث',
  'القراءة والكتابة',
  'الفقه',
  'اللغة العربية',
  'الأذكار',
  'الرياضيات',
  'اللغة الصومالية'
];

// Default Configuration (Fallback only)
const DEFAULT_CONFIG: CertificateConfig = {
  schoolName: 'New School Name',
  schoolNameEn: 'New School Name English',
  logoUrl: '/logo.jpg',
  stampUrl: '', // Gold stamp
  managerName: '',
  managerSignatureUrl: '',
  themeColor: '#5b21b6',
  gradingMethod: 'sum',
  passThreshold: 50, // Strict rule: 50 is Pass
  studentPrefix: 'AQ-',
  classLevels: [
    { id: 'level1', nameAr: 'المستوى الأول', nameEn: 'Level 1', nameSo: 'Heerka 1' },
    { id: 'level2', nameAr: 'المستوى الثاني', nameEn: 'Level 2', nameSo: 'Heerka 2' },
    { id: 'level3', nameAr: 'المستوى الثالث', nameEn: 'Level 3', nameSo: 'Heerka 3' },
    { id: 'level4', nameAr: 'المستوى الرابع', nameEn: 'Level 4', nameSo: 'Heerka 4' },
    { id: 'level5', nameAr: 'المستوى الخامس', nameEn: 'Level 5', nameSo: 'Heerka 5' },
    { id: 'level6', nameAr: 'المستوى السادس', nameEn: 'Level 6', nameSo: 'Heerka 6' },
  ],
  attendanceSessions: [
    { id: 'morning', nameAr: 'الصباح', nameEn: 'Morning', nameSo: 'Subax' },
    { id: 'afternoon', nameAr: 'المساء', nameEn: 'Afternoon', nameSo: 'Galab' }
  ],
  assessmentColumns: [
    { id: 'monthly1', name: 'Monthly Exam 1', maxMarks: 100, type: 'number' },
    { id: 'midterm', name: 'Midterm Exam', maxMarks: 100, type: 'number' },
    { id: 'monthly2', name: 'Monthly Exam 2', maxMarks: 100, type: 'number' },
    { id: 'final', name: 'Final Exam', maxMarks: 100, type: 'number' }
  ],
  // New Template Features Defaults
  templateId: 'template1',
  primaryColor: '#5b21b6', // qabas-purple
  secondaryColor: '#ea580c', // qabas-orange
  accentColor: '#d97706', // gold
  textColor: '#0f172a', // slate-900
  subjects: [
    { id: 'tafsir', nameAr: 'التفسير', nameEn: 'Tafsir', nameSo: 'Tafsiir', maxMarks: 100, active: true },
    { id: 'sira', nameAr: 'السيرة', nameEn: 'Sira', nameSo: 'Siiro', maxMarks: 100, active: true },
    { id: 'hadith', nameAr: 'الحديث', nameEn: 'Hadith', nameSo: 'Xadiis', maxMarks: 100, active: true },
    { id: 'reading', nameAr: 'القراءة والكتابة', nameEn: 'Reading & Writing', nameSo: 'Ahris & Qoris', maxMarks: 100, active: true },
    { id: 'fiqh', nameAr: 'الفقه', nameEn: 'Fiqh', nameSo: 'Fiqi', maxMarks: 100, active: true },
    { id: 'arabic', nameAr: 'اللغة العربية', nameEn: 'Arabic Language', nameSo: 'Luqada Carabiga', maxMarks: 100, active: true },
    { id: 'adhkar', nameAr: 'الأذكار', nameEn: 'Adhkar', nameSo: 'Adkaarta', maxMarks: 100, active: true },
    { id: 'math', nameAr: 'الرياضيات', nameEn: 'Mathematics', nameSo: 'Xisaab', maxMarks: 100, active: true },
    { id: 'somali', nameAr: 'اللغة الصومالية', nameEn: 'Somali Language', nameSo: 'Af-Soomaali', maxMarks: 100, active: true }
  ]
};

// --- Utilities ---
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- Database Initialization ---
let dbInitPromise: Promise<void> | null = null;

export const seedDatabase = async () => {
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      console.log('Initializing database tables...');

      await sql`
        CREATE TABLE IF NOT EXISTS schools (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          sub_status TEXT DEFAULT 'active',
          sub_expiry TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS students (
          id TEXT PRIMARY KEY,
          school_id TEXT DEFAULT 'aqd-default',
          student_id TEXT NOT NULL,
          full_name TEXT NOT NULL,
          academic_year TEXT,
          class_level TEXT,
          subjects JSONB,
          total INTEGER,
          percentage INTEGER,
          final_result TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS config (
          school_id TEXT PRIMARY KEY,
          data JSONB
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS admins (
          email TEXT PRIMARY KEY,
          password TEXT,
          school_id TEXT,
          role TEXT DEFAULT 'school_admin'
        )
      `;

      // Migrations: Add missing columns to existing tables
      try {
        await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'school_admin'`;
        await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS school_id TEXT`;
        await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS school_id TEXT DEFAULT 'aqd-default'`;
        // Financial migrations
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'monthly'`;
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS sub_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0`;
        // Billing & Messaging migrations
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS fee_type TEXT DEFAULT 'paid'`;
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0`;
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS billing_message TEXT`;
        // Online status migrations
        await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE`;
        await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
        await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS has_onboarded BOOLEAN DEFAULT FALSE`;
        // Credit system migrations
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 10`;
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0`;
        // Onboarding fields
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS location TEXT`;
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS license_number TEXT`;
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS phone_number TEXT`;
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`;

        // Activity Table
        await sql`
          CREATE TABLE IF NOT EXISTS school_activity (
            id TEXT PRIMARY KEY,
            school_id TEXT REFERENCES schools(id),
            type TEXT,
            action TEXT,
            timestamp TIMESTAMP,
            user_email TEXT
          )
        `;

        // Credit Requests Table
        await sql`
          CREATE TABLE IF NOT EXISTS credit_requests (
            id TEXT PRIMARY KEY,
            school_id TEXT REFERENCES schools(id),
            amount INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            processed_at TIMESTAMP
          )
        `;
      } catch (migrationError) {
        console.warn("Migration warning (columns might already exist):", migrationError);
      }

      // Create attendance table
      await sql`
        CREATE TABLE IF NOT EXISTS attendance (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL,
          school_id TEXT NOT NULL,
          date TEXT NOT NULL,
          status TEXT NOT NULL,
          session TEXT,
          teacher_id TEXT,
          notes TEXT,
          recorded_by TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS teachers (
          id TEXT PRIMARY KEY,
          school_id TEXT NOT NULL,
          full_name TEXT NOT NULL,
          full_name_ar TEXT,
          email TEXT,
          phone_number TEXT,
          subjects JSONB,
          assigned_classes JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS admin_attendance (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          role TEXT NOT NULL,
          school_id TEXT,
          login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_online BOOLEAN DEFAULT TRUE
        )
      `;

        await sql`
          CREATE TABLE IF NOT EXISTS system_settings (
            id TEXT PRIMARY KEY,
            name TEXT DEFAULT 'Aqooni Digital',
            logo TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        await sql`
          CREATE TABLE IF NOT EXISTS contact_inquiries (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            school_name TEXT,
            location TEXT,
            email TEXT NOT NULL,
            phone TEXT,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            reply_message TEXT,
            replied_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;

      // Seed default system settings
      const settingsCount = await sql`SELECT count(*) FROM system_settings WHERE id = 'main'`;
      if (parseInt(settingsCount[0].count as string) === 0) {
        await sql`INSERT INTO system_settings (id, name, logo) VALUES ('main', 'Aqooni Digital', ${DEFAULT_CONFIG.logoUrl})`;
      }

      const schoolsCount = await sql`SELECT count(*) FROM schools WHERE id = 'aqd-default'`;
      if (parseInt(schoolsCount[0].count as string) === 0) {
        await sql`INSERT INTO schools (id, name, sub_status) VALUES ('aqd-default', 'أقوني ديجيتال', 'active')`;
      }

      const superAdminCount = await sql`SELECT count(*) FROM admins WHERE email = 'super@control.com'`;
      if (parseInt(superAdminCount[0].count as string) === 0) {
        await sql`INSERT INTO admins (email, password, role) VALUES ('super@control.com', 'SuperControl2025!', 'super_admin') ON CONFLICT (email) DO NOTHING`;
      }

      const qabasAdminCount = await sql`SELECT count(*) FROM admins WHERE email = 'admin@aqoonidigital.edu'`;
      if (parseInt(qabasAdminCount[0].count as string) === 0) {
        await sql`INSERT INTO admins (email, password, school_id, role) VALUES ('admin@aqoonidigital.edu', 'QabasAL-huda2025@!', 'aqd-default', 'school_admin') ON CONFLICT (email) DO NOTHING`;
      }

      try {
        await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_students_student_id_school ON students (student_id, school_id)`;
      } catch (e) {
        console.warn("Could not ensure unique index:", e);
      }

      console.log("Database initialized successfully with multi-tenancy support");
    } catch (error) {
      console.error("Database initialization failed:", error);
      dbInitPromise = null;
      throw error;
    }
  })();

  return dbInitPromise;
};

// --- Global Enforcement ---
const enforceCredits = async (sid: string) => {
  const school = (await sql`SELECT credits, sub_status FROM schools WHERE id = ${sid}`)[0];
  if (school && school.credits <= 0 && (!school.sub_status || school.sub_status !== 'active')) {
    throw new Error('SUBSCRIPTION_REQUIRED');
  }
};

// --- Auth Services ---

export const syncClerkUser = async (clerkUser: any) => {
  if (!clerkUser) return null;

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  try {
    await seedDatabase();

    const users = await sql`
      SELECT a.*, s.status as school_status 
      FROM admins a 
      LEFT JOIN schools s ON a.school_id = s.id 
      WHERE a.email = ${email}
    `;

    if (users.length > 0) {
      let user = users[0];

      // Fix for users who were created without a school_id (prevents onboarding stuck)
      if (!user.school_id) {
        console.log('User found but missing school_id, assigning one...');
        const recoverySchoolId = generateUUID();
        await sql`INSERT INTO schools (id, name, sub_status, credits, location, phone_number) VALUES (${recoverySchoolId}, '(Pending Onboarding)', 'active', 10, 'Not Set', 'Not Set') ON CONFLICT (id) DO NOTHING`;
        await sql`UPDATE admins SET school_id = ${recoverySchoolId} WHERE email = ${email}`;

        // Re-fetch to get updated state
        const updatedUsers = await sql`SELECT * FROM admins WHERE email = ${email}`;
        user = updatedUsers[0];
      }

      // Bridge Clerk session with our legacy session keys for compatibility
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, user.role);
      localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, user.school_id || '');
      localStorage.setItem('cv_user_email', user.email);
      localStorage.setItem('cv_has_onboarded', user.has_onboarded ? 'true' : 'false');
      localStorage.setItem('cv_school_status', user.school_status || 'active');

      // Update online status
      await sql`UPDATE admins SET is_online = TRUE, last_active_at = CURRENT_TIMESTAMP WHERE email = ${email}`;

      return {
        success: true,
        role: user.role,
        schoolId: user.school_id,
        email: user.email,
        hasOnboarded: user.has_onboarded,
        schoolStatus: user.school_status
      };
    } else {
      // New user from Clerk? Assign to a new school immediately
      const newSchoolId = generateUUID();
      // Create potential new school with 'pending' status
      await sql`INSERT INTO schools (id, name, sub_status, status, credits, location, phone_number) VALUES (${newSchoolId}, '(Pending Onboarding)', 'active', 'pending', 5, 'Not Set', 'Not Set')`;

      // Try to insert admin, but if exists (race condition), do nothing
      await sql`
        INSERT INTO admins (email, role, school_id, has_onboarded)
        VALUES (${email}, 'school_admin', ${newSchoolId}, FALSE)
        ON CONFLICT (email) DO NOTHING
      `;

      // CRITICAL: Re-fetch the user to get the AUTHORITATIVE school_id and role.
      // If we hit a race condition, the user might have been created by another request with a DIFFERENT school_id.
      // We must return the DB's truth, not our local 'newSchoolId' variable if it wasn't used.
      const finalUserResult = await sql`SELECT * FROM admins WHERE email = ${email}`;
      const finalUser = finalUserResult[0];

      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, finalUser.role);
      localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, finalUser.school_id);
      localStorage.setItem('cv_user_email', finalUser.email);
      localStorage.setItem('cv_has_onboarded', finalUser.has_onboarded ? 'true' : 'false');

      await logAction(finalUser.school_id, 'Login', `Admin signed in via Clerk`, email);

      return {
        success: true,
        role: finalUser.role,
        schoolId: finalUser.school_id,
        email: finalUser.email,
        hasOnboarded: finalUser.has_onboarded,
        schoolStatus: 'pending' // New users are always pending
      };

    }
  } catch (e) {
    console.error("Clerk Sync Error:", e);
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
};

export const login = async (emailRaw: string, passRaw: string) => {
  const email = emailRaw.trim();
  const pass = passRaw.trim();

  try {
    console.log(`Login attempt for: ${email}`);
    await seedDatabase();

    const users = await sql`
      SELECT a.*, s.status as school_status 
      FROM admins a 
      LEFT JOIN schools s ON a.school_id = s.id 
      WHERE a.email = ${email} AND a.password = ${pass}
    `;

    if (users.length > 0) {
      const user = users[0];
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, user.role);
      localStorage.setItem('cv_user_email', user.email);
      localStorage.setItem('cv_school_status', user.school_status || 'active');

      // Update online status
      await sql`UPDATE admins SET is_online = TRUE, last_active_at = CURRENT_TIMESTAMP WHERE email = ${user.email}`;

      return {
        success: true,
        role: user.role,
        schoolId: user.school_id,
        email: user.email,
        hasOnboarded: user.has_onboarded,
        schoolStatus: user.school_status
      };
    } else {
      // Check if user exists at all
      const checkUser = await sql`SELECT email FROM admins WHERE email = ${email}`;
      if (checkUser.length === 0) {
        return { success: false, error: 'البريد الإلكتروني غير مسجل' };
      } else {
        return { success: false, error: 'كلمة المرور غير صحيحة' };
      }
    }
  } catch (e: any) {
    console.error("Login Error:", e);
    return { success: false, error: `خطأ في الاتصال بقاعدة البيانات: ${e.message || 'Unknown error'}` };
  }
};

export const logout = async () => {
  const email = localStorage.getItem('cv_user_email');
  if (email) {
    await seedDatabase();
    await sql`UPDATE admins SET is_online = FALSE WHERE email = ${email}`;
  }
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
  localStorage.removeItem(STORAGE_KEYS.SCHOOL_ID);
  localStorage.removeItem('cv_user_email');
  localStorage.removeItem('cv_has_onboarded');
};

export const getUserSession = () => {
  return {
    isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH),
    role: localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE),
    schoolId: localStorage.getItem(STORAGE_KEYS.SCHOOL_ID),
    email: localStorage.getItem('cv_user_email'),
    hasOnboarded: localStorage.getItem('cv_has_onboarded') === 'true',
    schoolStatus: localStorage.getItem('cv_school_status') || 'active'
  };
};

export const changeAdminPassword = async (newPassword: string, email?: string) => {
  try {
    await seedDatabase();
    const userEmail = email || localStorage.getItem('cv_user_email');
    if (!userEmail) return false;
    await sql`UPDATE admins SET password = ${newPassword} WHERE email = ${userEmail}`;
    return true;
  } catch (e) {
    console.error("Failed to change password:", e);
    return false;
  }
};


export const recoverPassword = async () => {
  try {
    // For security, we no longer return the password via this function
    return null;
  } catch (e) {
    console.error("Failed to recover password:", e);
    return null;
  }
};

// --- Student Services ---

export const getStudents = async (schoolId?: string): Promise<Student[]> => {
  try {
    await seedDatabase();
    const sid = schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!sid && localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE) !== 'super_admin') return [];

    let rows;
    if (sid) {
      rows = await sql`SELECT * FROM students WHERE school_id = ${sid} ORDER BY created_at DESC`;
    } else {
      rows = await sql`SELECT * FROM students ORDER BY created_at DESC`;
    }

    return rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      fullName: row.full_name,
      academicYear: row.academic_year,
      classLevel: row.class_level,
      subjects: row.subjects as Subject[],
      total: row.total,
      percentage: row.percentage,
      finalResult: row.final_result,
      schoolId: row.school_id,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }
};

export const getStudentByRegId = async (regId: string, schoolId?: string): Promise<Student | null> => {
  try {
    await seedDatabase();
    const sid = schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);

    let rows;
    if (sid) {
      rows = await sql`SELECT * FROM students WHERE (student_id = ${regId} OR id = ${regId}) AND school_id = ${sid}`;
    } else {
      // Global search for public verification - returns first match
      rows = await sql`SELECT * FROM students WHERE (student_id = ${regId} OR id = ${regId}) LIMIT 1`;
    }

    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      studentId: row.student_id,
      fullName: row.full_name,
      academicYear: row.academic_year,
      classLevel: row.class_level,
      subjects: row.subjects as Subject[],
      total: row.total,
      percentage: row.percentage,
      finalResult: row.final_result,
      schoolId: row.school_id,
      createdAt: row.created_at
    };
  } catch (error) {
    console.error("Failed to fetch student:", error);
    return null;
  }
};

export const saveStudent = async (student: Student) => {
  try {
    await seedDatabase();
    const sid = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID) || 'aqd-default';

    // Check credits and fetch school data
    const school = (await sql`SELECT credits, student_count, sub_status FROM schools WHERE id = ${sid}`)[0];
    if (school && Number(school.credits) <= 0 && (!school.sub_status || school.sub_status !== 'active')) {
      throw new Error('SUBSCRIPTION_REQUIRED');
    }

    const existingById = await sql`SELECT id FROM students WHERE id = ${student.id} AND school_id = ${sid}`;
    const existingByRegId = await sql`SELECT id FROM students WHERE student_id = ${student.studentId} AND school_id = ${sid}`;

    let targetId = student.id;
    let shouldUpdate = false;

    if (existingById.length > 0) {
      shouldUpdate = true;
      if (existingByRegId.length > 0 && existingByRegId[0].id !== student.id) {
        throw new Error(`رقم الطالب ${student.studentId} مستخدم بالفعل لطالب آخر.`);
      }
    } else {
      if (existingByRegId.length > 0) {
        targetId = existingByRegId[0].id;
        shouldUpdate = true;
      } else {
        shouldUpdate = false;
      }
    }

    if (!shouldUpdate && !targetId) {
      targetId = generateUUID();
    }

    if (shouldUpdate) {
      await sql`
        UPDATE students SET 
          student_id = ${student.studentId},
          full_name = ${student.fullName},
          academic_year = ${student.academicYear},
          class_level = ${student.classLevel},
          subjects = ${JSON.stringify(student.subjects)},
          total = ${student.total},
          percentage = ${student.percentage},
          final_result = ${student.finalResult}
        WHERE id = ${targetId} AND school_id = ${sid}
      `;
    } else {
      await sql`
        INSERT INTO students (id, school_id, student_id, full_name, academic_year, class_level, subjects, total, percentage, final_result, created_at)
        VALUES (
          ${targetId}, 
          ${sid},
          ${student.studentId}, 
          ${student.fullName}, 
          ${student.academicYear}, 
          ${student.classLevel}, 
          ${JSON.stringify(student.subjects)}, 
          ${student.total}, 
          ${student.percentage}, 
          ${student.finalResult},
          ${student.createdAt || new Date().toISOString()}
        )
      `;

      // Update student count and deduct credit if needed
      if (school) {
        const newCount = Number(school.student_count || 0) + 1;
        let newCredits = Number(school.credits || 0);
        if (newCount > 3) {
          newCredits = Math.max(0, newCredits - 1);
        }
        await sql`UPDATE schools SET student_count = ${newCount}, credits = ${newCredits} WHERE id = ${sid}`;
      }
      await logAction(sid, 'Student', `Registered new student: ${student.fullName}`);
    }
  } catch (error) {
    console.error("Failed to save student:", error);
    throw error;
  }
};

export const deleteStudent = async (id: string) => {
  if (!id) throw new Error("ID is required for deletion");
  try {
    await seedDatabase();
    await sql`DELETE FROM students WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error("Failed to delete student:", error);
    throw error;
  }
};

// --- Teacher Services ---

export const getTeachers = async (schoolId?: string): Promise<Teacher[]> => {
  try {
    await seedDatabase();
    const sid = schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!sid && localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE) !== 'super_admin') return [];

    let rows;
    if (sid) {
      rows = await sql`SELECT * FROM teachers WHERE school_id = ${sid} ORDER BY created_at DESC`;
    } else {
      rows = await sql`SELECT * FROM teachers ORDER BY created_at DESC`;
    }

    return rows.map(row => ({
      id: row.id,
      fullName: row.full_name,
      fullNameAr: row.full_name_ar,
      email: row.email,
      phoneNumber: row.phone_number,
      subjects: row.subjects as string[],
      assignedClasses: row.assigned_classes as string[],
      schoolId: row.school_id,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    return [];
  }
};

export const saveTeacher = async (teacher: Teacher) => {
  try {
    await seedDatabase();
    const sid = teacher.schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID) || 'aqd-default';

    const existing = await sql`SELECT id FROM teachers WHERE id = ${teacher.id} AND school_id = ${sid}`;

    if (existing.length > 0) {
      await sql`
        UPDATE teachers SET 
          full_name = ${teacher.fullName},
          full_name_ar = ${teacher.fullNameAr || ''},
          email = ${teacher.email || ''},
          phone_number = ${teacher.phoneNumber || ''},
          subjects = ${JSON.stringify(teacher.subjects || [])},
          assigned_classes = ${JSON.stringify(teacher.assignedClasses || [])}
        WHERE id = ${teacher.id} AND school_id = ${sid}
      `;
    } else {
      await sql`
        INSERT INTO teachers (id, school_id, full_name, full_name_ar, email, phone_number, subjects, assigned_classes, created_at)
        VALUES (
          ${teacher.id || generateUUID()}, 
          ${sid},
          ${teacher.fullName}, 
          ${teacher.fullNameAr || ''},
          ${teacher.email || ''},
          ${teacher.phoneNumber || ''},
          ${JSON.stringify(teacher.subjects || [])}, 
          ${JSON.stringify(teacher.assignedClasses || [])},
          ${new Date().toISOString()}
        )
      `;
    }
    return true;
  } catch (error) {
    console.error("Failed to save teacher:", error);
    throw error;
  }
};

export const deleteTeacher = async (id: string) => {
  try {
    await seedDatabase();
    await sql`DELETE FROM teachers WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error("Failed to delete teacher:", error);
    throw error;
  }
};

// --- Config Services ---

// ===================================================================
// SCHOOL CONFIG (SCHOOL ADMIN SPECIFIC)
// These settings include school-specific certificate branding:
// - logoUrl: School logo for certificates
// - managerSignatureUrl: Manager signature for certificates  
// - stampUrl: Optional stamp for certificates
// This is separate from the system logo managed by Super Admin
// ===================================================================
export const getConfig = async (schoolId?: string): Promise<CertificateConfig> => {
  const sid = schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID) || 'aqd-default';

  // Try LocalStorage first (Fastest/Offline support)
  try {
    const localData = localStorage.getItem(`cv_config_${sid}`);
    if (localData) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(localData) };
    }
  } catch (e) {
    console.warn("LocalStorage read error:", e);
  }

  // Try Database
  try {
    await seedDatabase();
    const rows = await sql`SELECT data FROM config WHERE school_id = ${sid}`;
    if (rows.length > 0) {
      // Sync DB to LocalStorage for future
      localStorage.setItem(`cv_config_${sid}`, JSON.stringify(rows[0].data));
      return { ...DEFAULT_CONFIG, ...rows[0].data };
    }
  } catch (e) {
    console.error("Error getting config (using default):", e);
  }
  return DEFAULT_CONFIG;
};

export const saveConfig = async (config: CertificateConfig, schoolId?: string) => {
  const sid = schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID) || 'aqd-default';

  // Always save to LocalStorage (Reliable fallback)
  try {
    localStorage.setItem(`cv_config_${sid}`, JSON.stringify(config));
  } catch (e) {
    console.warn("Failed to save to LocalStorage:", e);
  }

  // Try Database
  try {
    await seedDatabase();
    const countData = await sql`SELECT count(*) FROM config WHERE school_id = ${sid}`;
    if (parseInt(countData[0].count as string) > 0) {
      await sql`UPDATE config SET data = ${JSON.stringify(config)} WHERE school_id = ${sid}`;
    } else {
      await sql`INSERT INTO config (school_id, data) VALUES (${sid}, ${JSON.stringify(config)})`;
    }
  } catch (error) {
    console.error("Failed to save config to DB (saved locally):", error);
  }
  await logAction(sid, 'Settings', `Updated school certificate configuration`);
};

// ===================================================================
// SYSTEM SETTINGS (SUPER ADMIN ONLY)
// These settings control the platform-wide branding (favicon, system name)
// This is separate from school-specific logos managed in the config table
// ===================================================================
export const getSystemSettings = async () => {
  try {
    await seedDatabase();
    const rows = await sql`SELECT name, logo FROM system_settings WHERE id = 'main'`;
    if (rows.length > 0) {
      return {
        name: rows[0].name,
        logo: rows[0].logo
      };
    }
    return {
      name: 'Aqooni Digital',
      logo: DEFAULT_CONFIG.logoUrl
    };
  } catch (e) {
    console.error("Failed to get system settings:", e);
    return {
      name: 'Aqooni Digital',
      logo: DEFAULT_CONFIG.logoUrl
    };
  }
};

export const saveSystemSettings = async (settings: { name: string, logo: string }) => {
  try {
    await seedDatabase();
    await sql`
      UPDATE system_settings 
      SET name = ${settings.name}, logo = ${settings.logo}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = 'main'
    `;
    return true;
  } catch (e) {
    console.error("Failed to save system settings:", e);
    return false;
  }
};

// --- Contact Inquiry Services ---

export const saveContactInquiry = async (inquiry: Omit<ContactInquiry, 'id' | 'status' | 'createdAt'>) => {
  try {
    await seedDatabase();
    const id = generateUUID();
    await sql`
      INSERT INTO contact_inquiries (id, full_name, school_name, location, email, phone, message, status, created_at)
      VALUES (
        ${id},
        ${inquiry.fullName},
        ${inquiry.schoolName},
        ${inquiry.location},
        ${inquiry.email},
        ${inquiry.phone},
        ${inquiry.message},
        'pending',
        ${new Date().toISOString()}
      )
    `;
    return { success: true, id };
  } catch (error) {
    console.error("Failed to save contact inquiry:", error);
    return { success: false, error };
  }
};

export const getContactInquiries = async (): Promise<ContactInquiry[]> => {
  try {
    await seedDatabase();
    const rows = await sql`SELECT * FROM contact_inquiries ORDER BY created_at DESC`;
    return rows.map(row => ({
      id: row.id,
      fullName: row.full_name,
      schoolName: row.school_name,
      location: row.location,
      email: row.email,
      phone: row.phone,
      message: row.message,
      status: row.status as any,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Failed to fetch contact inquiries:", error);
    return [];
  }
};

export const updateContactInquiryStatus = async (id: string, status: ContactInquiry['status']) => {
  try {
    await seedDatabase();
    await sql`UPDATE contact_inquiries SET status = ${status} WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error("Failed to update contact inquiry status:", error);
    return false;
  }
};

export const deleteContactInquiry = async (id: string) => {
  try {
    await seedDatabase();
    await sql`DELETE FROM contact_inquiries WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error("Failed to delete contact inquiry:", error);
    return false;
  }
};

// Resend Email Integration
const RESEND_API_KEY = '[REDACTED_RESEND_KEY]';

export const sendReplyEmail = async (inquiryId: string, replyMessage: string) => {
  try {
    await seedDatabase();
    
    // 1. Get inquiry details
    const inquiryData = await sql`SELECT email, full_name, school_name, message FROM contact_inquiries WHERE id = ${inquiryId}`;
    if (inquiryData.length === 0) throw new Error('Inquiry not found');
    const inquiry = inquiryData[0];

    // 2. Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Aqooni Digital <onboarding@resend.dev>',
        to: [inquiry.email],
        subject: `Response to your inquiry - Aqooni Digital`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #6366f1;">Hello ${inquiry.full_name},</h2>
            <p>Thank you for contacting us regarding <strong>${inquiry.school_name || 'your inquiry'}</strong>.</p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280; font-style: italic;">" ${inquiry.message} "</p>
            </div>
            <p style="white-space: pre-wrap;">${replyMessage}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="font-size: 12px; color: #9ca3af;">Aqooni Digital Team<br />Support: +2520614163362</p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    // 3. Update database
    await sql`
      UPDATE contact_inquiries 
      SET 
        status = 'replied', 
        reply_message = ${replyMessage}, 
        replied_at = CURRENT_TIMESTAMP 
      WHERE id = ${inquiryId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Failed to send reply email:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// --- Analytics ---

export const getAnalytics = async (schoolId?: string): Promise<Analytics> => {
  try {
    await seedDatabase();
    const sid = schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID) || 'aqd-default';
    const totalData = await sql`SELECT count(*) as c FROM students WHERE school_id = ${sid}`;
    const passedData = await sql`SELECT count(*) as c FROM students WHERE final_result = 'ناجح' AND school_id = ${sid}`;

    const activityData = await sql`SELECT count(*) as c FROM school_activity WHERE school_id = ${sid} AND type = 'Verification'`;

    return {
      totalStudents: parseInt(totalData[0].c as string),
      passed: parseInt(passedData[0].c as string),
      failed: parseInt(totalData[0].c as string) - parseInt(passedData[0].c as string),
      recentVerifications: parseInt(activityData[0].c as string)
    };
  } catch (e) {
    return { totalStudents: 0, passed: 0, failed: 0, recentVerifications: 0 };
  }
};

// --- Super Admin School Management ---

export const getSchools = async () => {
  try {
    await seedDatabase();
    return await sql`SELECT * FROM schools ORDER BY created_at DESC`;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getGlobalActivity = async () => {
  try {
    await seedDatabase();
    // Fetch recent activity from the centralized school_activity table
    const activity = await sql`
      SELECT 
        sa.type, 
        sa.user_email as user, 
        sa.timestamp, 
        sa.action,
        s.name as school_name
      FROM school_activity sa
      LEFT JOIN schools s ON sa.school_id = s.id
      ORDER BY sa.timestamp DESC 
      LIMIT 30
    `;
    return activity;
  } catch (e) {
    console.error("Global Activity Error:", e);
    return [];
  }
};

export const getPendingRegistrations = async () => {
  try {
    await seedDatabase();
    // Admins who signed up via Clerk but haven't been assigned a school or finished onboarding
    // OR schools that are still in 'pending' status
    return await sql`
      SELECT 
        a.email, 
        a.role, 
        a.is_online, 
        a.last_active_at, 
        a.created_at,
        s.name as school_name,
        s.id as school_id,
        s.sub_status as school_status
      FROM admins a
      LEFT JOIN schools s ON a.school_id = s.id
      WHERE (a.school_id IS NULL OR a.has_onboarded = FALSE OR s.sub_status = 'pending') 
      AND a.role != 'super_admin'
      ORDER BY a.created_at DESC
    `;
  } catch (e) {
    console.error("Pending Registrations Error:", e);
    return [];
  }
};

export const toggleSchoolStatus = async (schoolId: string, status: 'active' | 'pending') => {
  try {
    await seedDatabase();
    await sql`UPDATE schools SET status = ${status}, sub_status = ${status} WHERE id = ${schoolId}`;
    return true;
  } catch (e) {
    console.error("Failed to toggle school status:", e);
    return false;
  }
};

export const saveSchool = async (school: any) => {
  try {
    await seedDatabase();
    const id = school.id || generateUUID();
    const existing = await sql`SELECT id FROM schools WHERE id = ${id}`;

    if (existing.length > 0) {
      await sql`UPDATE schools SET name = ${school.name}, sub_status = ${school.sub_status}, sub_expiry = ${school.sub_expiry}, location = ${school.location}, phone_number = ${school.phone_number} WHERE id = ${id}`;
    } else {
      await sql`INSERT INTO schools (id, name, sub_status, sub_expiry, location, phone_number) VALUES (${id}, ${school.name}, ${school.sub_status}, ${school.sub_expiry}, ${school.location}, ${school.phone_number})`;
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const toggleSubscription = async (schoolId: string, status: string) => {
  try {
    await seedDatabase();
    await sql`UPDATE schools SET sub_status = ${status}, status = ${status} WHERE id = ${schoolId}`;
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getSchoolSubscription = async (schoolId: string) => {
  try {
    await seedDatabase();
    const rows = await sql`SELECT sub_status FROM schools WHERE id = ${schoolId}`;
    return rows.length > 0 ? rows[0].sub_status : 'expired';
  } catch (e) {
    return 'expired';
  }
};

export const getAllAdmins = async () => {
  try {
    await seedDatabase();
    // For security, do NOT return passwords in the admin list
    return await sql`SELECT email, role, school_id, is_online, last_active_at, has_onboarded FROM admins ORDER BY email ASC`;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const trackActivity = async (email: string) => {
  try {
    if (!email) return false;
    await seedDatabase();

    const adminData = await sql`SELECT school_id, role, last_active_at FROM admins WHERE email = ${email}`;
    if (adminData.length > 0) {
      const admin = adminData[0];
      const now = new Date();
      const lastActive = new Date(admin.last_active_at);

      if (admin.school_id && lastActive.toDateString() !== now.toDateString()) {
        const schoolData = await sql`SELECT credits FROM schools WHERE id = ${admin.school_id}`;
        if (schoolData.length > 0 && Number(schoolData[0].credits) > 0) {
          await sql`UPDATE schools SET credits = credits - 1 WHERE id = ${admin.school_id}`;
        }
      }

      await sql`UPDATE admins SET is_online = TRUE, last_active_at = CURRENT_TIMESTAMP WHERE email = ${email}`;

      const today = new Date().toISOString().split('T')[0];
      const attendanceId = `${email}_${today}`;
      const existingEntry = await sql`SELECT id FROM admin_attendance WHERE id = ${attendanceId}`;

      if (existingEntry.length > 0) {
        await sql`UPDATE admin_attendance SET last_active_at = CURRENT_TIMESTAMP, is_online = TRUE WHERE id = ${attendanceId}`;
      } else {
        await sql`
          INSERT INTO admin_attendance (id, email, role, school_id, login_at, last_active_at, is_online)
          VALUES (${attendanceId}, ${email}, ${admin.role || 'admin'}, ${admin.school_id || 'system'}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE)
        `;
      }
      return true;
    }
    // Log into school_activity as well
    if (adminData.length > 0 && adminData[0].school_id) {
      await logAction(adminData[0].school_id, 'Admin Login', 'Admin active in system', email);
    }
    return false;
  } catch (e) {
    console.error("Track Activity Error:", e);
    return false;
  }
};

export const updateAdminCredentials = async (email: string, updates: { password?: string, role?: string, schoolId?: string }) => {
  try {
    await seedDatabase();
    if (updates.password) await sql`UPDATE admins SET password = ${updates.password} WHERE email = ${email}`;
    if (updates.role) await sql`UPDATE admins SET role = ${updates.role} WHERE email = ${email}`;
    if (updates.schoolId) await sql`UPDATE admins SET school_id = ${updates.schoolId} WHERE email = ${email}`;
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const recordPayment = async (schoolId: string, amount: number, months: number) => {
  try {
    await seedDatabase();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);

    await sql`
      UPDATE schools 
      SET 
        sub_status = 'active', 
        sub_expiry = ${expiry.toISOString()},
        credits = 0 
      WHERE id = ${schoolId}
    `;
    return true;
  } catch (e) {
    console.error("Payment Record Error:", e);
    return false;
  }
};

export const paySchoolSubscription = async (schoolId: string, planMode: 'monthly' | 'yearly' = 'monthly') => {
  try {
    await seedDatabase();
    await sql`UPDATE schools SET sub_status = 'pending', plan_type = ${planMode} WHERE id = ${schoolId}`;
    return true;
  } catch (e) {
    console.error("Pay Subscription Error:", e);
    return false;
  }
};

export const createSchoolAdmin = async (email: string, pass: string, schoolId: string) => {
  try {
    await seedDatabase();
    const existing = await sql`SELECT email FROM admins WHERE email = ${email}`;
    if (existing.length > 0) {
      return { success: false, error: 'Email already registered' };
    }

    await sql`
      INSERT INTO admins (email, password, school_id, role)
      VALUES (${email.trim()}, ${pass.trim()}, ${schoolId}, 'school_admin')
    `;
    return { success: true };
  } catch (e) {
    console.error("Create School Admin Error:", e);
    return { success: false, error: 'Database error' };
  }
};

export const updateBillingDetails = async (schoolId: string, updates: any) => {
  try {
    await seedDatabase();
    const keys = Object.keys(updates);
    for (const key of keys) {
      if (updates[key] !== undefined) {
        // Simple dynamic update (be careful with SQL injection, but here keys are controlled or it's a small app)
        // For safety, we'll do it manually as before
        if (key === 'fee_type') await sql`UPDATE schools SET fee_type = ${updates[key]} WHERE id = ${schoolId}`;
        if (key === 'balance') await sql`UPDATE schools SET balance = ${updates[key]} WHERE id = ${schoolId}`;
        if (key === 'billing_message') await sql`UPDATE schools SET billing_message = ${updates[key]} WHERE id = ${schoolId}`;
        if (key === 'plan_type') await sql`UPDATE schools SET plan_type = ${updates[key]} WHERE id = ${schoolId}`;
        if (key === 'sub_expiry') await sql`UPDATE schools SET sub_expiry = ${updates[key]} WHERE id = ${schoolId}`;
        if (key === 'total_paid') await sql`UPDATE schools SET total_paid = ${updates[key]} WHERE id = ${schoolId}`;
        if (key === 'credits') await sql`UPDATE schools SET credits = ${updates[key]} WHERE id = ${schoolId}`;
        if (key === 'status') await sql`UPDATE schools SET status = ${updates[key]}, sub_status = ${updates[key]} WHERE id = ${schoolId}`;
      }
    }
    return true;
  } catch (e) {
    console.error("Update Billing Details Error:", e);
    return false;
  }
};

export const getSchoolBilling = async () => {
  try {
    await seedDatabase();
    const schoolId = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!schoolId) return null;

    const data = await sql`SELECT name, phone_number, fee_type, balance, billing_message, sub_expiry, sub_status, credits, student_count FROM schools WHERE id = ${schoolId}`;
    return data[0] ? {
      name: data[0].name,
      phoneNumber: data[0].phone_number,
      feeType: data[0].fee_type,
      balance: data[0].balance,
      billingMessage: data[0].billing_message,
      subExpiry: data[0].sub_expiry,
      subStatus: data[0].sub_status,
      credits: data[0].credits,
      studentCount: data[0].student_count
    } : null;
  } catch (e) {
    console.error("Get School Billing Error:", e);
    return null;
  }
};

// --- Attendance Services ---

export const getAttendance = async (date?: string, classLevel?: string): Promise<AttendanceRecord[]> => {
  try {
    await seedDatabase();
    const schoolId = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    const role = localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE);

    if (!schoolId && role !== 'super_admin') return [];

    let query;
    if (date && classLevel) {
      if (schoolId) {
        const studentData = await sql`SELECT student_id FROM students WHERE school_id = ${schoolId} AND class_level = ${classLevel}`;
        const studentIds = studentData.map(s => s.student_id);
        if (studentIds.length === 0) return [];
        query = await sql`
          SELECT a.*, s.full_name as student_name, s.class_level 
          FROM attendance a 
          LEFT JOIN students s ON a.student_id = s.student_id AND s.school_id = a.school_id
          WHERE a.school_id = ${schoolId} AND a.date = ${date} AND a.student_id = ANY(${studentIds})
          ORDER BY s.full_name
        `;
      } else {
        query = await sql`
          SELECT a.*, s.full_name as student_name, s.class_level 
          FROM attendance a 
          LEFT JOIN students s ON a.student_id = s.student_id AND s.school_id = a.school_id
          WHERE a.date = ${date} AND s.class_level = ${classLevel}
          ORDER BY s.full_name
        `;
      }
    } else if (date) {
      if (schoolId) {
        query = await sql`
          SELECT a.*, s.full_name as student_name, s.class_level 
          FROM attendance a 
          LEFT JOIN students s ON a.student_id = s.student_id AND s.school_id = a.school_id
          WHERE a.school_id = ${schoolId} AND a.date = ${date}
          ORDER BY s.full_name
        `;
      } else {
        query = await sql`
          SELECT a.*, s.full_name as student_name, s.class_level 
          FROM attendance a 
          LEFT JOIN students s ON a.student_id = s.student_id AND s.school_id = a.school_id
          WHERE a.date = ${date}
          ORDER BY s.full_name
        `;
      }
    } else {
      if (schoolId) {
        query = await sql`
          SELECT a.*, s.full_name as student_name, s.class_level 
          FROM attendance a 
          LEFT JOIN students s ON a.student_id = s.student_id AND s.school_id = a.school_id
          WHERE a.school_id = ${schoolId}
          ORDER BY a.date DESC, s.full_name
          LIMIT 500
        `;
      } else {
        query = await sql`
          SELECT a.*, s.full_name as student_name, s.class_level 
          FROM attendance a 
          LEFT JOIN students s ON a.student_id = s.student_id AND s.school_id = a.school_id
          ORDER BY a.date DESC, s.full_name
          LIMIT 500
        `;
      }
    }

    return query.map(row => ({
      id: row.id,
      studentId: row.student_id,
      studentName: row.student_name || row.full_name,
      schoolId: row.school_id,
      date: row.date,
      status: row.status as any,
      session: row.session,
      notes: row.notes,
      recordedBy: row.recorded_by,
      createdAt: row.created_at
    }));
  } catch (e) {
    console.error("Get Attendance Error:", e);
    return [];
  }
};

export const saveAttendance = async (records: AttendanceRecord[]) => {
  try {
    await seedDatabase();
    const schoolId = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!schoolId) return false;

    for (const record of records) {
      const sid = record.schoolId || schoolId;
      const existing = await sql`
        SELECT id FROM attendance 
        WHERE student_id = ${record.studentId} AND school_id = ${sid} AND date = ${record.date} AND (session = ${record.session || ''} OR session IS NULL)
      `;

      if (existing.length > 0) {
        await sql`
          UPDATE attendance 
          SET status = ${record.status}, notes = ${record.notes || ''}, recorded_by = ${record.recordedBy}, session = ${record.session || ''}
          WHERE id = ${existing[0].id}
        `;
      } else {
        const id = generateUUID();
        await sql`
          INSERT INTO attendance (id, student_id, school_id, date, status, session, notes, recorded_by)
          VALUES (${id}, ${record.studentId}, ${sid}, ${record.date}, ${record.status}, ${record.session || ''}, ${record.notes || ''}, ${record.recordedBy})
        `;
      }
    }
    return true;
  } catch (e) {
    console.error("Save Attendance Error:", e);
    return false;
  }
};

export const getAttendanceReport = async (startDate: string, endDate: string, classLevel?: string): Promise<AttendanceReport[]> => {
  try {
    await seedDatabase();
    const schoolId = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!schoolId) return [];

    let students;
    if (classLevel) {
      students = await sql`SELECT student_id, full_name, class_level FROM students WHERE school_id = ${schoolId} AND class_level = ${classLevel}`;
    } else {
      students = await sql`SELECT student_id, full_name, class_level FROM students WHERE school_id = ${schoolId}`;
    }

    const reports: AttendanceReport[] = [];

    for (const student of students) {
      const attendanceData = await sql`
        SELECT status, COUNT(*) as count 
        FROM attendance 
        WHERE student_id = ${student.student_id} AND school_id = ${schoolId} AND date >= ${startDate} AND date <= ${endDate}
        GROUP BY status
      `;

      let presentDays = 0, absentDays = 0, lateDays = 0, excusedDays = 0;
      attendanceData.forEach(a => {
        if (a.status === 'present') presentDays = parseInt(a.count as string);
        if (a.status === 'absent') absentDays = parseInt(a.count as string);
        if (a.status === 'late') lateDays = parseInt(a.count as string);
        if (a.status === 'excused') excusedDays = parseInt(a.count as string);
      });

      const totalDays = presentDays + absentDays + lateDays + excusedDays;
      const attendanceRate = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;

      reports.push({
        studentId: student.student_id,
        studentName: student.full_name,
        classLevel: student.class_level,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        attendanceRate
      });
    }

    return reports.sort((a, b) => a.studentName.localeCompare(b.studentName, 'ar'));
  } catch (e) {
    console.error("Get Attendance Report Error:", e);
    return [];
  }
};

export const getStudentAttendanceHistory = async (studentId: string, schoolId?: string): Promise<AttendanceRecord[]> => {
  try {
    await seedDatabase();
    const sid = schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!sid) return [];

    // Search by both RegID and UUID to be safe and thorough
    const rows = await sql`
      SELECT * FROM attendance 
      WHERE (student_id = ${studentId} OR student_id = (SELECT id FROM students WHERE student_id = ${studentId} LIMIT 1) OR student_id = (SELECT student_id FROM students WHERE id = ${studentId} LIMIT 1))
      AND school_id = ${sid}
      ORDER BY date DESC
      LIMIT 100
    `;

    return rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      schoolId: row.school_id,
      date: row.date,
      status: row.status as any,
      session: row.session,
      notes: row.notes,
      recordedBy: row.recorded_by,
      createdAt: row.created_at
    }));
  } catch (e) {
    console.error("Get Student Attendance History Error:", e);
    return [];
  }
};

export const getMonthlyAttendance = async (year: number, month: number, classLevel: string): Promise<AttendanceRecord[]> => {
  try {
    await seedDatabase();
    const schoolId = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!schoolId) return [];

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const rows = await sql`
      SELECT a.* FROM attendance a
      JOIN students s ON a.student_id = s.student_id AND a.school_id = s.school_id
      WHERE a.school_id = ${schoolId} 
      AND a.date >= ${startDate} 
      AND a.date <= ${endDate}
      AND s.class_level = ${classLevel}
    `;

    return rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      schoolId: row.school_id,
      date: row.date,
      status: row.status as any,
      session: row.session,
      notes: row.notes,
      recordedBy: row.recorded_by,
      createdAt: row.created_at
    }));
  } catch (e) {
    console.error("Get Monthly Attendance Error:", e);
    return [];
  }
};

export const logAction = async (schoolId: string, type: string, action: string, user: string = 'System') => {
  try {
    await seedDatabase();
    const id = generateUUID();
    await sql`
      INSERT INTO school_activity (id, school_id, type, action, timestamp, user_email)
      VALUES (${id}, ${schoolId}, ${type}, ${action}, ${new Date().toISOString()}, ${user})
    `;
    return true;
  } catch (e) {
    console.error("Log Action Error:", e);
    return false;
  }
};

export const getSchoolActivity = async (schoolId: string) => {
  try {
    await seedDatabase();
    // Fetch real activity logs
    return await sql`
      SELECT id, type, action, timestamp, user_email 
      FROM school_activity 
      WHERE school_id = ${schoolId} 
      ORDER BY timestamp DESC 
      LIMIT 20
    `;
  } catch (e) {
    console.error("Get School Activity Error:", e);
    return [];
  }
};



export const updateSchoolProfile = async (schoolId: string, data: { name?: string, location?: string, licenseNumber?: string, phoneNumber?: string }) => {
  try {
    await seedDatabase();

    // We cannot use sql(obj) with neon driver directly for SET clause usually, so we update fields individually or construct query carefully.
    // However, since we have a fixed set of fields, we can just write the update query explicitly.
    // Or we can execute multiple updates, or build a dynamic query string (risky without proper parameterization).
    // Safest and cleanest for now is to just update all fields if provided, or only those provided.

    // Let's use a simple approach: Update only what's needed.
    // Since neon supports template literals, we can conditionally build the query? No, that's hard with tagged templates. // actually we can't easily composed tagged templates.

    // Alternative: Just update all columns, using COALESCE or similar if we want to keep old values, but here we expect data to be passed.
    // "data" contains the fields we want to update.

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name) {
      // We'll execute separate or a monolithic query. 
      // Using neon, we can't easily build dynamic queries safely without a helper.
      // Let's try to just run specific updates for each field if it exists. Ideally we'd want one query.

      await sql`
            UPDATE schools 
            SET 
                name = COALESCE(${data.name}, name),
                location = COALESCE(${data.location}, location),
                license_number = COALESCE(${data.licenseNumber}, license_number),
                phone_number = COALESCE(${data.phoneNumber}, phone_number)
            WHERE id = ${schoolId}
        `;
    } else {
      // Fallback if name is missing but others are present (rare in this app flow)
      await sql`
            UPDATE schools 
            SET 
                location = COALESCE(${data.location}, location),
                license_number = COALESCE(${data.licenseNumber}, license_number),
                phone_number = COALESCE(${data.phoneNumber}, phone_number)
            WHERE id = ${schoolId}
        `;
    }

    await logAction(schoolId, 'Profile Update', `Updated profile details`);

    return { success: true };
  } catch (error) {
    console.error('Error updating school profile:', error);
    return { success: false, error };
  }
};

// Lightweight: just mark admin as onboarded (used by OnboardingTour)
export const markTourComplete = async (email: string) => {
  try {
    await seedDatabase();
    await sql`UPDATE admins SET has_onboarded = TRUE WHERE email = ${email}`;
    localStorage.setItem('cv_has_onboarded', 'true');
    return { success: true };
  } catch (error) {
    console.error('Error marking tour complete:', error);
    return { success: false, error };
  }
};

export const completeOnboarding = async (schoolId: string, email: string, data: { name: string, location: string, licenseNumber: string, phoneNumber: string }) => {
  try {
    // 1. Update School Profile
    const profileResult = await updateSchoolProfile(schoolId, data);
    if (!profileResult.success) {
      throw new Error("Failed to update school profile: " + JSON.stringify(profileResult.error));
    }

    // 2. Mark Admin as Onboarded
    await sql`
      UPDATE admins
      SET has_onboarded = TRUE
      WHERE email = ${email}
    `;

    await logAction(schoolId, 'Onboarding', `Completed school setup`, email);

    return { success: true };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { success: false, error };
  }
};

export const addCredits = async (schoolId: string, amount: number) => {
  try {
    await sql`
      UPDATE schools
      SET credits = credits + ${amount}
      WHERE id = ${schoolId}
    `;
    await logAction(schoolId, 'Credit Update', `Added ${amount} credits`);
    return { success: true };
  } catch (error) {
    console.error('Error adding credits:', error);
    return { success: false, error };
  }
};

export const requestCredits = async (amount: number, notes: string) => {
  try {
    const schoolId = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!schoolId) return { success: false, error: 'No school ID' };
    await seedDatabase();
    const id = generateUUID();
    await sql`
      INSERT INTO credit_requests (id, school_id, amount, status, notes)
      VALUES (${id}, ${schoolId}, ${amount}, 'pending', ${notes})
    `;
    await logAction(schoolId, 'Credit Request', `Requested ${amount} credits`);
    return { success: true };
  } catch (error) {
    console.error('Error requesting credits:', error);
    return { success: false, error };
  }
};

export const getCreditRequests = async (schoolId?: string): Promise<CreditRequest[]> => {
  try {
    await seedDatabase();
    let rows;
    if (schoolId) {
      rows = await sql`
        SELECT cr.*, s.name as school_name 
        FROM credit_requests cr
        JOIN schools s ON cr.school_id = s.id
        WHERE cr.school_id = ${schoolId}
        ORDER BY cr.created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT cr.*, s.name as school_name 
        FROM credit_requests cr
        JOIN schools s ON cr.school_id = s.id
        ORDER BY cr.created_at DESC
      `;
    }
    return rows.map(row => ({
      id: row.id,
      school_id: row.school_id,
      schoolName: row.school_name,
      amount: row.amount,
      status: row.status as any,
      notes: row.notes,
      createdAt: row.created_at,
      processedAt: row.processed_at
    }));
  } catch (error) {
    console.error('Error getting credit requests:', error);
    return [];
  }
};

export const processCreditRequest = async (requestId: string, status: 'approved' | 'rejected') => {
  try {
    await seedDatabase();
    const requestData = await sql`SELECT * FROM credit_requests WHERE id = ${requestId}`;
    if (requestData.length === 0) return { success: false, error: 'Request not found' };

    const request = requestData[0];
    if (request.status !== 'pending') return { success: false, error: 'Request already processed' };

    await sql`
      UPDATE credit_requests 
      SET status = ${status}, processed_at = CURRENT_TIMESTAMP 
      WHERE id = ${requestId}
    `;

    if (status === 'approved') {
      await sql`
        UPDATE schools 
        SET credits = credits + ${request.amount} 
        WHERE id = ${request.school_id}
      `;
      await logAction(request.school_id, 'Credit Approval', `Approved ${request.amount} credits`);
    } else {
      await logAction(request.school_id, 'Credit Rejection', `Rejected ${request.amount} credits request`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error processing credit request:', error);
    return { success: false, error };
  }
};

