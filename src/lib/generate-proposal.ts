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
  convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProposalSection = {
  id: string;
  type: "title" | "subtitle" | "info" | "h2" | "body" | "closing" | "divider" | "page-break" | "table";
  content: string;
  editable: boolean;
  tableData?: string[][];
  aiKey?: "section1" | "section2a" | "section2b";
};

export interface ProposalInput {
  studentName: string;
  birthYear: string;
  school: string;
  intendedMajor: string;
  targetSchools: string;
  servicePeriod: string;
  section1: string;    // I. Chiến lược tổng thể
  section2a: string;   // II. Lộ trình — Lớp 11
  section2b: string;   // II. Lộ trình — Lớp 12
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
  const { studentName, birthYear, school, intendedMajor, targetSchools, servicePeriod, section1, section2a, section2b } = input;

  return [
    // ── PAGE 1: Cover ──
    { id: sid(), type: "subtitle", content: "Lộ trình Ứng tuyển Đại học – Cá nhân hóa",               editable: true  },
    { id: sid(), type: "divider",  content: "",                                                        editable: false },
    { id: sid(), type: "info",     content: `Học sinh: ${studentName}`,                               editable: true  },
    { id: sid(), type: "info",     content: `Năm sinh: ${birthYear}`,                                 editable: true  },
    { id: sid(), type: "info",     content: `Trường: ${school}`,                                      editable: true  },
    { id: sid(), type: "info",     content: `Ngành dự định: ${intendedMajor}`,                        editable: true  },
    { id: sid(), type: "info",     content: `Mục tiêu trường: ${targetSchools}`,                      editable: true  },
    { id: sid(), type: "info",     content: `Thời gian triển khai: ${servicePeriod}`,                 editable: true  },

    // ── PAGE 2: Section I ──
    { id: sid(), type: "page-break", content: "", editable: false },
    { id: sid(), type: "h2",   content: "I. CHIẾN LƯỢC TỔNG THỂ", editable: false },
    { id: sid(), type: "body", content: section1, editable: true, aiKey: "section1" },

    // ── PAGE 3: Section II — Lớp 11 ──
    { id: sid(), type: "page-break", content: "", editable: false },
    { id: sid(), type: "h2",   content: "II. LỘ TRÌNH THEO NĂM HỌC — Lớp 11", editable: false },
    { id: sid(), type: "body", content: section2a, editable: true, aiKey: "section2a" },

    // ── PAGE 4: Section II — Lớp 12 ──
    { id: sid(), type: "page-break", content: "", editable: false },
    { id: sid(), type: "h2",   content: "II. LỘ TRÌNH THEO NĂM HỌC — Lớp 12", editable: false },
    { id: sid(), type: "body", content: section2b, editable: true, aiKey: "section2b" },

    // ── PAGE 5: Section III ──
    { id: sid(), type: "page-break", content: "", editable: false },
    { id: sid(), type: "h2",  content: "III. TIMELINE", editable: false },
    {
      id: sid(), type: "table", content: "", editable: true,
      tableData: [
        ["Thời gian", "Hạng mục", "Chi tiết"],
        ["T9–12 (Lớp 11)", "Học thuật",    "Ôn thi SAT/IELTS, duy trì GPA, đăng ký thi chuẩn hóa"],
        ["T1–4 (Lớp 11)",  "Hoạt động",   "Triển khai dự án cá nhân, tham gia cuộc thi, tìm thực tập"],
        ["T5–8 (Lớp 11)",  "Hồ sơ",       "Viết luận chính, xin thư giới thiệu, chốt danh sách trường"],
        ["T8–11 (Lớp 12)", "Nộp EA/ED",   "Rà soát hồ sơ, hoàn thiện luận, nộp đợt sớm"],
        ["T12–2 (Lớp 12)", "Nộp RD",      "Cập nhật bảng điểm, nộp đợt thường"],
        ["T1–4 (Lớp 12)",  "Hậu xét tuyển","Phỏng vấn, hồ sơ tài chính, update letter"],
        ["T4–5 (Lớp 12)",  "Quyết định",  "Phân tích offer, chọn trường, đặt cọc"],
        ["T5–8 (Lớp 12)",  "Chuẩn bị",   "Visa, pre-departure workshop, đăng ký ký túc"],
      ],
    },

    // ── PAGE 6: Section IV (static) ──
    { id: sid(), type: "page-break", content: "", editable: false },
    { id: sid(), type: "h2",      content: "IV. CAM KẾT",  editable: false },
    { id: sid(), type: "closing", content: CLOSING_TEXT,   editable: true  },
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

function sectionToDocx(s: ProposalSection): (Paragraph | Table)[] {
  switch (s.type) {

    case "title":
      return [para({ spaceBefore: 720, spaceAfter: 80, children: [tx(s.content, { bold: true, size: 52, color: BRAND, allCaps: true })] })];

    case "subtitle":
      return [para({ spaceAfter: 40, children: [tx(s.content, { italics: true, size: 24, color: INK_MED })] })];

    case "info": {
      const ci = s.content.indexOf(":");
      const label = ci >= 0 ? s.content.slice(0, ci + 1) : "";
      const value = ci >= 0 ? s.content.slice(ci + 1) : s.content;
      return [para({ spaceBefore: 40, spaceAfter: 40, lineRule: 240, children: [tx(label, { bold: true, size: 20, color: INK_LIGHT }), tx(value, { size: 20 })] })];
    }

    case "h2":
      return [para({ spaceBefore: 440, spaceAfter: 200, borderBottom: true, children: [tx(s.content, { bold: true, size: 26, color: BRAND, allCaps: true })] })];

    case "body":
    case "closing":
      return [para({ spaceAfter: 160, lineRule: 302, children: txLines(s.content, { size: 22 }) })];

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
  const children: (Paragraph | Table)[] = [];
  for (const s of sections) children.push(...sectionToDocx(s));

  let logoBuffer: ArrayBuffer | null = null;
  let iconBuffer: ArrayBuffer | null = null;
  try {
    const [lr, ir] = await Promise.all([fetch("/elio-logo.png"), fetch("/elio-icon.png")]);
    if (lr.ok) logoBuffer = await lr.arrayBuffer();
    if (ir.ok) iconBuffer = await ir.arrayBuffer();
  } catch { /* graceful fallback */ }

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
      tx("Một điểm đến, mọi bước đồng hành", { italics: true, size: 18, color: INK_LIGHT }),
      new TextRun({ children: ["\t"] }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: INK_LIGHT }),
    ],
  });

  const doc = new Document({
    numbering: { config: [{ reference: "bullet-list", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.2) } } } }] }] },
    styles: { default: { document: { run: { font: FONT, size: 22, color: INK } } } },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 2259, bottom: 1440, left: 1440, right: 1440, header: 1008, footer: 720 },
        },
      },
      headers: { default: new Header({ children: [headerPara] }) },
      footers: { default: new Footer({ children: [footerPara] }) },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Elio_Proposal_${studentName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`);
}
