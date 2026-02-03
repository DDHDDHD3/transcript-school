import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            nav: {
                home: "Home",
                verify: "Verify Certificate",
                admin: "Admin Portal",
                dashboard: "Dashboard",
                students: "Students & Grades",
                attendance: "Attendance",
                settings: "Settings",
                logout: "Logout",
                backToHome: "Back to Home",
                superPanel: "Super Panel",
                superAdmin: "Super Admin",
                attendanceRecord: "Monthly Attendance Record",
                selectMonth: "Select Month:",
                presentDays: "Days Present",
                absentDays: "Days Absent",
                noAttendance: "No attendance records found for {{month}}",
                sessions: {
                    morning: "Morning",
                    afternoon: "Afternoon"
                },
                status: {
                    present: "Present",
                    absent: "Absent"
                }
            },
            common: {
                certificateSystem: "Aqooni Digital Portal",
                instituteName: "Aqooni Digital",
                qahi: "AQD",
                digitalCertificateSystem: "Aqooni Digital Management System",
                edit: "Edit",
                save: "Save",
                cancel: "Cancel",
                subjects: {
                    tafsir: "Tafsir",
                    sira: "Sira",
                    hadith: "Hadith",
                    reading: "Reading & Writing",
                    fiqh: "Fiqh",
                    arabic: "Arabic Language",
                    adhkar: "Adhkar",
                    math: "Mathematics",
                    somali: "Somali Language"
                }
            },
            home: {
                publicPortal: "Public Verification Portal",
                title: "Certificate Authenticity Verification",
                subtitle: "Enter a certificate code to verify its authenticity and view official details instantly.",
                placeholder: "Enter Certificate Code (e.g., AQD-2024-001)",
                verifyBtn: "Verify Now",
                features: {
                    secure: "Secure & Verifiable",
                    instant: "Instant Results",
                    official: "Official Recognition"
                },
                errorNotFound: "Student ID not found. Please check and try again.",
                errorSystem: "System error. Please try again.",
                newSearch: "New Search",
                downloadPDF: "Download Certificate PDF"
            },
            dashboard: {
                title: "Dashboard",
                subtitle: "Overview of the certificate system",
                totalStudents: "Total Students",
                passedStudents: "Passed Certificates",
                recentVerifications: "Verifications (24h)",
                systemStatus: "System Status",
                verificationPortal: "Verification Portal",
                database: "Database (Local)",
                online: "Online",
                offline: "Offline"
            },
            students: {
                title: "Students Register",
                subtitle: "Manage grades and certificates",
                addStudent: "Add Student",
                exportExcel: "Export Excel",
                importExcel: "Import Excel",
                importing: "Importing...",
                searchPlaceholder: "Search by name or student ID...",
                table: {
                    name: "Student Name",
                    id: "Student ID",
                    level: "Level",
                    result: "Final Result",
                    actions: "Actions"
                },
                modal: {
                    addTitle: "Add New Student",
                    editTitle: "Edit Student",
                    studentIdAuto: "Student ID (Auto)",
                    studentName: "Student Name",
                    level: "Level",
                    academicYear: "Academic Year",
                    subjectsTitle: "Subject Grades",
                    addSubject: "Add Subject",
                    table: {
                        subject: "Subject",
                        fullMarks: "Full Marks",
                        studentMarks: "Student Marks",
                        result: "Result",
                        delete: "Delete"
                    },
                    footer: {
                        total: "Total Marks",
                        percentage: "Percentage",
                        save: "Save Record",
                        cancel: "Cancel"
                    }
                },
                messages: {
                    deleteConfirm: "Are you sure you want to delete this student record? This action cannot be reversed.",
                    deleteSuccess: "Student record deleted successfully.",
                    deleteError: "Error: Student ID not found",
                    saveSuccess: "Student data saved successfully.",
                    saveError: "Failed to save student data.",
                    noRecords: "No records found to export.",
                    importErrorHeader: "Error: Could not find column",
                    foundHeaders: "Headers found in file",
                    checkHeaders: "Please ensure your column headers match exactly.",
                    importSuccess: "Import completed! {{count}} records added.",
                    failedRecords: "failed {{count}} records",
                    firstError: "First error",
                    importErrorFile: "Error reading file. Check the format."
                },
                levels: {
                    level1: "Level 1",
                    level2: "Level 2",
                    level3: "Level 3",
                    level4: "Level 4",
                    level5: "Level 5",
                    level6: "Level 6",
                    level7: "Level 7",
                    level8: "Level 8",
                    level9: "Level 9",
                    level10: "Level 10",
                    level11: "Level 11",
                    level12: "Level 12"
                },
                status: {
                    pass: "Pass",
                    fail: "Fail"
                },
                noRecords: "No records found."
            },
            super: {
                title: "School Ecosystem",
                subtitle: "Platform-wide management and security controls.",
                createSchool: "Create New School",
                schoolBranch: "School Branch",
                adminStatus: "Admin Status",
                status: "Status",
                expiry: "Expiry",
                revenue: "Revenue",
                settings: "Settings",
                security: {
                    title: "Platform Security",
                    changePass: "Change Super Admin Password",
                    newPass: "New Password",
                    updateBtn: "Update Now"
                },
                manage: {
                    adminSecurity: "Admin Security",
                    currentAdmin: "Current Admin",
                    currentPass: "Current Password",
                    newPass: "New Reset Password",
                    resetBtn: "Reset Password",
                    finance: "Subscription & Finance",
                    planType: "Plan Type",
                    totalEarned: "Total Earned",
                    expiresOn: "Service Expires On",
                    updateSub: "Update Subscription Details",
                    feeCategory: "Fee Category",
                    balance: "Current Balance",
                    paymentNote: "Payment Notification for School Dashboard",
                    updateBilling: "Update Billing & Message"
                },
                messages: {
                    passUpdateSuccess: "Password updated successfully!",
                    passUpdateError: "Failed to update password.",
                    configSaveSuccess: "School settings saved successfully!",
                    configSaveError: "Failed to save settings.",
                    paymentSuccess: "Recorded ${{amount}} and extended subscription by {{months}} month(s)!",
                    paymentError: "Failed to record payment.",
                    adminCreateSuccess: "Admin account created successfully!",
                    adminCreateError: "Failed to create account.",
                    billingUpdateSuccess: "Billing data and notifications updated successfully!",
                    billingUpdateError: "Failed to update billing data."
                }
            },
            login: {
                title: "Admin Portal",
                subtitle: "Digital Management Gateway",
                email: "Email Address",
                password: "Password",
                loginBtn: "Login",
                forgotPass: "Forgot Password? (Show Password)",
                backHome: "Back to Main Home",
                errors: {
                    invalid: "Invalid email or password",
                    noAccount: "Admin account not found.",
                    contactAdmin: "Please contact the system administrator to reset your password."
                },
                alerts: {
                    currentPass: "Current password is:\n\n{{pass}}\n\nPlease save it."
                }
            },
            subscription: {
                expiredTitle: "Subscription Expired",
                expiredSubtitle: "Please renew your subscription to continue accessing the dashboard.",
                howToRenew: "How to Renew",
                renewInstructions: "You can renew your monthly subscription ($5) by contacting central management.",
                contactSupport: "Technical Support"
            },
            settings: {
                title: "System Settings",
                subtitle: "Customize school data and security settings.",
                security: {
                    title: "Security & Password",
                    newPasswordLabel: "New Password",
                    placeholder: "Enter a strong new password...",
                    hint: "Changing the password will clear security warnings.",
                    button: "Change Password",
                    loading: "Changing...",
                    success: "Password changed successfully! Security warning will disappear on next login.",
                    error: "Error changing password",
                    minLength: "Password must be at least 6 characters"
                },
                school: {
                    title: "School Information",
                    nameAr: "School Name (Arabic)",
                    nameEn: "School Name (English)"
                },
                media: {
                    title: "Images & Signatures",
                    logo: "School Logo",
                    stamp: "Golden Stamp",
                    signature: "Manager Signature",
                    noImage: "No image",
                    upload: "Upload Image"
                },
                save: "Save Settings",
                saving: "Saving...",
                success: "Settings saved successfully!",
                error: "Error saving settings. Please try again.",
                loading: "Loading settings...",
                billing: {
                    title: "Billing & Subscription",
                    status: "Account Status",
                    balance: "Outstanding Balance",
                    expiry: "Service Expiry",
                    message: "Messages from Platform",
                    payNow: "How to Pay",
                    payMsg: "To settle your balance, please contact the platform administration or follow the bank instructions provided in the message above.",
                    active: "Active Service",
                    expired: "Service Expired",
                    free: "Free Plan",
                    paid: "Premium Plan",
                    credits: "Remaining Credits",
                    studentCount: "Student Count",
                    paymentModal: {
                        secureHeader: "Secure Payment Gateway",
                        currBalance: "Current Balance",
                        svcExpiry: "Service Expiry",
                        amountLabel: "Payment Amount ($)",
                        renewLabel: "Renew For (Months)",
                        confirmBtn: "Confirm Payment",
                        mockNote: "* This is a mock payment for demonstration purposes.",
                        month: "Month",
                        months: "Months"
                    }
                },
                grading: {
                    title: "Grading & Assessment Structure",
                    subtitle: "Define custom columns for student marks and exams.",
                    addColumn: "Add Column",
                    columnName: "Column Name",
                    maxMarks: "Max Marks",
                    type: "Type",
                    actions: "Actions",
                    number: "Number",
                    text: "Text",
                    confirmDelete: "Are you sure you want to delete this column? Subject data for this column may be lost."
                }
            },
            attendance: {
                title: "Attendance Management",
                subtitle: "Track daily student attendance",
                recordBtn: "Record",
                reportsBtn: "Reports",
                monthlyBtn: "Monthly View",
                selectDate: "Select Date",
                session: {
                    label: "Session",
                    morning: "Morning",
                    afternoon: "Afternoon"
                },
                selectClass: "Select Class",
                prevDay: "Prev Day",
                nextDay: "Next Day",
                selectMonth: "Select Month",
                markAllPresent: "Mark All Present",
                markAllAbsent: "Mark All Absent",
                saveAttendance: "Save Attendance",
                summary: {
                    total: "Total Students",
                    present: "Present",
                    absent: "Absent",
                    late: "Late"
                },
                table: {
                    name: "Student Name",
                    id: "ID",
                    status: "Status",
                    notes: "Notes"
                },
                status: {
                    present: "Present",
                    absent: "Absent",
                    late: "Late",
                    excused: "Excused"
                },
                reports: {
                    title: "Attendance Reports",
                    student: "Student",
                    total: "Total",
                    present: "Present",
                    absent: "Absent",
                    rate: "Rate",
                    period: "Period",
                    generate: "Generate Report",
                    export: "Export Report"
                },
                messages: {
                    saveSuccess: "Attendance recorded successfully!",
                    saveError: "Failed to save attendance",
                    pdfError: "Failed to generate PDF",
                    xlsxError: "XLSX library not loaded"
                },
                bulk: {
                    allPresent: "All P",
                    allAbsent: "All A"
                }
            },
            pwa: {
                title: "Download the Student Grades App — (DHAQ DHAQAAQA ARDAYGA DAGSO)",
                subtitle: "Fast & Secure Access",
                description: "Install our app for quick access to certificate verification and student grades.",
                installBtn: "Install App",
                notNow: "Not now",
                iosTitle: "iOS Installation",
                iosInstructions: "Tap the Share button, then select Add to Home Screen",
                offlineAccess: "Offline Access",
                fastSecure: "Fast & Secure",
                freeDownload: "Free Download"
            },
            pdf: {
                certificateTitle: "Monthly Student Certificate",
                attendanceTitle: "Monthly Attendance Report",
                studentName: "Student Name",
                studentId: "Student ID",
                level: "Level",
                academicYear: "Academic Year",
                subject: "Subject",
                fullMarks: "Full Marks",
                studentMarks: "Student Marks",
                result: "Result",
                total: "Total",
                percentage: "Percentage",
                finalResult: "Final Result",
                signature: "Manager Signature",
                date: "Date",
                stamp: "Official Stamp",
                presentDays: "Days Present",
                absentDays: "Days Absent",
                avgRate: "Average Attendance",
                recordedDate: "Issued Date",
                noNotes: "No notes",
                historyTitle: "Monthly Attendance History",
                monthSelect: "Select Month",
                present: "Present",
                absent: "Absent",
                totalDays: "Total Days",
                avgAttendance: "Average Attendance",
                totalAbsences: "Total Absences"
            }
        }
    },
    ar: {
        translation: {
            nav: {
                home: "الرئيسية",
                verify: "التحقق من الشهادة",
                admin: "دخول الإدارة",
                dashboard: "لوحة التحكم",
                students: "الطلاب والدرجات",
                attendance: "التحضير",
                settings: "الإعدادات",
                logout: "تسجيل الخروج",
                backToHome: "العودة للرئيسية",
                superPanel: "لوحة التحكم العليا",
                superAdmin: "المدير العام",
                attendanceRecord: "سجل الحضور الشهري",
                selectMonth: "اختر الشهر:",
                presentDays: "أيام الحضور",
                absentDays: "أيام الغياب",
                noAttendance: "لا يوجد سجل حضور لشهر {{month}}",
                sessions: {
                    morning: "صباحي",
                    afternoon: "مسائي"
                },
                status: {
                    present: "حاضر",
                    absent: "غائب"
                }
            },
            common: {
                certificateSystem: "بوابة أقوني ديجيتال",
                instituteName: "أقوني ديجيتال",
                qahi: "AQD",
                digitalCertificateSystem: "نظام إدارة أقوني ديجيتال",
                edit: "تعديل",
                save: "حفظ",
                cancel: "إلغاء",
                subjects: {
                    tafsir: "التفسير",
                    sira: "السيرة",
                    hadith: "الحديث",
                    reading: "القراءة والكتابة",
                    fiqh: "الفقه",
                    arabic: "الغة العربية",
                    adhkar: "الأذكار",
                    math: "الرياضيات",
                    somali: "اللغة الصومالية"
                }
            },
            home: {
                publicPortal: "بوابة التحقق العام",
                title: "التحقق من صحة الشهادات",
                subtitle: "أدخل رمز الشهادة للتحقق من مصداقيتها وعرض التفاصيل الرسمية فوراً.",
                placeholder: "أدخل رمز الشهادة (مثال: AQD-2024-001)",
                verifyBtn: "تحقق الآن",
                features: {
                    secure: "آمن وقابل للتحقق",
                    instant: "نتائج فورية",
                    official: "اعتراف رسمي"
                },
                errorNotFound: "لم يتم العثور على رقم الطالب. يرجى التحقق والمحاولة مرة أخرى.",
                errorSystem: "خطأ في النظام. حاول مرة أخرى.",
                newSearch: "بحث جديد",
                downloadPDF: "تحميل الشهادة PDF"
            },
            dashboard: {
                title: "لوحة المعلومات",
                subtitle: "نظرة عامة على نظام الشهادات",
                totalStudents: "إجمالي الطلاب",
                passedStudents: "الشهادات المصدرة (ناجح)",
                recentVerifications: "التحققات (24 ساعة)",
                systemStatus: "حالة النظام",
                verificationPortal: "بوابة التحقق",
                database: "قاعدة البيانات (المحلية)",
                online: "متصل",
                offline: "غير متصل"
            },
            students: {
                title: "سجل الطلاب",
                subtitle: "إدارة الدرجات والشهادات",
                addStudent: "إضافة طالب",
                exportExcel: "تصدير إكسل",
                importExcel: "استيراد إكسل",
                importing: "جاري الاستيراد...",
                searchPlaceholder: "بحث بالاسم أو رقم الطالب...",
                table: {
                    name: "اسم الطالب",
                    id: "رقم الطالب",
                    level: "المستوى",
                    result: "النتيجة النهائية",
                    actions: "إجراءات"
                },
                modal: {
                    addTitle: "إضافة طالب جديد",
                    editTitle: "تعديل طالب",
                    studentIdAuto: "رقم الطالب (تلقائي)",
                    studentName: "اسم الطالب",
                    level: "المستوى",
                    academicYear: "العام الدراسي",
                    subjectsTitle: "درجات المواد",
                    addSubject: "إضافة مادة",
                    table: {
                        subject: "المادة",
                        fullMarks: "الدرجة الكاملة",
                        studentMarks: "درجة الطالب",
                        result: "النتيجة",
                        delete: "حذف"
                    },
                    footer: {
                        total: "المجموع الكلي",
                        percentage: "النسبة المئوية",
                        save: "حفظ السجل",
                        cancel: "إلغاء"
                    }
                },
                messages: {
                    deleteConfirm: "هل أنت متأكد من حذف سجل الطالب؟ لا يمكن التراجع عن هذا الإجراء.",
                    deleteSuccess: "تم حذف سجل الطالب بنجاح.",
                    deleteError: "خطأ: رقم الطالب غير موجود",
                    saveSuccess: "تم حفظ بيانات الطالب بنجاح.",
                    saveError: "فشل حفظ بيانات الطالب.",
                    noRecords: "لا توجد بيانات للتصدير.",
                    importErrorHeader: "خطأ: لم يتم العثور على عمود",
                    foundHeaders: "الأعمدة التي تم العثور عليها",
                    checkHeaders: "يرجى التأكد من تطابق عناوين الأعمدة تماماً.",
                    importSuccess: "اكتمل الاستيراد! تم إضافة {{count}} سجل.",
                    failedRecords: "فشل {{count}} سجل",
                    firstError: "أول خطأ",
                    importErrorFile: "حدث خطأ أثناء قراءة الملف. تأكد من الصيغة."
                },
                levels: {
                    level1: "المستوى الأول",
                    level2: "المستوى الثاني",
                    level3: "المستوى الثالث",
                    level4: "المستوى الرابع",
                    level5: "المستوى الخامس",
                    level6: "المستوى السادس",
                    level7: "المستوى السابع",
                    level8: "المستوى الثامن",
                    level9: "المستوى التاسع",
                    level10: "المستوى العاشر",
                    level11: "المستوى الحادي عشر",
                    level12: "المستوى الثاني عشر"
                },
                status: {
                    pass: "ناجح",
                    fail: "راسب"
                },
                noRecords: "لا توجد سجلات."
            },
            super: {
                title: "نظام المدارس",
                subtitle: "إدارة شاملة للمنصة وعناصر التحكم في الأمان.",
                createSchool: "إنشاء مدرسة جديدة",
                schoolBranch: "فرع المدرسة",
                adminStatus: "حالة المدير",
                status: "الحالة",
                expiry: "انتهاء الصلاحية",
                revenue: "الإيرادات",
                settings: "الإعدادات",
                security: {
                    title: "أمان المنصة",
                    changePass: "تغيير كلمة مرور Super Admin",
                    newPass: "كلمة المرور الجديدة",
                    updateBtn: "تحديث الآن"
                },
                manage: {
                    adminSecurity: "أمان المدير",
                    currentAdmin: "المدير الحالي",
                    currentPass: "كلمة المرور الحالية",
                    newPass: "كلمة مرور جديدة لإعادة التعيين",
                    resetBtn: "إعادة تعيين كلمة المرور",
                    finance: "الاشتراك والتمويل",
                    planType: "نوع الخطة",
                    totalEarned: "إجمالي الأرباح",
                    expiresOn: "تاريخ انتهاء الخدمة",
                    updateSub: "تحديث تفاصيل الاشتراك",
                    feeCategory: "فئة الرسوم",
                    balance: "الرصيد الحالي",
                    paymentNote: "إشعار الدفع للوحة تحكم المدرسة",
                    updateBilling: "تحديث الفوترة والرسائل"
                },
                messages: {
                    passUpdateSuccess: "تم تحديث كلمة المرور بنجاح!",
                    passUpdateError: "فشل تحديث كلمة المرور.",
                    configSaveSuccess: "تم حفظ إعدادات المدرسة بنجاح!",
                    configSaveError: "فشل حفظ الإعدادات.",
                    paymentSuccess: "تم تسجيل ${{amount}} وتمديد الاشتراك {{months}} شهر!",
                    paymentError: "فشل تسجيل الدفعة.",
                    adminCreateSuccess: "تم إنشاء حساب المسؤول بنجاح!",
                    adminCreateError: "فشل إنشاء الحساب.",
                    billingUpdateSuccess: "تم تحديث بيانات الفوترة والإشعارات بنجاح!",
                    billingUpdateError: "فشل تحديث بيانات الفوترة."
                }
            },
            login: {
                title: "بوابة الإدارة",
                subtitle: "بوابة الإدارة الإلكترونية",
                email: "البريد الإلكتروني",
                password: "كلمة المرور",
                loginBtn: "تسجيل الدخول",
                forgotPass: "نسيت كلمة المرور؟ (أظهر كلمة المرور)",
                backHome: "العودة للواجهة الرئيسية",
                errors: {
                    invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                    noAccount: "لم يتم العثور على حساب المسؤول.",
                    contactAdmin: "يرجى التواصل مع إدارة النظام لإعادة تعيين كلمة المرور."
                },
                alerts: {
                    currentPass: "كلمة المرور الحالية هي:\n\n{{pass}}\n\nيرجى حفظها."
                }
            },
            subscription: {
                expiredTitle: "انتهى الاشتراك",
                expiredSubtitle: "يرجى تجديد الاشتراك لمتابعة الوصول إلى لوحة التحكم",
                howToRenew: "طريقة التجديد",
                renewInstructions: "يمكنك تجديد الاشتراك الشهري (5 دولار) عبر التواصل مع الإدارة المركزية.",
                contactSupport: "الدعم الفني"
            },
            settings: {
                title: "إعدادات النظام",
                subtitle: "تخصيص بيانات المعهد وإعدادات الأمان.",
                security: {
                    title: "الأمان وتغيير كلمة المرور",
                    newPasswordLabel: "كلمة المرور الجديدة",
                    placeholder: "أدخل كلمة مرور قوية وجديدة...",
                    hint: "تغيير كلمة المرور سيخفي تحذير الأمان.",
                    button: "تغيير كلمة المرور",
                    loading: "جاري التغيير...",
                    success: "تم تغيير كلمة المرور بنجاح! سيختفي تحذير الأمان عند تسجيل الدخول القادم.",
                    error: "حدث خطأ أثناء تغيير كلمة المرور",
                    minLength: "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
                },
                school: {
                    title: "بيانات المعهد",
                    nameAr: "اسم المعهد (عربي)",
                    nameEn: "اسم المعهد (إنجليزي)"
                },
                media: {
                    title: "الصور والتوقيعات",
                    logo: "شعار المعهد",
                    stamp: "الختم الذهبي",
                    signature: "توقيع المدير",
                    noImage: "لا يوجد صورة",
                    upload: "رفع صورة"
                },
                save: "حفظ الإعدادات",
                saving: "جاري الحفظ...",
                success: "تم حفظ الإعدادات بنجاح!",
                error: "حدث خطأ أثناء حفظ الإعدادات. يرجى المحاولة مرة أخرى.",
                loading: "جاري تحميل الإعدادات...",
                billing: {
                    title: "الفوترة والاشتراك",
                    status: "حالة الحساب",
                    balance: "الرصيد المستحق",
                    expiry: "تاريخ انتهاء الخدمة",
                    message: "رسائل من إدارة المنصة",
                    payNow: "كيفية الدفع",
                    payMsg: "لتسوية رصيدك، يرجى التواصل مع إدارة المنصة أو اتباع تعليمات البنك الموضحة في الرسالة أعلاه.",
                    active: "خدمة نشطة",
                    expired: "الخدمة منتهية",
                    free: "الخطة المجانية",
                    paid: "الخطة المميزة",
                    credits: "الرصيد المتبقي",
                    studentCount: "عدد الطلاب",
                    paymentModal: {
                        secureHeader: "بوابة دفع آمنة",
                        currBalance: "الرصيد الحالي",
                        svcExpiry: "انتهاء الخدمة",
                        amountLabel: "مبلغ الدفع ($)",
                        renewLabel: "تجديد لمدة (أشهر)",
                        confirmBtn: "تأكيد الدفع",
                        mockNote: "* هذا دفع تجريبي لأغراض العرض فقط.",
                        month: "شهر",
                        months: "أشهر"
                    }
                },
                grading: {
                    title: "نظام الدرجات والتقييم",
                    subtitle: "تحديد أعمدة مخصصة لدرجات الطلاب والامتحانات.",
                    addColumn: "إضافة عمود",
                    columnName: "اسم العمود",
                    maxMarks: "الدرجة القصوى",
                    type: "النوع",
                    actions: "إجراءات",
                    number: "رقم",
                    text: "نص",
                    confirmDelete: "هل أنت متأكد من حذف هذا العمود؟ قد يتم فقدان بيانات المواد المرتبطة بهذا العمود."
                }
            },
            attendance: {
                title: "إدارة الحضور والغياب",
                subtitle: "تتبع حضور الطلاب اليومي",
                recordBtn: "تسجيل",
                reportsBtn: "التقارير",
                monthlyBtn: "العرض الشهري",
                selectDate: "اختر التاريخ",
                session: {
                    label: "الفترة",
                    morning: "الصباحية",
                    afternoon: "المسائية"
                },
                selectClass: "اختر المستوى",
                prevDay: "اليوم السابق",
                nextDay: "اليوم التالي",
                selectMonth: "اختر الشهر",
                markAllPresent: "تحديد الكل حاضر",
                markAllAbsent: "تحديد الكل غائب",
                saveAttendance: "حفظ الكشف",
                summary: {
                    total: "إجمالي الطلاب",
                    present: "حضور",
                    absent: "غياب",
                    late: "متأخر"
                },
                table: {
                    name: "اسم الطالب",
                    id: "المعرف",
                    status: "الحالة",
                    notes: "ملاحظات"
                },
                status: {
                    present: "حاضر",
                    absent: "غائب",
                    late: "متأخر",
                    excused: "بعذر"
                },
                reports: {
                    title: "تقارير الحضور",
                    student: "الطالب",
                    total: "الإجمالي",
                    present: "حضور",
                    absent: "غياب",
                    rate: "النسبة",
                    period: "الفترة",
                    generate: "توليد التقرير",
                    export: "تصدير"
                },
                messages: {
                    saveSuccess: "تم حفظ الحضور بنجاح!",
                    saveError: "فشل في حفظ الحضور",
                    pdfError: "فشل في إنشاء ملف PDF",
                    xlsxError: "مكتبة XLSX غير محملة"
                },
                bulk: {
                    allPresent: "حاضر للكل",
                    allAbsent: "غائب للكل"
                }
            },
            pwa: {
                title: "تحميل تطبيق درجات الطلاب — (DHAQ DHAQAAQA ARDAYGA DAGSO)",
                subtitle: "وصول سريع وآمن",
                description: "قم بتثبيت التطبيق للوصول السريع إلى التحقق من الشهادات ودرجات الطلاب.",
                installBtn: "تثبيت التطبيق",
                notNow: "ليس الآن",
                iosTitle: "تثبيت على iOS",
                iosInstructions: "اضغط على زر المشاركة، ثم اختر إضافة إلى الشاشة الرئيسية",
                offlineAccess: "الوصول بدون إنترنت",
                fastSecure: "سريع وآمن",
                freeDownload: "تحميل مجاني"
            },
            pdf: {
                certificateTitle: "شهادة الطالب الشهرية",
                attendanceTitle: "تقرير حضور الطالب الشهري",
                studentName: "اسم الطالب",
                studentId: "رقم الطالب",
                level: "المستوى",
                academicYear: "العام الدراسي",
                subject: "المادة",
                fullMarks: "الدرجة الكاملة",
                studentMarks: "درجة الطالب",
                result: "النتيجة",
                total: "المجموع",
                percentage: "النسبة المئوية",
                finalResult: "النتيجة النهائية",
                signature: "توقيع الإدارة",
                date: "التاريخ",
                stamp: "الختم الرسمي",
                presentDays: "أيام الحضور",
                absentDays: "أيام الغياب",
                avgRate: "متوسط الحضور",
                recordedDate: "تاريخ الإصدار",
                noNotes: "لا توجد ملاحظات",
                historyTitle: "سجل الحضور الشهري",
                monthSelect: "اختر الشهر",
                present: "حاضر",
                absent: "غائب",
                totalDays: "إجمالي الأيام",
                avgAttendance: "متوسط الحضور",
                totalAbsences: "إجمالي الغيابات"
            }
        }
    },
    so: {
        translation: {
            nav: {
                home: "Hoyga",
                verify: "Hubi Shahaadada",
                admin: "Albaabka Maamulka",
                dashboard: "Xogta Maamulka",
                students: "Ardayda & Darajooyinka",
                attendance: "Imaanshiyaha",
                settings: "Habsami u socodka",
                logout: "Ka Bax",
                backToHome: "Ku laabo Hoyga",
                superPanel: "Xogta Super",
                superAdmin: "Maamulaha Guud",
                attendanceRecord: "Diiwaanka Imaanshiyaha ee Bisha",
                selectMonth: "Dooro Bisha:",
                presentDays: "Maalmaha Joogay",
                absentDays: "Maalmaha Maqnaa",
                noAttendance: "Lama helin wax diiwaan imaansho ah bisha {{month}}",
                sessions: {
                    morning: "Subax",
                    afternoon: "Galab"
                },
                status: {
                    present: "Jooga",
                    absent: "Ma Joogo"
                }
            },
            common: {
                certificateSystem: "Nidaamka Shahaadooyinka",
                instituteName: "Aqooni",
                qahi: "AQD",
                digitalCertificateSystem: "Nidaamka Shahaadada Digital-ka",
                edit: "Wax ka beddel",
                save: "Keydi",
                cancel: "Ka noqo",
                subjects: {
                    tafsir: "Tafsiir",
                    sira: "Siirada",
                    hadith: "Xadiis",
                    reading: "Akhris & Qoris",
                    fiqh: "Fiqi",
                    arabic: "Luuqadda Carabiga",
                    adhkar: "Adkaar",
                    math: "Xisaab",
                    somali: "Luuqadda Soomaaliga"
                }
            },
            home: {
                publicPortal: "Albaabka Hubinta Shahaadada",
                title: "Xaqiijinta Sugnaanta Shahaadada",
                subtitle: "Gali koodhka shahaadada si aad u hubiso ansaxnimadeeda iyo faahfaahinteeda rasmiga ah.",
                placeholder: "Gali Koodhka Shahaadada (tusaale: AQD-2024-001)",
                verifyBtn: "Hubi Hadda",
                features: {
                    secure: "Aamin & La Hubin karo",
                    instant: "Natiijooyin Degdeg ah",
                    official: "Aqoonsi Rasmi ah"
                },
                errorNotFound: "Lama helin nambarka ardayga. Fadlan xaqiiji oo isku day mar kale.",
                errorSystem: "Cillad habka ah. Fadlan isku day mar kale.",
                newSearch: "Baaris Cusub",
                downloadPDF: "Soo deji Shahaadada PDF"
            },
            dashboard: {
                title: "Xogta Maamulka",
                subtitle: "Dulmarka guud ee nidaamka shahaadooyinka",
                totalStudents: "Wadar Ardayda",
                passedStudents: "Shahaadooyinka Gudbay",
                recentVerifications: "Xaqiijinta (24h)",
                systemStatus: "Xaaladda Nidaamka",
                verificationPortal: "Albaabka Xaqiijinta",
                database: "Keydka Macluumaadka",
                online: "Online",
                offline: "Offline"
            },
            students: {
                title: "Diiwaanka Ardayda",
                subtitle: "Maamul darajooyinka iyo shahaadooyinka",
                addStudent: "Ku dar Arday",
                exportExcel: "Excel u Bedel",
                importExcel: "Excel ka keen",
                importing: "Soo ururinaya...",
                searchPlaceholder: "Ku raadi magac ama ID...",
                table: {
                    name: "Magaca Ardayga",
                    id: "ID-ga Ardayga",
                    level: "Heerka",
                    result: "Natiijada",
                    actions: "Waxqabad"
                },
                modal: {
                    addTitle: "Ku dar Arday Cusub",
                    editTitle: "Wax ka bedel Ardayga",
                    studentIdAuto: "ID-ga Ardayga (Auto)",
                    studentName: "Magaca Ardayga",
                    level: "Heerka",
                    academicYear: "Sannad Waxbarasho",
                    subjectsTitle: "Dhibcaha Maadooyinka",
                    addSubject: "Ku dar Maaddo",
                    table: {
                        subject: "Maaddo",
                        fullMarks: "Dhibcaha Buuxa",
                        studentMarks: "Dhibcaha Ardayga",
                        result: "Natiijada",
                        delete: "Tirtir"
                    },
                    footer: {
                        total: "Wadar dhibcaha",
                        percentage: "Boqolleyda",
                        save: "Keydi Macluumaadka",
                        cancel: "Jooji"
                    }
                },
                messages: {
                    deleteConfirm: "Ma hubtaa inaad tirtirto diiwaankan ardayga? Ficilkan lagama noqon karo.",
                    deleteSuccess: "Diiwaanka ardayga si guul leh ayaa loo tirtiray.",
                    deleteError: "Khalad: Aqoonsiga ardayga lama helin",
                    saveSuccess: "Xogta ardayga si guul leh ayaa loo keydiyay.",
                    saveError: "Waa ku guuldareysatay in la keydiyo xogta ardayga.",
                    noRecords: "Lama helin wax diiwaan ah oo la dhoofiyo.",
                    importErrorHeader: "Khalad: Lama heli karo tiirka",
                    foundHeaders: "Madaxyada laga helay faylka",
                    checkHeaders: "Fadlan hubi in madaxyada tiirarkaaga ay isku mid yihiin.",
                    importSuccess: "Soo dejinta waa dhammaatay! {{count}} diiwaan ayaa lagu daray.",
                    failedRecords: "waxaa ku guuldareystay {{count}} diiwaan",
                    firstError: "Khaladkii ugu horreeyay",
                    importErrorFile: "Khalad baa ka dhacay akhrinta faylka. Hubi qaabka."
                },
                levels: {
                    level1: "Heerka 1-aad",
                    level2: "Heerka 2-aad",
                    level3: "Heerka 3-aad",
                    level4: "Heerka 4-aad",
                    level5: "Heerka 5-aad",
                    level6: "Heerka 6-aad",
                    level7: "Heerka 7-aad",
                    level8: "Heerka 8-aad",
                    level9: "Heerka 9-aad",
                    level10: "Heerka 10-aad",
                    level11: "Heerka 11-aad",
                    level12: "Heerka 12-aad"
                },
                status: {
                    pass: "Gudbay",
                    fail: "Dhacay"
                },
                noRecords: "Wax xog ah lama helin."
            },
            super: {
                title: "Nidaamka Dugsiyada",
                subtitle: "Maamulka guud ee nidaamka iyo xakameynta amniga.",
                createSchool: "Abuur Dugsi Cusub",
                schoolBranch: "Laanta Dugsiga",
                adminStatus: "Heerka Maamulaha",
                status: "Heerka",
                expiry: "Dhicitaanka",
                revenue: "Dakhliga",
                settings: "Habsami u socodka",
                security: {
                    title: "Amniga Nidaamka",
                    changePass: "Beddel Lambarka Sirta ah ee Super Admin",
                    newPass: "Lambar Sir ah oo Cusub",
                    updateBtn: "Cusboonaysii Hadda"
                },
                manage: {
                    adminSecurity: "Amniga Maamulaha",
                    currentAdmin: "Maamulaha Hadda",
                    currentPass: "Lambarka Sirta ah ee Hadda",
                    newPass: "Lambar Sir ah oo Cusub",
                    resetBtn: "Beddel Lambarka Sirta",
                    finance: "Is-diiwaangelinta & Maaliyadda",
                    planType: "Nooca Qorshaha",
                    totalEarned: "Warta Guud ee la Helay",
                    expiresOn: "Adeegga wuxuu dhacayaa",
                    updateSub: "Cusboonaysii Faahfaahinta Is-diiwaangelinta",
                    feeCategory: "Nooca Lacag bixinta",
                    balance: "Haraaga Hadda",
                    paymentNote: "Ogeysiiska Lacag bixinta ee Dugsiga",
                    updateBilling: "Cusboonaysii Biillka & Farriinta"
                },
                messages: {
                    passUpdateSuccess: "Lambarka sirta ah si guul leh ayaa loo cusboonaysiiyay!",
                    passUpdateError: "Waa ku guuldareysatay in la cusboonaysiiyo lambarka sirta ah.",
                    configSaveSuccess: "Habsami u socodka dugsiga si guul leh ayaa loo keydiyay!",
                    configSaveError: "Waa ku guuldareysatay in la keydiyo habsami u socodka.",
                    paymentSuccess: "Waxaa la diiwaangeliyay ${{amount}} waxaana la dheereeyay is-diiwaangelinta {{months}} bilood!",
                    paymentError: "Waa ku guuldareysatay in la diiwaangeliyo lacag bixinta.",
                    adminCreateSuccess: "Koontada maamulaha si guul leh ayaa loo abuuray!",
                    adminCreateError: "Waa ku guuldareysatay in la abuuray koontada.",
                    billingUpdateSuccess: "Xogta biillka iyo ogeysiisyada si guul leh ayaa loo cusboonaysiiyay!",
                    billingUpdateError: "Waa ku guuldareysatay in la cusboonaysiiyo xogta biillka."
                }
            },
            login: {
                title: "Albaabka Maamulka",
                subtitle: "Albaabka Maamulka Dijital ah",
                email: "Cinwaanka Iimaylka",
                password: "Lambarka Sirta ah",
                loginBtn: "Gali",
                forgotPass: "Ma ilaaway Lambarka Sirta ah? (Muuji Lambarka Sirta ah)",
                backHome: "Ku laabo Hoyga Weyn",
                errors: {
                    invalid: "Iimaylka ama lambarka sirta ah waa khaldan yahay",
                    noAccount: "Koontada maamulaha lama helin."
                },
                alerts: {
                    currentPass: "Lambarka sirta ah ee hadda waa:\n\n{{pass}}\n\nFadlan keydi."
                }
            },
            subscription: {
                expiredTitle: "Diiwaangelintu way dhacday",
                expiredSubtitle: "Fadlan cusboonaysii diiwaangelintaada si aad u sii wadato galaangalka dashboard-ka.",
                howToRenew: "Sida loo cusboonaysiiyo",
                renewInstructions: "Waxaad ku cusboonaysiin kartaa diiwaangelintaada bishii ($5) adoo la xiriiraya maamulka dhexe.",
                contactSupport: "Taageerada Farsamada"
            },
            settings: {
                title: "Habaynta Nidaamka",
                subtitle: "Habee macluumaadka dugsiga iyo nidaamka amaanka.",
                security: {
                    title: "Amaanka iyo Bedelka Password-ka",
                    newPasswordLabel: "Password Cusub",
                    placeholder: "Gali password adag oo cusub...",
                    hint: "Beddelidda password-ka waxay meesha ka saaraysaa digniinaha amaanka.",
                    button: "Bedel Password-ka",
                    loading: "Badelaya...",
                    success: "Password-ka si guul leh ayaa loo bedelay! Digniinta amaanku way babi'i doontaa marka xigta ee aad soo gasho.",
                    error: "Khalad ayaa dhacay intii password-ka la bedelayay",
                    minLength: "Password-ku waa inuu ka koobnaado ugu yaraan 6 xaraf"
                },
                school: {
                    title: "Macluumaadka Dugsiga",
                    nameAr: "Magaca Dugsiga (Carabi)",
                    nameEn: "Magaca Dugsiga (Ingiriis)"
                },
                media: {
                    title: "Sawirada iyo Saxiixyada",
                    logo: "Astaanta Dugsiga",
                    stamp: "Stambada Dahabiga ah",
                    signature: "Saxiixa Maamulaha",
                    noImage: "Sawir ma jiro",
                    upload: "Soo geli sawir"
                },
                save: "Keydi Habaynta",
                saving: "Keydinaya...",
                success: "Habaynta si guul leh ayaa loo keydiyay!",
                error: "Khalad ayaa dhacay intii la keydinayay. Fadlan isku day markale.",
                loading: "Soo raraya habaynta...",
                billing: {
                    title: "Bixinta & Is-qorista",
                    status: "Xaaladda Koontada",
                    balance: "Lacagta Kugu Maqan",
                    expiry: "Goorta Adeeggu Dhacayo",
                    message: "Fariimaha Maamulka",
                    payNow: "Sida loo bixiyo",
                    payMsg: "Si aad u bixiso lacagta kugu maqan, fadlan la xiriir maamulka nidaamka ama raac tilmaamaha bangiga ee fariinta kore ku xusan.",
                    active: "Adeeg Shaqaynaya",
                    expired: "Adeeggu waa dhacay",
                    free: "Qorshaha Bilaashka ah",
                    paid: "Qorshaha Premium-ka ah",
                    paymentModal: {
                        secureHeader: "Albaabka Lacag-bixinta ee Sugan",
                        currBalance: "Haraaga Hadda",
                        svcExpiry: "Dhicitaanka Adeegga",
                        amountLabel: "Xaddiga Lacag-bixinta ($)",
                        renewLabel: "U cusboonaysii (Bilood)",
                        confirmBtn: "Xaqiiji Lacag-bixinta",
                        mockNote: "* Tani waa lacag-bixin ku-meel-gaar ah oo ujeedkeedu yahay muujin keliya.",
                        month: "Bil",
                        months: "Bilood"
                    }
                },
                grading: {
                    title: "Habaynta Darajooyinka & Qiimeynta",
                    subtitle: "Qeex tiirar gaar ah oo loogu talagalay dhibcaha ardayda iyo imtixaanada.",
                    addColumn: "Ku dar Tiir",
                    columnName: "Magaca Tiirka",
                    maxMarks: "Dhibcaha ugu badan",
                    type: "Nooca",
                    actions: "Waxqabad",
                    number: "Lambarka",
                    text: "Qoraal",
                    confirmDelete: "Ma hubtaa inaad tirtirto tiirkan? Xogta maadooyinka ee tiirkan waa la waayi karaa.",
                    methodTitle: "Habka Qiimeynta",
                    methodSum: "Dhibcaha",
                    methodAvg: "Boqolkiiba",
                    methodSumDesc: "Natiijada waxaa lagu xisaabinayaa wadarta guud ee dhibcaha.",
                    methodAvgDesc: "Natiijada waxaa lagu xisaabinayaa celceliska (boqolkiiba).",
                    thresholdTitle: "Heerka Gudbitaanka",
                    thresholdDesc: "Dhibcaha ugu yar ee lagu gudbi karo."
                }
            },
            attendance: {
                title: "Maamulka Imaanshiyaha",
                subtitle: "La soco imaanshiyaha maalinlaha ah",
                recordBtn: "Diiwaangeli",
                reportsBtn: "Warbixinnada",
                monthlyBtn: "Muddada Bisha",
                selectDate: "Dooro Taariikhda",
                session: {
                    label: "Xilliga",
                    morning: "Subaxda",
                    afternoon: "Galabta"
                },
                selectClass: "Dooro Fasalka",
                prevDay: "Horay",
                nextDay: "Xiga",
                selectMonth: "Dooro Bisha",
                markAllPresent: "Dhammaan Jooga",
                markAllAbsent: "Dhammaan Maqan",
                saveAttendance: "Keydi Imaanshiyaha",
                summary: {
                    total: "Wadarta Ardayda",
                    present: "Jooga",
                    absent: "Ma Joogo",
                    late: "Soo Daahay"
                },
                table: {
                    name: "Magaca Ardayga",
                    id: "ID",
                    status: "Xaaladda",
                    notes: "Xog"
                },
                status: {
                    present: "Jooga",
                    absent: "Ma Joogo",
                    late: "Wuu Soo Daahay",
                    excused: "Cudurdaar Leh"
                },
                reports: {
                    title: "Warbixinnada Imaanshiyaha",
                    student: "Ardayga",
                    total: "Wadar",
                    present: "Jooga",
                    absent: "Ma Joogo",
                    rate: "Boqolleyda",
                    period: "Xilliga",
                    generate: "Samee Warbixin",
                    export: "Soo saar"
                },
                messages: {
                    saveSuccess: "Imaanshiyaha si guul leh ayaa loo diiwaangeliyay!",
                    saveError: "Wuu ku guuldareystay keydinta imaanshiyaha",
                    pdfError: "Wuu ku guuldareystay samaynta PDF",
                    xlsxError: "Maktabadda XLSX lama helin"
                },
                bulk: {
                    allPresent: "Dh-J",
                    allAbsent: "Dh-M"
                }
            },
            pwa: {
                title: "Dagso App-ka Darajooyinka Ardayda — (DHAQ DHAQAAQA ARDAYGA DAGSO)",
                subtitle: "Si degdeg ah oo ammaan ah",
                description: "Ku rakib app-ka si aad si degdeg ah ugu hesho xaqiijinta shahaadada iyo darajooyinka ardayda.",
                installBtn: "Rakib App-ka",
                notNow: "Hadda maya",
                iosTitle: "Rakibida iOS",
                iosInstructions: "Taabo badhanka Wadaagida, kadibna dooro Ku dar Shaashadda Hoyga",
                offlineAccess: "Gelid La'aan Internet",
                fastSecure: "Degdeg & Ammaan",
                freeDownload: "Soo Dejin Bilaash ah"
            },
            pdf: {
                certificateTitle: "Shahaadada Ardayga ee Bisha",
                attendanceTitle: "Warbixinta Imaanshiyaha ee Bisha",
                studentName: "Magaca Ardayga",
                studentId: "Aqoonsiga(ID) Ardayga",
                level: "Heerka",
                academicYear: "Sannad Dugsiyeedka",
                subject: "Maaddada",
                fullMarks: "Dhibcaha Buuxa",
                studentMarks: "Dhibcaha Ardayga",
                result: "Natiijada",
                total: "Wadar",
                percentage: "Boqolleyda",
                finalResult: "Natiijada kama dambaysta ah",
                signature: "Saxiixa Maamulka",
                date: "Taariikhda",
                stamp: "Stambada Rasmiga ah",
                presentDays: "Maalmaha Joogay",
                absentDays: "Maalmaha Maqnaa",
                avgRate: "Celceliska Imaanshiyaha",
                recordedDate: "Taariikhda la soo saaray",
                noNotes: "Ma jiraan wax xog ah",
                historyTitle: "Taariikhda Imaanshiyaha ee Bisha",
                monthSelect: "Dooro Bisha",
                present: "Jooga",
                absent: "Ma Joogo",
                totalDays: "Wadarta Maalmaha",
                avgAttendance: "Celceliska Imaanshiyaha",
                totalAbsences: "Wadarta Maqnaanshaha"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'ar',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage', 'cookie'],
        },
    });

export default i18n;
