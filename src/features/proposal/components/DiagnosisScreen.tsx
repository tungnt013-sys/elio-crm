"use client";

import { useState } from "react";
import type { Diagnosis } from "../types";
import styles from "../proposal.module.css";
import Tag from "./Tag";

interface DiagnosisScreenProps {
  diagnosis: Diagnosis;
  onNext: () => void;
}

type DiagnosisKey = "strengths" | "weaknesses" | "risks" | "gaps";

export default function DiagnosisScreen({ diagnosis, onNext }: DiagnosisScreenProps) {
  const [d, setD] = useState<Diagnosis>(JSON.parse(JSON.stringify(diagnosis)));

  const upd = (key: DiagnosisKey, i: number, val: string) =>
    setD((p) => {
      const n = { ...p, [key]: [...p[key]] };
      n[key][i] = val;
      return n;
    });

  function Section({
    title,
    color,
    items,
    field,
  }: {
    title: string;
    color: string;
    items: string[];
    field: DiagnosisKey;
  }) {
    return (
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color,
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: 10,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                  marginTop: 10,
                }}
              />
              <textarea
                className={styles.editable}
                value={v}
                onChange={(e) => upd(field, i, e.target.value)}
                rows={2}
                style={{ flex: 1 }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen} style={{ padding: "28px 32px 60px", maxWidth: 660 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 3,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Strategic Diagnosis</div>
        <Tag label="AI draft — edit freely" color="#6B7280" bg="#F3F4F6" />
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
        Review and refine before projects are generated. All fields are editable.
      </div>

      <Section title="Strengths" color="#059669" items={d.strengths} field="strengths" />
      <Section title="Weaknesses" color="#DC2626" items={d.weaknesses} field="weaknesses" />

      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#7C3AED",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: 8,
          }}
        >
          Core narrative thread
        </div>
        <textarea
          className={styles.editable}
          value={d.narrative}
          onChange={(e) => setD((p) => ({ ...p, narrative: e.target.value }))}
          rows={3}
          style={{ border: "1.5px solid #c4b5fd", width: "100%" }}
        />
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
          This thread must connect every section of the proposal and all essays.
        </div>
      </div>

      <Section title="Risk flags" color="#D97706" items={d.risks} field="risks" />
      <Section
        title="Info gaps to verify with student"
        color="#6B7280"
        items={d.gaps}
        field="gaps"
      />

      <button className={styles.btnPrimary} onClick={onNext}>
        Approve &amp; Generate Projects →
      </button>
    </div>
  );
}
