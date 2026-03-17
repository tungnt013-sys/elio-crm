"use client";

import { useState, useEffect } from "react";
import { useRole } from "@/components/dashboard-shell";
import {
  loadRules, saveRules, loadLog, loadActionRules, saveActionRules, appendLog,
  type AutomationRule, type AutomationRecipient, type AutomationLogEntry,
  type ActionRule, type ActionStep,
  STARTER_RULES, STARTER_ACTION_RULES,
} from "@/lib/automations";
import { STATUS_OPTIONS } from "@/lib/all-leads";

// ── Email RuleForm ─────────────────────────────────────────────────────────────

const RECIPIENT_OPTIONS: { key: AutomationRecipient; label: string }[] = [
  { key: "parent",    label: "Parent Email" },
  { key: "student",   label: "Student Email" },
  { key: "counselor", label: "Assigned Counselor" },
];

const VARIABLES = ["{{studentName}}", "{{parentName}}", "{{grade}}", "{{school}}", "{{status}}", "{{counselorName}}", "{{appointmentDate}}", "{{appointmentTime}}"];

function EmailRuleForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: AutomationRule;
  onSave: (rule: Omit<AutomationRule, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [name, setName]             = useState(initial?.name ?? "");
  const [triggerStatus, setTrigger] = useState(initial?.triggerStatus ?? STATUS_OPTIONS[0]);
  const [recipients, setRecipients] = useState<AutomationRecipient[]>(initial?.recipients ?? ["parent"]);
  const [othersEnabled, setOthersEnabled] = useState((initial?.otherEmails ?? []).length > 0);
  const [othersInput, setOthersInput] = useState((initial?.otherEmails ?? []).join(", "));
  const [subject, setSubject]       = useState(initial?.subject ?? "");
  const [body, setBody]             = useState(initial?.body ?? "");

  const toggleRecipient = (r: AutomationRecipient) =>
    setRecipients((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );

  const insertVar = (v: string, field: "subject" | "body") => {
    if (field === "subject") setSubject((p) => p + v);
    else setBody((p) => p + v);
  };

  const otherEmails = othersEnabled
    ? othersInput.split(/[,\n]+/).map((e) => e.trim()).filter(Boolean)
    : [];

  const valid = name.trim() && (recipients.length > 0 || otherEmails.length > 0) && subject.trim() && body.trim();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Name */}
      <div>
        <div className="detail-label" style={{ marginBottom: 6 }}>Rule Name</div>
        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Appointment Confirmation Email"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* Trigger */}
      <div>
        <div className="detail-label" style={{ marginBottom: 6 }}>Trigger — when status changes to</div>
        <select
          className="field"
          value={triggerStatus}
          onChange={(e) => setTrigger(e.target.value)}
          style={{ fontSize: 13 }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Recipients */}
      <div>
        <div className="detail-label" style={{ marginBottom: 8 }}>Send to</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {RECIPIENT_OPTIONS.map(({ key, label }) => (
            <label
              key={key}
              style={{
                display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                fontSize: 13, padding: "6px 12px", borderRadius: "var(--r-sm)",
                border: `1px solid ${recipients.includes(key) ? "var(--accent)" : "var(--line)"}`,
                background: recipients.includes(key) ? "var(--accent-soft)" : "var(--bg)",
                color: recipients.includes(key) ? "var(--accent)" : "var(--ink-2)",
                fontWeight: recipients.includes(key) ? 600 : 400,
                transition: "all 120ms",
              }}
            >
              <input
                type="checkbox"
                checked={recipients.includes(key)}
                onChange={() => toggleRecipient(key)}
                style={{ display: "none" }}
              />
              {recipients.includes(key) ? "✓ " : ""}{label}
            </label>
          ))}
          {/* Others chip */}
          <label
            style={{
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
              fontSize: 13, padding: "6px 12px", borderRadius: "var(--r-sm)",
              border: `1px solid ${othersEnabled ? "var(--accent)" : "var(--line)"}`,
              background: othersEnabled ? "var(--accent-soft)" : "var(--bg)",
              color: othersEnabled ? "var(--accent)" : "var(--ink-2)",
              fontWeight: othersEnabled ? 600 : 400,
              transition: "all 120ms",
            }}
          >
            <input
              type="checkbox"
              checked={othersEnabled}
              onChange={(e) => setOthersEnabled(e.target.checked)}
              style={{ display: "none" }}
            />
            {othersEnabled ? "✓ " : ""}Others
          </label>
        </div>

        {/* Others email input */}
        {othersEnabled && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>Enter email addresses (comma-separated)</div>
            <textarea
              className="field"
              rows={2}
              value={othersInput}
              onChange={(e) => setOthersInput(e.target.value)}
              placeholder="e.g. manager@elio.education, partner@example.com"
              style={{ fontSize: 12, resize: "vertical" }}
            />
          </div>
        )}
      </div>

      {/* Variables help */}
      <div>
        <div className="detail-label" style={{ marginBottom: 6 }}>Available variables</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {VARIABLES.map((v) => (
            <button
              key={v}
              className="btn btn-sm btn-ghost"
              onClick={() => insertVar(v, "body")}
              style={{ fontSize: 11, fontFamily: "monospace", padding: "2px 8px" }}
              title="Click to insert into body"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div className="detail-label">Email Subject</div>
          <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }} onClick={() => insertVar("{{studentName}}", "subject")}>
            + studentName
          </button>
        </div>
        <input
          className="field"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Xác nhận lịch tư vấn – {{studentName}}"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* Body */}
      <div>
        <div className="detail-label" style={{ marginBottom: 6 }}>Email Body</div>
        <textarea
          className="field"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email template here. Use variables like {{studentName}} to personalise."
          style={{ fontSize: 13, lineHeight: 1.6, resize: "vertical" }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button
          className="btn"
          disabled={!valid}
          onClick={() => onSave({
            name: name.trim(), triggerStatus, recipients, otherEmails, subject: subject.trim(),
            body: body.trim(), isActive: initial?.isActive ?? true,
          })}
          style={{ opacity: valid ? 1 : 0.4 }}
        >
          {initial ? "Save Changes" : "Create Rule"}
        </button>
      </div>
    </div>
  );
}

// ── Action RuleForm ───────────────────────────────────────────────────────────

function ActionRuleForm({
  initial,
  emailRules,
  onSave,
  onCancel,
}: {
  initial?: ActionRule;
  emailRules: AutomationRule[];
  onSave: (rule: Omit<ActionRule, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [name, setName]             = useState(initial?.name ?? "");
  const [triggerStatus, setTrigger] = useState(initial?.triggerStatus ?? STATUS_OPTIONS[0]);
  const [deadlineEnabled, setDeadlineEnabled] = useState(
    (initial?.steps ?? []).some((s) => s.type === "setDeadline")
  );
  const initStep = initial?.steps?.find((s) => s.type === "setDeadline") as (ActionStep & { type: "setDeadline" }) | undefined;
  const [deadlineDays, setDeadlineDays] = useState(initStep?.days ?? 3);
  const [deadlineBasis, setDeadlineBasis] = useState<"business" | "calendar">(initStep?.basis ?? "business");
  const [emailEnabled, setEmailEnabled] = useState(!!initial?.emailRuleId);
  const [emailRuleId, setEmailRuleId]   = useState(initial?.emailRuleId ?? "");

  const steps: ActionStep[] = deadlineEnabled
    ? [{ type: "setDeadline", days: deadlineDays, basis: deadlineBasis }]
    : [];

  const valid = name.trim() && (steps.length > 0 || emailEnabled);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Name */}
      <div>
        <div className="detail-label" style={{ marginBottom: 6 }}>Rule Name</div>
        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. S1 → Contact Deadline"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* Trigger */}
      <div>
        <div className="detail-label" style={{ marginBottom: 6 }}>Trigger — when status changes to</div>
        <select
          className="field"
          value={triggerStatus}
          onChange={(e) => setTrigger(e.target.value)}
          style={{ fontSize: 13 }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Set Deadline step */}
      <div style={{ padding: "12px 14px", borderRadius: "var(--r-md)", border: "1px solid var(--line)", background: "var(--bg)" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: deadlineEnabled ? 12 : 0 }}>
          <span style={{
            width: 32, height: 18, borderRadius: 99, border: "none", cursor: "pointer", flexShrink: 0,
            background: deadlineEnabled ? "var(--accent)" : "var(--line)",
            position: "relative", display: "inline-block", transition: "background 200ms",
          }}>
            <span style={{
              position: "absolute", top: 2,
              left: deadlineEnabled ? 16 : 2,
              width: 14, height: 14, borderRadius: "50%", background: "var(--surface)",
              transition: "left 200ms", boxShadow: "0 1px 2px rgba(0,0,0,.2)",
            }} />
          </span>
          <input type="checkbox" checked={deadlineEnabled} onChange={(e) => setDeadlineEnabled(e.target.checked)} style={{ display: "none" }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Set Deadline</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Auto-set a deadline when this status is entered</div>
          </div>
        </label>

        {deadlineEnabled && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              type="number"
              className="field"
              value={deadlineDays}
              min={1}
              max={90}
              onChange={(e) => setDeadlineDays(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: 64, fontSize: 13 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              {(["business", "calendar"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setDeadlineBasis(b)}
                  style={{
                    fontSize: 12, padding: "4px 10px", borderRadius: "var(--r-sm)", cursor: "pointer",
                    border: `1px solid ${deadlineBasis === b ? "var(--accent)" : "var(--line)"}`,
                    background: deadlineBasis === b ? "var(--accent-soft)" : "var(--bg)",
                    color: deadlineBasis === b ? "var(--accent)" : "var(--ink-2)",
                    fontWeight: deadlineBasis === b ? 600 : 400,
                  }}
                >
                  {b === "business" ? "Business days" : "Calendar days"}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontStyle: "italic" }}>
              → deadline {deadlineDays} {deadlineBasis} day{deadlineDays !== 1 ? "s" : ""} from trigger
            </div>
          </div>
        )}
      </div>

      {/* Also send email */}
      <div style={{ padding: "12px 14px", borderRadius: "var(--r-md)", border: "1px solid var(--line)", background: "var(--bg)" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: emailEnabled ? 12 : 0 }}>
          <span style={{
            width: 32, height: 18, borderRadius: 99, flexShrink: 0,
            background: emailEnabled ? "var(--accent)" : "var(--line)",
            position: "relative", display: "inline-block", transition: "background 200ms",
          }}>
            <span style={{
              position: "absolute", top: 2,
              left: emailEnabled ? 16 : 2,
              width: 14, height: 14, borderRadius: "50%", background: "var(--surface)",
              transition: "left 200ms", boxShadow: "0 1px 2px rgba(0,0,0,.2)",
            }} />
          </span>
          <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} style={{ display: "none" }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Also send an email</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Trigger an email automation when this rule fires</div>
          </div>
        </label>

        {emailEnabled && (
          emailRules.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic" }}>
              No email rules yet — create one in the Email tab first.
            </div>
          ) : (
            <select
              className="field"
              value={emailRuleId}
              onChange={(e) => setEmailRuleId(e.target.value)}
              style={{ fontSize: 13 }}
            >
              <option value="">— Select email rule —</option>
              {emailRules.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.triggerStatus.replace(/^S\d+ - /, "")})</option>
              ))}
            </select>
          )
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button
          className="btn"
          disabled={!valid}
          onClick={() => onSave({
            name: name.trim(), triggerStatus, steps,
            emailRuleId: emailEnabled && emailRuleId ? emailRuleId : undefined,
            isActive: initial?.isActive ?? true,
          })}
          style={{ opacity: valid ? 1 : 0.4 }}
        >
          {initial ? "Save Changes" : "Create Rule"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type TabKey = "email" | "actions" | "log";

export default function AutomationsPage() {
  const { role } = useRole();
  const isAdmin = role === "admin";

  const [rules, setRulesState]             = useState<AutomationRule[]>([]);
  const [actionRules, setActionRulesState] = useState<ActionRule[]>([]);
  const [log, setLog]                      = useState<AutomationLogEntry[]>([]);
  const [tab, setTab]                      = useState<TabKey>("email");

  // Email rule state
  const [editingEmail, setEditingEmail]   = useState<AutomationRule | null>(null);
  const [creatingEmail, setCreatingEmail] = useState(false);
  const [emailDeleteConfirm, setEmailDeleteConfirm] = useState<string | null>(null);

  // Action rule state
  const [editingAction, setEditingAction]   = useState<ActionRule | null>(null);
  const [creatingAction, setCreatingAction] = useState(false);
  const [actionDeleteConfirm, setActionDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setRulesState(loadRules());
    setActionRulesState(loadActionRules());
    setLog(loadLog());
  }, []);

  // ── Email rule CRUD ─────────────────────────────────────────────────────────
  const persistEmail = (next: AutomationRule[]) => { setRulesState(next); saveRules(next); };

  const createEmailRule = (data: Omit<AutomationRule, "id" | "createdAt">) => {
    persistEmail([...rules, { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    setCreatingEmail(false);
  };

  const updateEmailRule = (data: Omit<AutomationRule, "id" | "createdAt">) => {
    if (!editingEmail) return;
    persistEmail(rules.map((r) => r.id === editingEmail.id ? { ...r, ...data } : r));
    setEditingEmail(null);
  };

  const toggleEmailActive = (id: string) =>
    persistEmail(rules.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r));

  const deleteEmailRule = (id: string) => { persistEmail(rules.filter((r) => r.id !== id)); setEmailDeleteConfirm(null); };

  const installEmailStarters = () => {
    const added = STARTER_RULES.map((r, i) => ({ ...r, id: `starter-${Date.now()}-${i}`, createdAt: new Date().toISOString() }));
    persistEmail([...rules, ...added]);
  };

  // ── Action rule CRUD ────────────────────────────────────────────────────────
  const persistAction = (next: ActionRule[]) => { setActionRulesState(next); saveActionRules(next); };

  const createActionRule = (data: Omit<ActionRule, "id" | "createdAt">) => {
    persistAction([...actionRules, { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    setCreatingAction(false);
  };

  const updateActionRule = (data: Omit<ActionRule, "id" | "createdAt">) => {
    if (!editingAction) return;
    persistAction(actionRules.map((r) => r.id === editingAction.id ? { ...r, ...data } : r));
    setEditingAction(null);
  };

  const toggleActionActive = (id: string) =>
    persistAction(actionRules.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r));

  const deleteActionRule = (id: string) => { persistAction(actionRules.filter((r) => r.id !== id)); setActionDeleteConfirm(null); };

  const installActionStarters = () => {
    const added = STARTER_ACTION_RULES.map((r, i) => ({ ...r, id: `action-starter-${Date.now()}-${i}`, createdAt: new Date().toISOString() }));
    persistAction([...actionRules, ...added]);
  };

  // ── Shared helpers ──────────────────────────────────────────────────────────
  const statusStyle = (s: string) => {
    if (s.startsWith("S1") || s.startsWith("S2")) return { bg: "var(--badge-amber-bg)", color: "var(--badge-amber-text)" };
    if (s.startsWith("S5") || s.startsWith("S6")) return { bg: "var(--accent-soft)", color: "var(--accent)" };
    if (s.startsWith("S9") || s.startsWith("S8") || s.startsWith("S7")) return { bg: "var(--badge-purple-bg)", color: "var(--badge-purple-text)" };
    if (s.includes("S10")) return { bg: "var(--success-bg)", color: "var(--success)" };
    if (s.includes("S11") || s.includes("S12")) return { bg: "var(--danger-soft)", color: "var(--danger)" };
    if (s.includes("S13")) return { bg: "var(--warning-bg)", color: "var(--badge-amber-text)" };
    return { bg: "var(--bg-2)", color: "var(--ink-2)" };
  };

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    { key: "email",   label: "✉ Email",   count: rules.length || undefined },
    { key: "actions", label: "⚡ Actions", count: actionRules.length || undefined },
    { key: "log",     label: "Log",        count: log.length || undefined },
  ];

  return (
    <section style={{ display: "grid", gap: 20 }}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Automations</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {tab === "email" && (
            <>
              {rules.length === 0 && (
                <button className="btn btn-ghost" onClick={installEmailStarters} style={{ fontSize: 12 }}>
                  ✦ Load starter templates
                </button>
              )}
              <button className="btn btn-sm" onClick={() => { setCreatingEmail(true); setEditingEmail(null); }} style={{ fontWeight: 600 }}>
                + New Email Rule
              </button>
            </>
          )}
          {tab === "actions" && isAdmin && (
            <>
              {actionRules.length === 0 && (
                <button className="btn btn-ghost" onClick={installActionStarters} style={{ fontSize: 12 }}>
                  ✦ Load starter rules
                </button>
              )}
              <button className="btn btn-sm" onClick={() => { setCreatingAction(true); setEditingAction(null); }} style={{ fontWeight: 600 }}>
                + New Action Rule
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, background: "var(--bg-2)", padding: 3, borderRadius: "var(--r-md)", width: "fit-content" }}>
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "5px 16px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: tab === key ? 600 : 400,
              background: tab === key ? "var(--surface)" : "transparent",
              color: tab === key ? "var(--ink)" : "var(--ink-3)",
              boxShadow: tab === key ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              transition: "all 150ms",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {label}
            {count !== undefined && (
              <span style={{ fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 99, background: "var(--ink-3)", color: "var(--bg)", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Email tab ─────────────────────────────────────────────────── */}
      {tab === "email" && (
        <div style={{ display: "grid", gap: 10 }}>
          {creatingEmail && (
            <div className="panel-flush" style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                <span>✉</span> New Email Rule
              </div>
              <EmailRuleForm onSave={createEmailRule} onCancel={() => setCreatingEmail(false)} />
            </div>
          )}

          {rules.length === 0 && !creatingEmail && (
            <div className="panel-flush" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✉</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>No email rules yet</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16 }}>
                Email rules fire when a lead's status changes — sending a template to the parent, student, counselor, or custom addresses.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="btn btn-ghost" onClick={installEmailStarters} style={{ fontSize: 13 }}>✦ Load starter templates</button>
                <button className="btn" onClick={() => setCreatingEmail(true)} style={{ fontSize: 13 }}>+ Create first rule</button>
              </div>
            </div>
          )}

          {rules.map((rule) => {
            const ss = statusStyle(rule.triggerStatus);
            const isEditing = editingEmail?.id === rule.id;
            const allRecipients = [
              ...rule.recipients.map((r) => r === "parent" ? "Parent" : r === "student" ? "Student" : "Counselor"),
              ...(rule.otherEmails ?? []).map((e) => e),
            ];
            return (
              <div key={rule.id} className="panel-flush" style={{ overflow: "hidden" }}>
                <div style={{
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
                  borderBottom: isEditing ? "1px solid var(--line)" : "none",
                  opacity: rule.isActive ? 1 : 0.55,
                }}>
                  <button
                    onClick={() => toggleEmailActive(rule.id)}
                    title={rule.isActive ? "Disable rule" : "Enable rule"}
                    style={{ width: 32, height: 18, borderRadius: 99, border: "none", cursor: "pointer", background: rule.isActive ? "var(--accent)" : "var(--line)", position: "relative", flexShrink: 0, transition: "background 200ms" }}
                  >
                    <span style={{ position: "absolute", top: 2, left: rule.isActive ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "var(--surface)", transition: "left 200ms", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{rule.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>When →</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 99, background: ss.bg, color: ss.color }}>
                        {rule.triggerStatus.replace(/^S\d+ - /, "")}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>→ email to</span>
                      {allRecipients.slice(0, 3).map((r, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "var(--bg-2)", color: "var(--ink-2)", fontWeight: 500 }}>
                          {r}
                        </span>
                      ))}
                      {allRecipients.length > 3 && (
                        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>+{allRecipients.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {!isEditing && (
                      <button className="btn btn-sm btn-ghost" onClick={() => { setEditingEmail(rule); setCreatingEmail(false); }} style={{ fontSize: 12 }}>Edit</button>
                    )}
                    {emailDeleteConfirm === rule.id ? (
                      <>
                        <button className="btn btn-sm" onClick={() => deleteEmailRule(rule.id)} style={{ fontSize: 12, background: "var(--danger)", color: "var(--on-solid)", border: "none" }}>Delete</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setEmailDeleteConfirm(null)} style={{ fontSize: 12 }}>Cancel</button>
                      </>
                    ) : (
                      <button className="btn btn-sm btn-ghost" onClick={() => setEmailDeleteConfirm(rule.id)} style={{ fontSize: 12, color: "var(--danger)" }}>Delete</button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div style={{ padding: 20 }}>
                    <EmailRuleForm initial={rule} onSave={updateEmailRule} onCancel={() => setEditingEmail(null)} />
                  </div>
                )}

                {!isEditing && (
                  <div style={{ padding: "8px 16px 12px", borderTop: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>Subject</div>
                    <div style={{ fontSize: 12, color: "var(--ink-2)", fontStyle: "italic" }}>{rule.subject}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Actions tab ───────────────────────────────────────────────── */}
      {tab === "actions" && (
        <div style={{ display: "grid", gap: 10 }}>
          {/* Admin-only notice for non-admins */}
          {!isAdmin && (
            <div style={{ padding: "10px 14px", background: "var(--warning-bg)", borderRadius: "var(--r-md)", border: "1px solid var(--warning)", display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔒</span>
              <span style={{ fontSize: 13, color: "var(--badge-amber-text)" }}>Action rules can only be created and edited by Admins.</span>
            </div>
          )}

          {creatingAction && isAdmin && (
            <div className="panel-flush" style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                <span>⚡</span> New Action Rule
              </div>
              <ActionRuleForm emailRules={rules} onSave={createActionRule} onCancel={() => setCreatingAction(false)} />
            </div>
          )}

          {actionRules.length === 0 && !creatingAction && (
            <div className="panel-flush" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>No action rules yet</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16 }}>
                Action rules fire silently when a lead's status changes — auto-setting deadlines and optionally triggering an email.
              </div>
              {isAdmin && (
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button className="btn btn-ghost" onClick={installActionStarters} style={{ fontSize: 13 }}>✦ Load starter rules</button>
                  <button className="btn" onClick={() => setCreatingAction(true)} style={{ fontSize: 13 }}>+ Create first rule</button>
                </div>
              )}
            </div>
          )}

          {actionRules.map((rule) => {
            const ss = statusStyle(rule.triggerStatus);
            const isEditing = editingAction?.id === rule.id;
            const deadlineStep = rule.steps.find((s) => s.type === "setDeadline") as (ActionStep & { type: "setDeadline" }) | undefined;
            const linkedEmail = rule.emailRuleId ? rules.find((r) => r.id === rule.emailRuleId) : undefined;

            return (
              <div key={rule.id} className="panel-flush" style={{ overflow: "hidden" }}>
                <div style={{
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
                  borderBottom: isEditing ? "1px solid var(--line)" : "none",
                  opacity: rule.isActive ? 1 : 0.55,
                }}>
                  {/* Toggle — admin only */}
                  <button
                    onClick={() => isAdmin && toggleActionActive(rule.id)}
                    title={isAdmin ? (rule.isActive ? "Disable rule" : "Enable rule") : "Admin only"}
                    style={{ width: 32, height: 18, borderRadius: 99, border: "none", cursor: isAdmin ? "pointer" : "not-allowed", background: rule.isActive ? "var(--badge-purple-text)" : "var(--line)", position: "relative", flexShrink: 0, transition: "background 200ms" }}
                  >
                    <span style={{ position: "absolute", top: 2, left: rule.isActive ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "var(--surface)", transition: "left 200ms", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{rule.name}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "var(--badge-purple-bg)", color: "var(--badge-purple-text)", letterSpacing: "0.03em" }}>ADMIN</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>When →</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 99, background: ss.bg, color: ss.color }}>
                        {rule.triggerStatus.replace(/^S\d+ - /, "")}
                      </span>
                      {deadlineStep && (
                        <>
                          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>→ deadline</span>
                          <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "var(--badge-purple-bg)", color: "var(--badge-purple-text)", fontWeight: 500 }}>
                            +{deadlineStep.days} {deadlineStep.basis} days
                          </span>
                        </>
                      )}
                      {linkedEmail && (
                        <>
                          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>+ email</span>
                          <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 500 }}>
                            {linkedEmail.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      {!isEditing && (
                        <button className="btn btn-sm btn-ghost" onClick={() => { setEditingAction(rule); setCreatingAction(false); }} style={{ fontSize: 12 }}>Edit</button>
                      )}
                      {actionDeleteConfirm === rule.id ? (
                        <>
                          <button className="btn btn-sm" onClick={() => deleteActionRule(rule.id)} style={{ fontSize: 12, background: "var(--danger)", color: "var(--on-solid)", border: "none" }}>Delete</button>
                          <button className="btn btn-sm btn-ghost" onClick={() => setActionDeleteConfirm(null)} style={{ fontSize: 12 }}>Cancel</button>
                        </>
                      ) : (
                        <button className="btn btn-sm btn-ghost" onClick={() => setActionDeleteConfirm(rule.id)} style={{ fontSize: 12, color: "var(--danger)" }}>Delete</button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && isAdmin && (
                  <div style={{ padding: 20 }}>
                    <ActionRuleForm initial={rule} emailRules={rules} onSave={updateActionRule} onCancel={() => setEditingAction(null)} />
                  </div>
                )}

                {!isEditing && deadlineStep && (
                  <div style={{ padding: "8px 16px 12px", borderTop: "1px solid var(--line)", fontSize: 12, color: "var(--ink-2)", fontStyle: "italic" }}>
                    Sets deadline to {deadlineStep.days} {deadlineStep.basis} day{deadlineStep.days !== 1 ? "s" : ""} after status entry
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Log tab ───────────────────────────────────────────────────── */}
      {tab === "log" && (
        <div className="panel-flush">
          {log.length === 0 ? (
            <div className="empty-state" style={{ padding: 32, fontSize: 13 }}>
              No emails sent yet. Emails are logged here when automations fire during a status change.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rule</th>
                    <th>Student</th>
                    <th>Sent to</th>
                    <th>Subject</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((entry) => (
                    <tr key={entry.id}>
                      <td style={{ fontSize: 12, fontWeight: 500 }}>{entry.ruleName}</td>
                      <td style={{ fontSize: 12 }}>{entry.studentName}</td>
                      <td style={{ fontSize: 11, color: "var(--ink-2)" }}>{entry.sentTo.join(", ") || "—"}</td>
                      <td style={{ fontSize: 12, color: "var(--ink-2)" }}>{entry.subject}</td>
                      <td style={{ fontSize: 11, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
                        {new Date(entry.sentAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
