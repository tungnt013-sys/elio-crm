"use client";

import { useEffect, useState } from "react";

type Proposal = {
  id: string;
  proposalUrl: string;
  quoteAmount: number | null;
  quoteCurrency: string;
  isCustomQuote: boolean;
  sentAt: string | null;
};

export function ProposalCard({ studentId }: { studentId: string }) {
  const [rows, setRows] = useState<Proposal[]>([]);
  const [proposalUrl, setProposalUrl] = useState("");

  async function load() {
    const data = await fetch(`/api/proposals?studentId=${studentId}`).then((r) => r.json());
    setRows(data);
  }

  useEffect(() => {
    void load();
  }, [studentId]);

  async function createProposal() {
    if (!proposalUrl) return;
    await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, proposalUrl, isCustomQuote: false }),
    });
    setProposalUrl("");
    await load();
  }

  return (
    <div className="panel">
      <h3 className="section-title" style={{ marginBottom: 14 }}>Proposals</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={proposalUrl}
          onChange={(e) => setProposalUrl(e.target.value)}
          placeholder="Google Doc URL"
          className="field"
          style={{ flex: 1 }}
        />
        <button onClick={() => void createProposal()} className="btn btn-primary btn-sm">
          Add
        </button>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((row) => (
          <article
            key={row.id}
            style={{
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              padding: "12px 14px",
              background: "var(--bg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <a
                href={row.proposalUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "var(--accent)",
                  fontWeight: 560,
                  fontSize: 13.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Open Proposal
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M5 2h5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <span className={`badge ${row.isCustomQuote ? "badge-blue" : ""}`}>
                {row.isCustomQuote ? "Custom" : "Standard"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                color: "var(--ink-2)",
              }}
            >
              <span style={{ fontWeight: 550 }}>
                {row.quoteAmount
                  ? `${row.quoteCurrency} ${row.quoteAmount.toLocaleString()}`
                  : "Quote pending"}
              </span>
              <span>{row.sentAt ? new Date(row.sentAt).toLocaleDateString() : "Not sent"}</span>
            </div>
          </article>
        ))}
        {rows.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "24px 0",
              color: "var(--ink-3)",
              fontSize: 14,
            }}
          >
            No proposals yet
          </div>
        )}
      </div>
    </div>
  );
}
