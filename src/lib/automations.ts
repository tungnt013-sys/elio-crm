// ── Automation rule types & localStorage helpers ─────────────────────────────

export type AutomationRecipient = "parent" | "student" | "counselor";

export type AutomationRule = {
  id: string;
  name: string;
  triggerStatus: string;           // full status string, e.g. "S5 - Appointment Scheduled"
  recipients: AutomationRecipient[];
  subject: string;                 // supports {{studentName}}, {{parentName}}, etc.
  body: string;
  isActive: boolean;
  createdAt: string;
};

export type AutomationLogEntry = {
  id: string;
  ruleId: string;
  ruleName: string;
  leadId: string;
  studentName: string;
  sentTo: string[];                // resolved email addresses
  subject: string;                 // resolved subject
  sentAt: string;
};

const LS_RULES = "elio:automationRules";
const LS_LOG   = "elio:automationLog";

export function loadRules(): AutomationRule[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_RULES) ?? "[]"); } catch { return []; }
}
export function saveRules(rules: AutomationRule[]) {
  localStorage.setItem(LS_RULES, JSON.stringify(rules));
}

export function loadLog(): AutomationLogEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_LOG) ?? "[]"); } catch { return []; }
}
export function appendLog(entry: AutomationLogEntry) {
  const log = loadLog();
  localStorage.setItem(LS_LOG, JSON.stringify([entry, ...log].slice(0, 200)));
}

// ── Template variable resolution ─────────────────────────────────────────────
export type TemplateVars = {
  studentName: string;
  parentName: string;
  grade: string;
  school: string;
  status: string;
  counselorName: string;
  appointmentDate: string;
  appointmentTime: string;
};

export function resolveTemplate(template: string, vars: Partial<TemplateVars>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    (vars as Record<string, string>)[key] ?? `{{${key}}}`
  );
}

// ── Recipient → email resolution ─────────────────────────────────────────────
export type LeadEmailContext = {
  parentEmail?: string;
  studentEmail?: string;
  counselorEmail?: string;    // from appointment counselor or assigned staff
};

const COUNSELOR_EMAILS: Record<string, string> = {
  "Phương": "phuong@elio.education",
  "Đức":    "duc@elio.education",
  "Tùng":   "tung@elio.education",
};

export function resolveRecipients(
  recipients: AutomationRecipient[],
  ctx: LeadEmailContext
): string[] {
  const emails: string[] = [];
  for (const r of recipients) {
    if (r === "parent"    && ctx.parentEmail)    emails.push(ctx.parentEmail);
    if (r === "student"   && ctx.studentEmail)   emails.push(ctx.studentEmail);
    if (r === "counselor" && ctx.counselorEmail) emails.push(ctx.counselorEmail);
  }
  return emails;
}

export function counselorEmailFromName(name: string): string | undefined {
  for (const [k, v] of Object.entries(COUNSELOR_EMAILS)) {
    if (name.includes(k)) return v;
  }
  return undefined;
}

// ── Starter templates ─────────────────────────────────────────────────────────
export const STARTER_RULES: Omit<AutomationRule, "id" | "createdAt">[] = [
  {
    name: "Appointment Confirmation",
    triggerStatus: "S5 - Appointment Scheduled",
    recipients: ["parent"],
    subject: "Xác nhận lịch tư vấn – {{studentName}}",
    body: `Kính gửi phụ huynh {{parentName}},

Chúng tôi xin xác nhận lịch tư vấn cho {{studentName}} vào ngày {{appointmentDate}} lúc {{appointmentTime}}.

Cố vấn phụ trách: {{counselorName}}

Trân trọng,
Đội ngũ Elio Education`,
    isActive: true,
  },
  {
    name: "Proposal Ready",
    triggerStatus: "S6 - Proposal Pending",
    recipients: ["parent"],
    subject: "Đề xuất dịch vụ Elio – {{studentName}}",
    body: `Kính gửi phụ huynh {{parentName}},

Cảm ơn gia đình đã tin tưởng Elio Education.

Chúng tôi sẽ sớm gửi đề xuất chi tiết cho {{studentName}} (Lớp {{grade}}, {{school}}).

Trân trọng,
Đội ngũ Elio Education`,
    isActive: true,
  },
  {
    name: "Quote Sent Follow-up",
    triggerStatus: "S9 - Proposal & Quote Sent",
    recipients: ["parent"],
    subject: "Báo giá dịch vụ Elio – {{studentName}}",
    body: `Kính gửi phụ huynh {{parentName}},

Chúng tôi vừa gửi báo giá cho chương trình hỗ trợ {{studentName}}.

Nếu gia đình có bất kỳ câu hỏi nào, vui lòng liên hệ chúng tôi.

Trân trọng,
Đội ngũ Elio Education`,
    isActive: true,
  },
];
