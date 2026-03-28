import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Student, AttendanceRecord, AttendanceReport, CertificateConfig } from '../types';

/**
 * Generates a branded PDF attendance report for a specific student (Parent View)
 */
export const generateStudentAttendancePDF = async (
    student: Student,
    records: AttendanceRecord[],
    config: CertificateConfig,
    monthLabel: string
) => {
    // Ensure fonts are loaded
    await document.fonts.ready;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // 1. Header Branded Section
    // Background Gradient Header (Light)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(0, 0, pageWidth, 50, 'F');

    // School Logo
    if (config.logoUrl) {
        try {
            doc.addImage(config.logoUrl, 'PNG', pageWidth / 2 - 20, 5, 40, 40);
        } catch (e) {
            console.warn("Could not add logo to PDF:", e);
        }
    }

    // School Names (Center)
    doc.setTextColor(91, 33, 182); // qabas-purple
    doc.setFontSize(18);
    // Note: Standard jsPDF doesn't handle RTL Arabic perfectly without plugins.
    // We will use standard text for now, but in a real-world scenario, we'd use html2canvas for complex RTL layouts.
    // For this project, we've been using html2canvas + jsPDF to capture hidden DOM elements for perfect styling.

    // LET'S USE THE HTML2CANVAS APPROACH for perfect branding as seen in Certificate generation.
    // I need to create a hidden element in the DOM to render the report before capturing it.
};

/**
 * Instead of raw jsPDF drawing, we'll follow the pattern that worked for certificates:
 * Capture a perfectly styled HTML element.
 */
export const generateAttendancePDF = async (
    elementId: string, 
    filename: string, 
    lang: string = 'ar',
    orientation: 'portrait' | 'landscape' = 'portrait'
) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // 1. Ensure fonts and images are ready
    await document.fonts.ready;
    const images = element.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => (img as HTMLImageElement).decode().catch(() => { })));
    await new Promise(resolve => setTimeout(resolve, 1000));

    const isRtl = lang === 'ar';
    const isLandscape = orientation === 'landscape';

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: isLandscape ? 3508 : 2480,
            height: isLandscape ? 2480 : 3508,
            onclone: (clonedDoc: Document) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    clonedElement.style.display = 'block';
                    clonedElement.style.position = 'fixed';
                    clonedElement.style.top = '0';
                    clonedElement.style.left = '0';
                    clonedElement.style.width = isLandscape ? '3508px' : '2480px';
                    clonedElement.style.height = isLandscape ? '2480px' : '3508px';
                    clonedElement.style.margin = '0';
                    clonedElement.style.padding = '0';
                    clonedElement.style.direction = isRtl ? 'rtl' : 'ltr';
                    clonedElement.style.transform = 'none';
                    clonedElement.style.zIndex = '999999';
                }
            }
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const doc = new jsPDF({
            orientation: isLandscape ? 'l' : 'p',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();

        // Add to PDF - FORCE SINGLE PAGE by fitting to page bounds
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

        doc.save(`${filename}.pdf`);
        return true;
    } catch (error) {
        console.error("Attendance PDF Generation failed:", error);
        return false;
    }
};
