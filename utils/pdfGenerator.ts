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
      // CRITICAL: Force capture dimensions and positions to A4
      width: 2480,
      height: 3508,
      windowWidth: 2480, 
      windowHeight: 3508,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      allowTaint: true,
      onclone: (clonedDoc: Document) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Reset positioning styles to ensure it fits the capture window perfectly
          clonedElement.style.transform = 'none';
          clonedElement.style.margin = '0';
          clonedElement.style.padding = '0';
          clonedElement.style.width = '2480px';
          clonedElement.style.height = '3508px';
          clonedElement.style.display = 'block';
          clonedElement.style.direction = 'rtl';
          clonedElement.style.overflow = 'visible'; // Ensure nothing is hidden
          
          // --- FIX FOR DISCONNECTED ARABIC LETTERS ---
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el: any) => {
             el.style.letterSpacing = 'normal';
             el.style.fontVariantLigatures = 'common-ligatures';
             el.style.fontFeatureSettings = '"liga" 1, "dlig" 1';
             
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

    const imgData = canvas.toDataURL('image/jpeg', 0.90);
    
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
    doc.save(`${student.studentId}_Certificate.pdf`);

  } catch (error) {
    console.error("PDF Generation failed:", error);
    alert("حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.");
  }
};