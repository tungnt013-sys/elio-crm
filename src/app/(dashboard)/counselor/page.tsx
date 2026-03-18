"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { STUDENT_ROSTER, SEED_GAME_PLANS, SEED_MEETINGS, type StudentDetail, type Meeting, type CounselorNote } from "@/lib/mock-data";
import { ALL_LEADS, type LeadOverrides } from "@/lib/all-leads";
import { LeadDetailSlideover } from "@/components/lead-detail-slideover";
import { GamePlanModal, normalizeByWho, type GamePlan, type GamePlanItem } from "./_components/game-plan-modal";
import { CounselorNoteModal } from "./_components/counselor-note-modal";

// ── Helpers ──────────────────────────────────────────────────────────────────

const BADGE_CLASS: Record<string, string> = {
  grad: "badge-grad",
  g11: "badge-g11",
  g9: "badge-g9",
  done: "badge-done",
};

// ── Proposal types ───────────────────────────────────────────────────────────

export type ProposalEntry = {
  url: string;
  submittedBy: string;
  submittedAt: string;
  seen: boolean;
};

const LS_PROPOSALS = "elio:proposals";

function loadProposals(): Record<string, ProposalEntry> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LS_PROPOSALS) ?? "{}"); } catch { return {}; }
}
function saveProposals(p: Record<string, ProposalEntry>) {
  if (typeof window !== "undefined") localStorage.setItem(LS_PROPOSALS, JSON.stringify(p));
}

// ── Prospecting Tab ───────────────────────────────────────────────────────────

function ProspectingTab({ submitterName }: { submitterName: string }) {
  const s6Leads = ALL_LEADS.filter((l) => l.status.startsWith("S6"));
  const [proposals, setProposals] = useState<Record<string, ProposalEntry>>(loadProposals);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const setDraft = (id: string, val: string) =>
    setDrafts((prev) => ({ ...prev, [id]: val }));

  const submit = (leadId: string) => {
    const url = (drafts[leadId] ?? "").trim();
    if (!url) return;
    const entry: ProposalEntry = {
      url,
      submittedBy: submitterName,
      submittedAt: new Date().toISOString(),
      seen: false,
    };
    const next = { ...proposals, [leadId]: entry };
    setProposals(next);
    saveProposals(next);
    setDrafts((prev) => { const n = { ...prev }; delete n[leadId]; return n; });
  };

  const edit = (leadId: string) => {
    setDrafts((prev) => ({ ...prev, [leadId]: proposals[leadId]?.url ?? "" }));
    const next = { ...proposals };
    delete next[leadId];
    setProposals(next);
    saveProposals(next);
  };

  if (s6Leads.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 40, fontSize: 13, color: "var(--ink-3)" }}>
        No students are at Proposal Pending (S6) right now.
      </div>
    );
  }

  const submitted = s6Leads.filter((l) => proposals[l.id]);
  const pending   = s6Leads.filter((l) => !proposals[l.id]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {pending.length > 0 && (
        <div className="panel-flush">
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="section-title">Awaiting Proposal</span>
            <span style={{ fontSize: 11, color: "var(--warning)" }}>{pending.length} student{pending.length !== 1 ? "s" : ""}</span>
          </div>
          {pending.map((lead) => (
            <div key={lead.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{lead.studentName}</span>
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Grade {lead.gradeLevel}</span>
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>·</span>
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{lead.school}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "var(--accent-soft)", color: "var(--accent)" }}>Proposal Pending</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="field"
                  type="url"
                  placeholder="Paste Google Doc link…"
                  value={drafts[lead.id] ?? ""}
                  onChange={(e) => setDraft(lead.id, e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submit(lead.id); }}
                  style={{ flex: 1, fontSize: 13 }}
                />
                <button
                  className="btn btn-sm"
                  onClick={() => submit(lead.id)}
                  disabled={!(drafts[lead.id] ?? "").trim()}
                  style={{ flexShrink: 0, fontWeight: 600, opacity: (drafts[lead.id] ?? "").trim() ? 1 : 0.4 }}
                >
                  Submit →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {submitted.length > 0 && (
        <div className="panel-flush">
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="section-title">Submitted</span>
            <span style={{ fontSize: 11, color: "var(--success)" }}>{submitted.length} proposal{submitted.length !== 1 ? "s" : ""}</span>
          </div>
          {submitted.map((lead) => {
            const p = proposals[lead.id];
            const dt = new Date(p.submittedAt);
            const dtStr = `${dt.toLocaleDateString("vi-VN")} ${dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
            return (
              <div key={lead.id} style={{
                padding: "12px 16px", borderBottom: "1px solid var(--line)",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{lead.studentName}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Grade {lead.gradeLevel} · {lead.school}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 99,
                    background: "var(--success-bg)", color: "var(--success)", fontWeight: 600,
                  }}>✓ Submitted</span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >
                    {p.url}
                  </a>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{dtStr} · {p.submittedBy}</span>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => edit(lead.id)}
                    style={{ fontSize: 11 }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CounselorPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Counselor";
  const [activeTab, setActiveTab] = useState<"students" | "prospecting">("students");

  const [gamePlans, setGamePlansState] = useState<Record<string, GamePlan>>({});
  const [doneStudents, setDoneStudentsState] = useState<Set<string>>(
    new Set(STUDENT_ROSTER.filter((s) => s.group === "done").map((s) => s.id))
  );

  useEffect(() => {
    try {
      const savedPlans = JSON.parse(localStorage.getItem("elio:gamePlans") ?? "{}");
      if (Object.keys(savedPlans).length > 0) {
        setGamePlansState(savedPlans);
      } else {
        setGamePlansState(SEED_GAME_PLANS as Record<string, GamePlan>);
      }
    } catch {}
    try {
      const savedDone = JSON.parse(localStorage.getItem("elio:doneStudents") ?? "null");
      if (savedDone) setDoneStudentsState(new Set<string>(savedDone));
    } catch {}
  }, []);

  const setGamePlans = (val: Record<string, GamePlan> | ((prev: Record<string, GamePlan>) => Record<string, GamePlan>)) => {
    setGamePlansState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      if (typeof window !== "undefined") localStorage.setItem("elio:gamePlans", JSON.stringify(next));
      return next;
    });
  };
  const setDoneStudents = (val: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    setDoneStudentsState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      if (typeof window !== "undefined") localStorage.setItem("elio:doneStudents", JSON.stringify([...next]));
      return next;
    });
  };

  const [modalStudentId, setModalStudentId] = useState<string | null>(null);
  const [slideoverStudentId, setSlideoverStudentId] = useState<string | null>(null);
  const [leadOverrides, setLeadOverrides] = useState<Record<string, Partial<LeadOverrides>>>({});
  const [showDone, setShowDone] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // ── Meeting notes state ──
  const [meetingNotes, setMeetingNotes] = useState<Record<string, CounselorNote>>({});
  const [noteModal, setNoteModal] = useState<{ meeting: Meeting; student: StudentDetail } | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("elio:meetingNotes") ?? "{}");
      if (Object.keys(saved).length > 0) setMeetingNotes(saved);
    } catch {}
  }, []);

  const handleLeadUpdate = (id: string, updates: Partial<LeadOverrides>) => {
    setLeadOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...updates } }));
  };

  const toggleGroup = (id: string) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const today = new Date().toISOString().slice(0, 10);

  const markStudentDone = (studentId: string) => {
    setDoneStudents((prev) => new Set([...prev, studentId]));
    setModalStudentId(null);
  };

  const saveGamePlan = (studentId: string, plan: GamePlan) => {
    setGamePlans((prev) => ({ ...prev, [studentId]: plan }));
    setModalStudentId(null);
  };

  const markItemDone = (studentId: string, itemId: string) => {
    setGamePlans((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        items: prev[studentId].items.map((it) =>
          it.id === itemId ? { ...it, done: true } : it
        ),
      },
    }));
  };

  // Section 1: Next Items — grouped by student
  const nextItemGroups: { student: StudentDetail; items: GamePlanItem[] }[] = [];
  STUDENT_ROSTER.forEach((student) => {
    const plan = gamePlans[student.id];
    if (plan) {
      const pending = plan.items.filter((i) => !i.done);
      if (pending.length > 0) {
        const sorted = [...pending].sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.localeCompare(b.deadline);
        });
        nextItemGroups.push({ student, items: sorted });
      }
    }
  });
  const totalNextItems = nextItemGroups.reduce((n, g) => n + g.items.length, 0);

  const nextItemsAnyExpanded = nextItemGroups.some(({ student }) => !collapsedGroups.has(student.id));
  const pendingStudents = STUDENT_ROSTER.filter((s) => !gamePlans[s.id] && !doneStudents.has(s.id));
  const activeStudents = STUDENT_ROSTER.filter((s) => gamePlans[s.id] && !doneStudents.has(s.id));
  const completedStudents = STUDENT_ROSTER.filter((s) => doneStudents.has(s.id));

  const studentStatus = (student: StudentDetail) => {
    const plan = gamePlans[student.id];
    const hasOverdueItems = plan?.items.some((i) => !i.done && i.deadline && i.deadline < today);
    return hasOverdueItems ? "overdue" : "on-track";
  };

  const modalStudent = modalStudentId
    ? STUDENT_ROSTER.find((s) => s.id === modalStudentId) ?? null
    : null;

  const slideoverStudent = slideoverStudentId
    ? STUDENT_ROSTER.find((s) => s.id === slideoverStudentId) ?? null
    : null;
  const slideoverLead = slideoverStudent
    ? (() => {
        const base = ALL_LEADS.find(
          (l) => l.studentName === slideoverStudent.fullName ||
                 slideoverStudent.fullName.includes(l.studentName.split(" ").pop() || "___")
        );
        if (!base) return null;
        const ov = leadOverrides[base.id];
        return ov ? { ...base, ...ov } : base;
      })()
    : null;

  const s6Count = ALL_LEADS.filter((l) => l.status.startsWith("S6")).length;

  // Upcoming meetings (today + future, sorted by date/time)
  const upcomingMeetings = SEED_MEETINGS
    .filter((m) => m.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const handleSaveNote = (note: CounselorNote, updatedKeyNotes: string) => {
    // Persist note
    const next = { ...meetingNotes, [note.meetingId]: note };
    setMeetingNotes(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("elio:meetingNotes", JSON.stringify(next));
    }
    // Sync Key Notes back to game plan
    setGamePlans((prev) => {
      const plan = prev[note.studentId];
      if (!plan) return prev;
      return { ...prev, [note.studentId]: { ...plan, keyNotes: updatedKeyNotes } };
    });
    setNoteModal(null);
  };

  return (
    <section style={{ display: "grid", gap: 20 }}>
      {/* ── Header + Tabs ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Counselor Dashboard</h1>
        <div style={{ display: "flex", gap: 4, background: "var(--bg-2)", padding: 3, borderRadius: "var(--r-md)" }}>
            {([
              { key: "students"    as const, label: "My Students",           badge: undefined as number | undefined },
              { key: "prospecting" as const, label: "Prospecting Students",  badge: s6Count as number | undefined },
            ]).map(({ key, label, badge }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: "5px 14px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: activeTab === key ? 600 : 400,
                  background: activeTab === key ? "var(--surface)" : "transparent",
                  color: activeTab === key ? "var(--ink)" : "var(--ink-3)",
                  boxShadow: activeTab === key ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                  transition: "all 150ms",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {label}
                {badge !== undefined && badge > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 99,
                    background: activeTab === key ? "var(--accent)" : "var(--ink-3)",
                    color: "var(--bg)", display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "0 4px",
                  }}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
      </div>

      {activeTab === "prospecting" && (
        <ProspectingTab submitterName={userName} />
      )}

      {activeTab === "students" && (<>

      {/* ── Section 0: Upcoming Meetings ──────────────────────────────── */}
      <div className="panel-flush">
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="section-title">Upcoming Meetings</span>
          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
            {upcomingMeetings.length} scheduled
          </span>
        </div>
        {upcomingMeetings.length > 0 ? (
          <div style={{ display: "grid", gap: 0 }}>
            {upcomingMeetings.map((meeting) => {
              const [ymd] = meeting.date.split("T");
              const meetingDT = new Date(`${ymd}T${meeting.time}:00`);
              const dayNum = meetingDT.getDate();
              const monthStr = meetingDT.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
              const timeFmt = meetingDT.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
              const meetingStudent = STUDENT_ROSTER.find((s) => s.id === meeting.studentId);
              const existingNote = meetingNotes[meeting.id];
              const hasNote = !!existingNote && !!(existingNote.keyNotes || existingNote.strength || existingNote.detailedPlan);

              return (
                <div
                  key={meeting.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  {/* Date badge */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: 46,
                      textAlign: "center",
                      background: "var(--accent-soft)",
                      borderRadius: 8,
                      padding: "5px 0 6px",
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.09em", color: "var(--accent)", textTransform: "uppercase", lineHeight: 1 }}>
                      {monthStr}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", lineHeight: 1.1 }}>
                      {dayNum}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
                        {meeting.studentName}
                      </span>
                      {meetingStudent && (
                        <span className={`badge ${BADGE_CLASS[meetingStudent.group]}`}>
                          {meetingStudent.level}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{timeFmt}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
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
                        style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                      >
                        Join ↗
                      </a>
                    </div>
                  </div>

                  {/* Note button */}
                  <button
                    onClick={() =>
                      meetingStudent && setNoteModal({ meeting, student: meetingStudent })
                    }
                    style={{
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "6px 14px",
                      borderRadius: 7,
                      background: hasNote ? "var(--success-bg)" : "var(--bg-2)",
                      color: hasNote ? "var(--success)" : "var(--ink-2)",
                      border: `1.5px solid ${hasNote ? "transparent" : "var(--line)"}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "background 120ms, color 120ms, border-color 120ms",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--accent-soft)";
                      e.currentTarget.style.color = "var(--accent)";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = hasNote ? "var(--success-bg)" : "var(--bg-2)";
                      e.currentTarget.style.color = hasNote ? "var(--success)" : "var(--ink-2)";
                      e.currentTarget.style.borderColor = hasNote ? "transparent" : "var(--line)";
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <rect x="1.5" y="1.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M3.5 4h4M3.5 6.5h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                    </svg>
                    {hasNote ? "Note ✓" : "Note"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 24, fontSize: 13 }}>
            No upcoming meetings scheduled.
          </div>
        )}
      </div>

      {/* ── Section 1: Next Items ─────────────────────────────────────── */}
      <div className="panel-flush">
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="section-title">Next Items</span>
          {totalNextItems > 0 && (
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{totalNextItems} pending</span>
          )}
        </div>
        {nextItemGroups.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action Item</th>
                  {nextItemsAnyExpanded && <th>Deadline</th>}
                  {nextItemsAnyExpanded && <th>By</th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {nextItemGroups.map(({ student, items }) => {
                  const collapsed = collapsedGroups.has(student.id);
                  const overdueItems = items.filter((i) => i.deadline && i.deadline < today);
                  const maxOverdueDays = overdueItems.length > 0
                    ? Math.max(...overdueItems.map((i) => Math.floor((new Date(today).getTime() - new Date(i.deadline).getTime()) / 86400000)))
                    : 0;
                  return (
                    <Fragment key={student.id}>
                      <tr
                        onClick={() => toggleGroup(student.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td
                          colSpan={nextItemsAnyExpanded ? 4 : 2}
                          style={{ background: "var(--bg-2)", padding: "6px 14px", borderBottom: "1px solid var(--line)" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 150ms", flexShrink: 0, color: "var(--ink-3)" }}>
                              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <button
                              onClick={(e) => { e.stopPropagation(); setModalStudentId(student.id); }}
                              style={{ fontWeight: 600, fontSize: 12, color: "var(--ink)", background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "none" }}
                              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                            >
                              {student.fullName}
                            </button>
                            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                              {items.length} task{items.length !== 1 ? "s" : ""}
                            </span>
                            {maxOverdueDays > 0 && (
                              <span style={{ fontSize: 11, color: "var(--danger)", fontWeight: 600 }}>
                                ⚠ {maxOverdueDays} day{maxOverdueDays !== 1 ? "s" : ""} behind
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {!collapsed && items.map((item) => {
                        const overdue = item.deadline && item.deadline < today;
                        return (
                          <tr key={item.id}>
                            <td style={{ color: "var(--ink-2)", fontSize: 13, paddingLeft: 24 }}>{item.item || "—"}</td>
                            <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                              {item.deadline ? (
                                <span style={{ color: overdue ? "var(--danger)" : "var(--ink-2)", fontWeight: overdue ? 600 : 400 }}>
                                  {overdue ? "⚠ " : ""}{item.deadline}
                                </span>
                              ) : <span style={{ color: "var(--ink-3)" }}>—</span>}
                            </td>
                            <td style={{ color: "var(--ink-3)", fontSize: 12 }}>{normalizeByWho(item.byWho).join(", ") || "—"}</td>
                            <td>
                              <button
                                className="btn btn-sm"
                                onClick={() => markItemDone(student.id, item.id)}
                                style={{ background: "var(--success-bg)", color: "var(--success)", border: "none", fontSize: 12 }}
                              >
                                ✓ Done
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 24, fontSize: 13 }}>
            No pending action items. Set up game plans below to populate this list.
          </div>
        )}
      </div>

      {/* ── Section 2: Pending Game Plan ─────────────────────────────── */}
      {pendingStudents.length > 0 && (
        <div className="panel-flush">
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="section-title">Pending Game Plan</span>
            <span style={{ fontSize: 11, color: "var(--warning)" }}>{pendingStudents.length} need setup</span>
          </div>
          <div style={{ display: "grid", gap: 0 }}>
            {pendingStudents.map((student) => (
              <div
                key={student.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderBottom: "1px solid var(--line)",
                  cursor: "pointer", transition: "background 120ms",
                }}
                onClick={() => setModalStudentId(student.id)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    className="btn-ghost"
                    onClick={(e) => { e.stopPropagation(); setSlideoverStudentId(student.id); }}
                    style={{ fontWeight: 500, fontSize: 13, background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--ink)", textDecoration: "underline", textDecorationColor: "var(--line-strong)", textUnderlineOffset: 2 }}
                  >
                    {student.fullName}
                  </button>
                  <span className={`badge ${BADGE_CLASS[student.group]}`}>{student.level}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Assigned to {student.assignedTo}</span>
                  {student.issues.slice(0, 1).map((flag, i) => (
                    <span key={i} style={{ fontSize: 11, color: "var(--danger)" }}>⚑ {flag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 3: Active Students ───────────────────────────────── */}
      {activeStudents.length > 0 && (
        <div className="panel-flush">
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="section-title">Active Students</span>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{activeStudents.length} students</span>
          </div>
          <div style={{ display: "grid", gap: 0 }}>
            {activeStudents.map((student) => {
              const status = studentStatus(student);
              const plan = gamePlans[student.id];
              const openCount = plan?.items.filter((i) => !i.done).length ?? 0;
              return (
                <div
                  key={student.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 16px", borderBottom: "1px solid var(--line)",
                    cursor: "pointer", transition: "background 120ms",
                  }}
                  onClick={() => setSlideoverStudentId(student.id)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <Link
                      href={`/students/${student.id}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontWeight: 500, fontSize: 13, color: "inherit", textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {student.fullName}
                    </Link>
                    <span className={`badge ${BADGE_CLASS[student.group]}`}>{student.level}</span>
                    <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{student.assignedTo}</span>
                    {(gamePlans[student.id]?.flags ?? student.issues).slice(0, 1).map((flag, i) => (
                      <span key={i} style={{ fontSize: 11, color: "var(--danger)", whiteSpace: "nowrap" }}>⚑ {flag}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    {openCount > 0 && (
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{openCount} open</span>
                    )}
                    <span
                      className="badge"
                      style={{
                        background: status === "overdue" ? "var(--danger-soft)" : "var(--success-bg)",
                        color: status === "overdue" ? "var(--danger)" : "var(--success)",
                        fontSize: 11,
                      }}
                    >
                      {status === "overdue" ? "Overdue" : "On track"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section 4: Done (collapsed by default) ───────────────────── */}
      {completedStudents.length > 0 && (
        <div className="panel-flush">
          <div
            style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
            onClick={() => setShowDone((v) => !v)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="section-title">Done</span>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{completedStudents.length} students</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: showDone ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms", color: "var(--ink-3)" }}>
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {showDone && (
            <div style={{ display: "grid", gap: 0, borderTop: "1px solid var(--line)" }}>
              {completedStudents.map((student) => (
                <div
                  key={student.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 16px", borderBottom: "1px solid var(--line)", opacity: 0.6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Link
                      href={`/students/${student.id}`}
                      style={{ fontWeight: 500, fontSize: 13, color: "inherit", textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {student.fullName}
                    </Link>
                    <span className={`badge ${BADGE_CLASS[student.group]}`}>{student.level}</span>
                    <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{student.assignedTo}</span>
                  </div>
                  <span className="badge" style={{ background: "var(--bg-2)", color: "var(--ink-3)", fontSize: 11 }}>Done</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      </>)}

      {/* ── Student Slideover (sales-style) ──────────────────────────── */}
      {slideoverLead && (
        <LeadDetailSlideover
          lead={slideoverLead}
          overrides={leadOverrides[slideoverLead.id]}
          onUpdate={handleLeadUpdate}
          onClose={() => setSlideoverStudentId(null)}
        />
      )}

      {/* ── Game Plan Modal ───────────────────────────────────────────── */}
      {modalStudent && (
        <GamePlanModal
          student={modalStudent}
          existing={gamePlans[modalStudent.id]}
          isDone={doneStudents.has(modalStudent.id)}
          onSave={(plan) => saveGamePlan(modalStudent.id, plan)}
          onMarkDone={() => markStudentDone(modalStudent.id)}
          onClose={() => setModalStudentId(null)}
        />
      )}

      {/* ── Counselor Note Modal ──────────────────────────────────────── */}
      {noteModal && (
        <CounselorNoteModal
          student={noteModal.student}
          meeting={noteModal.meeting}
          initialKeyNotes={gamePlans[noteModal.meeting.studentId]?.keyNotes}
          initialNote={meetingNotes[noteModal.meeting.id]}
          onSave={handleSaveNote}
          onClose={() => setNoteModal(null)}
        />
      )}
    </section>
  );
}
