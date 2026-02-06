import React from 'react';
import { Student, CertificateConfig } from '../types';
import { useTranslation } from 'react-i18next';

interface TemplateProps {
    student: Student;
    config: CertificateConfig;
    getLevelLabel: (level: string) => string;
    getSubjectLabel: (name: string) => string;
    onSelect?: (id: string, type: 'cell' | 'text') => void;
    selectedId?: string | null;
    useCustomColors?: boolean;
}

// Reusable Standard Layout Component matching the requested design
const StandardTableTemplate: React.FC<TemplateProps & { theme: any, variant?: 'default' | 'modern' | 'classic' }> = ({
    student, config, getLevelLabel, getSubjectLabel, theme, variant = 'default', onSelect, selectedId
}) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    // Safe Grade Calculation
    const getStatus = (marks: number | string) => {
        const m = Number(marks);
        // Default to 50 if passThreshold is not set or invalid
        let passThreshold = Number(config.passThreshold);
        if (isNaN(passThreshold)) passThreshold = 50;

        // Return translated status
        return m < passThreshold ? t('students.status.fail') : t('students.status.pass');
    };

    const getStatusColor = (resultStr: string, marks: number | string) => {
        // 1. TRUST THE RECORD (Respect Translation Color)
        // Support all three languages: English, Arabic, Somali
        const lower = resultStr?.toLowerCase()?.trim() || '';

        // Pass keywords: English (pass/passed), Arabic (ناجح), Somali (gudbay/gudbey)
        if (['pass', 'ناجح', 'gudbay', 'passed', 'gudbey'].includes(lower)) return 'text-emerald-600';

        // Fail keywords: English (fail/failed), Arabic (راسب), Somali (dhacay/dhacday)
        if (['fail', 'راسب', 'dhacay', 'failed', 'dhacday'].includes(lower)) return 'text-red-500';

        // 2. Fallback to Marks Calculation if no recognized keyword
        const m = Number(marks);
        if (isNaN(m)) return 'text-slate-900'; // Neutral if unknown

        let passThreshold = Number(config.passThreshold);
        if (isNaN(passThreshold)) passThreshold = 50;

        // Return green for pass (>= threshold), red for fail (< threshold)
        return m < passThreshold ? 'text-red-500' : 'text-emerald-600';
    };

    const getFinalGrade = (percentage: number) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        return 'D';
    };

    const getTranslatedResult = (resultStr: string, marks: number | string) => {
        // 1. TRUST THE RECORD (Follow Student Grades)
        // Check if there is an explicit result string first
        // Support all three languages: English, Arabic, Somali
        const lower = resultStr?.toLowerCase()?.trim() || '';

        // Pass keywords: English (pass/passed), Arabic (ناجح), Somali (gudbay/gudbey)
        if (['pass', 'ناجح', 'gudbay', 'passed', 'gudbey'].includes(lower)) return t('students.status.pass');

        // Fail keywords: English (fail/failed), Arabic (راسب), Somali (dhacay/dhacday)
        if (['fail', 'راسب', 'dhacay', 'failed', 'dhacday'].includes(lower)) return t('students.status.fail');

        // 2. Fallback: Calculate dynamically if no valid string found
        const m = Number(marks);
        if (!isNaN(m)) {
            return getStatus(m);
        }

        // 3. Fallback to original string
        return resultStr;
    }

    const getElementProps = (id: string, baseClasses: string) => {
        const isSelected = selectedId === id;
        return {
            id,
            className: `${baseClasses} cursor-pointer transition-all duration-200 ${isSelected
                ? 'ring-4 ring-orange-500 ring-inset bg-orange-50 z-10 relative'
                : 'hover:bg-slate-50/80'
                }`,
            onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect?.(id, 'cell');
            }
        };
    };

    return (
        <div className="w-full h-full bg-white p-[100px] flex flex-col font-amiri relative overflow-hidden text-slate-900 border-[16px] border-double rounded-[48px]"
            style={{ borderColor: `${theme.primary}20` }}>

            {/* Header Section */}
            <header className="flex flex-col items-center text-center mb-10 pt-4">
                {/* School Logo */}
                {config.logoUrl && (
                    <img src={config.logoUrl} className="h-32 object-contain mb-6" alt="School Logo" />
                )}

                <h1 className="text-[72px] font-black mb-2 leading-tight font-amiri" style={{ color: theme.primary }}>
                    {config.schoolName}
                </h1>
                <h2 className="text-[36px] font-bold uppercase tracking-wide font-cairo text-[#ea580c]">
                    {config.schoolNameEn}
                </h2>

                {/* Decorative Divider */}
                <div className="flex items-center gap-4 mt-4 opacity-60">
                    <div className="h-[2px] w-[200px]" style={{ background: `linear-gradient(to left, ${theme.primary}, transparent)` }}></div>
                    <div className="w-3 h-3 rotate-45" style={{ backgroundColor: theme.secondary }}></div>
                    <div className="h-[2px] w-[200px]" style={{ background: `linear-gradient(to right, ${theme.primary}, transparent)` }}></div>
                </div>
            </header>

            {/* Student Info Grid */}
            <div className="rounded-3xl p-10 mb-12 border border-slate-100 bg-[#f8fafc]/50 relative overflow-hidden"
                style={{ backgroundColor: `${theme.primary}05` }}>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-20"
                    style={{ backgroundColor: theme.primary }}></div>

                <div className="grid grid-cols-2 gap-x-24 gap-y-10 relative z-10">
                    <div className="flex flex-col border-b border-slate-200 pb-2 text-center">
                        <span className="text-[36px] font-bold font-cairo mb-2" style={{ color: theme.primary }}>{t('pdf.studentName')} :</span>
                        <span className="text-[56px] font-black leading-none">{student.fullName}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-200 pb-2 text-center">
                        <span className="text-[36px] font-bold font-cairo mb-2" style={{ color: theme.primary }}>{t('pdf.studentId')} :</span>
                        <span className="text-[56px] font-black font-cairo leading-none uppercase text-[#ea580c]">{student.studentId}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-200 pb-2 text-center">
                        <span className="text-[36px] font-bold font-cairo mb-2" style={{ color: theme.primary }}>{t('pdf.level')} :</span>
                        <span className="text-[56px] font-bold leading-none">{getLevelLabel(student.classLevel)}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-200 pb-2 text-center">
                        <span className="text-[36px] font-bold font-cairo mb-2" style={{ color: theme.primary }}>{t('pdf.academicYear')} :</span>
                        <span className="text-[56px] font-bold font-cairo leading-none">{student.academicYear || new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>

            {/* Grades Table */}
            <div className="flex-1 mb-[60px] flex flex-col">
                <table className="w-full h-full border-collapse">
                    <thead>
                        <tr className="text-white text-[38px] font-black font-cairo text-center">
                            <th className={`py-5 px-8 text-center ${isRtl ? 'rounded-tr-2xl' : 'rounded-tl-2xl'}`}
                                style={{ backgroundColor: theme.primary }}>
                                {t('subject') || 'Subject'}
                            </th>
                            {config.assessmentColumns && config.assessmentColumns.length > 0 ? (
                                <>
                                    {config.assessmentColumns.map(col => (
                                        <th key={col.id} className="py-5 px-4 border-s border-white/20" style={{ backgroundColor: theme.primary }}>
                                            <div className="flex flex-col">
                                                <span>{col.name}</span>
                                                <span className="text-[18px] opacity-60">({col.maxMarks})</span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="py-5 px-4 w-[180px] border-s border-white/20" style={{ backgroundColor: theme.primary }}>
                                        {t('pdf.total')}
                                    </th>
                                </>
                            ) : (
                                <>
                                    <th className="py-5 px-4 w-[200px] border-s border-white/20" style={{ backgroundColor: theme.primary }}>
                                        {t('pdf.fullMarks')}
                                    </th>
                                    <th className="py-5 px-4 w-[200px] border-s border-white/20" style={{ backgroundColor: theme.primary }}>
                                        {t('pdf.studentMarks')}
                                    </th>
                                </>
                            )}
                            <th className={`py-5 px-8 w-[220px] border-s border-white/20 ${isRtl ? 'rounded-tl-2xl' : 'rounded-tr-2xl'}`}
                                style={{ backgroundColor: theme.primary }}>
                                {t('result') || 'Result'}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-[40px] font-bold">
                        {student.subjects.map((sub, idx) => (
                            <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors">
                                <td {...getElementProps(`cell-${idx}-name`, `py-5 px-8 border-x border-slate-100 uppercase text-center`)}>
                                    {getSubjectLabel(sub.name)}
                                </td>
                                {config.assessmentColumns && config.assessmentColumns.length > 0 ? (
                                    <>
                                        {config.assessmentColumns.map(col => (
                                            <td key={col.id} {...getElementProps(`cell-${idx}-${col.id}`, "py-5 px-4 border-x border-slate-100 text-center font-cairo text-slate-600")}>
                                                {/* Robust lookup: Try ID, then Name fallback */}
                                                {sub.assessments?.[col.id] ?? sub.assessments?.[col.name] ?? 0}
                                            </td>
                                        ))}
                                        <td {...getElementProps(`cell-${idx}-total`, "py-5 px-4 border-x border-slate-100 text-center font-black font-cairo text-slate-900 text-[38px]")}>
                                            {sub.studentMarks}
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td {...getElementProps(`cell-${idx}-fullMarks`, "py-5 px-4 border-x border-slate-100 text-center text-slate-400 font-cairo")}>
                                            100
                                        </td>
                                        <td {...getElementProps(`cell-${idx}-marks`, "py-5 px-4 border-x border-slate-100 text-center font-black font-cairo text-slate-900 text-[42px]")}>
                                            {sub.studentMarks}
                                        </td>
                                    </>
                                )}
                                <td {...getElementProps(`cell-${idx}-result`, `py-5 px-8 border-x border-slate-100 text-center font-black font-cairo ${getStatusColor(sub.result, sub.studentMarks)}`)}>
                                    {getTranslatedResult(sub.result, sub.studentMarks)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Summary & Signature */}
            <div className="flex justify-between items-end mb-32">

                {/* Consolidated Result Box */}
                <div className="border-[3px] rounded-3xl overflow-hidden flex shadow-sm" style={{ borderColor: theme.primary }}>
                    <div className="px-10 py-6 flex flex-col items-center min-w-[180px] bg-white border-r-2" style={{ borderColor: `${theme.primary}20` }}>
                        <span className="text-[32px] font-bold opacity-60 uppercase font-cairo mb-2" style={{ color: theme.primary }}>{t('pdf.total')}</span>
                        <span className="text-[60px] font-black font-cairo leading-none text-slate-900">{student.total}</span>
                    </div>
                    <div className="px-10 py-6 flex flex-col items-center min-w-[180px] bg-white border-r-2" style={{ borderColor: `${theme.primary}20` }}>
                        <span className="text-[36px] font-bold opacity-60 uppercase font-cairo mb-2" style={{ color: theme.primary }}>{t('pdf.percentage')}</span>
                        <span className="text-[72px] font-black font-cairo leading-none text-slate-900">{student.percentage}%</span>
                    </div>
                    <div className="px-12 py-6 flex flex-col items-center min-w-[240px] text-white" style={{ backgroundColor: theme.primary }}>
                        <span className="text-[32px] font-bold opacity-80 uppercase font-cairo mb-2">{t('pdf.finalResult')}</span>
                        <span className="text-[60px] font-black font-cairo leading-none">
                            {/* Try to parse final result string or use percentage */}
                            {getTranslatedResult(student.finalResult || '', student.percentage)}
                        </span>
                    </div>
                </div>

                {/* Signature Block */}
                <div className="text-center">
                    <div className="h-[25px] flex items-end justify-center mb-0">
                        <span className="text-[28px] font-bold font-cairo text-slate-800">{new Date().toLocaleDateString()}</span>
                    </div>
                    <p className="text-[24px] font-bold uppercase font-cairo mb-8" style={{ color: theme.primary }}>{t('pdf.recordedDate')}</p>

                    <div className="h-[80px] flex items-end justify-center mb-2">
                        {config.managerSignatureUrl && (
                            <img src={config.managerSignatureUrl} className="h-full object-contain" alt="Sig" />
                        )}
                    </div>
                    <p className="text-[30px] font-bold uppercase font-cairo opacity-80" style={{ color: theme.primary }}>{t('pdf.signature')}</p>
                </div>
            </div>

            {/* Simple Bottom Line */}
            <div className="h-[6px] w-full rounded-full opacity-20" style={{ backgroundColor: theme.primary }} />
        </div>
    );
};


/* --- 12 Variants using specific color palettes --- */

export const TEMPLATE_DESIGNS = {
    template1: { primary: '#5b21b6', secondary: '#ea580c', text: '#0f172a' },
    template2: { primary: '#1e3a8a', secondary: '#1e40af', text: '#0f172a' },
    template3: { primary: '#065f46', secondary: '#047857', text: '#064e3b' },
    template4: { primary: '#9f1239', secondary: '#be123c', text: '#881337' },
    template5: { primary: '#334155', secondary: '#475569', text: '#1e293b' },
    template6: { primary: '#4338ca', secondary: '#6366f1', text: '#312e81' },
    template7: { primary: '#0f766e', secondary: '#0d9488', text: '#134e4a' },
    template8: { primary: '#c2410c', secondary: '#ea580c', text: '#7c2d12' },
    template9: { primary: '#854d0e', secondary: '#a16207', text: '#451a03' },
    template10: { primary: '#172554', secondary: '#1e3a8a', text: '#020617' },
    template11: { primary: '#14532d', secondary: '#166534', text: '#052e16' },
    template12: { primary: '#701a75', secondary: '#86198f', text: '#4a044e' },
};

const CertificateTemplates: React.FC<TemplateProps> = (props) => {
    const { config, useCustomColors = true } = props;
    const templateId = (config.templateId || 'template1') as keyof typeof TEMPLATE_DESIGNS;
    const defaults = TEMPLATE_DESIGNS[templateId] || TEMPLATE_DESIGNS.template1;

    // Use custom colors ONLY if useCustomColors is true
    const theme = useCustomColors ? {
        primary: config.primaryColor || defaults.primary,
        secondary: config.secondaryColor || defaults.secondary,
        text: config.textColor || defaults.text
    } : defaults;

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <StandardTableTemplate {...props} theme={theme} />
        </div>
    );
};

export default CertificateTemplates;
