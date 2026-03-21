"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Capture proposal preview pages from the DOM and export as a PDF.
 * Each [data-proposal-page] element becomes one or more PDF pages.
 *
 * - Uses PNG (lossless) at 3× scale for crisp text and icons
 * - Tall page elements are sliced into multiple A4 pages so nothing is cut off
 * - Temporarily strips margin/shadow/border-radius for clean capture
 */
export async function downloadProposalPdf(
  containerEl: HTMLElement,
  studentName: string,
): Promise<void> {
  const pages = containerEl.querySelectorAll<HTMLElement>("[data-proposal-page]");
  if (pages.length === 0) throw new Error("No proposal pages found");

  // A4 in mm
  const A4_W = 210;
  const A4_H = 297;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let firstPage = true;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    // Save original styles
    const origMargin = page.style.margin;
    const origShadow = page.style.boxShadow;
    const origRadius = page.style.borderRadius;

    // Strip visual chrome for clean capture
    page.style.margin = "0";
    page.style.boxShadow = "none";
    page.style.borderRadius = "0";

    const canvas = await html2canvas(page, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });

    // Restore original styles
    page.style.margin = origMargin;
    page.style.boxShadow = origShadow;
    page.style.borderRadius = origRadius;

    // Full-width image dimensions
    const imgW = A4_W;
    const imgH = A4_W * (canvas.height / canvas.width);

    if (imgH <= A4_H) {
      // Fits in one page
      if (!firstPage) pdf.addPage();
      firstPage = false;
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, imgW, imgH);
    } else {
      // Content taller than A4 — slice into multiple pages
      // Each PDF page shows a horizontal strip of the canvas
      const pxPerMm = canvas.width / A4_W;
      const stripHeightPx = Math.floor(A4_H * pxPerMm);
      const totalSlices = Math.ceil(canvas.height / stripHeightPx);

      for (let s = 0; s < totalSlices; s++) {
        if (!firstPage) pdf.addPage();
        firstPage = false;

        const srcY = s * stripHeightPx;
        const srcH = Math.min(stripHeightPx, canvas.height - srcY);

        // Create a slice canvas
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = srcH;
        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.95);
        const sliceH = A4_W * (srcH / canvas.width);
        pdf.addImage(sliceData, "JPEG", 0, 0, imgW, sliceH);
      }
    }
  }

  const fileName = `Elio_Proposal_${studentName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(fileName);
}
