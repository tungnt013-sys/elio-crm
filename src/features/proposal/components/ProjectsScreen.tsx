"use client";

import { useState } from "react";
import type { Project } from "../types";
import styles from "../proposal.module.css";

interface ProjectsScreenProps {
  projects: Project[];
  onNext: (selectedProjectId: string) => void;
}

export default function ProjectsScreen({ projects, onNext }: ProjectsScreenProps) {
  const [sel, setSel] = useState<string | null>(null);
  const [exp, setExp] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>(
    Object.fromEntries(projects.map((p) => [p.id, ""]))
  );

  return (
    <div className={styles.screen} style={{ padding: "28px 24px 60px" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 3 }}>
        Signature Project Options
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
        Select one project. Each is grounded in the approved diagnosis and the student&apos;s specific profile.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {projects.map((p) => {
          const isSel = sel === p.id;
          return (
            <div
              key={p.id}
              className={`${styles.cardHover}${isSel ? " " + styles.cardSel : ""}`}
              onClick={() => setSel(p.id)}
              style={{
                borderRadius: 12,
                border: `2px solid ${isSel ? p.sc : "#E5E7EB"}`,
                background: isSel ? p.sb : "#fff",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: p.sc,
                    background: `${p.sc}18`,
                    padding: "2px 8px",
                    borderRadius: 99,
                  }}
                >
                  {p.src}
                </span>
                {p.prog && (
                  <span style={{ fontSize: 10, color: "#0369A1", fontWeight: 600 }}>
                    ↗ {p.prog.url}
                  </span>
                )}
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                {p.name}
              </div>

              <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.65 }}>{p.concept}</div>

              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 11,
                    color: "#374151",
                    background: "#F3F4F6",
                    padding: "2px 7px",
                    borderRadius: 5,
                  }}
                >
                  ⏱ {p.time}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: p.diff === "High" ? "#B45309" : "#374151",
                    background: p.diff === "High" ? "#FEF3C7" : "#F3F4F6",
                    padding: "2px 7px",
                    borderRadius: 5,
                  }}
                >
                  {p.diff}
                </span>
              </div>

              <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#9CA3AF",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  Why this student
                </div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.55 }}>
                  {p.rationale}
                </div>
              </div>

              <div style={{ fontSize: 12, color: p.sc, fontWeight: 500 }}>→ {p.link}</div>

              {p.prog && (
                <div style={{ background: "#F0F9FF", borderRadius: 7, padding: "9px 11px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0369A1", marginBottom: 2 }}>
                    {p.prog.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#374151" }}>
                    {p.prog.deadline} · {p.prog.cost}
                  </div>
                </div>
              )}

              {isSel && (
                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setExp(exp === p.id ? null : p.id)}
                    style={{
                      fontSize: 12,
                      color: "#2563EB",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: "inherit",
                    }}
                  >
                    {exp === p.id ? "▲ Hide" : "▼ Modify concept"}
                  </button>
                  {exp === p.id && (
                    <textarea
                      className={styles.editable}
                      value={edits[p.id]}
                      onChange={(e) => setEdits((pr) => ({ ...pr, [p.id]: e.target.value }))}
                      rows={3}
                      placeholder="Describe any adjustments..."
                      style={{ marginTop: 8, fontSize: 12 }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        className={styles.btnPrimary}
        onClick={() => sel && onNext(sel)}
        disabled={!sel}
      >
        Confirm &amp; Generate Deliverables →
      </button>
    </div>
  );
}
