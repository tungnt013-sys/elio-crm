"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { type FullLead, type LeadOverrides, type ContactLogEntry, STATUS_OPTIONS, computeDeadline } from "@/lib/all-leads";
import { STUDENT_ROSTER, MOCK_STAFF } from "@/lib/mock-data";
import { useRole } from "@/components/dashboard-shell";
import {
  loadRules, loadActionRules, appendLog, resolveTemplate, resolveRecipients, counselorEmailFromName,
  computeActionDeadline,
  type AutomationRule,
} from "@/lib/automations";

// ── Shared note localStorage (same store as student profile page) ─────────────
type NoteEntry = { content: string; editedBy: string; editedAt: string };
function readSharedNote(lsKey: string, studentId: string): string {
  if (typeof window === "undefined") return "";
  try {
    const store: Record<string, NoteEntry> = JSON.parse(localStorage.getItem(lsKey) ?? "{}");
    return store[studentId]?.content ?? "";
  } catch { return ""; }
}
function writeSharedNote(lsKey: string, studentId: string, content: string, editedBy: string) {
  if (typeof window === "undefined") return;
  try {
    const store: Record<string, NoteEntry> = JSON.parse(localStorage.getItem(lsKey) ?? "{}");
    store[studentId] = { content, editedBy, editedAt: new Date().toISOString() };
    localStorage.setItem(lsKey, JSON.stringify(store));
  } catch { /* ignore */ }
}

type MergedLead = FullLead & Partial<LeadOverrides>;

type Props = {
  lead: MergedLead;
  overrides?: Partial<LeadOverrides>;
  onUpdate: (id: string, updates: Partial<LeadOverrides>) => void;
  onClose: () => void;
};

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="detail-label">{label}</div>
      <div className="detail-value" style={{ whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}

type EditFieldProps = {
  label: string;
  value: string;
  fieldKey: keyof LeadOverrides;
  onSave: (key: keyof LeadOverrides, value: string) => void;
  placeholder?: string;
};

function EditField({ label, value, fieldKey, onSave, placeholder }: EditFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => { onSave(fieldKey, draft); setEditing(false); };

  return (
    <div style={{ marginBottom: 10 }}>
      <div className="detail-label">{label}</div>
      {editing ? (
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input
            className="field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder || label}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
            autoFocus
            style={{ fontSize: 13, flex: 1 }}
          />
        </div>
      ) : (
        <div
          className="detail-value"
          onClick={() => setEditing(true)}
          style={{ cursor: "text", borderRadius: "var(--r-sm)", padding: "2px 4px", margin: "-2px -4px", transition: "background 0.1s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          title="Click to edit"
        >
          {value || <span style={{ color: "var(--ink-3)", fontStyle: "italic" }}>—</span>}
        </div>
      )}
    </div>
  );
}

function autoNextAction(status: string): { action: string; urgency: "high" | "medium" | "low" | "none" } {
  if (status.startsWith("S1 ")) return { action: "Make first contact within 2 business days", urgency: "high" };
  if (status.startsWith("S2 ")) return { action: "Call parent, collect intake form info", urgency: "high" };
  if (status.startsWith("S3 ")) return { action: "Qualify lead — confirm need, budget, timeline", urgency: "medium" };
  if (status.startsWith("S4 ")) return { action: "Book appointment date, time & counselor — then move to S5", urgency: "medium" };
  if (status.startsWith("S5 ")) return { action: "Conduct scheduled consultation meeting", urgency: "medium" };
  if (status.startsWith("S6 ")) return { action: "Prepare and send proposal & quote", urgency: "medium" };
  if (status.startsWith("S7 ")) return { action: "Follow up on quote — negotiate if needed", urgency: "medium" };
  if (status.startsWith("S8 ")) return { action: "Send final quote — push for contract sign", urgency: "medium" };
  if (status.startsWith("S9 ")) return { action: "Proposal sent — follow up for decision", urgency: "medium" };
  if (status.includes("S10")) return { action: "Won — hand off to counselor team", urgency: "none" };
  if (status.includes("S13")) return { action: "Warm lead — re-engage when timing improves", urgency: "low" };
  if (status.includes("S11") || status.includes("S12")) return { action: "Closed — no action needed", urgency: "none" };
  return { action: "Review status", urgency: "low" };
}

// Business hours: Mon–Fri 8am–6pm (10h/day)
function timeSinceLastContact(dateStr: string): { calendarHours: number; businessHours: number } | null {
  if (!dateStr) return null;
  const from = new Date(dateStr + "T08:00:00"); // treat last contact as start of business day
  const now = new Date();
  if (isNaN(from.getTime())) return null;

  const calendarHours = Math.floor((now.getTime() - from.getTime()) / 3_600_000);

  // Count business hours (Mon=1…Fri=5, 8am–6pm)
  let bh = 0;
  const cursor = new Date(from);
  const BIZ_START = 8, BIZ_END = 18;
  while (cursor < now) {
    const dow = cursor.getDay();
    if (dow >= 1 && dow <= 5) {
      const h = cursor.getHours();
      if (h >= BIZ_START && h < BIZ_END) bh++;
    }
    cursor.setHours(cursor.getHours() + 1);
  }

  return { calendarHours, businessHours: bh };
}

function formatHours(h: number): string {
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  const rem = h % 24;
  return rem > 0 ? `${d}d ${rem}h` : `${d}d`;
}

// Counselors loaded from DB at runtime (see useCounselorUsers hook below)

const STAGE_ORDER: Record<string, number> = {
  S1: 1, S2: 2, S3: 3, S4: 4, S5: 5, S6: 6, S7: 7, S8: 8, S9: 9, S10: 10, S11: 11, S12: 12, S13: 13,
};

function stageNum(status: string): number {
  const m = status.match(/S(\d+)/);
  return m ? (STAGE_ORDER[`S${m[1]}`] || 99) : 99;
}

const MEDIUM_COLORS: Record<string, string> = {
  phone: "var(--accent)",
  email: "var(--success)",
  "in-person": "#6D28D9",
  sms: "#D97706",
  other: "var(--ink-3)",
};

export function LeadDetailSlideover({ lead, overrides, onUpdate, onClose }: Props) {
  const { role } = useRole();
  const { data: session } = useSession();
  const isAdmin = role === "admin";
  const isReadOnly = role === "sales_view";
  const { action: autoAction, urgency } = autoNextAction(lead.status);
  const displayAction = lead.customNextAction || autoAction;

  const rosterMatch = STUDENT_ROSTER.find(
    (s) => s.fullName === lead.studentName || s.fullName.includes(lead.studentName.split(" ").pop() || "___")
  );

  const urgencyColors = {
    high: { bg: "var(--danger-soft)", color: "var(--danger)", border: "var(--danger)" },
    medium: { bg: "var(--warning-bg)", color: "#92400E", border: "var(--warning)" },
    low: { bg: "var(--bg-2)", color: "var(--ink-2)", border: "var(--line)" },
    none: { bg: "var(--success-bg)", color: "var(--success)", border: "var(--success)" },
  };
  const uc = urgencyColors[urgency];

  // local draft states
  const [salesNotesDraft, setSalesNotesDraft] = useState(lead.salesNotes || "");
  const [editingSalesNotes, setEditingSalesNotes] = useState(false);
  const [editingAction, setEditingAction] = useState(false);
  const [actionDraft, setActionDraft] = useState(lead.customNextAction || "");
  const [contactMedium, setContactMedium] = useState<ContactLogEntry["medium"]>("phone");
  const [contactNote, setContactNote] = useState("");
  const [consultantDraft, setConsultantDraft] = useState(lead.consultantNotes || "");
  const [editingConsultantNotes, setEditingConsultantNotes] = useState(false);

  // Counselors from DB
  const [counselorUsers, setCounselorUsers] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/users?role=COUNSELOR")
      .then((r) => r.json())
      .then((data: { name: string }[]) => {
        if (Array.isArray(data) && data.length > 0) setCounselorUsers(data.map((u) => u.name));
      })
      .catch(() => {});
  }, []);

  // Appointment modal state
  const [showApptModal, setShowApptModal] = useState(false);
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [apptCounselor, setApptCounselor] = useState(lead.appointmentCounselor || "");

  // Automation email modal state
  type AutomationModal = {
    rule: AutomationRule;
    recipients: string[];   // resolved email addresses
    subject: string;        // resolved subject
    body: string;           // resolved body
  };
  const [automationModal, setAutomationModal] = useState<AutomationModal | null>(null);

  const fireAutomations = (newStatus: string) => {
    const allEmailRules = loadRules();
    const emailRules    = allEmailRules.filter((r) => r.isActive && r.triggerStatus === newStatus);

    // Fire action rules silently — apply steps immediately
    const actionRules = loadActionRules().filter((r) => r.isActive && r.triggerStatus === newStatus);
    const actionUpdates: Partial<LeadOverrides> = {};
    const extraEmailRuleIds: string[] = [];

    for (const ar of actionRules) {
      for (const step of ar.steps) {
        if (step.type === "setDeadline") {
          actionUpdates.deadline = computeActionDeadline(step);
        }
      }
      if (ar.emailRuleId) extraEmailRuleIds.push(ar.emailRuleId);
    }
    if (Object.keys(actionUpdates).length > 0) onUpdate(lead.id, actionUpdates);

    // Collect all email rules: direct matches + those linked from action rules
    const extraEmailRules = extraEmailRuleIds
      .map((id) => allEmailRules.find((r) => r.id === id))
      .filter((r): r is typeof r & NonNullable<typeof r> => !!r);
    const allMatchedEmail = [...emailRules, ...extraEmailRules];

    if (allMatchedEmail.length === 0) return;

    const counselorEmail = lead.appointmentCounselor
      ? counselorEmailFromName(lead.appointmentCounselor)
      : undefined;

    const vars = {
      studentName: lead.studentName,
      parentName: lead.parentName,
      grade: String(lead.gradeLevel ?? ""),
      school: lead.school ?? "",
      status: newStatus.replace(/^S\d+ - /, ""),
      counselorName: lead.appointmentCounselor ?? "",
      appointmentDate: lead.appointmentDate ?? "",
      appointmentTime: lead.appointmentTime ?? "",
    };

    // Show modal for the first matching email rule; log the rest silently
    allMatchedEmail.forEach((rule, i) => {
      const emailCtx = { parentEmail: lead.parentEmail, studentEmail: lead.studentEmail, counselorEmail };
      const recipients = resolveRecipients(rule.recipients, emailCtx, rule.otherEmails);
      const subject    = resolveTemplate(rule.subject, vars);
      const body       = resolveTemplate(rule.body, vars);

      if (i === 0) {
        setAutomationModal({ rule, recipients, subject, body });
      } else {
        appendLog({ id: `${Date.now()}-${i}`, ruleId: rule.id, ruleName: rule.name, leadId: lead.id, studentName: lead.studentName, sentTo: recipients, subject, sentAt: new Date().toISOString() });
      }
    });
  };

  // Reschedule inline state
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  // reset on lead change — read notes from shared localStorage (same as student profile)
  useEffect(() => {
    const rid = STUDENT_ROSTER.find(
      (s) => s.fullName === lead.studentName || s.fullName.includes(lead.studentName.split(" ").pop() || "___")
    )?.id;
    setSalesNotesDraft(rid ? (readSharedNote("elio:note:sales", rid) || lead.salesNotes || "") : (lead.salesNotes || ""));
    setEditingSalesNotes(false);
    setEditingAction(false);
    setActionDraft(lead.customNextAction || "");
    setContactNote("");
    setContactMedium("phone");
    setShowApptModal(false);
    setShowReschedule(false);
    setRescheduleReason("");
    setConsultantDraft(rid ? (readSharedNote("elio:note:counselor", rid) || lead.consultantNotes || "") : (lead.consultantNotes || ""));
    setEditingConsultantNotes(false);
  }, [lead.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = lead.deadline && lead.deadline < today && urgency !== "none";

  const saveField = (key: keyof LeadOverrides, value: string) => onUpdate(lead.id, { [key]: value } as Partial<LeadOverrides>);

  return (
    <>
      <div className="slide-over-backdrop" onClick={onClose} />
      <div className="slide-over">
        {/* Header */}
        <div className="slide-over-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>{lead.studentName || "Unknown"}</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>
                {lead.gradeLevel}{lead.school ? ` · ${lead.school}` : ""}
              </div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={onClose} style={{ padding: "4px 6px" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
            </button>
          </div>

          {/* Next Action Banner */}
          <div style={{ marginTop: 10, padding: "10px 12px", background: uc.bg, borderRadius: "var(--r-md)", borderLeft: `3px solid ${uc.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: uc.color }}>Next Action</div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setEditingAction(!editingAction); setActionDraft(lead.customNextAction || ""); }}
                style={{ fontSize: 11, padding: "2px 6px", height: "auto" }}
              >
                {editingAction ? "Cancel" : "Edit"}
              </button>
            </div>
            {editingAction ? (
              <div style={{ display: "grid", gap: 6 }}>
                <input
                  className="field"
                  value={actionDraft}
                  onChange={(e) => setActionDraft(e.target.value)}
                  placeholder="Custom next action..."
                  style={{ fontSize: 12 }}
                />
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => { onUpdate(lead.id, { customNextAction: actionDraft }); setEditingAction(false); }}
                  style={{ justifySelf: "start" }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: uc.color, fontWeight: 500 }}>{displayAction}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <div style={{ fontSize: 11, color: uc.color, fontWeight: 500 }}>Deadline:</div>
              {isAdmin ? (
                <input
                  type="date"
                  className="field"
                  value={lead.deadline || ""}
                  onChange={(e) => onUpdate(lead.id, { deadline: e.target.value })}
                  style={{ fontSize: 11, padding: "2px 6px", width: "auto", color: isOverdue ? "var(--danger)" : undefined }}
                />
              ) : (
                <span style={{ fontSize: 12, fontWeight: 500, color: isOverdue ? "var(--danger)" : uc.color }}>
                  {lead.deadline || "—"}
                </span>
              )}
              {isOverdue && <span style={{ fontSize: 11, color: "var(--danger)", fontWeight: 600 }}>Overdue</span>}
            </div>
          </div>
        </div>

        <div className="slide-over-body">

          {/* S4 Appointment Card */}
          {lead.status.startsWith("S4 ") && (
            <div style={{ marginBottom: 16, padding: "12px 14px", background: "var(--accent-soft)", borderRadius: "var(--r-md)", border: "1px solid rgba(0,112,243,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>Book Consultation</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {lead.appointmentDate && (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => { setShowReschedule(!showReschedule); setRescheduleDate(""); setRescheduleTime(""); setRescheduleReason(""); }}
                      style={{ fontSize: 11, color: "var(--warning)" }}
                    >
                      Reschedule
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => { setApptDate(lead.appointmentDate || ""); setApptTime(lead.appointmentTime || ""); setApptCounselor(lead.appointmentCounselor || counselorUsers[0] || ""); setShowApptModal(true); }}
                    style={{ fontSize: 11 }}
                  >
                    {lead.appointmentDate ? "Edit" : "Add Details"}
                  </button>
                </div>
              </div>

              {!lead.appointmentDate && (
                <div style={{ fontSize: 12, color: "var(--danger)", fontWeight: 500, marginBottom: 10 }}>
                  ⚠ Appointment details required before marking done.
                </div>
              )}

              {lead.appointmentDate ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                  <div>
                    <div className="detail-label">Date</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.appointmentDate}</div>
                  </div>
                  <div>
                    <div className="detail-label">Time</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.appointmentTime || "—"}</div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div className="detail-label">Counselor</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.appointmentCounselor || "—"}</div>
                  </div>
                </div>
              ) : null}

              {/* Reschedule inline form */}
              {showReschedule && (
                <div style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: "10px 12px", marginBottom: 10, border: "1px solid var(--line)", display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--warning)" }}>Reschedule</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <div className="detail-label" style={{ marginBottom: 3 }}>New Date</div>
                      <input type="date" className="field" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} style={{ fontSize: 12, width: "100%" }} />
                    </div>
                    <div>
                      <div className="detail-label" style={{ marginBottom: 3 }}>New Time</div>
                      <input type="time" className="field" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} style={{ fontSize: 12, width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="detail-label" style={{ marginBottom: 3 }}>Reason</div>
                    <input className="field" value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} placeholder="Reason for rescheduling..." style={{ fontSize: 12, width: "100%" }} />
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={!rescheduleDate || !rescheduleReason.trim()}
                      onClick={() => {
                        const now = new Date().toISOString();
                        const logEntry = {
                          timestamp: now,
                          medium: "other" as ContactLogEntry["medium"],
                          note: `Rescheduled to ${rescheduleDate}${rescheduleTime ? ` at ${rescheduleTime}` : ""} — Reason: ${rescheduleReason}`,
                        };
                        const existing = overrides?.contactLog || [];
                        onUpdate(lead.id, {
                          appointmentDate: rescheduleDate,
                          appointmentTime: rescheduleTime,
                          contactLog: [logEntry, ...existing],
                          lastContact: now.slice(0, 10),
                        });
                        setShowReschedule(false);
                        setRescheduleReason("");
                      }}
                    >
                      Confirm Reschedule
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => setShowReschedule(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <button
                className="btn btn-sm btn-primary"
                disabled={!lead.appointmentDate}
                onClick={() => {
                  const now = new Date();
                  const ts = `[${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}]`;
                  const note = `${ts} Appointment booked (${lead.appointmentDate}${lead.appointmentTime ? ` ${lead.appointmentTime}` : ""}, counselor: ${lead.appointmentCounselor || "—"}) — moving to Appointment Scheduled`;
                  const existing = lead.salesNotes || "";
                  onUpdate(lead.id, {
                    status: "S5 - Appointment Scheduled",
                    salesNotes: existing ? `${note}\n${existing}` : note,
                  });
                  setSalesNotesDraft((existing ? `${note}\n${existing}` : note));
                }}
                style={{ width: "100%" }}
              >
                ✓ Appointment Booked — Move to S5 Appointment Scheduled
              </button>
            </div>
          )}

          {/* S5 Meeting Done Card */}
          {lead.status.startsWith("S5 ") && (
            <div style={{ marginBottom: 16, padding: "12px 14px", background: "var(--success-bg)", borderRadius: "var(--r-md)", border: "1px solid rgba(0,160,80,0.2)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--success)", marginBottom: 8 }}>Appointment Scheduled</div>
              {lead.appointmentDate ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                  <div>
                    <div className="detail-label">Date</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.appointmentDate}</div>
                  </div>
                  <div>
                    <div className="detail-label">Time</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.appointmentTime || "—"}</div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div className="detail-label">Counselor</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.appointmentCounselor || "—"}</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>No appointment details recorded.</div>
              )}
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  const now = new Date();
                  const ts = `[${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}]`;
                  const note = `${ts} Consultation meeting done — moving to Proposal Pending`;
                  const existing = lead.salesNotes || "";
                  const updated = existing ? `${note}\n${existing}` : note;
                  onUpdate(lead.id, { status: "S6 - Proposal Pending", salesNotes: updated });
                  setSalesNotesDraft(updated);
                  fireAutomations("S6 - Proposal Pending");
                }}
                style={{ width: "100%" }}
              >
                ✓ Meeting Done — Move to S6 Proposal Pending
              </button>
            </div>
          )}

          {/* Status + Info Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <div style={{ padding: "8px 10px", background: "var(--bg)", borderRadius: "var(--r-md)", border: "1px solid var(--line)", gridColumn: "1 / -1" }}>
              <div className="detail-label" style={{ marginBottom: 4 }}>Status</div>
              <select
                className="field"
                disabled={isReadOnly}
                value={lead.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  const deadline = computeDeadline(newStatus, new Date());
                  onUpdate(lead.id, { status: newStatus, ...(deadline ? { deadline } : {}) });
                  if (newStatus.startsWith("S4 ")) {
                    setApptDate("");
                    setApptTime("");
                    setApptCounselor(counselorUsers[0] || "");
                    setShowApptModal(true);
                  }
                  fireAutomations(newStatus);
                }}
                style={{ fontSize: 13, fontWeight: 500, width: "100%" }}
              >
                {STATUS_OPTIONS.filter((s) => isAdmin || stageNum(s) >= stageNum(lead.status)).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                {/* If current status isn't in list (data variant), keep it selectable */}
                {!STATUS_OPTIONS.includes(lead.status as typeof STATUS_OPTIONS[number]) && (
                  <option value={lead.status}>{lead.status}</option>
                )}
              </select>
            </div>
            <div style={{ padding: "8px 10px", background: "var(--bg)", borderRadius: "var(--r-md)", border: "1px solid var(--line)" }}>
              <div className="detail-label">Submitted</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.submissionTime || "—"}</div>
            </div>
            <div style={{ padding: "8px 10px", background: "var(--bg)", borderRadius: "var(--r-md)", border: "1px solid var(--line)" }}>
              <div className="detail-label">First Contact</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.firstContact || "—"}</div>
            </div>
            <div style={{ padding: "8px 10px", background: "var(--bg)", borderRadius: "var(--r-md)", border: "1px solid var(--line)", gridColumn: "1 / -1" }}>
              <div className="detail-label">Last Contact</div>
              {lead.lastContact ? (() => {
                const t = timeSinceLastContact(lead.lastContact);
                const isStale = t && t.businessHours > 40; // >1 business week
                return (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)" }}>{lead.lastContact}</div>
                    {t && (
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 11, color: isStale ? "var(--danger)" : "var(--ink-3)" }}>
                          {formatHours(t.calendarHours)} ago
                        </span>
                        <span style={{ fontSize: 11, color: isStale ? "var(--danger)" : "var(--ink-3)", fontWeight: isStale ? 600 : 400 }}>
                          · {formatHours(t.businessHours)} biz hrs
                        </span>
                      </div>
                    )}
                  </div>
                );
              })() : <div style={{ fontSize: 13, color: "var(--ink-3)" }}>—</div>}
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>(auto-updated via contact log)</div>
            </div>
          </div>

          {/* Contact Information */}
          <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div className="section-title">Contact Information</div>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>· click any field to edit</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <EditField label="Parent" value={lead.parentName} fieldKey="parentName" onSave={saveField} />
              <EditField label="Relationship" value={lead.relationship} fieldKey="relationship" onSave={saveField} />
              <EditField label="Parent Email" value={lead.parentEmail} fieldKey="parentEmail" onSave={saveField} />
              <EditField label="Parent Phone" value={lead.parentPhone ? String(lead.parentPhone).replace(/^84/, "0") : ""} fieldKey="parentPhone" onSave={saveField} />
              <EditField label="Student Email" value={lead.studentEmail} fieldKey="studentEmail" onSave={saveField} />
              <EditField label="Student Phone" value={lead.studentPhone ? String(lead.studentPhone).replace(/^84/, "0") : ""} fieldKey="studentPhone" onSave={saveField} />
            </div>
          </div>

          {/* Academic Profile */}
          <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div className="section-title">Academic Profile</div>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>· click any field to edit</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <EditField label="Grade Level" value={lead.gradeLevel} fieldKey="gradeLevel" onSave={saveField} />
              <EditField label="School" value={lead.school} fieldKey="school" onSave={saveField} />
              <EditField label="City" value={lead.city} fieldKey="city" onSave={saveField} />
              <EditField label="Country" value={lead.country} fieldKey="country" onSave={saveField} />
              <EditField label="Desired Field" value={lead.desiredField} fieldKey="desiredField" onSave={saveField} />
              <EditField label="Target Schools" value={lead.desiredSchools} fieldKey="desiredSchools" onSave={saveField} />
              <EditField label="Test Scores" value={lead.testScores || lead.workExperience} fieldKey="testScores" onSave={saveField} />
              <EditField label="Budget" value={lead.budget} fieldKey="budget" onSave={saveField} />
            </div>
            <EditField label="Extracurriculars" value={lead.extracurriculars} fieldKey="extracurriculars" onSave={saveField} />
            <EditField label="Services Requested" value={lead.services} fieldKey="services" onSave={saveField} />
            <EditField label="Special Requests" value={lead.specialRequests} fieldKey="specialRequests" onSave={saveField} />
          </div>

          {/* Contact Log */}
          <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>Contact Log</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <select
                className="field"
                value={contactMedium}
                onChange={(e) => setContactMedium(e.target.value as ContactLogEntry["medium"])}
                style={{ width: 110, fontSize: 12 }}
              >
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="in-person">In Person</option>
                <option value="sms">SMS</option>
                <option value="other">Other</option>
              </select>
              <input
                className="field"
                value={contactNote}
                onChange={(e) => setContactNote(e.target.value)}
                placeholder="Brief note..."
                style={{ fontSize: 12, flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && contactNote.trim()) {
                    const now = new Date().toISOString();
                    const existing = overrides?.contactLog || [];
                    onUpdate(lead.id, {
                      contactLog: [{ timestamp: now, medium: contactMedium, note: contactNote.trim() }, ...existing],
                      lastContact: now.slice(0, 10),
                    });
                    setContactNote("");
                  }
                }}
              />
              <button
                className="btn btn-sm btn-primary"
                disabled={!contactNote.trim()}
                onClick={() => {
                  const now = new Date().toISOString();
                  const existing = overrides?.contactLog || [];
                  onUpdate(lead.id, {
                    contactLog: [{ timestamp: now, medium: contactMedium, note: contactNote.trim() }, ...existing],
                    lastContact: now.slice(0, 10),
                  });
                  setContactNote("");
                }}
              >
                Log
              </button>
            </div>
            {(overrides?.contactLog || []).length > 0 ? (
              <div className="timeline">
                {(overrides?.contactLog || []).map((entry, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" style={{ background: MEDIUM_COLORS[entry.medium] || "var(--ink-3)", marginTop: 3 }} />
                    <div>
                      <div className="timeline-type">{entry.medium}</div>
                      <div className="timeline-meta">{new Date(entry.timestamp).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</div>
                      <div className="timeline-content">{entry.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--ink-3)", padding: "8px 0" }}>No contacts logged yet.</div>
            )}
          </div>

          {/* Sales Notes */}
          <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, minHeight: 26 }}>
              <div className="section-title">Sales Notes</div>
              {/* Save button reserves space always to prevent layout shift */}
              <button
                className="btn btn-sm btn-primary"
                onClick={() => { onUpdate(lead.id, { salesNotes: salesNotesDraft }); if (rosterMatch) writeSharedNote("elio:note:sales", rosterMatch.id, salesNotesDraft, session?.user?.name ?? ""); setEditingSalesNotes(false); }}
                style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", height: "auto", visibility: salesNotesDraft !== (lead.salesNotes || "") ? "visible" : "hidden" }}
              >
                Save
              </button>
              {!editingSalesNotes && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setEditingSalesNotes(true)}
                  style={{ fontSize: 11, marginLeft: "auto" }}
                >
                  {salesNotesDraft ? "Edit" : "+ Add"}
                </button>
              )}
            </div>
            {editingSalesNotes ? (
              <textarea
                autoFocus
                className="field"
                value={salesNotesDraft}
                onChange={(e) => setSalesNotesDraft(e.target.value)}
                rows={Math.max(4, (salesNotesDraft || "").split("\n").length + 1)}
                style={{ fontSize: 12, resize: "vertical", width: "100%", lineHeight: 1.6, fontFamily: "inherit" }}
                onBlur={() => { if (salesNotesDraft === (lead.salesNotes || "")) setEditingSalesNotes(false); }}
              />
            ) : salesNotesDraft ? (
              <div
                onClick={() => setEditingSalesNotes(true)}
                style={{ fontSize: 12, lineHeight: 1.7, color: "var(--ink-2)", whiteSpace: "pre-wrap", cursor: "text", padding: "6px 8px", borderRadius: "var(--r-sm)", border: "1px solid transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
              >
                {salesNotesDraft}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic" }}>No sales notes yet.</div>
            )}
          </div>

          {/* Consultant Notes */}
          <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, minHeight: 26 }}>
              <div className="section-title">Consultant Notes</div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => { onUpdate(lead.id, { consultantNotes: consultantDraft }); if (rosterMatch) writeSharedNote("elio:note:counselor", rosterMatch.id, consultantDraft, session?.user?.name ?? ""); setEditingConsultantNotes(false); }}
                style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", height: "auto", visibility: consultantDraft !== (lead.consultantNotes || "") ? "visible" : "hidden" }}
              >
                Save
              </button>
              {!editingConsultantNotes && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setEditingConsultantNotes(true)}
                  style={{ fontSize: 11, marginLeft: "auto" }}
                >
                  {consultantDraft ? "Edit" : "+ Add"}
                </button>
              )}
            </div>
            {editingConsultantNotes ? (
              <textarea
                autoFocus
                className="field"
                value={consultantDraft}
                onChange={(e) => setConsultantDraft(e.target.value)}
                rows={Math.max(4, (consultantDraft || "").split("\n").length + 1)}
                style={{ fontSize: 12, resize: "vertical", width: "100%", lineHeight: 1.6, fontFamily: "inherit" }}
                onBlur={() => { if (consultantDraft === (lead.consultantNotes || "")) setEditingConsultantNotes(false); }}
              />
            ) : consultantDraft ? (
              <div
                onClick={() => setEditingConsultantNotes(true)}
                style={{ fontSize: 12, lineHeight: 1.7, color: "var(--ink-2)", whiteSpace: "pre-wrap", cursor: "text", padding: "6px 8px", borderRadius: "var(--r-sm)", border: "1px solid transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
              >
                {consultantDraft}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic" }}>No consultant notes yet.</div>
            )}
          </div>

          {/* Counselor Intel */}
          {rosterMatch && (
            <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 12 }}>
              <div className="section-title" style={{ marginBottom: 8 }}>Counselor Intel</div>
              <div style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.6, background: "var(--accent-soft)", padding: "10px 12px", borderRadius: "var(--r-md)", border: "1px solid rgba(0,112,243,0.15)" }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Assigned to {rosterMatch.assignedTo}</div>
                <div style={{ color: "var(--ink-2)" }}>{rosterMatch.keyNotes}</div>
                {rosterMatch.issues.length > 0 && (
                  <div style={{ marginTop: 6, color: "var(--danger)", fontWeight: 500 }}>
                    Issues: {rosterMatch.issues.join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proposal Link */}
          {lead.proposalLink && (
            <div style={{ marginBottom: 12 }}>
              <div className="section-title" style={{ marginBottom: 8 }}>Proposal</div>
              <a
                href={lead.proposalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{ color: "var(--accent)" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 1H2.5A1.5 1.5 0 001 2.5v7A1.5 1.5 0 002.5 11h7A1.5 1.5 0 0011 9.5V7M7 1h4v4M11 1L5.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Open Proposal
              </a>
            </div>
          )}

          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>
            Referral: {lead.referralSource || "—"} · Submitted by: {lead.submitter || "—"}
          </div>
        </div>
      </div>
      {/* Appointment Modal */}
      {showApptModal && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50 }}
            onClick={() => setShowApptModal(false)}
          />
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "var(--surface)",
            borderRadius: "var(--r-xl)",
            padding: 24,
            width: 360,
            zIndex: 51,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            border: "1px solid var(--line)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Schedule Appointment</div>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowApptModal(false)} style={{ padding: "4px 6px" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div className="detail-label" style={{ marginBottom: 4 }}>Date</div>
                <input
                  type="date"
                  className="field"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <div className="detail-label" style={{ marginBottom: 4 }}>Time</div>
                <input
                  type="time"
                  className="field"
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <div className="detail-label" style={{ marginBottom: 4 }}>Counselor</div>
                <select
                  className="field"
                  value={apptCounselor}
                  onChange={(e) => setApptCounselor(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {counselorUsers.length === 0 && (
                    <option value="" disabled>Loading...</option>
                  )}
                  {counselorUsers.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-primary"
                disabled={!apptDate}
                onClick={() => {
                  onUpdate(lead.id, {
                    appointmentDate: apptDate,
                    appointmentTime: apptTime,
                    appointmentCounselor: apptCounselor,
                  });
                  setShowApptModal(false);
                }}
              >
                Save Appointment
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Automation Email Modal ─────────────────────────────────── */}
      {automationModal && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.45)" }}
            onClick={() => setAutomationModal(null)} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            zIndex: 401, background: "var(--surface)", borderRadius: "var(--r-lg)",
            padding: 24, width: "min(520px, 92vw)", boxShadow: "0 8px 40px rgba(0,0,0,.18)",
            display: "grid", gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>
                  ⚡ Automation Triggered
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{automationModal.rule.name}</div>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setAutomationModal(null)}
                style={{ fontSize: 16, padding: "0 6px", lineHeight: 1 }}>×</button>
            </div>

            {/* Recipients */}
            <div>
              <div className="detail-label" style={{ marginBottom: 6 }}>Send to</div>
              {automationModal.recipients.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {automationModal.recipients.map((email) => (
                    <span key={email} style={{
                      fontSize: 12, padding: "3px 10px", borderRadius: 99,
                      background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 500,
                    }}>{email}</span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--warning)", fontWeight: 500 }}>
                  ⚠ No email address on file for this lead — update contact info first.
                </div>
              )}
            </div>

            {/* Subject */}
            <div>
              <div className="detail-label" style={{ marginBottom: 4 }}>Subject</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{automationModal.subject}</div>
            </div>

            {/* Body preview */}
            <div>
              <div className="detail-label" style={{ marginBottom: 4 }}>Body</div>
              <div style={{
                fontSize: 12, color: "var(--ink-2)", lineHeight: 1.7, whiteSpace: "pre-wrap",
                background: "var(--bg)", padding: "10px 12px", borderRadius: "var(--r-md)",
                border: "1px solid var(--line)", maxHeight: 180, overflowY: "auto",
              }}>
                {automationModal.body}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setAutomationModal(null)}
                style={{ fontSize: 13 }}>
                Dismiss
              </button>
              <button
                className="btn"
                disabled={automationModal.recipients.length === 0}
                style={{ fontSize: 13, opacity: automationModal.recipients.length > 0 ? 1 : 0.4 }}
                onClick={() => {
                  const { recipients, subject, body, rule } = automationModal;
                  // Open mailto
                  const to = recipients.join(",");
                  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  window.open(mailtoUrl, "_blank");
                  // Log it
                  appendLog({
                    id: Date.now().toString(),
                    ruleId: rule.id,
                    ruleName: rule.name,
                    leadId: lead.id,
                    studentName: lead.studentName,
                    sentTo: recipients,
                    subject,
                    sentAt: new Date().toISOString(),
                  });
                  setAutomationModal(null);
                }}
              >
                📧 Open in Email Client
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
