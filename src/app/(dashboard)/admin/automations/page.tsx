"use client";

import { useState, useEffect } from "react";
import {
  loadRules, saveRules, loadLog, appendLog,
  type AutomationRule, type AutomationRecipient, type AutomationLogEntry,
  STARTER_RULES,
} from "@/lib/automations";
import { STATUS_OPTIONS } from "@/lib/all-leads";

// ── RuleForm ──────────────────────────────────────────────────────────────────

const RECIPIENT_OPTIONS: { key: AutomationRecipient; label: string }[] = [
  { key: "parent",    label: "Parent Email" },
  { key: "student",   label: "Student Email" },
  { key: "counselor", label: "Assigned Counselor" },
];

const VARIABLES = ["{{studentName}}", "{{parentName}}", "{{grade}}", "{{school}}", "{{status}}", "{{counselorName}}", "{{appointmentDate}}", "{{appointmentTime}}"];

function RuleForm({
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

  const valid = name.trim() && recipients.length > 0 && subject.trim() && body.trim();

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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
        </div>
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
          onClick={() => onSave({ name: name.trim(), triggerStatus, recipients, subject: subject.trim(), body: body.trim(), isActive: initial?.isActive ?? true })}
          style={{ opacity: valid ? 1 : 0.4 }}
        >
          {initial ? "Save Changes" : "Create Rule"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AutomationsPage() {
  const [rules, setRulesState]       = useState<AutomationRule[]>([]);
  const [log, setLog]                = useState<AutomationLogEntry[]>([]);
  const [tab, setTab]                = useState<"rules" | "log">("rules");
  const [editing, setEditing]        = useState<AutomationRule | null>(null);
  const [creating, setCreating]      = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setRulesState(loadRules());
    setLog(loadLog());
  }, []);

  const persist = (next: AutomationRule[]) => {
    setRulesState(next);
    saveRules(next);
  };

  const createRule = (data: Omit<AutomationRule, "id" | "createdAt">) => {
    const rule: AutomationRule = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    persist([...rules, rule]);
    setCreating(false);
  };

  const updateRule = (data: Omit<AutomationRule, "id" | "createdAt">) => {
    if (!editing) return;
    persist(rules.map((r) => r.id === editing.id ? { ...r, ...data } : r));
    setEditing(null);
  };

  const toggleActive = (id: string) =>
    persist(rules.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r));

  const deleteRule = (id: string) => {
    persist(rules.filter((r) => r.id !== id));
    setDeleteConfirm(null);
  };

  const installStarters = () => {
    const added: AutomationRule[] = STARTER_RULES.map((r, i) => ({
      ...r,
      id: `starter-${Date.now()}-${i}`,
      createdAt: new Date().toISOString(),
    }));
    persist([...rules, ...added]);
  };

  const statusStyle = (s: string) => {
    if (s.startsWith("S1") || s.startsWith("S2")) return { bg: "#FEF3C7", color: "#92400E" };
    if (s.startsWith("S5") || s.startsWith("S6")) return { bg: "var(--accent-soft)", color: "var(--accent)" };
    if (s.startsWith("S9") || s.startsWith("S8") || s.startsWith("S7")) return { bg: "#F0F0FF", color: "#6D28D9" };
    if (s.includes("S10")) return { bg: "var(--success-bg)", color: "var(--success)" };
    if (s.includes("S11") || s.includes("S12")) return { bg: "var(--danger-soft)", color: "var(--danger)" };
    if (s.includes("S13")) return { bg: "var(--warning-bg)", color: "#92400E" };
    return { bg: "var(--bg-2)", color: "var(--ink-2)" };
  };

  return (
    <section style={{ display: "grid", gap: 20 }}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Email Automations</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {rules.length === 0 && (
            <button className="btn btn-ghost" onClick={installStarters} style={{ fontSize: 12 }}>
              ✦ Load starter templates
            </button>
          )}
          <button
            className="btn btn-sm"
            onClick={() => { setCreating(true); setEditing(null); }}
            style={{ fontWeight: 600 }}
          >
            + New Rule
          </button>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, background: "var(--bg-2)", padding: 3, borderRadius: "var(--r-md)", width: "fit-content" }}>
        {(["rules", "log"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "5px 16px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: tab === t ? 600 : 400,
              background: tab === t ? "var(--surface)" : "transparent",
              color: tab === t ? "var(--ink)" : "var(--ink-3)",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              transition: "all 150ms",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {t === "rules" ? "Rules" : "Send Log"}
            {t === "rules" && rules.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 99, background: "var(--ink-3)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {rules.length}
              </span>
            )}
            {t === "log" && log.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 99, background: "var(--ink-3)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {log.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Create form ───────────────────────────────────────────────── */}
      {creating && (
        <div className="panel-flush" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: "var(--ink)" }}>New Automation Rule</div>
          <RuleForm onSave={createRule} onCancel={() => setCreating(false)} />
        </div>
      )}

      {/* ── Rules tab ─────────────────────────────────────────────────── */}
      {tab === "rules" && (
        <div style={{ display: "grid", gap: 10 }}>
          {rules.length === 0 && !creating && (
            <div className="panel-flush" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>No automation rules yet</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16 }}>
                Rules fire when a lead's status changes — sending a template email to the parent, student, or counselor.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="btn btn-ghost" onClick={installStarters} style={{ fontSize: 13 }}>✦ Load starter templates</button>
                <button className="btn" onClick={() => setCreating(true)} style={{ fontSize: 13 }}>+ Create first rule</button>
              </div>
            </div>
          )}

          {rules.map((rule) => {
            const ss = statusStyle(rule.triggerStatus);
            const isEditing = editing?.id === rule.id;
            return (
              <div key={rule.id} className="panel-flush" style={{ overflow: "hidden" }}>
                {/* Rule header */}
                <div style={{
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
                  borderBottom: isEditing ? "1px solid var(--line)" : "none",
                  opacity: rule.isActive ? 1 : 0.55,
                }}>
                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(rule.id)}
                    title={rule.isActive ? "Disable rule" : "Enable rule"}
                    style={{
                      width: 32, height: 18, borderRadius: 99, border: "none", cursor: "pointer",
                      background: rule.isActive ? "var(--accent)" : "var(--line)",
                      position: "relative", flexShrink: 0, transition: "background 200ms",
                    }}
                  >
                    <span style={{
                      position: "absolute", top: 2,
                      left: rule.isActive ? 16 : 2,
                      width: 14, height: 14, borderRadius: "50%",
                      background: "#fff",
                      transition: "left 200ms",
                      boxShadow: "0 1px 2px rgba(0,0,0,.2)",
                    }} />
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{rule.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>When status →</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 99, background: ss.bg, color: ss.color }}>
                        {rule.triggerStatus.replace(/^S\d+ - /, "")}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>→ email to</span>
                      {rule.recipients.map((r) => (
                        <span key={r} style={{ fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "var(--bg-2)", color: "var(--ink-2)", fontWeight: 500 }}>
                          {r === "parent" ? "Parent" : r === "student" ? "Student" : "Counselor"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {!isEditing && (
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => { setEditing(rule); setCreating(false); }}
                        style={{ fontSize: 12 }}
                      >
                        Edit
                      </button>
                    )}
                    {deleteConfirm === rule.id ? (
                      <>
                        <button className="btn btn-sm" onClick={() => deleteRule(rule.id)}
                          style={{ fontSize: 12, background: "var(--danger)", color: "#fff", border: "none" }}>
                          Delete
                        </button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setDeleteConfirm(null)} style={{ fontSize: 12 }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setDeleteConfirm(rule.id)}
                        style={{ fontSize: 12, color: "var(--danger)" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit form inline */}
                {isEditing && (
                  <div style={{ padding: 20 }}>
                    <RuleForm
                      initial={rule}
                      onSave={updateRule}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                )}

                {/* Preview (collapsed, non-editing) */}
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
