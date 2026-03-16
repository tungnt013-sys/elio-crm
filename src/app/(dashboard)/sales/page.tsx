"use client";

import { useState } from "react";
import { ALL_LEADS, type FullLead, type LeadOverrides, computeDeadline } from "@/lib/all-leads";
import { LEAD_STATS } from "@/lib/mock-data";
import { LeadDetailSlideover } from "@/components/lead-detail-slideover";

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

export default function SalesPage() {
  const [filter, setFilter] = useState<FilterKey>("current");
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadOverrides, setLeadOverrides] = useState<Record<string, Partial<LeadOverrides>>>({});

  const handleLeadUpdate = (id: string, updates: Partial<LeadOverrides>) => {
    setLeadOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
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

  const stats = LEAD_STATS;

  return (
    <section style={{ display: "grid", gap: 20 }}>
      <h1 className="page-title">Sales Pipeline</h1>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        {[
          { label: "Total Leads", value: stats.total, sub: "All time" },
          { label: "Won", value: stats.won, sub: `${((stats.won / stats.total) * 100).toFixed(1)}% conversion`, color: "var(--success)" },
          { label: "Active Pipeline", value: stats.proposalSent + stats.proposalPending + stats.appointmentScheduled, sub: "In progress" },
          { label: "Warm Leads", value: stats.warmLead, sub: "Re-engage", color: "var(--warning)" },
          { label: "Lost", value: stats.lostNotFit + stats.lostNoContact, sub: "Not fit + No contact", color: "var(--danger)" },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

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
