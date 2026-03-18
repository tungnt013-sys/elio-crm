"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { STUDENT_ROSTER, type StudentDetail } from "@/lib/mock-data";

// ── Types (re-exported for consumers) ────────────────────────────────────────

export type GamePlanItem = {
  id: string;
  item: string;
  deadline: string;
  byWho: string[];
  done: boolean;
};

export type GamePlan = {
  keyNotes: string;
  items: GamePlanItem[];
  flags: string[];
  mainCounselor?: string;
};

// Migrate old string byWho values to arrays
export function normalizeByWho(v: string | string[]): string[] {
  if (Array.isArray(v)) return v;
  return v ? [v] : [];
}

// ── ByWho helpers ─────────────────────────────────────────────────────────────

const COUNSELOR_NAMES = [...new Set(STUDENT_ROSTER.map((s) => s.assignedTo).filter(Boolean))].sort();
const BYWHO_OPTIONS = [...COUNSELOR_NAMES, "Elio", "Student", "Parent"];

export { COUNSELOR_NAMES, BYWHO_OPTIONS };

function ByWhoMultiSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 2, left: rect.left, width: Math.max(rect.width, 150) });
    }
    setOpen((o) => !o);
  };

  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };

  const displayText = value.length === 0 ? "Select…" : value.join(", ");

  const dropdown = open
    ? createPortal(
        <div
          ref={dropRef}
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            minWidth: dropPos.width,
            zIndex: 600,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-sm)",
            padding: "4px 0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ padding: "4px 10px 3px", fontSize: 10, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Counselors
          </div>
          {COUNSELOR_NAMES.map((name) => (
            <label
              key={name}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px", cursor: "pointer", fontSize: 13 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <input
                type="checkbox"
                checked={value.includes(name)}
                onChange={() => toggle(name)}
                style={{ accentColor: "var(--accent)", cursor: "pointer", width: 13, height: 13 }}
              />
              <span style={{ color: "var(--ink)", fontWeight: value.includes(name) ? 600 : 400 }}>{name}</span>
            </label>
          ))}
          <div style={{ height: 1, background: "var(--line)", margin: "3px 0" }} />
          <div style={{ padding: "4px 10px 3px", fontSize: 10, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Other
          </div>
          {["Elio", "Student", "Parent"].map((opt) => (
            <label
              key={opt}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px", cursor: "pointer", fontSize: 13 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <input
                type="checkbox"
                checked={value.includes(opt)}
                onChange={() => toggle(opt)}
                style={{ accentColor: "var(--accent)", cursor: "pointer", width: 13, height: 13 }}
              />
              <span style={{ color: "var(--ink)", fontWeight: value.includes(opt) ? 600 : 400 }}>{opt}</span>
            </label>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        style={{
          width: "100%",
          textAlign: "left",
          fontSize: 12,
          padding: "4px 8px",
          background: "var(--bg)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-sm)",
          cursor: "pointer",
          color: value.length ? "var(--ink)" : "var(--ink-3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
          fontFamily: "inherit",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {displayText}
        </span>
        <span style={{ fontSize: 10, opacity: 0.5, flexShrink: 0 }}>▾</span>
      </button>
      {dropdown}
    </>
  );
}

// ── GamePlanModal ─────────────────────────────────────────────────────────────

export function GamePlanModal({
  student,
  existing,
  isDone,
  onSave,
  onMarkDone,
  onClose,
}: {
  student: StudentDetail;
  existing?: GamePlan;
  isDone: boolean;
  onSave: (plan: GamePlan) => void;
  onMarkDone: () => void;
  onClose: () => void;
}) {
  const [keyNotes, setKeyNotes] = useState(existing?.keyNotes ?? "");
  const [editingKeyNotes, setEditingKeyNotes] = useState(!existing?.keyNotes);
  const [items, setItems] = useState<GamePlanItem[]>(
    (existing?.items ?? []).map((it) => ({ ...it, byWho: normalizeByWho(it.byWho) }))
  );
  const [flags, setFlags] = useState<string[]>(existing?.flags ?? student.issues ?? []);
  const [flagDraft, setFlagDraft] = useState("");
  const [confirmDone, setConfirmDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mainCounselor, setMainCounselor] = useState(
    existing?.mainCounselor ?? student.assignedTo ?? COUNSELOR_NAMES[0] ?? ""
  );
  useEffect(() => setMounted(true), []);

  const addFlag = () => {
    const trimmed = flagDraft.trim();
    if (!trimmed) return;
    setFlags((prev) => [...prev, trimmed]);
    setFlagDraft("");
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), item: "", deadline: "", byWho: mainCounselor ? [mainCounselor] : [], done: false },
    ]);

  const updateItem = (id: string, patch: Partial<GamePlanItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const wordCount = keyNotes.split(/\s+/).filter(Boolean).length;

  if (!mounted) return null;
  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div style={{
        position: "relative", zIndex: 1,
        background: "var(--bg)", borderRadius: "var(--r-lg)", padding: 24,
        width: "min(700px, 95vw)", maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
      }}>
        {/* See full profile link */}
        <div style={{ marginBottom: 14 }}>
          <Link
            href={`/students/${student.id}`}
            onClick={onClose}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, color: "var(--accent)", textDecoration: "none", fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4.5 6h3M6 4.5l1.5 1.5L6 7.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            See full profile
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{student.fullName}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{student.level}</div>
            {/* Main Counselor picker */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500, whiteSpace: "nowrap" }}>Main counselor</span>
              <div style={{ display: "flex", gap: 4 }}>
                {COUNSELOR_NAMES.map((name) => {
                  const active = mainCounselor === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setMainCounselor(name)}
                      style={{
                        padding: "3px 10px", borderRadius: 99, border: "1px solid",
                        fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer",
                        background: active ? "var(--accent)" : "transparent",
                        borderColor: active ? "var(--accent)" : "var(--line)",
                        color: active ? "#fff" : "var(--ink-3)",
                        transition: "all 120ms",
                      }}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginLeft: 12 }}>✕</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="detail-label" style={{ marginBottom: 6 }}>Key Notes</div>
          {editingKeyNotes ? (
            <>
              <textarea
                value={keyNotes}
                onChange={(e) => setKeyNotes(e.target.value)}
                placeholder="Describe the student's situation, goals, approach, and anything the counselor team needs to know (~300 words)…"
                rows={7}
                className="field"
                autoFocus
                onBlur={() => setEditingKeyNotes(false)}
                style={{ width: "100%", resize: "vertical", fontSize: 13, lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: wordCount > 300 ? "var(--danger)" : "var(--ink-3)", marginTop: 4, textAlign: "right" }}>
                {wordCount} / 300 words
              </div>
            </>
          ) : (
            <div
              onClick={() => setEditingKeyNotes(true)}
              style={{
                fontSize: 13, lineHeight: 1.6, color: keyNotes ? "var(--ink)" : "var(--ink-3)",
                fontStyle: keyNotes ? "normal" : "italic",
                padding: "8px 10px", borderRadius: "var(--r-sm)", cursor: "text",
                border: "1px solid var(--line)", background: "var(--bg)",
                whiteSpace: "pre-wrap", minHeight: 80,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg)")}
            >
              {keyNotes || "Click to add key notes…"}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div className="detail-label">Action Items</div>
            <button className="btn btn-sm btn-ghost" onClick={addItem}>+ Add item</button>
          </div>
          {items.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-2)" }}>
                  {["Item", "Deadline", "By Who", ""].map((h) => (
                    <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "4px 6px", width: "45%" }}>
                      <input
                        className="field"
                        value={item.item}
                        onChange={(e) => updateItem(item.id, { item: e.target.value })}
                        placeholder="Action item…"
                        style={{ width: "100%", fontSize: 12 }}
                      />
                    </td>
                    <td style={{ padding: "4px 6px", width: "20%" }}>
                      <input
                        type="date"
                        className="field"
                        value={item.deadline}
                        onChange={(e) => updateItem(item.id, { deadline: e.target.value })}
                        style={{ fontSize: 12, width: "100%" }}
                      />
                    </td>
                    <td style={{ padding: "4px 6px", width: "25%" }}>
                      <ByWhoMultiSelect
                        value={normalizeByWho(item.byWho)}
                        onChange={(v) => updateItem(item.id, { byWho: v })}
                      />
                    </td>
                    <td style={{ padding: "4px 4px", textAlign: "center", width: 28 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeItem(item.id)}
                        style={{ color: "var(--danger)", fontSize: 13, padding: "0 4px" }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: "var(--ink-3)", fontSize: 13, padding: "8px 0" }}>
              No items yet. Click &quot;+ Add item&quot; to start.
            </div>
          )}
        </div>

        {/* Red Flags */}
        <div style={{ marginBottom: 24 }}>
          <div className="detail-label" style={{ marginBottom: 8 }}>Red Flags</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {flags.map((flag, i) => (
              <span key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "var(--danger-soft)", color: "var(--danger)",
                borderRadius: "var(--r-sm)", padding: "3px 8px", fontSize: 12, fontWeight: 500,
              }}>
                ⚑ {flag}
                <button
                  onClick={() => setFlags((prev) => prev.filter((_, j) => j !== i))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 0, fontSize: 13, lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
            {flags.length === 0 && (
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>No flags.</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="field"
              value={flagDraft}
              onChange={(e) => setFlagDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFlag(); } }}
              placeholder="Add a red flag…"
              style={{ flex: 1, fontSize: 12 }}
            />
            <button className="btn btn-sm" onClick={addFlag} style={{ flexShrink: 0 }}>Add</button>
          </div>
        </div>

        {!isDone && (
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "var(--warning)", marginTop: 1 }}>⚠</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>Mark as Done</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
                  This removes the student from your active list. This action cannot be undone easily.
                </div>
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--ink-2)" }}>
              <input
                type="checkbox"
                checked={confirmDone}
                onChange={(e) => setConfirmDone(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: "var(--danger)", cursor: "pointer" }}
              />
              I confirm this student&apos;s counseling is complete
            </label>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => { if (confirmDone) onMarkDone(); }}
              disabled={!confirmDone}
              style={{ marginTop: 10, opacity: confirmDone ? 1 : 0.4, cursor: confirmDone ? "pointer" : "not-allowed" }}
            >
              Mark as Done
            </button>
          </div>
        )}
        {isDone && (
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            <span className="badge badge-done" style={{ fontSize: 12 }}>Done</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={() => onSave({ keyNotes, items, flags, mainCounselor })}>Save Game Plan</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
