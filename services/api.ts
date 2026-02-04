import { Student, CertificateConfig, Analytics, Subject, AttendanceRecord, AttendanceReport } from '../types';
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
  schoolName: 'معهد قبس الهدى للدراسات الشرعية واللغوية',
  schoolNameEn: 'QABAS AL-HUDA INSTITUTE FOR SHARIA AND LINGUISTIC STUDIES',
  logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgNTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWE1ODBjO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2M5NDAwYztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM3YzNhZWQ7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNWIyMWI2O3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwhLS0gT3V0ZXIgRGlhbW9uZCBTaGFwZSAoT3JhbmdlKSAtLT48cGF0aCBkPSJNMjUwIDUwIEw1MCAyNTAgTDI1MCA0NTAgTDIwMCA0ODAgTDAgMjUwIEwyMDAgMjAgWiIgZmlsbD0idXJsKCNncmFkMSkiIC8+PHBhdGggZD0iTTI1MCA1MCBMNDUwIDI1MCBMMjUwIDQwMCBMMzAwIDQ4MCBMNTAwIDI1MCBMMzAwIDIwIFoiIGZpbGw9InVybCgjZ3JhZDIpIiAvPjwhLS0gSW5uZXIgV2hpdGUgQmFja2dyb3VuZCAtLT48cGF0aCBkPSJNMjUwIDEwMCBMMzkwIDI1MCBMMjUwIDQwMCBMMTEwIDI1MCBaIiBmaWxsPSIjZmZmZmZmIiAvPjwhLS0gQXJhYmljIENhbGxpZ3JhcGh5IChTdHlsaXplZCkgLS0+PHBhdGggZD0iTTI1MCAxNzAgQzIyMCAxNzAgMjAwIDE5MCAyMDAgMjIwIEMyMDAgMjUwIDIyMCAyNzAgMjUwIDI3MCBDMjgwIDI3MCAzMDAgMjUwIDMwMCAyMjAgQzMwMCAxOTAgMjgwIDE3MCAyNTAgMTcwIFogTTI1MCAxOTAgQzI2NSAxOTAgMjc1IDIwNSAyNzUgMjIwIEMyNzUgMjM1IDI2NSAyNTAgMjUwIDI1MCBDMjM1IDI1MCAyMjUgMjM1IDIyNSAyMjAgQzIyNSAyMDUgMjM1IDE5MCAyNTAgMTkwIFoiIGZpbGw9IiM1YjIxYjYiIC8+PCEtLSBCb29rIFNoYXBlIChQdXJwbGUvT3JhbmdlKSAtLT48cGF0aCBkPSJNMTMwIDMzMCBRMjUwIDM4MCAzNzAgMzMwIEwzNzAgMzYwIFEyNTAgNDEwIDEzMCAzNjAgWiIgZmlsbD0iIzViMjFiNiIgLz48cGF0aCBkPSJNMTMwIDM2MCBRMjUwIDQxMCAzNzAgMzYwIEwzNzAgMzg1IFEyNTAgNDM1IDEzMCAzODUgWiIgZmlsbD0iI2VhNTgwYyIgLz48IS0tIFFBSEkgVGV4dCAtLT48dGV4dCB4PSIyNTAiIHk9IjMwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0ibm9ybWFsIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNWIyMWI2Ij5RQUhJPC90ZXh0Pjwvc3ZnPg==',
  stampUrl: '', // Gold stamp
  managerName: '',
  managerSignatureUrl: '',
  themeColor: '#5b21b6',
  gradingMethod: 'sum',
  passThreshold: 50, // Strict rule: 50 is Pass
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
        // Credit system migrations
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 10`;
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0`;
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
          notes TEXT,
          recorded_by TEXT,
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
        await sql`INSERT INTO admins (email, password, role) VALUES ('super@control.com', 'SuperControl2025!', 'super_admin')`;
      }

      const qabasAdminCount = await sql`SELECT count(*) FROM admins WHERE email = 'admin@aqoonidigital.edu'`;
      if (parseInt(qabasAdminCount[0].count as string) === 0) {
        await sql`INSERT INTO admins (email, password, school_id, role) VALUES ('admin@aqoonidigital.edu', 'QabasAL-huda2025@!', 'aqd-default', 'school_admin')`;
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

export const isAuthenticated = () => {
  return !!localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
};

export const login = async (emailRaw: string, passRaw: string) => {
  const email = emailRaw.trim();
  const pass = passRaw.trim();

  try {
    console.log(`Login attempt for: ${email}`);
    await seedDatabase();

    const users = await sql`SELECT * FROM admins WHERE email = ${email} AND password = ${pass}`;

    if (users.length > 0) {
      const user = users[0];
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, user.role);
      if (user.school_id) {
        localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, user.school_id);
      }
      localStorage.setItem('cv_user_email', user.email);

      // Update online status
      await sql`UPDATE admins SET is_online = TRUE, last_active_at = CURRENT_TIMESTAMP WHERE email = ${user.email}`;

      return {
        success: true,
        role: user.role,
        schoolId: user.school_id,
        email: user.email
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
};

export const getUserSession = () => {
  return {
    isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH),
    role: localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE),
    schoolId: localStorage.getItem(STORAGE_KEYS.SCHOOL_ID)
  };
};

export const changeAdminPassword = async (newPassword: string, email?: string) => {
  try {
    await seedDatabase();
    const targetEmail = email || 'admin@aqoonidigital.edu';
    await sql`UPDATE admins SET password = ${newPassword} WHERE email = ${targetEmail}`;
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
    const sid = schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID) || 'aqd-default';
    const rows = await sql`SELECT * FROM students WHERE student_id = ${regId} AND school_id = ${sid}`;
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

// --- Config Services ---

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
};

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

// --- Analytics ---

export const getAnalytics = async (schoolId?: string): Promise<Analytics> => {
  try {
    await seedDatabase();
    const sid = schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID) || 'aqd-default';
    const totalData = await sql`SELECT count(*) as c FROM students WHERE school_id = ${sid}`;
    const passedData = await sql`SELECT count(*) as c FROM students WHERE final_result = 'ناجح' AND school_id = ${sid}`;

    return {
      totalStudents: parseInt(totalData[0].c as string),
      passed: parseInt(passedData[0].c as string),
      failed: parseInt(totalData[0].c as string) - parseInt(passedData[0].c as string),
      recentVerifications: Math.floor(Math.random() * 20) + 5
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

export const saveSchool = async (school: any) => {
  try {
    await seedDatabase();
    const id = school.id || generateUUID();
    const existing = await sql`SELECT id FROM schools WHERE id = ${id}`;

    if (existing.length > 0) {
      await sql`UPDATE schools SET name = ${school.name}, sub_status = ${school.sub_status}, sub_expiry = ${school.sub_expiry} WHERE id = ${id}`;
    } else {
      await sql`INSERT INTO schools (id, name, sub_status, sub_expiry) VALUES (${id}, ${school.name}, ${school.sub_status}, ${school.sub_expiry})`;
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
    await sql`UPDATE schools SET sub_status = ${status} WHERE id = ${schoolId}`;
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
    return await sql`SELECT email, password, role, school_id, is_online, last_active_at FROM admins ORDER BY email ASC`;
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

export const paySchoolSubscription = async (schoolId: string) => {
  return await recordPayment(schoolId, 5, 1);
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

    const data = await sql`SELECT fee_type, balance, billing_message, sub_expiry, sub_status, credits, student_count FROM schools WHERE id = ${schoolId}`;
    return data[0] ? {
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
        WHERE student_id = ${record.studentId} AND school_id = ${sid} AND date = ${record.date}
      `;

      if (existing.length > 0) {
        await sql`
          UPDATE attendance 
          SET status = ${record.status}, notes = ${record.notes || ''}, recorded_by = ${record.recordedBy}
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

export const getStudentAttendanceHistory = async (studentId: string): Promise<AttendanceRecord[]> => {
  try {
    await seedDatabase();
    const schoolId = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!schoolId) return [];

    const rows = await sql`
      SELECT * FROM attendance 
      WHERE student_id = ${studentId} AND school_id = ${schoolId}
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

export const getSchoolActivity = async (schoolId: string) => {
  try {
    await seedDatabase();
    const students = await sql`
      SELECT full_name as action, created_at as timestamp, 'Student Added' as type 
      FROM students 
      WHERE school_id = ${schoolId} 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    const logins = await sql`
      SELECT email as action, last_active_at as timestamp, 'Admin Active' as type 
      FROM admins 
      WHERE school_id = ${schoolId} 
      ORDER BY last_active_at DESC 
      LIMIT 5
    `;

    return [...students, ...logins].sort((a, b) =>
      new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime()
    ).slice(0, 10);
  } catch (e) {
    return [];
  }
};


