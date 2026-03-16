"use client";

import { useState, useEffect } from "react";
import { ALL_LEADS, type FullLead, type LeadOverrides, computeDeadline } from "@/lib/all-leads";
import { LeadDetailSlideover } from "@/components/lead-detail-slideover";
import type { ProposalEntry } from "@/app/(dashboard)/counselor/page";

// ── KPI helpers ───────────────────────────────────────────────────────────────
// Business window: Mon–Fri, 08:00–18:00 (600 min/day).
// Date-only strings (no "T") are treated as T10:00:00 (legacy records).
// Full ISO timestamps (e.g. "2025-08-11T14:23:00") use the actual time.
function bizMinutesBetween(a: string, b: string): number | null {
  if (!a || !b) return null;
  const norm = (s: string) => (s.includes("T") ? s : s + "T10:00:00");
  const from = new Date(norm(a));
  const to   = new Date(norm(b));
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;
  if (to <= from) return 0;

  const BIZ_S = 8  * 60;   // 480 min from midnight
  const BIZ_E = 18 * 60;   // 1080 min from midnight
  const PER_DAY = BIZ_E - BIZ_S; // 600

  const isWeekday = (d: Date) => { const w = d.getDay(); return w >= 1 && w <= 5; };
  const minOfDay  = (d: Date) => d.getHours() * 60 + d.getMinutes();
  const bizMins   = (d: Date, s: number, e: number) =>
    isWeekday(d) ? Math.max(0, Math.min(BIZ_E, e) - Math.max(BIZ_S, s)) : 0;

  const fromDay = new Date(from); fromDay.setHours(0, 0, 0, 0);
  const toDay   = new Date(to);   toDay.setHours(0, 0, 0, 0);

  if (fromDay.getTime() === toDay.getTime()) {
    return bizMins(from, minOfDay(from), minOfDay(to));
  }

  let total = bizMins(from, minOfDay(from), BIZ_E);

  const cursor = new Date(fromDay);
  cursor.setDate(cursor.getDate() + 1);
  while (cursor.getTime() < toDay.getTime()) {
    if (isWeekday(cursor)) total += PER_DAY;
    cursor.setDate(cursor.getDate() + 1);
  }

  total += bizMins(to, BIZ_S, minOfDay(to));
  return total;
}
function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function fmtBizMins(mins: number | null, n: number): string {
  if (mins === null || n === 0) return "—";
  if (mins === 0) return "< 1m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
function fmtDays(d: number | null, n: number): string {
  if (d === null || n === 0) return "—";
  return `${d < 1 ? "< 1" : d.toFixed(1)}d`;
}

type MergedLead = FullLead & Partial<LeadOverrides>;

function nextAction(lead: MergedLead): { action: string; urgency: "high" | "medium" | "low" | "none" } {
  if (lead.customNextAction) return { action: lead.customNextAction, urgency: "medium" };
  const s = lead.status;
  if (s.startsWith("S1 ")) return { action: "Make first contact", urgency: "high" };
  if (s.startsWith("S2 ")) return { action: "Call parent, collect info", urgency: "high" };
  if (s.startsWith("S3 ")) return { action: "Qualify — need, budget, timeline", urgency: "medium" };
  if (s.startsWith("S4 ")) return { action: "Schedule consultation", urgency: "medium" };
  if (s.startsWith("S5 ")) return { action: "Conduct consultation", urgency: "medium" };
  if (s.startsWith("S6 ")) return { action: "Send proposal & quote", urgency: "medium" };
  if (s.startsWith("S7 ")) return { action: "Follow up on quote", urgency: "medium" };
  if (s.startsWith("S8 ")) return { action: "Push for contract sign", urgency: "medium" };
  if (s.startsWith("S9 ")) return { action: "Follow up for decision", urgency: "medium" };
  if (s.includes("S10")) return { action: "Won — hand off", urgency: "none" };
  if (s.includes("S13")) return { action: "Re-engage later", urgency: "low" };
  if (s.includes("S11") || s.includes("S12")) return { action: "Closed", urgency: "none" };
  return { action: "Review", urgency: "low" };
}

const STAGE_ORDER: Record<string, number> = {
  S1: 1, S2: 2, S3: 3, S4: 4, S5: 5, S6: 6, S7: 7, S8: 8, S9: 9, S10: 10, S11: 11, S12: 12, S13: 13,
};

function stageNum(status: string): number {
  const m = status.match(/S(\d+)/);
  return m ? (STAGE_ORDER[`S${m[1]}`] || 99) : 99;
}

function statusStyle(status: string) {
  if (status.includes("S10")) return { bg: "var(--success-bg)", color: "var(--success)" };
  if (status.startsWith("S1 ") || status.startsWith("S2 ")) return { bg: "#FEF3C7", color: "#92400E" };
  if (status.startsWith("S9") || status.startsWith("S8 ") || status.startsWith("S7 ")) return { bg: "#F0F0FF", color: "#6D28D9" };
  if (status.startsWith("S5 ") || status.startsWith("S6 ")) return { bg: "var(--accent-soft)", color: "var(--accent)" };
  if (status.includes("S11") || status.includes("S12")) return { bg: "var(--danger-soft)", color: "var(--danger)" };
  if (status.includes("S13")) return { bg: "var(--warning-bg)", color: "#92400E" };
  return { bg: "var(--bg-2)", color: "var(--ink-2)" };
}

function shortStatus(status: string) {
  return status.replace(/^S\d+ - /, "");
}

type FilterKey = "current" | "all";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "current", label: "Current" },
  { key: "all", label: "All" },
];

const urgencyDot: Record<string, string> = {
  high: "var(--danger)",
  medium: "var(--warning)",
  low: "var(--ink-3)",
  none: "var(--success)",
};

const LS_OVERRIDES = "elio:leadOverrides";
function loadOverrides(): Record<string, Partial<LeadOverrides>> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LS_OVERRIDES) ?? "{}"); } catch { return {}; }
}
function saveOverrides(data: Record<string, Partial<LeadOverrides>>) {
  localStorage.setItem(LS_OVERRIDES, JSON.stringify(data));
}

export default function SalesPage() {
  const [filter, setFilter] = useState<FilterKey>("current");
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadOverrides, setLeadOverrides] = useState<Record<string, Partial<LeadOverrides>>>({});

  useEffect(() => {
    setLeadOverrides(loadOverrides());
  }, []);

  const handleLeadUpdate = (id: string, updates: Partial<LeadOverrides>) => {
    setLeadOverrides((prev) => {
      const next = { ...prev, [id]: { ...prev[id], ...updates } };
      saveOverrides(next);
      return next;
    });
  };

  const mergedLeads: MergedLead[] = ALL_LEADS.map((lead) => {
    const overrides = leadOverrides[lead.id];
    return overrides ? { ...lead, ...overrides } : lead;
  });

  const selectedLead = selectedLeadId ? mergedLeads.find((l) => l.id === selectedLeadId) ?? null : null;
  const today = new Date().toISOString().slice(0, 10);

  // Next Items: active pipeline only (S1–S9), sorted by urgency then stage
  const nextItems = mergedLeads
    .filter((l) => { const n = stageNum(l.status); return n >= 1 && n <= 9; })
    .sort((a, b) => {
      const urgencyRank = { high: 0, medium: 1, low: 2, none: 3 };
      const ua = urgencyRank[nextAction(a).urgency];
      const ub = urgencyRank[nextAction(b).urgency];
      if (ua !== ub) return ua - ub;
      return stageNum(a.status) - stageNum(b.status);
    });

  // All Leads table — hide Closed by default (current), show all if filter === "all"
  const isClosed = (status: string) =>
    status.includes("S10") || status.includes("S11") || status.includes("S12") || status.includes("S13");

  let leads = mergedLeads;
  if (filter === "current") {
    leads = leads.filter((l) => !isClosed(l.status));
  }
  // filter === "all" shows everything

  if (search.trim()) {
    const q = search.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.studentName.toLowerCase().includes(q) ||
        l.parentName.toLowerCase().includes(q) ||
        l.school.toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q)
    );
  }

  leads = [...leads].sort((a, b) => stageNum(a.status) - stageNum(b.status));

  // ── KPI computations ────────────────────────────────────────────────────────
  // 1. Time to First Response: submission → firstContact (business minutes)
  const responseGaps = mergedLeads
    .map(l => bizMinutesBetween(l.submissionTime, l.firstContact))
    .filter((d): d is number => d !== null && d > 0);
  const avgResponse = median(responseGaps);

  // 2. Time to First Meeting: submission → appointmentDate (calendar days)
  const meetingGaps = mergedLeads
    .map(l => {
      const a = l.submissionTime, b = l.appointmentDate || "";
      if (!a || !b) return null;
      const da = new Date(a), db = new Date(b);
      if (isNaN(da.getTime()) || isNaN(db.getTime())) return null;
      const d = (db.getTime() - da.getTime()) / 86_400_000;
      return d > 0 ? d : null;
    })
    .filter((d): d is number => d !== null);
  const avgMeeting = median(meetingGaps);

  // 3. Meeting → Proposal Sent: appointmentDate → lastContact for leads at S6+
  const proposalGaps = mergedLeads
    .filter(l => stageNum(l.status) >= 6)
    .map(l => {
      const a = l.appointmentDate || "", b = l.lastContact;
      if (!a || !b) return null;
      const da = new Date(a), db = new Date(b);
      if (isNaN(da.getTime()) || isNaN(db.getTime())) return null;
      const d = (db.getTime() - da.getTime()) / 86_400_000;
      return d > 0 ? d : null;
    })
    .filter((d): d is number => d !== null);
  const avgProposal = median(proposalGaps);

  // 4. Active Pipeline: S1–S9
  const activePipeline = mergedLeads.filter(l => { const n = stageNum(l.status); return n >= 1 && n <= 9; }).length;

  // ── Counselor proposals notification ────────────────────────────────────────
  const [proposals, setProposals] = useState<Record<string, ProposalEntry>>({});
  const [showProposals, setShowProposals] = useState(false);
  useEffect(() => {
    const load = () => {
      try { setProposals(JSON.parse(localStorage.getItem("elio:proposals") ?? "{}")); } catch { /* ignore */ }
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const unseenProposals = Object.entries(proposals).filter(([, p]) => !p.seen);

  const markAllSeen = () => {
    const next: Record<string, ProposalEntry> = {};
    for (const [id, p] of Object.entries(proposals)) next[id] = { ...p, seen: true };
    setProposals(next);
    localStorage.setItem("elio:proposals", JSON.stringify(next));
  };

  const proposalLeadMap = Object.fromEntries(
    ALL_LEADS.map((l) => [l.id, l])
  );

  return (
    <section style={{ display: "grid", gap: 20 }}>
      <h1 className="page-title">Sales Pipeline</h1>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          {
            label: "Time to First Response",
            value: fmtBizMins(avgResponse, responseGaps.length),
            sub: responseGaps.length ? `Median · ${responseGaps.length} leads · biz hrs` : "No data yet",
          },
          {
            label: "Time to First Meeting",
            value: fmtDays(avgMeeting, meetingGaps.length),
            sub: meetingGaps.length ? `Median across ${meetingGaps.length} leads` : "No data yet",
          },
          {
            label: "Meeting → Proposal Sent",
            value: fmtDays(avgProposal, proposalGaps.length),
            sub: proposalGaps.length ? `Median across ${proposalGaps.length} leads` : "No data yet",
          },
          {
            label: "Active Pipeline",
            value: activePipeline,
            sub: "Leads in S1–S9",
          },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Counselor Proposals Banner ──────────────────────────────── */}
      {Object.keys(proposals).length > 0 && (
        <div className="panel-flush" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 12, cursor: "pointer",
              background: unseenProposals.length > 0 ? "var(--accent-soft)" : "var(--bg-2)",
              borderBottom: showProposals ? "1px solid var(--line)" : "none",
            }}
            onClick={() => { setShowProposals((v) => !v); if (!showProposals) markAllSeen(); }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 15 }}>📄</span>
              <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
                Counselor Proposals
              </span>
              {unseenProposals.length > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                  background: "var(--accent)", color: "#fff",
                }}>
                  {unseenProposals.length} new
                </span>
              )}
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {Object.keys(proposals).length} proposal{Object.keys(proposals).length !== 1 ? "s" : ""} submitted
              </span>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              style={{ transform: showProposals ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms", color: "var(--ink-3)" }}>
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {showProposals && (
            <div>
              {Object.entries(proposals).map(([leadId, p]) => {
                const lead = proposalLeadMap[leadId];
                const dt = new Date(p.submittedAt);
                const dtStr = `${dt.toLocaleDateString("vi-VN")} ${dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
                return (
                  <div key={leadId} style={{
                    padding: "12px 16px", borderBottom: "1px solid var(--line)",
                    display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                  }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{lead?.studentName ?? leadId}</span>
                      {lead && <span style={{ fontSize: 12, color: "var(--ink-3)", marginLeft: 8 }}>Grade {lead.gradeLevel} · {lead.school}</span>}
                    </div>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12, color: "var(--accent)", textDecoration: "none",
                        maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {p.url}
                    </a>
                    <span style={{ fontSize: 11, color: "var(--ink-3)", flexShrink: 0 }}>
                      {p.submittedBy} · {dtStr}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Next Items */}
      {nextItems.length > 0 && (
        <div className="panel-flush">
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="section-title">Next Items</span>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{nextItems.length} requiring action</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Student</th>
                  <th>Next Action</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {nextItems.map((lead) => {
                  const st = statusStyle(lead.status);
                  const na = nextAction(lead);
                  const isOverdue = lead.deadline && lead.deadline < today;
                  return (
                    <tr key={lead.id} onClick={() => setSelectedLeadId(lead.id)} style={{ cursor: "pointer" }}>
                      <td>
                        <span className="badge" style={{ background: st.bg, color: st.color, fontSize: 11, whiteSpace: "nowrap" }}>
                          {shortStatus(lead.status)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{lead.studentName || "—"}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: urgencyDot[na.urgency], flexShrink: 0 }} />
                          <span style={{ color: "var(--ink-2)" }}>{na.action}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                        {lead.deadline ? (
                          <span style={{ color: isOverdue ? "var(--danger)" : "var(--ink-2)", fontWeight: isOverdue ? 600 : 400 }}>
                            {isOverdue ? "⚠ " : ""}{lead.deadline}
                          </span>
                        ) : <span style={{ color: "var(--ink-3)" }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Leads */}
      <div className="panel-flush">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="section-title">All Leads</span>
            <span style={{ fontSize: 11, color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}>{leads.length} results</span>
            {filter === "current" && (
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>· Closed hidden</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="text"
              placeholder="Search name, school..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                fontSize: 12,
                padding: "5px 10px",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-md)",
                background: "var(--bg)",
                color: "var(--ink)",
                width: 180,
                outline: "none",
              }}
            />
            <div className="filter-pills">
              {FILTERS.map((f) => (
                <button key={f.key} className={`filter-pill${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Student</th>
                <th>Parent</th>
                <th>Grade</th>
                <th>School</th>
                <th>Next Action</th>
                <th>Deadline</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const st = statusStyle(lead.status);
                const na = nextAction(lead);
                const isOverdue = lead.deadline && lead.deadline < today && na.urgency !== "none";
                return (
                  <tr key={lead.id} onClick={() => setSelectedLeadId(lead.id)} style={{ cursor: "pointer" }}>
                    <td>
                      <span className="badge" style={{ background: st.bg, color: st.color, fontSize: 11, whiteSpace: "nowrap" }}>
                        {shortStatus(lead.status)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{lead.studentName || "—"}</td>
                    <td style={{ color: "var(--ink-2)" }}>{lead.parentName || "—"}</td>
                    <td><span className="badge">{lead.gradeLevel || "—"}</span></td>
                    <td style={{ color: "var(--ink-2)", fontSize: 12, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.school || "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: urgencyDot[na.urgency], flexShrink: 0 }} />
                        <span style={{ color: "var(--ink-2)" }}>{na.action}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                      {lead.deadline ? (
                        <span style={{ color: isOverdue ? "var(--danger)" : "var(--ink-2)", fontWeight: isOverdue ? 600 : 400 }}>
                          {isOverdue ? "⚠ " : ""}{lead.deadline}
                        </span>
                      ) : <span style={{ color: "var(--ink-3)" }}>—</span>}
                    </td>
                    <td style={{ color: "var(--ink-3)", fontSize: 12, whiteSpace: "nowrap" }}>{lead.submissionTime || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {leads.length === 0 && (
          <div className="empty-state" style={{ padding: 32 }}>No leads match your filters.</div>
        )}
      </div>

      {selectedLead && (
        <LeadDetailSlideover
          lead={selectedLead}
          overrides={leadOverrides[selectedLead.id]}
          onUpdate={handleLeadUpdate}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </section>
  );
}
