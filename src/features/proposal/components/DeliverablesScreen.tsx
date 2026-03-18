import type { Deliverable, Phase } from "../types";
import styles from "../proposal.module.css";
import Tag from "./Tag";

interface DeliverablesScreenProps {
  deliverables: Deliverable[];
  phases: Phase[];
  onNext: () => void;
}

const COMPETITIONS = [
  {
    name: "Intel ISEF Affiliate Fair",
    lvl: "International",
    fit: "Prototype-based science — direct fit for hardware deliverable",
  },
  {
    name: "Vietnam Young Scientists Award",
    lvl: "National",
    fit: "Environmental Engineering category — high feasibility",
  },
  {
    name: "AI4Good Student Competition",
    lvl: "International",
    fit: "If dashboard incorporates ML predictions — stretch goal",
  },
];

export default function DeliverablesScreen({
  deliverables,
  phases,
  onNext,
}: DeliverablesScreenProps) {
  return (
    <div className={styles.screen} style={{ padding: "28px 32px 60px", maxWidth: 700 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 3 }}>
        Deliverables &amp; Phase Plan
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
        Confirm outputs and timeline. Approve to generate the full proposal.
      </div>

      {/* Deliverables table */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#374151",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: 10,
          }}
        >
          Deliverables
        </div>
        <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 70px 2fr 80px 65px",
              padding: "8px 14px",
              background: "#F9FAFB",
              fontSize: 11,
              fontWeight: 600,
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: ".04em",
              gap: 8,
            }}
          >
            <span>Item</span>
            <span>Type</span>
            <span>Spec</span>
            <span>Visibility</span>
            <span>Due</span>
          </div>
          {deliverables.map((d, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 70px 2fr 80px 65px",
                padding: "11px 14px",
                borderTop: "1px solid #E5E7EB",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{d.label}</span>
              <span style={{ fontSize: 12, color: "#6B7280" }}>{d.type}</span>
              <span style={{ fontSize: 12, color: "#374151" }}>{d.spec}</span>
              <Tag
                label={d.vis}
                color={d.vis === "External" ? "#0369A1" : "#374151"}
                bg={d.vis === "External" ? "#F0F9FF" : "#F3F4F6"}
              />
              <span style={{ fontSize: 12, color: "#6B7280" }}>{d.due}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Competitions */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#374151",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: 10,
          }}
        >
          Recommended competitions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {COMPETITIONS.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
              }}
            >
              <Tag
                label={c.lvl}
                color={c.lvl === "International" ? "#7C3AED" : "#374151"}
                bg={c.lvl === "International" ? "#F5F3FF" : "#F3F4F6"}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{c.fit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase plan */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#374151",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: 14,
          }}
        >
          Phase plan
        </div>
        <div style={{ position: "relative", paddingLeft: 16 }}>
          <div
            style={{
              position: "absolute",
              left: 5,
              top: 8,
              bottom: 8,
              width: 2,
              background: "#E5E7EB",
            }}
          />
          {phases.map((ph, i) => (
            <div key={i} style={{ position: "relative", marginBottom: 18, paddingLeft: 18 }}>
              <div
                style={{
                  position: "absolute",
                  left: -10,
                  top: 3,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#2563EB",
                  border: "2px solid #fff",
                  boxShadow: "0 0 0 2px #2563EB",
                }}
              />
              <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", marginBottom: 2 }}>
                {ph.period}
              </div>
              <div style={{ fontSize: 13, color: "#374151" }}>{ph.focus}</div>
              <div style={{ fontSize: 12, color: "#059669", marginTop: 3 }}>→ {ph.ms}</div>
            </div>
          ))}
        </div>
      </div>

      <button className={styles.btnPrimary} onClick={onNext}>
        Approve &amp; Generate Full Proposal →
      </button>
    </div>
  );
}
