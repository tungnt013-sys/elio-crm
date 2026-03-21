"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Header,
  Footer,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  PageBreak,
  PageNumber,
  BorderStyle,
  WidthType,
  ShadingType,
  TabStopType,
  TabStopPosition,
  LevelFormat,
  HeightRule,
  VerticalAlign,
  convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AISectionKey = "section1" | "section2" | "section3";

export type ProposalSection = {
  id: string;
  type: "title" | "subtitle" | "info" | "h2" | "body" | "closing" | "divider" | "page-break" | "table";
  content: string;
  editable: boolean;
  tableData?: string[][];
  aiKey?: AISectionKey;
};

export interface ProposalInput {
  studentName: string;
  birthYear: string;
  school: string;
  intendedMajor: string;
  targetSchools: string;
  servicePeriod: string;
  currentGrade: string;  // e.g. "10", "11"
  section1: string;      // I. Chiến lược tổng thể
  section2: string;      // II. Lộ trình theo năm học
  section3: string;      // III. Gợi ý các trường phù hợp
}

// ── Static closing text ───────────────────────────────────────────────────────

const CLOSING_TEXT = `Elio không chỉ là một dịch vụ tư vấn — chúng tôi là người đồng hành thực sự trong hành trình trưởng thành và bước vào cánh cổng đại học.

Với mỗi học sinh, chúng tôi cam kết:

• Đồng hành sát sao, minh bạch và tận tâm — từ buổi đầu tiên đến ngày nhận thư trúng tuyển.
• Báo cáo tiến độ hàng tháng để phụ huynh luôn hiểu rõ tình hình và tự tin vào hành trình.
• Điều chỉnh kế hoạch linh hoạt — vì không có hành trình nào giống nhau, và chúng tôi luôn sẵn sàng thích nghi.

Phía trước là cánh cổng đại học. Chúng tôi sẽ ở đây, bước cùng bạn qua từng ngưỡng cửa — cho đến khi bạn sẵn sàng tự mình bước tiếp.

Một điểm đến. Mọi bước đồng hành.`;

// ── Build proposal sections ───────────────────────────────────────────────────

let _sid = 0;
function sid(): string { return `ps-${++_sid}`; }

export function buildProposalSections(input: ProposalInput): ProposalSection[] {
  _sid = 0;
  const { studentName, birthYear, school, intendedMajor, targetSchools, servicePeriod, currentGrade, section1, section2, section3 } = input;

  // Build timeline rows dynamically based on current grade
  const grade = parseInt(currentGrade) || 11;
  const timelineRows: string[][] = [["Thời gian", "Hạng mục", "Chi tiết"]];
  if (grade <= 10) {
    timelineRows.push(
      ["T9–12 (Lớp 10)", "Khám phá", "Xác định hướng ngành, tham gia CLB/hoạt động, xây nền tảng tiếng Anh"],
      ["T1–5 (Lớp 10)", "Nền tảng", "Bắt đầu ôn IELTS, tìm hiểu các chương trình mùa hè, duy trì GPA"],
    );
  }
  if (grade <= 11) {
    timelineRows.push(
      ["T9–12 (Lớp 11)", "Học thuật", "Ôn thi SAT/IELTS, duy trì GPA, đăng ký thi chuẩn hóa"],
      ["T1–4 (Lớp 11)", "Hoạt động", "Triển khai dự án cá nhân, tham gia cuộc thi, tìm thực tập/nghiên cứu"],
      ["T5–8 (Lớp 11)", "Hồ sơ", "Viết luận chính, xin thư giới thiệu, chốt danh sách trường"],
    );
  }
  timelineRows.push(
    ["T8–11 (Lớp 12)", "Nộp EA/ED", "Rà soát hồ sơ, hoàn thiện luận, nộp đợt sớm"],
    ["T12–2 (Lớp 12)", "Nộp RD", "Cập nhật bảng điểm, nộp đợt thường"],
    ["T1–4 (Lớp 12)", "Hậu xét tuyển", "Phỏng vấn, hồ sơ tài chính, update letter"],
    ["T4–5 (Lớp 12)", "Quyết định", "Phân tích offer, chọn trường, đặt cọc"],
    ["T5–8 (Lớp 12)", "Chuẩn bị", "Visa, pre-departure workshop, đăng ký ký túc xá"],
  );

  return [
    // ── Cover ──
    { id: sid(), type: "subtitle", content: "Lộ trình Ứng tuyển Đại học – Cá nhân hóa",               editable: true  },
    { id: sid(), type: "divider",  content: "",                                                        editable: false },
    { id: sid(), type: "info",     content: `Học sinh: ${studentName}`,                               editable: true  },
    { id: sid(), type: "info",     content: `Năm sinh: ${birthYear}`,                                 editable: true  },
    { id: sid(), type: "info",     content: `Trường: ${school}`,                                      editable: true  },
    { id: sid(), type: "info",     content: `Ngành dự định: ${intendedMajor}`,                        editable: true  },
    { id: sid(), type: "info",     content: `Mục tiêu trường: ${targetSchools}`,                      editable: true  },
    { id: sid(), type: "info",     content: `Thời gian triển khai: ${servicePeriod}`,                 editable: true  },

    // ── I. Chiến lược tổng thể ──
    { id: sid(), type: "page-break", content: "", editable: false },
    { id: sid(), type: "h2",   content: "I. Chiến lược Tổng thể", editable: false },
    { id: sid(), type: "body", content: section1, editable: true, aiKey: "section1" },

    // ── II. Lộ trình theo năm học ──
    { id: sid(), type: "page-break", content: "", editable: false },
    { id: sid(), type: "h2",   content: "II. Lộ trình theo Năm học", editable: false },
    { id: sid(), type: "body", content: section2, editable: true, aiKey: "section2" },

    // ── III. Gợi ý các trường phù hợp ──
    { id: sid(), type: "page-break", content: "", editable: false },
    { id: sid(), type: "h2",   content: "III. Gợi ý các Trường phù hợp", editable: false },
    { id: sid(), type: "body", content: section3, editable: true, aiKey: "section3" },

    // ── IV. Timeline ──
    { id: sid(), type: "page-break", content: "", editable: false },
    { id: sid(), type: "h2",  content: "IV. Timeline", editable: false },
    { id: sid(), type: "table", content: "", editable: true, tableData: timelineRows },

    // ── Cam kết (closing) ──
    { id: sid(), type: "page-break", content: "", editable: false },
    { id: sid(), type: "closing", content: CLOSING_TEXT, editable: true },
  ];
}

// ── .docx export ──────────────────────────────────────────────────────────────

const BRAND     = "173F36";
const INK       = "1A1A1A";
const INK_MED   = "4A5568";
const INK_LIGHT = "718096";
const ROW_ALT   = "F7FAF8";
const RULE      = "CBD5CE";
const FONT      = "Be Vietnam Pro";

function para(opts: {
  children: (TextRun | ImageRun)[];
  align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  spaceBefore?: number;
  spaceAfter?: number;
  lineRule?: number;
  borderBottom?: boolean;
  bulletRef?: string;
}): Paragraph {
  return new Paragraph({
    children: opts.children,
    alignment: opts.align ?? AlignmentType.LEFT,
    spacing: {
      before: opts.spaceBefore ?? 0,
      after:  opts.spaceAfter  ?? 120,
      line:   opts.lineRule    ?? 276,
      lineRule: "auto" as never,
    },
    ...(opts.borderBottom ? {
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND, space: 6 } },
    } : {}),
    ...(opts.bulletRef ? {
      numbering: { reference: opts.bulletRef, level: 0 },
    } : {}),
  });
}

function tx(text: string, opts?: { bold?: boolean; size?: number; color?: string; italics?: boolean; allCaps?: boolean }): TextRun {
  return new TextRun({ text, bold: opts?.bold, italics: opts?.italics, font: FONT, size: opts?.size ?? 22, color: opts?.color ?? INK, allCaps: opts?.allCaps });
}

function txLines(text: string, opts?: Parameters<typeof tx>[1]): TextRun[] {
  return text.split("\n").flatMap((line, i) => i === 0
    ? [tx(line, opts)]
    : [new TextRun({ break: 1, font: FONT, size: opts?.size ?? 22, color: opts?.color ?? INK }), tx(line, opts)]
  );
}

/** Parse inline **bold** markers into TextRun[] */
function parseInlineDocx(text: string, opts?: { size?: number; color?: string }): TextRun[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.filter(Boolean).map(part => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return tx(part.slice(2, -2), { bold: true, size: opts?.size, color: opts?.color });
    }
    return tx(part, { size: opts?.size, color: opts?.color });
  });
}

function sectionToDocx(s: ProposalSection): (Paragraph | Table)[] {
  switch (s.type) {

    case "title":
      return [para({ spaceBefore: 720, spaceAfter: 80, children: [tx(s.content, { size: 64, color: BRAND })] })];

    case "subtitle":
      return [para({ spaceAfter: 40, children: [tx(s.content, { bold: true, size: 40, color: INK })] })];

    case "info": {
      const ci = s.content.indexOf(":");
      const label = ci >= 0 ? s.content.slice(0, ci + 1) : "";
      const value = ci >= 0 ? s.content.slice(ci + 1) : s.content;
      return [para({ spaceBefore: 40, spaceAfter: 40, lineRule: 240, children: [tx(label, { bold: true, size: 22, color: INK }), tx(value, { size: 22 })] })];
    }

    case "h2":
      return [para({ spaceBefore: 440, spaceAfter: 200, borderBottom: true, children: [tx(s.content, { bold: true, size: 32, color: BRAND })] })];

    case "body":
    case "closing": {
      const paragraphs: Paragraph[] = [];
      const lines = s.content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          paragraphs.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [] }));
          continue;
        }
        // Numbered sub-heading (e.g. "1. Điểm mạnh")
        const numHeading = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (numHeading && trimmed.length < 80 && !trimmed.includes("•")) {
          paragraphs.push(para({ spaceBefore: 200, spaceAfter: 80, children: [tx(trimmed, { bold: true, size: 24, color: BRAND })] }));
          continue;
        }
        // Sub-sub heading (e.g. "Học thuật & Chuẩn hóa:")
        if (trimmed.endsWith(":") && trimmed.length < 60 && !trimmed.startsWith("•")) {
          paragraphs.push(para({ spaceBefore: 120, spaceAfter: 40, children: [tx(trimmed, { bold: true, size: 22, color: INK })] }));
          continue;
        }
        // Bullet point
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
          const bulletText = trimmed.slice(2);
          paragraphs.push(para({ spaceBefore: 20, spaceAfter: 20, lineRule: 302, children: parseInlineDocx(bulletText, { size: 22 }), bulletRef: "bullet-list" }));
          continue;
        }
        // Regular paragraph with inline bold
        paragraphs.push(para({ spaceAfter: 100, lineRule: 302, children: parseInlineDocx(trimmed, { size: 22 }) }));
      }
      return paragraphs;
    }

    case "divider":
      return [new Paragraph({ spacing: { before: 160, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 1 } }, children: [] })];

    case "page-break":
      return [new Paragraph({ children: [new PageBreak()] })];

    case "table": {
      if (!s.tableData?.length) return [];
      const [header, ...rows] = s.tableData;
      const totalW = 9360;
      const colWidths = [1700, 1600, 6060];

      const hRow = new TableRow({
        tableHeader: true,
        children: header.map((cell, ci) => new TableCell({
          width: { size: colWidths[ci], type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 140, right: 140 },
          shading: { fill: BRAND, type: ShadingType.CLEAR, color: "auto" },
          children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [tx(cell, { bold: true, size: 19, color: "FFFFFF" })] })],
        })),
      });

      const border = { style: BorderStyle.SINGLE, size: 1, color: RULE };
      return [
        new Paragraph({ spacing: { before: 0, after: 0 }, children: [] }),
        new Table({
          width: { size: totalW, type: WidthType.DXA },
          columnWidths: colWidths,
          rows: [hRow, ...rows.map((row, ri) => new TableRow({
            children: row.map((cell, ci) => new TableCell({
              width: { size: colWidths[ci], type: WidthType.DXA },
              margins: { top: 60, bottom: 60, left: 140, right: 140 },
              shading: ri % 2 === 1 ? { fill: ROW_ALT, type: ShadingType.CLEAR, color: "auto" } : undefined,
              children: [new Paragraph({ spacing: { before: 20, after: 20 }, children: [tx(cell, { size: 19, bold: ci === 0 })] })],
            })),
          }))],
          borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
        }),
      ];
    }

    default: return [];
  }
}

// ── Download ──────────────────────────────────────────────────────────────────

export async function downloadProposalDocx(sections: ProposalSection[], studentName: string): Promise<void> {
  // ── Split sections into cover (before first page-break) and body (after) ──
  const firstBreakIdx = sections.findIndex(s => s.type === "page-break");
  const coverSections = firstBreakIdx >= 0 ? sections.slice(0, firstBreakIdx) : [];
  const bodySections = firstBreakIdx >= 0 ? sections.slice(firstBreakIdx + 1) : sections;

  // ── Build body content ──
  const bodyChildren: (Paragraph | Table)[] = [];
  for (const s of bodySections) bodyChildren.push(...sectionToDocx(s));

  // ── Fetch logo images ──
  let logoBuffer: ArrayBuffer | null = null;
  let iconBuffer: ArrayBuffer | null = null;
  try {
    const [lr, ir] = await Promise.all([
      fetch("/elio-logo.png"),
      fetch("/elio-icon.png"),
    ]);
    if (lr.ok) logoBuffer = await lr.arrayBuffer();
    if (ir.ok) iconBuffer = await ir.arrayBuffer();
  } catch { /* graceful fallback */ }

  // ── Cover page: full-page green table ──
  const CREAM = "E8E0D0";
  const pageW = 12240; // letter width in twip
  const coverW = pageW; // full width (margins handled by section)
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder };

  // Extract cover info from sections (match preview: only student name + birth year)
  const subtitleSec = coverSections.find(s => s.type === "subtitle");
  const infoSections = coverSections.filter(s => s.type === "info");
  const extractInfo = (prefix: string) => {
    const sec = infoSections.find(s => s.content.startsWith(prefix));
    return sec ? sec.content.split(":").slice(1).join(":").trim() : "";
  };
  const coverStudentName = extractInfo("Học sinh");
  const coverBirthYear = extractInfo("Năm sinh");

  const coverTable = new Table({
    width: { size: coverW, type: WidthType.DXA },
    columnWidths: [coverW],
    borders: noBorders,
    rows: [
      // Row 1 — Logo + tagline (1600 twips)
      new TableRow({
        height: { value: 1600, rule: HeightRule.EXACT },
        children: [new TableCell({
          width: { size: coverW, type: WidthType.DXA },
          shading: { fill: BRAND, type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 400, bottom: 200, left: 500, right: 500 },
          borders: noBorders,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 80 },
              children: [tx("elio education", { bold: true, size: 28, color: "FFFFFF" })],
            }),
            new Paragraph({
              spacing: { before: 0, after: 0 },
              children: [tx("Một điểm đến, mọi bước đồng hành", { italics: true, size: 16, color: CREAM })],
            }),
          ],
        })],
      }),
      // Row 2 — Spacer (3000 twips — pushes title down)
      new TableRow({
        height: { value: 3000, rule: HeightRule.EXACT },
        children: [new TableCell({
          width: { size: coverW, type: WidthType.DXA },
          shading: { fill: BRAND, type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 0, bottom: 0, left: 500, right: 500 },
          borders: noBorders,
          children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [] })],
        })],
      }),
      // Row 3 — Title (4000 twips)
      new TableRow({
        height: { value: 4000, rule: HeightRule.EXACT },
        children: [new TableCell({
          width: { size: coverW, type: WidthType.DXA },
          shading: { fill: BRAND, type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 0, bottom: 400, left: 500, right: 500 },
          borders: noBorders,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 200 },
              children: [tx(subtitleSec?.content ?? "Lộ trình Ứng tuyển Đại học – Cá nhân hóa", { bold: true, size: 56, color: "FFFFFF" })],
            }),
          ],
        })],
      }),
      // Row 4 — Divider (300 twips)
      new TableRow({
        height: { value: 300, rule: HeightRule.EXACT },
        children: [new TableCell({
          width: { size: coverW, type: WidthType.DXA },
          shading: { fill: BRAND, type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 0, bottom: 0, left: 500, right: 500 },
          borders: noBorders,
          children: [new Paragraph({
            spacing: { before: 0, after: 0 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: CREAM, space: 1 } },
            children: [],
          })],
        })],
      }),
      // Row 5 — Student info (2940 twips)
      new TableRow({
        height: { value: 2940, rule: HeightRule.EXACT },
        children: [new TableCell({
          width: { size: coverW, type: WidthType.DXA },
          shading: { fill: BRAND, type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 200, bottom: 400, left: 500, right: 500 },
          borders: noBorders,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 40 },
              tabStops: [{ type: TabStopType.LEFT, position: Math.round(coverW / 2) }],
              children: [
                tx("STUDENT", { bold: true, size: 15, color: CREAM }),
                new TextRun({ children: ["\t"] }),
                tx("YEAR OF BIRTH", { bold: true, size: 15, color: CREAM }),
              ],
            }),
            new Paragraph({
              spacing: { before: 0, after: 0 },
              tabStops: [{ type: TabStopType.LEFT, position: Math.round(coverW / 2) }],
              children: [
                tx(coverStudentName || studentName, { size: 24, color: "FFFFFF" }),
                new TextRun({ children: ["\t"] }),
                tx(coverBirthYear, { size: 24, color: "FFFFFF" }),
              ],
            }),
          ],
        })],
      }),
      // Row 6 — Contact footer (4000 twips, content pushed to bottom)
      new TableRow({
        height: { value: 4000, rule: HeightRule.EXACT },
        children: [new TableCell({
          width: { size: coverW, type: WidthType.DXA },
          shading: { fill: BRAND, type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 200, bottom: 400, left: 500, right: 500 },
          borders: noBorders,
          verticalAlign: VerticalAlign.BOTTOM,
          children: [
            new Paragraph({
              spacing: { before: 80, after: 0 },
              border: { top: { style: BorderStyle.SINGLE, size: 1, color: CREAM, space: 6 } },
              tabStops: [
                { type: TabStopType.CENTER, position: Math.round(coverW / 2) },
                { type: TabStopType.RIGHT, position: coverW - 1000 },
              ],
              children: [
                tx("Hà Nội, Việt Nam", { size: 16, color: CREAM }),
                new TextRun({ children: ["\t"] }),
                tx("info@elio.education", { size: 16, color: CREAM }),
                new TextRun({ children: ["\t"] }),
                tx("(+84) 33 929 9925", { size: 16, color: CREAM }),
              ],
            }),
          ],
        })],
      }),
    ],
  });

  // ── Header / Footer for body pages ──
  const headerPara = new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    spacing: { before: 0, after: 0 },
    children: [
      ...(logoBuffer ? [new ImageRun({ type: "png", data: logoBuffer, transformation: { width: 159, height: 19 }, altText: { title: "Elio Education", description: "logo", name: "elio-logo" } })] : [tx("ELIO EDUCATION", { bold: true, size: 18, color: BRAND })]),
      new TextRun({ children: ["\t"] }),
      ...(iconBuffer ? [new ImageRun({ type: "png", data: iconBuffer, transformation: { width: 24, height: 24 }, altText: { title: "Elio icon", description: "icon", name: "elio-icon" } })] : []),
    ],
  });

  const footerPara = new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    spacing: { before: 120, after: 0 },
    border: { top: { style: BorderStyle.SINGLE, size: 3, color: RULE, space: 6 } },
    children: [
      tx("Một điểm đến, mọi bước đồng hành", { italics: true, size: 16, color: INK_LIGHT }),
      new TextRun({ children: ["\t"] }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: INK_LIGHT }),
    ],
  });

  const pageProps = {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 2259, bottom: 1440, left: 1440, right: 1440, header: 1008, footer: 720 },
    },
  };

  const doc = new Document({
    numbering: { config: [{ reference: "bullet-list", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.2) } } } }] }] },
    styles: { default: { document: { run: { font: FONT, size: 22, color: INK } } } },
    sections: [
      // Cover page section — no header/footer, minimal margins
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 0, bottom: 0, left: 0, right: 0, header: 0, footer: 0 },
          },
        },
        children: [coverTable],
      },
      // Body section — with header/footer
      {
        properties: pageProps,
        headers: { default: new Header({ children: [headerPara] }) },
        footers: { default: new Footer({ children: [footerPara] }) },
        children: bodyChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Elio_Proposal_${studentName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`);
}
