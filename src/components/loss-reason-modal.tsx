"use client";

import { LossReason } from "@prisma/client";

const OPTIONS: LossReason[] = [
  "NO_NEED",
  "NOT_CONTACTABLE",
  "COST",
  "CHANGED_PLANS",
  "SCHEDULE",
  "CHOSE_COMPETITOR",
  "TOO_YOUNG",
  "OTHER",
];

const OPTION_LABELS: Record<LossReason, string> = {
  NO_NEED: "No need",
  NOT_CONTACTABLE: "Not contactable",
  COST: "Cost concerns",
  CHANGED_PLANS: "Changed plans",
  SCHEDULE: "Schedule conflict",
  CHOSE_COMPETITOR: "Chose competitor",
  TOO_YOUNG: "Too young",
  OTHER: "Other reason",
};

export function LossReasonModal({
  open,
  value,
  detail,
  onValueChange,
  onDetailChange,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  value: LossReason | "";
  detail: string;
  onValueChange: (value: LossReason | "") => void;
  onDetailChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal fade-in" role="dialog" aria-modal="true">
        <div className="modal-title">Mark as Lost</div>
        <div className="modal-desc">
          Select a reason before moving this student to a lost stage.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {OPTIONS.map((opt) => {
            const selected = value === opt;
            return (
              <button
                key={opt}
                onClick={() => onValueChange(opt)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: `1.5px solid ${selected ? "var(--accent)" : "var(--line-strong)"}`,
                  background: selected ? "var(--accent-soft)" : "var(--bg)",
                  color: selected ? "var(--accent)" : "var(--ink)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: selected ? 580 : 450,
                  fontSize: 13.5,
                  transition: "all 120ms ease",
                }}
              >
                <span
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    border: `1.5px solid ${selected ? "var(--accent)" : "var(--ink-3)"}`,
                    background: selected ? "var(--accent)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 120ms ease",
                  }}
                >
                  {selected && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M1.5 4l2 2 3-3"
                        stroke="white"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {OPTION_LABELS[opt]}
              </button>
            );
          })}
        </div>

        <textarea
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
          placeholder="Additional context (optional)"
          rows={3}
          className="field"
          style={{ marginTop: 14, resize: "vertical" }}
        />

        <div className="modal-footer">
          <button onClick={onCancel} className="btn">
            Cancel
          </button>
          <button onClick={onSubmit} disabled={!value} className="btn btn-danger" style={{ opacity: value ? 1 : 0.45 }}>
            Confirm Loss
          </button>
        </div>
      </div>
    </div>
  );
}
