"use client";

import { LEAD_STATS, STUDENT_ROSTER, MOCK_CONTRACTS } from "@/lib/mock-data";

function DonutChart({ slices, title, total }: { slices: { label: string; value: number; color: string }[]; title: string; total: number }) {
  if (total === 0) return null;

  const r = 44, cx = 56, cy = 56, gap = 0.03;
  let angle = -Math.PI / 2;
  const arcs = slices.filter((s) => s.value > 0).map((s) => {
    const theta = (s.value / total) * (2 * Math.PI) - gap;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += theta + gap;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = theta > Math.PI ? 1 : 0;
    return { path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, ...s };
  });

  return (
    <div className="panel" style={{ padding: "16px 20px" }}>
      <div className="section-title" style={{ marginBottom: 12 }}>{title}</div>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <svg width="112" height="112" viewBox="0 0 112 112" style={{ flexShrink: 0 }}>
          {arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} />)}
          <circle cx={cx} cy={cy} r={22} fill="var(--surface)" />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink)">{total}</text>
        </svg>
        <div style={{ display: "grid", gap: 4, flex: 1 }}>
          {slices.filter((s) => s.value > 0).map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: "var(--ink-2)" }}>{s.label}</span>
              <span style={{ fontWeight: 600, color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const stats = LEAD_STATS;
  const conversionRate = ((stats.won / stats.total) * 100).toFixed(1);

  const leadOutcomes = [
    { label: "Won", value: stats.won, color: "var(--success)" },
    { label: "Warm Lead", value: stats.warmLead, color: "var(--warning)" },
    { label: "Lost - Not Fit", value: stats.lostNotFit, color: "var(--ink-3)" },
    { label: "Lost - No Contact", value: stats.lostNoContact, color: "var(--danger)" },
    { label: "In Progress", value: stats.proposalSent + stats.proposalPending + stats.appointmentScheduled, color: "var(--accent)" },
  ];

  const studentByLevel = [
    { label: "Graduate", value: STUDENT_ROSTER.filter((s) => s.group === "grad").length, color: "var(--badge-blue-text)" },
    { label: "Undergrad G11", value: STUDENT_ROSTER.filter((s) => s.group === "g11").length, color: "var(--badge-green-text)" },
    { label: "Undergrad G9", value: STUDENT_ROSTER.filter((s) => s.group === "g9").length, color: "var(--badge-yellow-text)" },
    { label: "Done", value: STUDENT_ROSTER.filter((s) => s.group === "done").length, color: "var(--ink-3)" },
  ];

  const contractStatuses = [
    { label: "Active", value: MOCK_CONTRACTS.filter((c) => c.status === "ACTIVE").length, color: "var(--success)" },
    { label: "Sent", value: MOCK_CONTRACTS.filter((c) => c.status === "SENT").length, color: "var(--warning)" },
  ];

  const ownerWorkload: Record<string, number> = {};
  STUDENT_ROSTER.forEach((s) => { ownerWorkload[s.assignedTo] = (ownerWorkload[s.assignedTo] || 0) + 1; });
  const workloadRows = Object.entries(ownerWorkload).sort((a, b) => b[1] - a[1]);
  const maxWorkload = Math.max(...workloadRows.map((r) => r[1]), 1);

  return (
    <section style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="muted" style={{ marginTop: 2, fontSize: 13 }}>
          Overview analytics across pipeline, students, and contracts
        </p>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Leads</div>
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-sub">All time</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Conversion Rate</div>
          <div className="kpi-value" style={{ color: "var(--success)" }}>{conversionRate}%</div>
          <div className="kpi-sub">Lead to won</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Students</div>
          <div className="kpi-value">{STUDENT_ROSTER.filter((s) => s.group !== "done").length}</div>
          <div className="kpi-sub">In roster</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Contracts</div>
          <div className="kpi-value">{MOCK_CONTRACTS.filter((c) => c.status === "ACTIVE").length}</div>
          <div className="kpi-sub">Signed & active</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Issues</div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>{STUDENT_ROSTER.filter((s) => s.issues.length > 0).length}</div>
          <div className="kpi-sub">Need attention</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <DonutChart slices={leadOutcomes} title="Lead Outcomes" total={stats.total} />
        <DonutChart slices={studentByLevel} title="Students by Level" total={STUDENT_ROSTER.length} />
        <DonutChart slices={contractStatuses} title="Contract Status" total={MOCK_CONTRACTS.length} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="panel">
          <div className="section-title" style={{ marginBottom: 12 }}>Workload by Counselor</div>
          {workloadRows.map(([name, count]) => (
            <div key={name} className="stat-row">
              <div className="stat-row-header">
                <span className="stat-row-label">{name}</span>
                <span className="stat-row-value">{count} students</span>
              </div>
              <div className="stat-bar-track">
                <div className="stat-bar-fill" style={{ width: `${(count / maxWorkload) * 100}%`, background: "var(--ink)" }} />
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="section-title" style={{ marginBottom: 12 }}>Students with Issues</div>
          {STUDENT_ROSTER.filter((s) => s.issues.length > 0).map((s) => (
            <div key={s.id} className="stat-row" style={{ gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="stat-row-label">{s.fullName}</span>
                <span className={`badge ${BADGE_CLASS[s.group]}`} style={{ fontSize: 10 }}>{s.level}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--danger)" }}>{s.issues.join(", ")}</div>
            </div>
          ))}
          {STUDENT_ROSTER.filter((s) => s.issues.length > 0).length === 0 && (
            <div className="empty-state">No issues flagged.</div>
          )}
        </div>
      </div>
    </section>
  );
}

const BADGE_CLASS: Record<string, string> = {
  grad: "badge-grad",
  g11: "badge-g11",
  g9: "badge-g9",
  done: "badge-done",
};
