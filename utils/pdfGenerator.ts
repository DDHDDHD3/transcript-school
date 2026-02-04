import { Student } from '../types';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

export const generateCertificatePDF = async (student: Student, elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // 1. Ensure fonts are fully loaded to prevent text splitting
  await document.fonts.ready;

  // 2. Wait for layout and images (especially the logo) to be fully ready
  const images = element.querySelectorAll('img');
  await Promise.all(Array.from(images).map(img => (img as HTMLImageElement).decode().catch(() => { })));

  // 3. Brief cooling period for browser layout engine
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { jsPDF } = window.jspdf;
  const html2canvas = window.html2canvas;

  try {
    // CAPTURE PHASE: Forces a high-fidelity 300DPI snapshot
    const canvas = await html2canvas(element, {
      scale: 1, // Use explicit 1:1 scale for our fixed pixel dimensions
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 2480,
      height: 3508,
      windowWidth: 2480,
      windowHeight: 3508,
      scrollX: 0,
      scrollY: 0,
      allowTaint: true,
      onclone: (clonedDoc: Document) => {
        const originalDir = element.getAttribute('dir') || 'rtl';
        const clonedElement = clonedDoc.getElementById(elementId);

        if (clonedElement) {
          clonedElement.style.position = 'fixed';
          clonedElement.style.top = '0';
          clonedElement.style.left = '0';
          clonedElement.style.margin = '0';
          clonedElement.style.padding = '0';
          clonedElement.style.transform = 'none';
          clonedElement.style.width = '2480px';
          clonedElement.style.height = '3508px';
          clonedElement.style.display = 'block';
          clonedElement.style.overflow = 'hidden';
          clonedElement.style.zIndex = '999999';
          clonedElement.setAttribute('dir', originalDir);

          // --- FIX FOR DISCONNECTED ARABIC LETTERS & FONT STABILITY ---
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el: any) => {
            el.style.letterSpacing = 'normal';
            el.style.textShadow = 'none';
            el.style.lineHeight = '1.4';
            if (['H1', 'H2', 'P', 'SPAN', 'TD', 'TH', 'DIV'].includes(el.tagName)) {
              el.style.fontFamily = '"Amiri", "Noto Naskh Arabic", serif';
            }
          });

          void clonedElement.offsetHeight;
        }
      }
    });

    // RENDER PHASE: Convert to high-quality image format
    const imgData = canvas.toDataURL('image/png'); // Use PNG for better alignment/rotation compatibility

    // PDF ASSEMBLY: Strict Portrait A4
    const doc = new jsPDF({
      orientation: 'p', // Lock to 'Portrait'
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16 // Better precision for positioning
    });

    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    // Fit to page perfectly
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    // EXPORT: Save as file
    doc.save(`${student.studentId}_Certificate.pdf`);

  } catch (error) {
    console.error("PDF Generation failed:", error);
    alert("حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.");
  }
};