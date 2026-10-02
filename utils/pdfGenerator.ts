import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { Student } from '../types';

/**
 * Captures the element with `elementId` and renders it as a portrait A4 PDF.
 *
 * Key fix: Using html2canvas-pro to support Tailwind CSS v4 oklch() colors.
 */
export const generateCertificatePDF = async (student: Student, elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Certificate view is not currently available for PDF export.');
    return false;
  }

  // 1. Wait for web-fonts (prevents invisible/broken Arabic text)
  await document.fonts.ready;

  // 2. Wait for every <img> to finish decoding
  const images = element.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map((img) =>
      (img as HTMLImageElement).decode().catch(() => {})
    )
  );

  // 3. Brief cooldown for the browser layout engine to settle
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Detect RTL — walk up the DOM to find the nearest dir attribute
  let originalDir = 'rtl';
  let node: HTMLElement | null = element;
  while (node) {
    const dir = node.getAttribute('dir');
    if (dir) { originalDir = dir; break; }
    node = node.parentElement;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High-quality 2x resolution for certificates
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      width: 2480,
      height: 3508,
      windowWidth: 2480,
      windowHeight: 3508,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc: Document) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (!clonedElement) return;

        // ── Reset all interfering CSS ─────────────────────────────────────
        clonedElement.style.position      = 'fixed';
        clonedElement.style.top           = '0';
        clonedElement.style.left          = '0';
        clonedElement.style.margin        = '0';
        clonedElement.style.padding       = '0';
        clonedElement.style.transform     = 'none';
        clonedElement.style.transformOrigin = 'top left';
        clonedElement.style.width         = '2480px';
        clonedElement.style.height        = '3508px';
        clonedElement.style.minWidth      = '2480px';
        clonedElement.style.minHeight     = '3508px';
        clonedElement.style.maxWidth      = '2480px';
        clonedElement.style.maxHeight     = '3508px';
        clonedElement.style.display       = 'block';
        clonedElement.style.overflow      = 'hidden';
        clonedElement.style.opacity       = '1';
        clonedElement.style.visibility    = 'visible';
        clonedElement.style.zIndex        = '999999';
        clonedElement.setAttribute('dir', originalDir);

        // ── Force CORS on all images ──────────────────────────────────────
        clonedElement.querySelectorAll('img').forEach((img) => {
          img.setAttribute('crossOrigin', 'anonymous');
          if (img.src && !img.src.startsWith('data:')) {
            const sep = img.src.includes('?') ? '&' : '?';
            img.src = `${img.src}${sep}cors_bust=${Date.now()}`;
          }
        });

        // ── Arabic font stability ─────────────────────────────────────────
        clonedElement.querySelectorAll<HTMLElement>('*').forEach((el) => {
          el.style.letterSpacing = 'normal';
          el.style.textShadow   = 'none';
          el.style.lineHeight   = '1.4';
          if (['H1', 'H2', 'P', 'SPAN', 'TD', 'TH', 'DIV'].includes(el.tagName)) {
            el.style.fontFamily = '"Amiri", "Noto Naskh Arabic", serif';
          }
        });
      },
    });

    // Convert canvas to a lossless PNG (high quality)
    const imgData = canvas.toDataURL('image/png');

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: false, // Maximum quality, no compression
      floatPrecision: 16,
    });

    const pdfWidth  = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    doc.save(`${student.studentId}_Certificate.pdf`);
    return true;

  } catch (error) {
    if (error instanceof Error && error.message.includes('Tainted')) {
      alert('Security Error: Unable to export PDF due to cross-origin images.');
    } else {
      console.error('Certificate PDF Generation failed:', error);
      alert('PDF Error: ' + (error as Error).message);
    }
    return false;
  }
};
