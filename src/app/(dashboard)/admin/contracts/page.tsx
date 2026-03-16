"use client";

import { MOCK_CONTRACTS } from "@/lib/mock-data";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE:    { bg: "var(--success-bg)", color: "var(--success)", label: "Active" },
  SIGNED:    { bg: "var(--accent-soft)", color: "var(--accent)", label: "Signed" },
  SENT:      { bg: "var(--warning-bg)", color: "#B45309", label: "Sent" },
  DRAFT:     { bg: "var(--bg-2)", color: "var(--ink-2)", label: "Draft" },
  COMPLETED: { bg: "var(--bg-2)", color: "var(--ink-3)", label: "Completed" },
};

function formatVND(amount: number) {
  if (amount === 0) return "—";
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

export default function ContractsPage() {
  const activeCount = MOCK_CONTRACTS.filter((c) => c.status === "ACTIVE").length;
  const totalPayments = MOCK_CONTRACTS.reduce((sum, c) => sum + c.payments.reduce((s, p) => s + p.amount, 0), 0);

  return (
    <section style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 className="page-title">Contracts</h1>
        <p className="muted" style={{ marginTop: 2, fontSize: 13 }}>
          {MOCK_CONTRACTS.length} contracts · {activeCount} active
        </p>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Contracts</div>
          <div className="kpi-value">{MOCK_CONTRACTS.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active</div>
          <div className="kpi-value" style={{ color: "var(--success)" }}>{activeCount}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pending Signature</div>
          <div className="kpi-value">{MOCK_CONTRACTS.filter((c) => c.status === "SENT").length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Collected</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>{formatVND(totalPayments)}</div>
        </div>
      </div>

      <div className="panel-flush">
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <span className="section-title">All Contracts</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Contract Code</th>
              <th>Student</th>
              <th>Status</th>
              <th>Recipient</th>
              <th>Phone</th>
              <th>Payments</th>
              <th>Shipping</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CONTRACTS.map((c) => {
              const st = STATUS_STYLES[c.status] || STATUS_STYLES.DRAFT;
              return (
                <tr key={c.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{c.contractCode}</td>
                  <td style={{ fontWeight: 500 }}>{c.student.fullName}</td>
                  <td>
                    <span className="badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </td>
                  <td style={{ color: "var(--ink-2)", fontSize: 12 }}>{c.recipient || "—"}</td>
                  <td style={{ color: "var(--ink-2)", fontSize: 12 }}>{c.recipientPhone || "—"}</td>
                  <td style={{ fontSize: 12 }}>
                    {c.payments.length === 0 ? (
                      <span style={{ color: "var(--ink-3)" }}>No payments</span>
                    ) : (
                      c.payments.map((p, i) => (
                        <div key={i} style={{ color: "var(--ink-2)" }}>
                          {p.note}: {formatVND(p.amount)} ({p.date})
                        </div>
                      ))
                    )}
                  </td>
                  <td style={{ color: "var(--ink-3)", fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.shippingAddress || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
