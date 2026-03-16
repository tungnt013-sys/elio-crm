// ── Automation rule types & localStorage helpers ─────────────────────────────

export type AutomationRecipient = "parent" | "student" | "counselor";

export type AutomationRule = {
  id: string;
  name: string;
  triggerStatus: string;           // full status string, e.g. "S5 - Appointment Scheduled"
  recipients: AutomationRecipient[];
  otherEmails?: string[];          // arbitrary email addresses
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

// ── Action Automation types ───────────────────────────────────────────────────

export type ActionStep = {
  type: "setDeadline";
  days: number;
  basis: "business" | "calendar";
};

export type ActionRule = {
  id: string;
  name: string;
  triggerStatus: string;
  steps: ActionStep[];
  emailRuleId?: string;            // optional: also fire this email rule
  isActive: boolean;
  createdAt: string;
};

const LS_RULES        = "elio:automationRules";
const LS_LOG          = "elio:automationLog";
const LS_ACTION_RULES = "elio:actionRules";

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

export function loadActionRules(): ActionRule[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_ACTION_RULES) ?? "[]"); } catch { return []; }
}
export function saveActionRules(rules: ActionRule[]) {
  localStorage.setItem(LS_ACTION_RULES, JSON.stringify(rules));
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
  ctx: LeadEmailContext,
  otherEmails?: string[]
): string[] {
  const emails: string[] = [];
  for (const r of recipients) {
    if (r === "parent"    && ctx.parentEmail)    emails.push(ctx.parentEmail);
    if (r === "student"   && ctx.studentEmail)   emails.push(ctx.studentEmail);
    if (r === "counselor" && ctx.counselorEmail) emails.push(ctx.counselorEmail);
  }
  if (otherEmails) {
    for (const e of otherEmails) {
      const trimmed = e.trim();
      if (trimmed) emails.push(trimmed);
    }
  }
  return emails;
}

export function counselorEmailFromName(name: string): string | undefined {
  for (const [k, v] of Object.entries(COUNSELOR_EMAILS)) {
    if (name.includes(k)) return v;
  }
  return undefined;
}

// ── Action step deadline computation ─────────────────────────────────────────
function addDays(date: Date, days: number, business: boolean): Date {
  const result = new Date(date);
  if (!business) {
    result.setDate(result.getDate() + days);
    return result;
  }
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

export function computeActionDeadline(step: ActionStep & { type: "setDeadline" }): string {
  return addDays(new Date(), step.days, step.basis === "business").toISOString().slice(0, 10);
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

export const STARTER_ACTION_RULES: Omit<ActionRule, "id" | "createdAt">[] = [
  {
    name: "S1 → First Contact Deadline",
    triggerStatus: "S1 - New Lead",
    steps: [{ type: "setDeadline", days: 2, basis: "business" }],
    isActive: true,
  },
  {
    name: "S2 → Schedule Consultation Deadline",
    triggerStatus: "S2 - Initial Contact",
    steps: [{ type: "setDeadline", days: 5, basis: "business" }],
    isActive: true,
  },
  {
    name: "S7 → Send Final Quote Deadline",
    triggerStatus: "S7 - Follow Up Quote",
    steps: [{ type: "setDeadline", days: 5, basis: "business" }],
    isActive: true,
  },
];
