"use client";

import { useState } from "react";
import type { Student, PastCase } from "../types";
import styles from "../proposal.module.css";
import Tag from "./Tag";

interface SetupScreenProps {
  student: Student;
  pastCases: PastCase[];
  onNext: () => void;
}

export default function SetupScreen({ student, pastCases, onNext }: SetupScreenProps) {
  const [notes, setNotes] = useState(student.notes);
  const [hasRef, setHasRef] = useState<"yes" | "no" | null>(null);
  const [selCase, setSelCase] = useState<number | null>(null);
  const [extra, setExtra] = useState("");
  const [cx, setCx] = useState({ time: false, budget: false, parent: false, ft: false });

  const ready = notes.trim().length > 10 && hasRef !== null && (hasRef === "no" || selCase !== null);

  return (
    <div className={styles.screen} style={{ padding: "28px 32px 60px", maxWidth: 660 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 3 }}>
        Generate Proposal
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
        Review meeting notes and configure before AI analysis begins.
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
          Meeting notes{" "}
          <span style={{ color: "#9CA3AF", fontWeight: 400 }}>— pulled from Consultant Notes</span>
        </div>
        <textarea
          className={styles.editable}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
        />
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
          Edit freely — add anything from today&apos;s session not captured above.
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 3 }}>
          Do you have a reference case in mind?
        </div>
        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>
          Cards A and B draw from past proposals. Pin a specific case or let AI select.
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          {(
            [
              ["yes", "Yes — I have one in mind"],
              ["no", "No — let AI select"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              onClick={() => {
                setHasRef(v);
                if (v === "no") setSelCase(null);
              }}
              style={{
                padding: "9px 16px",
                borderRadius: 8,
                border: `1.5px solid ${hasRef === v ? "#2563EB" : "#E5E7EB"}`,
                background: hasRef === v ? "#EFF6FF" : "#fff",
                color: hasRef === v ? "#2563EB" : "#374151",
                fontSize: 13,
                fontWeight: hasRef === v ? 600 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {hasRef === "yes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pastCases.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelCase(c.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `1.5px solid ${selCase === c.id ? "#2563EB" : "#E5E7EB"}`,
                  background: selCase === c.id ? "#EFF6FF" : "#FAFAFA",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 13, color: "#111827" }}>{c.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: selCase === c.id ? "#2563EB" : "#9CA3AF",
                  }}
                >
                  {c.sim}% match
                </span>
              </button>
            ))}
          </div>
        )}

        {hasRef === "no" && (
          <div
            style={{
              padding: "12px 14px",
              background: "#F9FAFB",
              borderRadius: 8,
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
              AI will select the 2 most similar cases based on major, grade, and activity pattern.
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {pastCases.slice(0, 2).map((c) => (
                <Tag
                  key={c.id}
                  label={`${c.label.split("—")[0].trim()} · ${c.sim}%`}
                  color="#374151"
                  bg="#F3F4F6"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
          Constraints <span style={{ color: "#9CA3AF", fontWeight: 400 }}>— optional</span>
        </div>
        {(
          [
            ["time", "Student has < 8 hrs/week outside school"],
            ["budget", "Avoid hardware or paid programs"],
            ["parent", "Strong parent opinion on country or program type"],
            ["ft", "Student has shown low follow-through historically"],
          ] as const
        ).map(([k, l]) => (
          <label
            key={k}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={cx[k]}
              onChange={(e) => setCx((p) => ({ ...p, [k]: e.target.checked }))}
              style={{ width: 15, height: 15, accentColor: "#2563EB" }}
            />
            <span style={{ fontSize: 13, color: "#374151" }}>{l}</span>
          </label>
        ))}
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
          Additional context <span style={{ color: "#9CA3AF", fontWeight: 400 }}>— optional</span>
        </div>
        <textarea
          className={styles.editable}
          value={extra}
          onChange={(e) => setExtra(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="Anything from the meeting not captured above..."
        />
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4, textAlign: "right" }}>
          {extra.length}/500
        </div>
      </div>

      <button className={styles.btnPrimary} onClick={onNext} disabled={!ready}>
        Generate Diagnosis →
      </button>
    </div>
  );
}
