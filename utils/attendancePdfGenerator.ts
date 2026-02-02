import { Student, AttendanceRecord, AttendanceReport, CertificateConfig } from '../types';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

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

    const { jsPDF } = window.jspdf;
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
export const generateAttendancePDF = async (elementId: string, filename: string, lang: string = 'ar') => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
    const isRtl = lang === 'ar';

    try {
        // Higher scale for crisp text on A4
        const canvas = await html2canvas(element, {
            scale: 2.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc: Document) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    clonedElement.style.display = 'block';
                    clonedElement.style.width = '2480px';
                    clonedElement.style.direction = isRtl ? 'rtl' : 'ltr';

                    const allElements = clonedElement.querySelectorAll('*');
                    allElements.forEach((el: any) => {
                        el.style.letterSpacing = 'normal';
                        if (['H1', 'H2', 'P', 'SPAN', 'TD', 'TH', 'DIV'].includes(el.tagName)) {
                            if (lang === 'ar') {
                                el.style.fontFamily = '"Amiri", "Noto Naskh Arabic", serif';
                            } else {
                                el.style.fontFamily = '"Inter", "Roboto", sans-serif';
                            }
                        }
                    });
                }
            }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();

        const totalHeightInMm = (canvas.height * pdfWidth) / canvas.width;

        // --- SMART FIT LOGIC ---
        if (totalHeightInMm > pdfHeight && totalHeightInMm < pdfHeight * 1.1) {
            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        } else if (totalHeightInMm <= pdfHeight) {
            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, totalHeightInMm);
        } else {
            // Multi-page logic for very long reports
            let heightLeft = totalHeightInMm;
            let position = 0;
            let pageCount = 0;

            while (heightLeft > 0) {
                if (pageCount > 0) {
                    doc.addPage();
                }
                doc.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalHeightInMm);
                heightLeft -= pdfHeight;
                position -= pdfHeight;
                pageCount++;
            }
        }

        doc.save(`${filename}.pdf`);
        return true;
    } catch (error) {
        console.error("Attendance PDF Generation failed:", error);
        return false;
    }
};
