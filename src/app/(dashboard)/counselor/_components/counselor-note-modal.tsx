"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { StudentDetail, Meeting, CounselorNote } from "@/lib/mock-data";

// ── Mock AI generators ────────────────────────────────────────────────────────

function mockAIContent(
  section: "keyNotes" | "strength" | "improvement" | "plan" | "report",
  student: StudentDetail,
  note: CounselorNoteState
): string {
  const name = student.fullName.split(" ").pop() ?? student.fullName;
  const kn = student.keyNotes;

  switch (section) {
    case "keyNotes":
      return (
        kn ||
        `${name} is making steady progress toward their university application goals. ` +
          `Key priorities this cycle: academic preparation, extracurricular positioning, and college list strategy. ` +
          `Parent communication is active and aligned. Next milestone: finalize target list and begin essay drafts.`
      );

    case "strength":
      return (
        `${name} demonstrates strong academic discipline and genuine intellectual curiosity in their chosen field. ` +
        `They are receptive to feedback and show maturity in following through on commitments. ` +
        `Communication with the counseling team is consistent, and motivation remains high heading into the critical application period. ` +
        `Their ability to articulate goals clearly is a strong indicator of readiness for competitive programs.`
      );

    case "improvement":
      return (
        `${name} would benefit from more proactive ownership of deadlines — several action items have been delayed without prior notice. ` +
        `The extracurricular narrative needs a clearer central theme that ties activities to a coherent identity. ` +
        `"Why this school" essay angles remain underdeveloped and require dedicated school-specific research before drafting. ` +
        `Strengthening initiative outside of counselor-prompted tasks will be important for final portfolio strength.`
      );

    case "plan":
      return (
        `Priorities for the next 4 weeks:\n` +
        `1. Complete outstanding test prep milestones (SAT / IELTS target score)\n` +
        `2. Identify and reach out to 2 potential research mentors or internship contacts\n` +
        `3. Draft main personal statement outline (300–500 words)\n` +
        `4. Finalize college list — minimum 10 schools across reach / target / safety\n` +
        `5. Schedule parent alignment call before end of month`
      );

    case "report": {
      const date = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const strength =
        note.strength ||
        "Strong academic foundation and consistent follow-through on counselor recommendations.";
      const improvement =
        note.areaForImprovement ||
        "Deadline ownership and extracurricular narrative clarity need continued attention.";
      const plan =
        note.detailedPlan ||
        "Focus on test prep, research outreach, and college list finalization over the next 4 weeks.";
      const keyNotes = note.keyNotes || kn;

      return (
        `COUNSELOR MEETING REPORT\n` +
        `Student: ${student.fullName}\n` +
        `Date: ${date}\n` +
        `────────────────────────────────────────\n\n` +
        `OVERVIEW\n` +
        (keyNotes
          ? keyNotes.slice(0, 320) + (keyNotes.length > 320 ? "…" : "")
          : `${name} is making steady progress toward their university application goals.`) +
        `\n\n` +
        `STRENGTHS\n${strength}\n\n` +
        `AREAS FOR IMPROVEMENT\n${improvement}\n\n` +
        `ACTION PLAN\n${plan}\n\n` +
        `────────────────────────────────────────\n` +
        `This report is prepared as a counselor summary and may be shared with the student and family.\n` +
        `Prepared by Elio CRM · ${date}`
      );
    }
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CounselorNoteState {
  keyNotes: string;
  strength: string;
  areaForImprovement: string;
  detailedPlan: string;
  report: string;
}

interface Props {
  student: StudentDetail;
  meeting: Meeting;
  initialKeyNotes?: string;
  initialNote?: Partial<CounselorNote>;
  onSave: (note: CounselorNote, updatedKeyNotes: string) => void;
  onClose: () => void;
}

// ── NoteSection atom ──────────────────────────────────────────────────────────

function NoteSection({
  label,
  value,
  onChange,
  placeholder,
  generating,
  onGenerate,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  generating: boolean;
  onGenerate: () => void;
  rows?: number;
}) {
  return (
    <div style={{ display: "grid", gap: 7 }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--ink-3)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <button
          onClick={onGenerate}
          disabled={generating}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 6,
            background: generating ? "var(--bg-2)" : "var(--accent-soft)",
            color: generating ? "var(--ink-3)" : "var(--accent)",
            border: "none",
            cursor: generating ? "not-allowed" : "pointer",
            transition: "background 120ms, color 120ms",
          }}
          onMouseEnter={(e) => {
            if (!generating) {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.color = "var(--bg)";
            }
          }}
          onMouseLeave={(e) => {
            if (!generating) {
              e.currentTarget.style.background = "var(--accent-soft)";
              e.currentTarget.style.color = "var(--accent)";
            }
          }}
        >
          {generating ? (
            <>
              <SpinIcon />
              Generating…
            </>
          ) : (
            <>
              <StarIcon />
              Generate
            </>
          )}
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="field"
        style={{
          width: "100%",
          resize: "vertical",
          fontSize: 13,
          lineHeight: 1.65,
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

// ── Icon helpers ──────────────────────────────────────────────────────────────

function SpinIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      style={{ animation: "cnm-spin 0.9s linear infinite" }}
    >
      <circle
        cx="5"
        cy="5"
        r="3.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="12 6"
        fill="none"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
      <path d="M4.5 0.5L5.4 2.85L7.9 3.05L6.0 4.75L6.6 7.25L4.5 6.0L2.4 7.25L3.0 4.75L1.1 3.05L3.6 2.85L4.5 0.5Z" />
    </svg>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function CounselorNoteModal({
  student,
  meeting,
  initialKeyNotes,
  initialNote,
  onSave,
  onClose,
}: Props) {
  const [note, setNote] = useState<CounselorNoteState>({
    keyNotes: initialNote?.keyNotes ?? initialKeyNotes ?? "",
    strength: initialNote?.strength ?? "",
    areaForImprovement: initialNote?.areaForImprovement ?? "",
    detailedPlan: initialNote?.detailedPlan ?? "",
    report: initialNote?.report ?? "",
  });

  const [generating, setGenerating] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(!!initialNote?.report);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setField = (field: keyof CounselorNoteState) => (value: string) =>
    setNote((prev) => ({ ...prev, [field]: value }));

  const generate = (section: keyof CounselorNoteState) => {
    if (generating) return;
    setGenerating(section);
    setTimeout(() => {
      const content = mockAIContent(section as Parameters<typeof mockAIContent>[0], student, note);
      setNote((prev) => ({ ...prev, [section]: content }));
      setGenerating(null);
    }, 1800);
  };

  const handleGenerateReport = () => {
    if (generating) return;
    setGenerating("report");
    setShowReport(true);
    setTimeout(() => {
      const content = mockAIContent("report", student, note);
      setNote((prev) => ({ ...prev, report: content }));
      setGenerating(null);
    }, 2400);
  };

  const buildFull = (): CounselorNote => ({
    meetingId: meeting.id,
    studentId: meeting.studentId,
    ...note,
    updatedAt: new Date().toISOString(),
  });

  const handleSave = () => {
    onSave(buildFull(), note.keyNotes);
  };

  const handleSubmit = () => {
    onSave(buildFull(), note.keyNotes);
    setSubmitted(true);
    setTimeout(() => onClose(), 800);
  };

  // Format meeting date/time for header
  const [datePart] = meeting.date.split("T");
  const meetingDateTime = new Date(`${datePart}T${meeting.time}:00`);
  const dateLabel = meetingDateTime.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeLabel = meetingDateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (!mounted) return null;

  return createPortal(
    <>
      <style>{`
        @keyframes cnm-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1200,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            borderRadius: 14,
            width: "100%",
            maxWidth: 660,
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 28px 64px rgba(0,0,0,0.28)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div
            style={{
              padding: "18px 24px 16px",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>
                {student.fullName}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 5,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  {dateLabel} · {timeLabel}
                </span>
                <span style={{ color: "var(--line-strong)", fontSize: 12 }}>·</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: "var(--bg-2)",
                    color: "var(--ink-2)",
                  }}
                >
                  {meeting.counselorName}
                </span>
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  Join Meeting ↗
                </a>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "var(--ink-3)",
                flexShrink: 0,
                borderRadius: 6,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "none")
              }
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "22px 24px",
              display: "grid",
              gap: 20,
            }}
          >
            {/* Key Notes — synced with game plan */}
            <NoteSection
              label="Key Notes"
              value={note.keyNotes}
              onChange={setField("keyNotes")}
              placeholder="Key context about this student — synced with game plan…"
              generating={generating === "keyNotes"}
              onGenerate={() => generate("keyNotes")}
              rows={4}
            />

            {/* Strength */}
            <NoteSection
              label="Strength"
              value={note.strength}
              onChange={setField("strength")}
              placeholder="What is this student doing well?"
              generating={generating === "strength"}
              onGenerate={() => generate("strength")}
              rows={3}
            />

            {/* Area for Improvement */}
            <NoteSection
              label="Area for Improvement"
              value={note.areaForImprovement}
              onChange={setField("areaForImprovement")}
              placeholder="What needs to improve before the next session?"
              generating={generating === "areaForImprovement"}
              onGenerate={() => generate("areaForImprovement")}
              rows={3}
            />

            {/* Detailed Plan */}
            <NoteSection
              label="Detailed Plan"
              value={note.detailedPlan}
              onChange={setField("detailedPlan")}
              placeholder="Concrete next steps and timeline…"
              generating={generating === "detailedPlan"}
              onGenerate={() => generate("detailedPlan")}
              rows={4}
            />

            {/* Generate Report button */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 18 }}>
              <button
                onClick={handleGenerateReport}
                disabled={!!generating}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  background:
                    generating === "report" ? "var(--bg-2)" : "var(--surface)",
                  border: "1.5px dashed var(--line-strong)",
                  borderRadius: 10,
                  cursor: generating ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color:
                    generating === "report"
                      ? "var(--ink-3)"
                      : "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => {
                  if (!generating) {
                    e.currentTarget.style.background = "var(--accent-soft)";
                    e.currentTarget.style.borderStyle = "solid";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!generating) {
                    e.currentTarget.style.background = "var(--surface)";
                    e.currentTarget.style.borderStyle = "dashed";
                  }
                }}
              >
                {generating === "report" ? (
                  <>
                    <SpinIcon />
                    Generating Report…
                  </>
                ) : (
                  <>
                    <StarIcon />
                    Generate Report with AI
                  </>
                )}
              </button>
            </div>

            {/* Report preview (shown after generation) */}
            {showReport && (
              <div style={{ display: "grid", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      textTransform: "uppercase",
                    }}
                  >
                    Report Preview
                  </span>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    Fully editable before submitting
                  </span>
                </div>
                <textarea
                  value={note.report}
                  onChange={(e) =>
                    setNote((prev) => ({ ...prev, report: e.target.value }))
                  }
                  rows={18}
                  className="field"
                  placeholder={
                    generating === "report" ? "Generating…" : "Report will appear here…"
                  }
                  disabled={generating === "report"}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    fontSize: 12,
                    lineHeight: 1.75,
                    fontFamily: "ui-monospace, monospace",
                    background: "var(--bg-2)",
                    opacity: generating === "report" ? 0.45 : 1,
                    transition: "opacity 200ms",
                  }}
                />
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              padding: "14px 24px",
              borderTop: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 8,
              flexShrink: 0,
              background: "var(--bg-2)",
            }}
          >
            <button
              className="btn btn-ghost"
              onClick={onClose}
              style={{ fontSize: 13 }}
            >
              Cancel
            </button>
            <button
              className="btn"
              onClick={handleSave}
              style={{ fontSize: 13 }}
            >
              Save Notes
            </button>
            {showReport && note.report && (
              <button
                className="btn"
                onClick={handleSubmit}
                disabled={submitted}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  background: submitted
                    ? "var(--success-bg)"
                    : "var(--accent)",
                  color: submitted ? "var(--success)" : "var(--bg)",
                  border: "none",
                }}
              >
                {submitted ? "✓ Submitted" : "Submit Report"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
