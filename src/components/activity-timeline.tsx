"use client";

import { useEffect, useState } from "react";

type ActivityRow = {
  id: string;
  type: string;
  direction: string;
  content: string;
  createdAt: string;
  staff: { name: string };
};

const TYPE_COLOR: Record<string, string> = {
  CALL:            "#173F36",
  TEXT:            "#1E6B44",
  EMAIL:           "#B86A10",
  ZALO:            "#2A6654",
  MEETING:         "#D95E1A",
  NOTE:            "#5F6B69",
  DOCUMENT_UPLOAD: "#B83232",
};

const TYPE_LABEL: Record<string, string> = {
  CALL: "Call", TEXT: "Text", EMAIL: "Email",
  ZALO: "Zalo", MEETING: "Meeting", NOTE: "Note", DOCUMENT_UPLOAD: "Document",
};

export function ActivityTimeline({ studentId }: { studentId: string }) {
  const [rows, setRows] = useState<ActivityRow[]>([]);

  useEffect(() => {
    fetch(`/api/activities?studentId=${studentId}`)
      .then((r) => r.json())
      .then((data) => setRows(data));
  }, [studentId]);

  return (
    <div className="panel">
      <h3 className="section-title" style={{ marginBottom: 16 }}>Activity</h3>
      <div className="timeline">
        {rows.map((row) => (
          <div key={row.id} className="timeline-item">
            <div
              className="timeline-dot"
              style={{ background: TYPE_COLOR[row.type] ?? "var(--brand)" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                <span
                  className="timeline-type"
                  style={{ color: TYPE_COLOR[row.type] ?? "var(--ink-2)" }}
                >
                  {TYPE_LABEL[row.type] ?? row.type}
                </span>
                <span className="badge" style={{ textTransform: "capitalize", fontSize: 10.5, padding: "1px 6px" }}>
                  {row.direction.toLowerCase()}
                </span>
              </div>
              <div className="timeline-meta">
                {row.staff.name} · {new Date(row.createdAt).toLocaleString()}
              </div>
              {row.content && <div className="timeline-content">{row.content}</div>}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ textAlign: "center", padding: "36px 0", color: "var(--ink-3)", fontSize: 13.5 }}>
            No activity recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
