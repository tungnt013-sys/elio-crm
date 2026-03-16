"use client";

import { useEffect, useState } from "react";

type ContractRow = {
  id: string;
  contractCode: string;
  status: string;
  student: { fullName: string };
  payments: { amount: number }[];
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "badge",
  SENT: "badge badge-blue",
  SIGNED: "badge badge-green",
  ACTIVE: "badge badge-green",
  COMPLETED: "badge badge-orange",
};

export function ContractTable() {
  const [rows, setRows] = useState<ContractRow[]>([]);

  useEffect(() => {
    fetch("/api/contracts")
      .then((r) => r.json())
      .then((data) => setRows(data));
  }, []);

  return (
    <div className="panel panel-flush">
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
        <h2 className="section-title">Contracts</h2>
      </div>
      <div style={{ padding: "0 20px 4px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Contract Code</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Total Paid</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const paid = row.payments.reduce((sum, p) => sum + p.amount, 0);
              return (
                <tr key={row.id}>
                  <td style={{ fontWeight: 560 }}>{row.student.fullName}</td>
                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12.5,
                        color: "var(--ink-2)",
                        background: "var(--bg)",
                        padding: "2px 7px",
                        borderRadius: 6,
                        border: "1px solid var(--line)",
                      }}
                    >
                      {row.contractCode}
                    </span>
                  </td>
                  <td>
                    <span className={STATUS_CLASS[row.status] ?? "badge"}>
                      {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 550 }}>
                    {paid.toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", color: "var(--ink-3)", padding: "28px 0" }}
                >
                  No contracts yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
