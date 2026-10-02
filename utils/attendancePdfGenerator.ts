import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * Captures a perfectly styled HTML element and generates a PDF from it.
 * Supports both portrait (A4) and landscape (A4) orientations.
 *
 * Key fix: Using html2canvas-pro to support Tailwind CSS v4 oklch() colors.
 *
 * @param elementId - The DOM ID of the hidden template element to capture.
 * @param filename  - The base filename (without .pdf extension).
 * @param lang      - Language code for RTL detection ('ar' = RTL).
 * @param orientation - 'portrait' or 'landscape'.
 * @returns true on success, false on failure.
 */
export const generateAttendancePDF = async (
    elementId: string,
    filename: string,
    lang: string = 'ar',
    orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<boolean> => {
    const element = document.getElementById(elementId);
    if (!element) {
        alert('Attendance report is not available for PDF export.');
        return false;
    }

    // 1. Ensure fonts and images are fully ready
    await document.fonts.ready;
    const images = element.querySelectorAll('img');
    await Promise.all(
        Array.from(images).map((img) =>
            (img as HTMLImageElement).decode().catch(() => { })
        )
    );
    // Brief settling time for the browser layout engine
    await new Promise((resolve) => setTimeout(resolve, 500));

    const isRtl = lang === 'ar';
    const isLandscape = orientation === 'landscape';

    // A4 pixel dimensions at 300 DPI
    const templateW = isLandscape ? 3508 : 2480;
    const templateH = isLandscape ? 2480 : 3508;

    try {
        const canvas = await html2canvas(element, {
            scale: 2, // High-quality 2x resolution
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: '#ffffff',
            width: templateW,
            height: templateH,
            windowWidth: templateW,
            windowHeight: templateH,
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDoc: Document) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    // Override any hiding/size styles so html2canvas captures correctly
                    clonedElement.style.display = 'block';
                    clonedElement.style.position = 'fixed';
                    clonedElement.style.top = '0';
                    clonedElement.style.left = '0';
                    clonedElement.style.width = `${templateW}px`;
                    clonedElement.style.height = `${templateH}px`;
                    clonedElement.style.margin = '0';
                    clonedElement.style.padding = '0';
                    clonedElement.style.overflow = 'hidden';
                    clonedElement.style.direction = isRtl ? 'rtl' : 'ltr';
                    clonedElement.style.transform = 'none';
                    clonedElement.style.opacity = '1';
                    clonedElement.style.zIndex = '999999';

                    // Force all images in the clone to use CORS correctly
                    const clonedImages = clonedElement.querySelectorAll('img');
                    clonedImages.forEach((img) => {
                        img.setAttribute('crossOrigin', 'anonymous');
                        if (img.src && !img.src.startsWith('data:')) {
                            const separator = img.src.includes('?') ? '&' : '?';
                            img.src = `${img.src}${separator}cors_bust=${Date.now()}`;
                        }
                    });
                }
            },
        });

        // Convert canvas to a lossless PNG (high quality)
        const imgData = canvas.toDataURL('image/png');

        const doc = new jsPDF({
            orientation: isLandscape ? 'l' : 'p',
            unit: 'mm',
            format: 'a4',
            compress: false, // Maximum quality, no compression
        });

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();

        // Fit image exactly to page bounds (lossless PNG)
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        
        doc.save(`${filename}.pdf`);
        return true;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Tainted')) {
            alert(
                'Security Error: Unable to export PDF due to cross-origin images.'
            );
        } else {
            console.error('Attendance PDF Generation failed:', error);
            alert('Unexpected Error: ' + (error as Error).message);
        }
        return false;
    }
};
