"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { ProposalSection } from "./generate-proposal";

export async function downloadProposalPdf(
  _sections: ProposalSection[],
  studentName: string,
): Promise<void> {
  const pageEls = Array.from(
    document.querySelectorAll<HTMLElement>("[data-proposal-page]"),
  );
  if (pageEls.length === 0) throw new Error("No proposal pages found in DOM");

  // A4 in mm
  const A4_W = 210;
  const A4_H = 297;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  for (let i = 0; i < pageEls.length; i++) {
    const el = pageEls[i];

    const canvas = await html2canvas(el, {
      scale: 5,           // 5× ≈ 370 DPI — sharp enough for print
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const elH = el.offsetHeight;
    const elW = el.offsetWidth;
    // Scale to A4 width; if content is taller than A4, let the PDF page stretch
    const pdfH = Math.max(A4_H, (elH / elW) * A4_W);

    if (i === 0) {
      // Resize the first page if needed
      if (pdfH > A4_H) pdf.deletePage(1);
      if (pdfH > A4_H) pdf.addPage([A4_W, pdfH]);
    } else {
      pdf.addPage([A4_W, pdfH]);
    }

    pdf.addImage(imgData, "PNG", 0, 0, A4_W, pdfH);
  }

  const fileName = `Elio_Proposal_${studentName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(fileName);
}
