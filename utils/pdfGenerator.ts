import { Student } from '../types';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

export const generateCertificatePDF = async (student: Student, elementId: string) => {
  // 1. Ensure fonts are fully loaded to prevent text splitting
  await document.fonts.ready;

  // 2. Wait a brief moment for any layout shifts
  await new Promise(resolve => setTimeout(resolve, 500));

  const element = document.getElementById(elementId);
  if (!element) return;

  const { jsPDF } = window.jspdf;
  const html2canvas = window.html2canvas;

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High quality scale
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',

      // CRITICAL: Dimensions match A4 300DPI exactly
      width: 2480,
      height: 3508,
      windowWidth: 2480,
      windowHeight: 3508,
      scrollX: 0,
      scrollY: 0,
      allowTaint: true,
      onclone: (clonedDoc: Document) => {
        // Get the original element's direction before cloning
        const originalDir = element.getAttribute('dir') || 'rtl';

        // Reset document to neutral state for proper capture
        clonedDoc.documentElement.style.overflow = 'hidden';
        clonedDoc.documentElement.style.margin = '0';
        clonedDoc.documentElement.style.padding = '0';
        clonedDoc.body.style.margin = '0';
        clonedDoc.body.style.padding = '0';
        clonedDoc.body.style.overflow = 'hidden';
        clonedDoc.body.style.width = '2480px';
        clonedDoc.body.style.height = '3508px';
        clonedDoc.body.style.position = 'relative';

        // Locate the element in the clone
        const clonedElement = clonedDoc.getElementById(elementId);

        if (clonedElement) {
          // Move it to the very top of body to avoid any parent constraints
          clonedDoc.body.innerHTML = '';
          clonedDoc.body.appendChild(clonedElement);

          // Force styles for perfect A4 capture - KEEP ORIGINAL DIRECTION
          clonedElement.style.position = 'absolute';
          clonedElement.style.left = '0px';
          clonedElement.style.top = '0px';
          clonedElement.style.right = 'auto';
          clonedElement.style.margin = '0';
          clonedElement.style.padding = '0';
          clonedElement.style.boxSizing = 'border-box';
          clonedElement.style.transform = 'none';
          clonedElement.style.width = '2480px';
          clonedElement.style.height = '3508px';
          clonedElement.style.maxHeight = '3508px';
          clonedElement.style.zIndex = '9999';
          clonedElement.style.display = 'block';
          clonedElement.style.overflow = 'hidden';
          clonedElement.style.background = '#ffffff';
          // Preserve original direction for proper text rendering
          clonedElement.setAttribute('dir', originalDir);
          clonedElement.style.direction = originalDir;

          // --- FIX FOR DISCONNECTED ARABIC LETTERS ---
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el: any) => {
            el.style.letterSpacing = 'normal';

            // Ensure correct font family for Arabic elements
            if (['H1', 'H2', 'P', 'SPAN', 'TD', 'TH', 'DIV'].includes(el.tagName)) {
              const computed = window.getComputedStyle(el);
              const fontFamily = computed.fontFamily;
              // Only override if it's not explicitly set to one of our headers
              if (!fontFamily.includes('Cairo') && !fontFamily.includes('Almarai') && !fontFamily.includes('Scheherazade')) {
                el.style.fontFamily = '"Amiri", "Noto Naskh Arabic", serif';
              }
            }
          });
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // A4 Portrait: 210mm x 297mm
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Safety check: Remove any extra pages if generated (Reverse loop is safer)
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = totalPages; i > 1; i--) {
      doc.deletePage(i);
    }

    doc.save(`${student.studentId}_Certificate.pdf`);

  } catch (error) {
    console.error("PDF Generation failed:", error);
    alert("حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.");
  }
};