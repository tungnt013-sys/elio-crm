"use client";

import { use, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { STUDENT_ROSTER, type StudentDetail } from "@/lib/mock-data";
import { ALL_LEADS } from "@/lib/all-leads";

// ── Types ─────────────────────────────────────────────────────────────────────

type NoteEntry = { content: string; editedBy: string; editedAt: string };
type NoteStore = Record<string, NoteEntry>;

type TouchPoint = {
  id: string;
  date: string;
  type: "call" | "email" | "meeting" | "message" | "note";
  with: "student" | "parent" | "both";
  summary: string;
  addedBy: string;
};

type GamePlanItem = { id: string; item: string; deadline: string; byWho: string; done: boolean };
type GamePlan = { keyNotes: string; items: GamePlanItem[]; flags: string[] };

type ProposalEntry = { url: string; submittedBy: string; submittedAt: string; seen: boolean };

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS = {
  notes:       (k: "counselor" | "sales") => `elio:note:${k}`,
  touchpoints: (id: string) => `elio:touchpoints:${id}`,
  gamePlans:   "elio:gamePlans",
  proposals:   "elio:proposals",
};

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function write(key: string, value: unknown) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TOUCH_ICONS: Record<TouchPoint["type"], string> = {
  call: "📞", email: "✉️", meeting: "🤝", message: "💬", note: "📝",
};
const TOUCH_LABELS: Record<TouchPoint["type"], string> = {
  call: "Call", email: "Email", meeting: "Meeting", message: "Message", note: "Note",
};
const WITH_LABELS: Record<TouchPoint["with"], string> = {
  student: "Student", parent: "Parent", both: "Student & Parent",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const BADGE_CLASS: Record<string, string> = {
  grad: "badge-grad", g11: "badge-g11", g9: "badge-g9", done: "badge-done",
};

// ── NotePanel ────────────────────────────────────────────────────────────────

function NotePanel({
  title, lsKey, studentId, canEdit, accentColor, fallback,
}: {
  title: string; lsKey: string; studentId: string; canEdit: boolean; accentColor?: string; fallback?: string;
}) {
  const { data: session } = useSession();
  const [stored, setStored] = useState<NoteEntry | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setStored(readStore<NoteStore>(lsKey, {})[studentId] ?? null);
  }, [lsKey, studentId]);

  const displayContent = stored?.content || fallback || "";
  const startEdit = () => { setDraft(stored?.content ?? fallback ?? ""); setEditing(true); };

  const save = useCallback(() => {
    const entry: NoteEntry = {
      content: draft.trim(),
      editedBy: session?.user?.name ?? session?.user?.email ?? "Unknown",
      editedAt: new Date().toISOString(),
    };
    const store = readStore<NoteStore>(lsKey, {});
    store[studentId] = entry;
    write(lsKey, store);
    setStored(entry);
    setEditing(false);
  }, [draft, lsKey, studentId, session]);

  const color = accentColor ?? "var(--accent)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{title}</span>
        {canEdit && !editing && (
          <button className="btn btn-sm btn-ghost" onClick={startEdit} style={{ fontSize: 11 }}>
            {displayContent ? "Edit" : "+ Add note"}
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ display: "grid", gap: 8 }}>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            className="field"
            style={{ fontSize: 13, lineHeight: 1.65, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm" onClick={save}>Save</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : displayContent ? (
        <div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink-2)", margin: 0, whiteSpace: "pre-wrap" }}>
            {displayContent}
          </p>
          {stored?.editedBy && (
            <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6, margin: "6px 0 0" }}>
              Last edited by <strong style={{ color: "var(--ink-2)" }}>{stored.editedBy}</strong> · {fmtDateTime(stored.editedAt)}
            </p>
          )}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0, fontStyle: "italic" }}>No note yet.</p>
      )}

      <div style={{ height: 2, borderRadius: 99, background: color, opacity: 0.2, marginTop: 2 }} />
    </div>
  );
}

// ── TouchPoints ───────────────────────────────────────────────────────────────

function TouchPoints({ studentId, userName }: { studentId: string; userName: string }) {
  const [points, setPoints] = useState<TouchPoint[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<TouchPoint, "id" | "addedBy">>({
    date: new Date().toISOString().slice(0, 10),
    type: "call",
    with: "parent",
    summary: "",
  });

  useEffect(() => {
    setPoints(readStore<TouchPoint[]>(LS.touchpoints(studentId), []));
  }, [studentId]);

  const save = () => {
    if (!form.summary.trim()) return;
    const entry: TouchPoint = { ...form, id: Date.now().toString(), addedBy: userName };
    const next = [entry, ...points].sort((a, b) => b.date.localeCompare(a.date));
    setPoints(next);
    write(LS.touchpoints(studentId), next);
    setAdding(false);
    setForm({ date: new Date().toISOString().slice(0, 10), type: "call", with: "parent", summary: "" });
  };

  const remove = (id: string) => {
    const next = points.filter((p) => p.id !== id);
    setPoints(next);
    write(LS.touchpoints(studentId), next);
  };

  return (
    <div style={{ display: "grid", gap: 0 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid var(--line)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="section-title">Touch Points</span>
          {points.length > 0 && (
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{points.length} recorded</span>
          )}
        </div>
        {!adding && (
          <button className="btn btn-sm" onClick={() => setAdding(true)} style={{ fontSize: 12 }}>
            + Log interaction
          </button>
        )}
      </div>

      {adding && (
        <div style={{ padding: 16, borderBottom: "1px solid var(--line)", background: "var(--bg-2)", display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div>
              <div className="detail-label" style={{ marginBottom: 4 }}>Date</div>
              <input type="date" className="field" value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                style={{ fontSize: 13 }} />
            </div>
            <div>
              <div className="detail-label" style={{ marginBottom: 4 }}>Type</div>
              <select className="field" value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TouchPoint["type"] }))}
                style={{ fontSize: 13 }}>
                {(["call", "email", "meeting", "message", "note"] as const).map((t) => (
                  <option key={t} value={t}>{TOUCH_ICONS[t]} {TOUCH_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="detail-label" style={{ marginBottom: 4 }}>With</div>
              <select className="field" value={form.with}
                onChange={(e) => setForm((f) => ({ ...f, with: e.target.value as TouchPoint["with"] }))}
                style={{ fontSize: 13 }}>
                {(["student", "parent", "both"] as const).map((w) => (
                  <option key={w} value={w}>{WITH_LABELS[w]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="detail-label" style={{ marginBottom: 4 }}>Summary</div>
            <textarea className="field" rows={3} value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              placeholder="Brief summary of the interaction…"
              style={{ fontSize: 13, lineHeight: 1.6, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm" onClick={save}
              style={{ opacity: form.summary.trim() ? 1 : 0.4 }}
              disabled={!form.summary.trim()}>Save</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {points.length === 0 && !adding ? (
        <div className="empty-state" style={{ padding: "28px 16px", fontSize: 13 }}>
          No interactions logged yet. Click "Log interaction" to start tracking touch points.
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", left: 27, top: 0, bottom: 0, width: 1,
            background: "var(--line)", zIndex: 0,
          }} />
          {points.map((p, i) => (
            <div key={p.id} style={{
              display: "flex", gap: 14, padding: "14px 16px",
              borderBottom: i < points.length - 1 ? "1px solid var(--line)" : "none",
              position: "relative",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", background: "var(--surface)",
                border: "2px solid var(--line)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11, flexShrink: 0,
                position: "relative", zIndex: 1,
              }}>
                {TOUCH_ICONS[p.type]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                    {TOUCH_LABELS[p.type]}
                  </span>
                  <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "var(--bg-2)", color: "var(--ink-3)" }}>
                    with {WITH_LABELS[p.with]}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{fmtDate(p.date)}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>· {p.addedBy}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-2)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {p.summary}
                </p>
              </div>
              <button
                onClick={() => remove(p.id)}
                style={{ fontSize: 12, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: "2px 4px", alignSelf: "flex-start" }}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ProposalSection ───────────────────────────────────────────────────────────

function ProposalSection({ student }: { student: StudentDetail }) {
  const [proposal, setProposal] = useState<ProposalEntry | null>(null);

  useEffect(() => {
    const lead = ALL_LEADS.find(
      (l) => l.studentName === student.fullName ||
             student.fullName.includes(l.studentName.split(" ").pop() || "___")
    );
    if (!lead) return;
    const proposals = readStore<Record<string, ProposalEntry>>(LS.proposals, {});
    setProposal(proposals[lead.id] ?? null);
  }, [student.fullName]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="section-title">Proposal</span>
        {proposal && (
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--success-bg)", color: "var(--success)", fontWeight: 600 }}>
            ✓ Submitted
          </span>
        )}
      </div>
      {proposal ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a
            href={proposal.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            {proposal.url}
          </a>
          <span style={{ fontSize: 11, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
            {proposal.submittedBy} · {fmtDate(proposal.submittedAt.slice(0, 10))}
          </span>
        </div>
      ) : (
        <span style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic" }}>Not submitted yet</span>
      )}
    </div>
  );
}

// ── KeyNotesSection ───────────────────────────────────────────────────────────

function KeyNotesSection({ studentId, canEdit }: { studentId: string; canEdit: boolean }) {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<GamePlan | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const plans = readStore<Record<string, GamePlan>>(LS.gamePlans, {});
    setPlan(plans[studentId] ?? null);
  }, [studentId]);

  const startEdit = () => { setDraft(plan?.keyNotes ?? ""); setEditing(true); };

  const save = () => {
    const plans = readStore<Record<string, GamePlan>>(LS.gamePlans, {});
    const existing = plans[studentId] ?? { keyNotes: "", items: [], flags: [] };
    const updated = { ...existing, keyNotes: draft.trim() };
    plans[studentId] = updated;
    write(LS.gamePlans, plans);
    setPlan(updated);
    setEditing(false);
  };

  const userName = session?.user?.name ?? "";

  return (
    <div style={{ display: "grid", gap: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="section-title">Key Notes</span>
          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>from Game Plan</span>
        </div>
        {canEdit && !editing && (
          <button className="btn btn-sm btn-ghost" onClick={startEdit} style={{ fontSize: 11 }}>
            {plan?.keyNotes ? "Edit" : "+ Add"}
          </button>
        )}
      </div>
      <div style={{ padding: 16 }}>
        {editing ? (
          <div style={{ display: "grid", gap: 8 }}>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              className="field"
              style={{ fontSize: 13, lineHeight: 1.65, resize: "vertical" }}
              placeholder="Describe the student's situation, goals, approach…"
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sm" onClick={save}>Save</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : plan?.keyNotes ? (
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink-2)", margin: 0, whiteSpace: "pre-wrap" }}>
            {plan.keyNotes}
          </p>
        ) : (
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0, fontStyle: "italic" }}>
            No key notes in game plan yet.{canEdit ? " Click \"+ Add\" to add." : ""}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const student = STUDENT_ROSTER.find((s) => s.id === id);
  const lead = student ? ALL_LEADS.find(
    (l) => l.studentName === student.fullName || student.fullName.includes(l.studentName.split(" ").pop() || "___")
  ) : undefined;
  const { data: session } = useSession();
  const sessionRole = session?.user?.role;
  const userName = session?.user?.name ?? "Unknown";

  const canCounselorEdit = sessionRole === "ADMIN" || sessionRole === "COUNSELOR";
  const canSalesEdit     = sessionRole === "ADMIN" || sessionRole === "SALES";

  if (!student) {
    return (
      <div className="panel empty-state">
        Student not found. <Link href="/counselor" style={{ color: "var(--accent)" }}>Back to roster</Link>
      </div>
    );
  }

  return (
    <section style={{ display: "grid", gap: 16 }}>

      {/* ── Back ─────────────────────────────────────────────────────── */}
      <Link href="/counselor" className="btn btn-sm btn-ghost" style={{ width: "fit-content", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M7.5 2.5l-4 3.5 4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </Link>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="panel">
        {/* Top row: name + badges + contract/payment */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 className="page-title" style={{ margin: 0 }}>{student.fullName}</h1>
              <span className={`badge ${BADGE_CLASS[student.group]}`}>{student.level}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
                Assigned to <strong>{student.assignedTo}</strong>
              </span>
              {student.school && <span style={{ fontSize: 13, color: "var(--ink-3)" }}>· {student.school}</span>}
              {student.gradeLevel && (
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--bg-2)", color: "var(--ink-3)" }}>
                  {student.gradeLevel}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
            {student.contractCode && (
              <span style={{ fontSize: 11, fontFamily: "monospace", background: "var(--bg-2)", padding: "3px 8px", borderRadius: "var(--r-sm)", color: "var(--ink-2)" }}>
                {student.contractCode}
              </span>
            )}
            {student.paymentStatus && (
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "var(--success-bg)", color: "var(--success)", fontWeight: 600 }}>
                {student.paymentStatus}
              </span>
            )}
          </div>
        </div>

        {/* Issues */}
        {student.issues.length > 0 && (
          <div style={{ marginBottom: 10, padding: "7px 10px", background: "var(--danger-soft)", borderRadius: "var(--r-md)", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="6.5" cy="6.5" r="5.5" stroke="var(--danger)" strokeWidth="1.1" />
              <path d="M6.5 4v3M6.5 9h.01" stroke="var(--danger)" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 12, color: "var(--danger)", fontWeight: 500 }}>{student.issues.join(" · ")}</span>
          </div>
        )}

        {/* Tags */}
        {student.tags.length > 0 && (
          <div style={{ marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {student.tags.map((t, i) => (
              <span key={i} className="action-tag">{t}</span>
            ))}
          </div>
        )}

        {/* Inline contact info */}
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, display: "grid", gap: 6 }}>
          {/* Student contact */}
          {(student.email || student.phone || student.studentInfo) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 48 }}>Student</span>
              {student.studentInfo && <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{student.studentInfo}</span>}
              {student.phone && <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{student.phone}</span>}
              {student.email && <a href={`mailto:${student.email}`} style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>{student.email}</a>}
            </div>
          )}
          {/* Parent contacts */}
          {student.parents.map((p, i) => (
            <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 48 }}>Parent</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-2)" }}>{p.fullName}</span>
              {p.phone && <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{p.phone}</span>}
              {p.email && <a href={`mailto:${p.email}`} style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>{p.email}</a>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Touch Points ─────────────────────────────────────────────── */}
      <div className="panel-flush">
        <TouchPoints studentId={id} userName={userName} />
      </div>

      {/* ── Proposal ─────────────────────────────────────────────────── */}
      <div className="panel-flush">
        <ProposalSection student={student} />
      </div>

      {/* ── Key Notes (from Game Plan) ────────────────────────────────── */}
      <div className="panel-flush">
        <KeyNotesSection studentId={id} canEdit={canCounselorEdit} />
      </div>

      {/* ── Notes ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="panel">
          <NotePanel
            title="Counselor Note"
            lsKey={LS.notes("counselor")}
            studentId={id}
            canEdit={canCounselorEdit}
            accentColor="var(--accent)"
            fallback={lead?.consultantNotes}
          />
        </div>
        <div className="panel">
          <NotePanel
            title="Sales Note"
            lsKey={LS.notes("sales")}
            studentId={id}
            canEdit={canSalesEdit}
            accentColor="var(--success)"
            fallback={lead?.salesNotes}
          />
        </div>
      </div>

    </section>
  );
}
