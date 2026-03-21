"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Capture proposal preview pages from the DOM and export as a PDF.
 * Each [data-proposal-page] element becomes one page in the PDF.
 */
export async function downloadProposalPdf(
  containerEl: HTMLElement,
  studentName: string,
): Promise<void> {
  const pages = containerEl.querySelectorAll<HTMLElement>("[data-proposal-page]");
  if (pages.length === 0) throw new Error("No proposal pages found");

  // A4 dimensions in mm
  const A4_W = 210;
  const A4_H = 297;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    // Capture at 2× for crisp output
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      backgroundColor: null, // preserve transparent/colored backgrounds
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    // Calculate dimensions to fit A4 while preserving aspect ratio
    const canvasRatio = canvas.height / canvas.width;
    const a4Ratio = A4_H / A4_W;

    let imgW = A4_W;
    let imgH = A4_W * canvasRatio;

    // If content is taller than A4, scale down to fit
    if (imgH > A4_H) {
      imgH = A4_H;
      imgW = A4_H / canvasRatio;
    }

    // Center on page
    const x = (A4_W - imgW) / 2;
    const y = (A4_H - imgH) / 2;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", x, y, imgW, imgH);
  }

  const fileName = `Elio_Proposal_${studentName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(fileName);
}
