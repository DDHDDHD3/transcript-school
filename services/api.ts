import { Student, CertificateConfig, Analytics, Subject, CreditRequest, ContactInquiry } from '../types';
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
      console.log('Initializing new database schema...');

      // 1. Schools Table
      await sql`
        CREATE TABLE IF NOT EXISTS schools (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          location TEXT,
          phone_number TEXT,
          description TEXT,
          logo TEXT,
          status TEXT DEFAULT 'pending',
          sub_status TEXT DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // 2. Users Table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
          name TEXT,
          email TEXT UNIQUE,
          password TEXT,
          role TEXT, -- admin, teacher, etc.
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Migrations for existing tables
      try {
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo TEXT`;
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'`;
        await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS sub_status TEXT DEFAULT 'pending'`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS has_onboarded BOOLEAN DEFAULT FALSE`;
        // Migration: Rename phone to phone_number if it exists and phone_number doesn't
        try {
          await sql`ALTER TABLE schools RENAME COLUMN phone TO phone_number`;
        } catch (e) {
          // Column might already be renamed or doesn't exist
          await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS phone_number TEXT`;
        }
      } catch (e) {
        console.log("Migration note: Some columns already exist or were already migrated.");
      }

      // 3. Students Table (Updated for Transcript system)
      await sql`
        CREATE TABLE IF NOT EXISTS students (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
          name TEXT,
          class TEXT,
          registration_number TEXT,
          faculty TEXT,
          program TEXT,
          enrollment_year TEXT,
          graduation_date TEXT,
          cgpa NUMERIC(4,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      try {
        await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS registration_number TEXT`;
        await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS faculty TEXT`;
        await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS program TEXT`;
        await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS enrollment_year TEXT`;
        await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS graduation_date TEXT`;
        await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS cgpa NUMERIC(4,2)`;
      } catch (e) {
        console.log("Migration note: Students columns migrated.");
      }

      // 4. Courses Table
      await sql`
        CREATE TABLE IF NOT EXISTS courses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          institution_id UUID REFERENCES schools(id) ON DELETE CASCADE,
          course_code TEXT,
          course_name TEXT,
          credit_hours INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // 5. Academic Records Table
      await sql`
        CREATE TABLE IF NOT EXISTS academic_records (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          course_id UUID REFERENCES courses(id),
          semester TEXT,
          academic_year TEXT,
          grade TEXT,
          grade_point NUMERIC(4,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // 6. Issued Documents Table
      await sql`
        CREATE TABLE IF NOT EXISTS issued_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          institution_id UUID REFERENCES schools(id) ON DELETE CASCADE,
          document_type TEXT,
          status TEXT DEFAULT 'draft',
          issued_at TIMESTAMP,
          revoked_at TIMESTAMP,
          qr_code_hash TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;



      // Legacy support for school_activity (logs)
      await sql`
        CREATE TABLE IF NOT EXISTS school_activity (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          school_id UUID REFERENCES schools(id),
          type TEXT,
          action TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          user_email TEXT
        )
      `;

      // Setup default configuration table for settings (per school)
      await sql`
        CREATE TABLE IF NOT EXISTS config (
          school_id UUID PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
          data JSONB
        )
      `;

      // Admins table for System Administrators
      await sql`
        CREATE TABLE IF NOT EXISTS admins (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE,
          password TEXT,
          role TEXT DEFAULT 'admin',
          school_id UUID,
          is_online BOOLEAN DEFAULT FALSE,
          last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          has_onboarded BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // System Settings Table (Super Admin Platform Branding)
      await sql`
        CREATE TABLE IF NOT EXISTS system_settings (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          logo TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Contact Inquiries Table
      await sql`
        CREATE TABLE IF NOT EXISTS contact_inquiries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          full_name TEXT,
          school_name TEXT,
          location TEXT,
          email TEXT,
          phone TEXT,
          message TEXT,
          status TEXT DEFAULT 'pending',
          reply_message TEXT,
          replied_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Credit Requests Table
      await sql`
        CREATE TABLE IF NOT EXISTS credit_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          school_id UUID REFERENCES schools(id),
          amount INTEGER,
          status TEXT DEFAULT 'pending',
          notes TEXT,
          processed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Admin Attendance / Session Tracking Table
      await sql`
        CREATE TABLE IF NOT EXISTS admin_attendance (
          id TEXT PRIMARY KEY,
          email TEXT,
          role TEXT,
          school_id TEXT,
          login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_online BOOLEAN DEFAULT FALSE
        )
      `;

      // Seed the two authorized super-admin accounts
      const seedAdmins = [
        { email: 'super@control.com', password: 'SuperControl2025!' },
        { email: 'admin@aqoonidigital.edu', password: 'QabasAL-huda2025@!' },
      ];
      for (const a of seedAdmins) {
        const exists = await sql`SELECT count(*) FROM admins WHERE email = ${a.email}`;
        if (parseInt(exists[0].count as string) === 0) {
          await sql`INSERT INTO admins (email, password) VALUES (${a.email}, ${a.password})`;
        }
      }

      console.log("Database initialized successfully with absolute multi-tenancy");
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
      SELECT u.*, s.name as school_name, s.status as school_status
      FROM users u 
      LEFT JOIN schools s ON u.school_id = s.id 
      WHERE u.email = ${email}
    `;

    if (users.length > 0) {
      const user = users[0];

      // SECURITY: Clerk authentication can NEVER grant super_admin access.
      // Super-admin is exclusively reached via the System Administrator Login form
      // (DB admins table). If somehow a users-table row has super_admin, demote it.
      const safeRole = user.role === 'super_admin' ? 'admin' : user.role;

      // Bridge Clerk session with local storage
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, safeRole);
      localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, user.school_id || '');
      localStorage.setItem('cv_user_email', user.email);
      localStorage.setItem('cv_school_status', user.school_status || 'pending');
      localStorage.setItem('cv_has_onboarded', 'true');

      return {
        success: true,
        role: safeRole,
        schoolId: user.school_id,
        email: user.email,
        hasOnboarded: true
      };
    } else {
      // New user from Clerk? They need to onboard and create a school
      return {
        success: true,
        email: email,
        hasOnboarded: false
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

// ── System Administrator Login ──────────────────────────────────────────────
// All super-admin credentials are stored exclusively in the DB `admins` table.
// There are NO hardcoded bypass credentials in client-side code.
export const login = async (emailRaw: string, passRaw: string) => {
  const email = emailRaw.trim();
  const pass = passRaw.trim();

  try {
    await seedDatabase();

    const users = await sql`
      SELECT u.*, s.name as school_name 
      FROM users u 
      LEFT JOIN schools s ON u.school_id = s.id 
      WHERE u.email = ${email} AND u.password = ${pass}
    `;

    if (users.length > 0) {
      const user = users[0];
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, user.role);
      localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, user.school_id || '');
      localStorage.setItem('cv_user_email', user.email);
      localStorage.setItem('cv_has_onboarded', 'true');

      return {
        success: true,
        role: user.role,
        schoolId: user.school_id,
        email: user.email,
        hasOnboarded: true
      };
    } else {
      // Check legacy Super Admin
      const admins = await sql`SELECT * FROM admins WHERE email = ${email} AND password = ${pass}`;
      if (admins.length > 0) {
        const admin = admins[0];
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
        localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, 'super_admin');
        localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, '');
        localStorage.setItem('cv_user_email', admin.email);
        localStorage.setItem('cv_has_onboarded', 'true');

        return {
          success: true,
          role: 'super_admin',
          schoolId: '',
          email: admin.email,
          hasOnboarded: true
        };
      }

      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
  } catch (e: any) {
    console.error("Login Error:", e);
    return { success: false, error: `خطأ في الاتصال بقاعدة البيانات` };
  }
};

export const logout = async () => {
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
    schoolStatus: localStorage.getItem('cv_school_status') || 'pending'
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

export const getStudents = async (schoolId?: string): Promise<any[]> => {
  try {
    await seedDatabase();
    const sid = schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!sid) return [];

    const rows = await sql`SELECT * FROM students WHERE school_id = ${sid} ORDER BY name`;

    return rows.map(row => ({
      id: row.id,
      studentId: row.id.slice(0, 8).toUpperCase(), // UI-friendly short ID
      fullName: row.name,
      classLevel: row.class,
      name: row.name,
      class: row.class,
      schoolId: row.school_id,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }
};

export const getStudentById = async (id: string, schoolId?: string) => {
  try {
    await seedDatabase();
    const sid = schoolId || localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!sid) return null;

    const rows = await sql`SELECT * FROM students WHERE id = ${id} AND school_id = ${sid}`;
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Failed to fetch student:", error);
    return null;
  }
};

export const getStudentByRegId = async (regId: string) => {
  try {
    await seedDatabase();
    // Search by full ID or short ID (first 8 chars)
    const rows = await sql`
      SELECT * FROM students 
      WHERE id::text = ${regId} 
         OR id::text LIKE ${regId.toLowerCase() + '%'}
      LIMIT 1
    `;

    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      studentId: row.id.slice(0, 8).toUpperCase(),
      fullName: row.name,
      classLevel: row.class,
      name: row.name,
      class: row.class,
      schoolId: row.school_id,
      createdAt: row.created_at
    };
  } catch (error) {
    console.error("Failed to fetch student by RegID:", error);
    return null;
  }
};

export const saveStudent = async (student: any) => {
  try {
    await seedDatabase();
    const sid = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!sid) throw new Error("No school selected");

    const name = student.name || student.fullName;
    const className = student.class || student.classLevel;

    if (student.id) {
      await sql`
        UPDATE students SET 
          name = ${name},
          class = ${className}
        WHERE id = ${student.id} AND school_id = ${sid}
      `;
    } else {
      await sql`
        INSERT INTO students (school_id, name, class)
        VALUES (${sid}, ${name}, ${className})
      `;
      await logAction(sid, 'Student', `Registered new student: ${name}`);
    }
    return true;
  } catch (error) {
    console.error("Failed to save student:", error);
    throw error;
  }
};

export const deleteStudent = async (id: string) => {
  if (!id) throw new Error("ID is required for deletion");
  try {
    await seedDatabase();
    const sid = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!sid) throw new Error("No school selected");
    await sql`DELETE FROM students WHERE id = ${id} AND school_id = ${sid}`;
    return true;
  } catch (error) {
    console.error("Failed to delete student:", error);
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

export const getAnalytics = async (): Promise<any> => {
  try {
    await seedDatabase();
    const sid = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (!sid) return null;

    const [studentCount, documentCount] = await Promise.all([
      sql`SELECT COUNT(*) FROM students WHERE school_id = ${sid}`,
      sql`SELECT COUNT(*) FROM issued_documents WHERE institution_id = ${sid}`
    ]);

    return {
      totalStudents: parseInt(studentCount[0].count),
      recentVerifications: 0,
      totalCertificates: parseInt(documentCount[0].count)
    };
  } catch (error) {
    console.error("Get Analytics Error:", error);
    return null;
  }
};

export const saveSystemSettings = async (settings: { name: string, logo: string | null }) => {
  try {
    await seedDatabase();
    // Check if main entry exists
    const exists = await sql`SELECT id FROM system_settings WHERE id = 'main'`;
    if (exists.length > 0) {
      await sql`
        UPDATE system_settings 
        SET name = ${settings.name}, logo = ${settings.logo}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = 'main'
      `;
    } else {
      await sql`
        INSERT INTO system_settings (id, name, logo)
        VALUES ('main', ${settings.name}, ${settings.logo})
      `;
    }
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

export const sendReplyEmail = async (_inquiryId: string, _replyMessage: string) => ({
  success: false,
  error: 'Email replies are unavailable until a server-side email endpoint is configured.'
});


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
        u.email, 
        u.role, 
        u.created_at,
        s.name as school_name,
        s.id as school_id,
        s.status as school_status
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE (u.school_id IS NULL OR u.has_onboarded = FALSE OR s.status = 'pending') 
      AND u.role != 'super_admin'
      ORDER BY u.created_at DESC
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

    const data = await sql`SELECT name, location, phone_number, fee_type, balance, billing_message, sub_expiry, sub_status, credits, student_count FROM schools WHERE id = ${schoolId}`;
    return data[0] ? {
      name: data[0].name,
      location: data[0].location || 'Not Set',
      phoneNumber: data[0].phone_number || 'Not Set',
      feeType: data[0].fee_type || 'free',
      balance: data[0].balance || 0,
      billingMessage: data[0].billing_message || '',
      subExpiry: data[0].sub_expiry || new Date().toISOString(),
      subStatus: data[0].sub_status || 'pending',
      credits: data[0].credits || 0,
      studentCount: data[0].student_count || 0
    } : null;
  } catch (e) {
    console.error("Get School Billing Error:", e);
    return null;
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



export const updateSchoolProfile = async (schoolId: string, data: any) => {
  try {
    await seedDatabase();
    await sql`
      UPDATE schools 
      SET 
        name = COALESCE(${data.name}, name),
        location = COALESCE(${data.location}, location),
        phone_number = COALESCE(${data.phone_number || data.phone}, phone_number),
        description = COALESCE(${data.description}, description)
      WHERE id = ${schoolId}
    `;
    return { success: true };
  } catch (error) {
    console.error('Error updating school profile:', error);
    return { success: false, error };
  }
};

export const completeOnboarding = async (schoolId: string | null | undefined, email: string, data: any) => {
  try {
    await seedDatabase();

    // Ensure we have a valid school ID
    const sid = (schoolId && schoolId !== 'null' && schoolId !== 'undefined' && schoolId !== '')
      ? schoolId
      : generateUUID();

    // 1. Create or Update School
    const existing = await sql`SELECT id FROM schools WHERE id = ${sid}`;
    if (existing.length > 0) {
      await updateSchoolProfile(sid, data);
    } else {
      await sql`
        INSERT INTO schools (id, name, location, phone_number, description, logo, status, sub_status)
        VALUES (${sid}, ${data.name}, ${data.location}, ${data.phone || data.phone_number || null}, ${data.description}, ${data.logo || null}, 'pending', 'pending')
      `;
    }

    // 2. Link user to school
    await sql`
      UPDATE users 
      SET school_id = ${sid}, role = 'admin', has_onboarded = TRUE 
      WHERE email = ${email}
    `;

    // 3. Ensure record in localStorage
    localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, sid);
    localStorage.setItem('cv_school_status', 'pending');
    localStorage.setItem('cv_has_onboarded', 'true');

    return { success: true, schoolId: sid };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { success: false, error };
  }
};

export const markTourComplete = async (email: string) => {
  try {
    await seedDatabase();
    localStorage.setItem('cv_has_onboarded', 'true');
    if (email) {
      await sql`UPDATE users SET has_onboarded = TRUE WHERE email = ${email}`;
    }
    return true;
  } catch (error) {
    console.error('Error marking tour complete:', error);
    return false;
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

// ─── School Data Explorer ─────────────────────────────────────────────────────

export const getSchoolFullData = async (schoolId: string) => {
  try {
    await seedDatabase();

    const [schoolRows, students, courses, documents, activity] = await Promise.all([
      sql`
        SELECT s.*, 
               COUNT(DISTINCT st.id) AS student_count,
               COUNT(DISTINCT c.id) AS course_count,
               COUNT(DISTINCT d.id)  AS document_count
        FROM schools s
        LEFT JOIN students   st ON st.school_id = s.id
        LEFT JOIN courses    c  ON c.institution_id = s.id
        LEFT JOIN issued_documents d ON d.institution_id = s.id
        WHERE s.id = ${schoolId}
        GROUP BY s.id
      `,
      sql`
        SELECT id, name, class, registration_number, faculty, program, enrollment_year, graduation_date, cgpa, created_at
        FROM students
        WHERE school_id = ${schoolId}
        ORDER BY name
      `,
      sql`
        SELECT *
        FROM courses
        WHERE institution_id = ${schoolId}
        ORDER BY course_name
      `,
      sql`
        SELECT d.*, s.name as student_name
        FROM issued_documents d
        LEFT JOIN students s ON s.id = d.student_id
        WHERE d.institution_id = ${schoolId}
        ORDER BY d.created_at DESC
        LIMIT 1000
      `,
      sql`
        SELECT type, action, timestamp, user_email
        FROM school_activity
        WHERE school_id = ${schoolId}
        ORDER BY timestamp DESC
        LIMIT 100
      `,
    ]);

    return {
      school: schoolRows[0] || null,
      students: students,
      courses: courses,
      documents: documents,
      activity: activity
    };
  } catch (error) {
    console.error('getSchoolFullData error:', error);
    return null;
  }
};

// ─── Transcript & Academic Record Services ──────────────────────────────────────

export const getCourses = async (institutionId: string): Promise<any[]> => {
  try {
    return await sql`SELECT * FROM courses WHERE institution_id = ${institutionId} ORDER BY course_name`;
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
};

export const saveCourse = async (course: any) => {
  try {
    if (course.id) {
      await sql`UPDATE courses SET course_code = ${course.courseCode}, course_name = ${course.courseName}, credit_hours = ${course.creditHours} WHERE id = ${course.id}`;
    } else {
      await sql`INSERT INTO courses (institution_id, course_code, course_name, credit_hours) VALUES (${course.institutionId}, ${course.courseCode}, ${course.courseName}, ${course.creditHours})`;
    }
    return true;
  } catch (error) {
    console.error("Failed to save course:", error);
    return false;
  }
};

export const getAcademicRecords = async (studentId: string): Promise<any[]> => {
  try {
    return await sql`
      SELECT r.*, c.course_code, c.course_name, c.credit_hours 
      FROM academic_records r
      LEFT JOIN courses c ON r.course_id = c.id
      WHERE r.student_id = ${studentId}
      ORDER BY r.academic_year DESC, r.semester DESC
    `;
  } catch (error) {
    console.error("Failed to fetch academic records:", error);
    return [];
  }
};

export const saveAcademicRecord = async (record: any) => {
  try {
    if (record.id) {
      await sql`UPDATE academic_records SET course_id = ${record.courseId}, semester = ${record.semester}, academic_year = ${record.academicYear}, grade = ${record.grade}, grade_point = ${record.gradePoint} WHERE id = ${record.id}`;
    } else {
      await sql`INSERT INTO academic_records (student_id, course_id, semester, academic_year, grade, grade_point) VALUES (${record.studentId}, ${record.courseId}, ${record.semester}, ${record.academicYear}, ${record.grade}, ${record.gradePoint})`;
    }
    return true;
  } catch (error) {
    console.error("Failed to save academic record:", error);
    return false;
  }
};

export const updateStudentCGPA = async (studentId: string, cgpa: number) => {
  try {
    await sql`UPDATE students SET cgpa = ${cgpa} WHERE id = ${studentId}`;
    return true;
  } catch (error) {
    console.error("Failed to update CGPA:", error);
    return false;
  }
};

export const getIssuedDocuments = async (institutionId: string): Promise<any[]> => {
  try {
    return await sql`
      SELECT d.*, s.name as student_name, s.registration_number
      FROM issued_documents d
      LEFT JOIN students s ON s.id = d.student_id
      WHERE d.institution_id = ${institutionId}
      ORDER BY d.created_at DESC
    `;
  } catch (error) {
    console.error("Failed to fetch issued documents:", error);
    return [];
  }
};

export const issueDocument = async (doc: any) => {
  try {
    const id = doc.id || generateUUID();
    const qrHash = doc.qrCodeHash || generateUUID();
    await sql`
      INSERT INTO issued_documents (id, student_id, institution_id, document_type, status, issued_at, qr_code_hash)
      VALUES (${id}, ${doc.studentId}, ${doc.institutionId}, ${doc.documentType}, 'issued', CURRENT_TIMESTAMP, ${qrHash})
    `;
    return { success: true, id, qrHash };
  } catch (error) {
    console.error("Failed to issue document:", error);
    return { success: false };
  }
};

export const revokeDocument = async (id: string) => {
  try {
    await sql`UPDATE issued_documents SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error("Failed to revoke document:", error);
    return false;
  }
};

export const verifyDocumentById = async (id: string) => {
  try {
    const rows = await sql`
      SELECT d.*, s.name as student_name, s.registration_number, s.faculty, s.program, s.graduation_date, s.cgpa, i.name as institution_name
      FROM issued_documents d
      LEFT JOIN students s ON s.id = d.student_id
      LEFT JOIN schools i ON i.id = d.institution_id
      WHERE d.id = ${id} OR d.qr_code_hash = ${id}
    `;
    return rows[0] || null;
  } catch (error) {
    console.error("Failed to verify document:", error);
    return null;
  }
};
