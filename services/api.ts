import { Student, CertificateConfig, Analytics, Subject } from '../types';
import sql from '../db';

// Keys for LocalStorage (Only used for Auth Session)
const STORAGE_KEYS = {
  ADMIN_AUTH: 'cv_admin_auth',
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
  logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgNTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWE1ODBjO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2M5NDAwYztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM3YzNhZWQ7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNWIyMWI2O3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwhLS0gT3V0ZXIgRGlhbW9uZCBTaGFwZSAoT3JhbmdlKSAtLT48cGF0aCBkPSJNMjUwIDUwIEw1MCAyNTAgTDI1MCA0NTAgTDIwMCA0ODAgTDAgMjUwIEwyMDAgMjAgWiIgZmlsbD0idXJsKCNncmFkMSkiIC8+PHBhdGggZD0iTTI1MCA1MCBMNDUwIDI1MCBMMjUwIDQ1MCBMMzAwIDQ4MCBMNTAwIDI1MCBMMzAwIDIwIFoiIGZpbGw9InVybCgjZ3JhZDIpIiAvPjwhLS0gSW5uZXIgV2hpdGUgQmFja2dyb3VuZCAtLT48cGF0aCBkPSJNMjUwIDEwMCBMMzkwIDI1MCBMMjUwIDQwMCBMMTEwIDI1MCBaIiBmaWxsPSIjZmZmZmZmIiAvPjwhLS0gQXJhYmljIENhbGxpZ3JhcGh5IChTdHlsaXplZCkgLS0+PHBhdGggZD0iTTI1MCAxNzAgQzIyMCAxNzAgMjAwIDE5MCAyMDAgMjIwIEMyMDAgMjUwIDIyMCAyNzAgMjUwIDI3MCBDMjgwIDI3MCAzMDAgMjUwIDMwMCAyMjAgQzMwMCAxOTAgMjgwIDE3MCAyNTAgMTcwIFogTTI1MCAxOTAgQzI2NSAxOTAgMjc1IDIwNSAyNzUgMjIwIEMyNzUgMjM1IDI2NSAyNTAgMjUwIDI1MCBDMjM1IDI1MCAyMjUgMjM1IDIyNSAyMjAgQzIyNSAyMDUgMjM1IDE5MCAyNTAgMTkwIFoiIGZpbGw9IiM1YjIxYjYiIC8+PCEtLSBCb29rIFNoYXBlIChQdXJwbGUvT3JhbmdlKSAtLT48cGF0aCBkPSJNMTMwIDMzMCBRMjUwIDM4MCAzNzAgMzMwIEwzNzAgMzYwIFEyNTAgNDEwIDEzMCAzNjAgWiIgZmlsbD0iIzViMjFiNiIgLz48cGF0aCBkPSJNMTMwIDM2MCBRMjUwIDQxMCAzNzAgMzYwIEwzNzAgMzg1IFEyNTAgNDM1IDEzMCAzODUgWiIgZmlsbD0iI2VhNTgwYyIgLz48IS0tIFFBSEkgVGV4dCAtLT48dGV4dCB4PSIyNTAiIHk9IjMwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0ibm9ybWFsIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNWIyMWI2Ij5RQUhJPC90ZXh0Pjwvc3ZnPg==',
  stampUrl: '', // Gold stamp
  managerName: '',
  managerSignatureUrl: '',
  themeColor: '#5b21b6',
};

// --- Utilities ---
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- Database Initialization ---
let dbInitPromise: Promise<void> | null = null;

export const seedDatabase = async () => {
  // Always return the existing promise if it's pending to avoid concurrent init attempts
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      console.log('Initializing database tables...');
      
      // Execute table creations sequentially to avoid "Failed to fetch" errors due to concurrency
      
      // 1. Create Students Table
      await sql`
        CREATE TABLE IF NOT EXISTS students (
          id TEXT PRIMARY KEY,
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

      // 2. Create Config Table
      await sql`
        CREATE TABLE IF NOT EXISTS config (
          id INTEGER PRIMARY KEY,
          data JSONB
        )
      `;

      // 3. Create Admin Table
      await sql`
        CREATE TABLE IF NOT EXISTS admins (
          email TEXT PRIMARY KEY,
          password TEXT
        )
      `;

      // Attempt to add unique index safely (separate step)
      try {
        await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_students_student_id ON students (student_id)`;
      } catch (e) {
        console.warn("Could not ensure unique index on student_id (may already exist or have duplicates):", e);
      }

      // Seed Admin if not exists
      const admins = await sql`SELECT count(*) FROM admins WHERE email = 'admin@qahi.edu'`;
      if (parseInt(admins[0].count) === 0) {
        // Use the requested password for new installations
        await sql`INSERT INTO admins (email, password) VALUES ('admin@qahi.edu', 'QabasAL-huda2025@!')`;
      } else {
        // FORCE UPDATE: Ensure the password matches what the user requested
        await sql`UPDATE admins SET password = 'QabasAL-huda2025@!' WHERE email = 'admin@qahi.edu'`;
      }

      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Database initialization failed:", error);
      dbInitPromise = null; // Reset promise so we can try again
      throw error;
    }
  })();

  return dbInitPromise;
};

// --- Auth Services ---

export const isAuthenticated = () => {
  return !!localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
};

export const login = async (email: string, pass: string) => {
  try {
     await seedDatabase();
     const users = await sql`SELECT * FROM admins WHERE email = ${email} AND password = ${pass}`;
     if (users.length > 0) {
       localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
       return true;
     }
  } catch(e) { console.error(e); }
  return false;
};

export const logout = async () => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
};

export const changeAdminPassword = async (newPassword: string) => {
  try {
    await seedDatabase();
    // Updates the default admin password
    await sql`UPDATE admins SET password = ${newPassword} WHERE email = 'admin@qahi.edu'`;
    return true;
  } catch (e) {
    console.error("Failed to change password:", e);
    return false;
  }
};

export const recoverPassword = async () => {
  try {
    await seedDatabase();
    const users = await sql`SELECT password FROM admins WHERE email = 'admin@qahi.edu'`;
    if (users.length > 0) {
      return users[0].password;
    }
    return null;
  } catch (e) {
    console.error("Failed to recover password:", e);
    return null;
  }
};

// --- Student Services ---

export const getStudents = async (): Promise<Student[]> => {
  try {
    await seedDatabase();
    const rows = await sql`SELECT * FROM students ORDER BY created_at DESC`;
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
    // If table doesn't exist, we might get an error, return empty
    return [];
  }
};

export const getStudentByRegId = async (regId: string): Promise<Student | null> => {
  try {
    await seedDatabase();
    const rows = await sql`SELECT * FROM students WHERE student_id = ${regId}`;
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

    // Strategy: Manual Check -> Update or Insert.
    // This avoids reliance on SQL UNIQUE constraints/indices which might be missing in the current DB schema.

    // 1. Check if we are editing an existing record by its Primary Key (ID)
    const existingById = await sql`SELECT id FROM students WHERE id = ${student.id}`;

    // 2. Check if a student with the same Student Number (student_id) already exists anywhere
    const existingByRegId = await sql`SELECT id FROM students WHERE student_id = ${student.studentId}`;

    let targetId = student.id;
    let shouldUpdate = false;

    if (existingById.length > 0) {
       // We are editing a known record (e.g., from the Edit Modal)
       shouldUpdate = true;
       // Validation: Ensure we aren't changing the Student Number to one that belongs to someone else
       if (existingByRegId.length > 0 && existingByRegId[0].id !== student.id) {
           throw new Error(`رقم الطالب ${student.studentId} مستخدم بالفعل لطالب آخر.`);
       }
    } else {
       // We are creating a New record OR Importing
       if (existingByRegId.length > 0) {
           // A student with this Number exists. We should UPDATE that student instead of inserting a duplicate.
           // This is the "Import Excel" upsert logic.
           targetId = existingByRegId[0].id; // Use the ID from the database
           shouldUpdate = true;
       } else {
           // Totally new student
           shouldUpdate = false;
       }
    }
    
    // Safety check: Ensure targetId is valid before DB ops
    if (!shouldUpdate && !targetId) {
        targetId = generateUUID();
    }

    if (shouldUpdate) {
      // Update Logic
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
        WHERE id = ${targetId}
      `;
    } else {
      // Insert Logic
      await sql`
        INSERT INTO students (id, student_id, full_name, academic_year, class_level, subjects, total, percentage, final_result, created_at)
        VALUES (
          ${targetId}, 
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
    }

  } catch (error) {
    console.error("Failed to save student:", error);
    throw error;
  }
};

export const deleteStudent = async (id: string) => {
  if (!id) throw new Error("ID is required for deletion");
  try {
    console.log(`Attempting to delete student with ID: ${id}`);
    await seedDatabase();
    
    // Using RETURNING to verify deletion
    const result = await sql`DELETE FROM students WHERE id = ${id} RETURNING id`;
    
    if (result.length === 0) {
        console.warn(`Attempted to delete student ${id} but no record was found in DB.`);
    } else {
        console.log(`Successfully deleted student ${id} from DB.`);
    }
    return true;
  } catch (error) {
    console.error("Failed to delete student:", error);
    throw error;
  }
};

// --- Config Services ---

export const getConfig = async (): Promise<CertificateConfig> => {
  try {
    await seedDatabase();
    const rows = await sql`SELECT data FROM config WHERE id = 1`;
    if (rows.length > 0) {
      return { ...DEFAULT_CONFIG, ...rows[0].data };
    }
  } catch(e) { 
    console.error("Error getting config (using default):", e); 
  }
  return DEFAULT_CONFIG;
};

export const saveConfig = async (config: CertificateConfig) => {
  try {
    await seedDatabase();
    const count = await sql`SELECT count(*) FROM config WHERE id = 1`;
    if (parseInt(count[0].count) > 0) {
      await sql`UPDATE config SET data = ${JSON.stringify(config)} WHERE id = 1`;
    } else {
      await sql`INSERT INTO config (id, data) VALUES (1, ${JSON.stringify(config)})`;
    }
  } catch (error) {
    console.error("Failed to save config:", error);
    throw error;
  }
};

// --- Analytics ---

export const getAnalytics = async (): Promise<Analytics> => {
   try {
     await seedDatabase();
     const total = await sql`SELECT count(*) as c FROM students`;
     const passed = await sql`SELECT count(*) as c FROM students WHERE final_result = 'ناجح'`;
     
     return {
       totalStudents: parseInt(total[0].c),
       passed: parseInt(passed[0].c),
       failed: parseInt(total[0].c) - parseInt(passed[0].c),
       recentVerifications: Math.floor(Math.random() * 20) + 5
     };
   } catch (e) {
     return { totalStudents: 0, passed: 0, failed: 0, recentVerifications: 0 };
   }
};