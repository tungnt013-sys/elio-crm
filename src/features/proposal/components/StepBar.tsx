const STEPS = ["Setup", "Diagnosis", "Projects", "Deliverables", "Preview"];

interface StepBarProps {
  step: number;
}

export default function StepBar({ step }: StepBarProps) {
  return (
    <div
      style={{
        borderBottom: "1px solid #E5E7EB",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      {STEPS.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                background: i <= step ? "#2563EB" : "#F3F4F6",
                color: i <= step ? "#fff" : "#9CA3AF",
                flexShrink: 0,
              }}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: i === step ? 600 : 400,
                color: i === step ? "#111827" : i < step ? "#2563EB" : "#9CA3AF",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              style={{
                width: 24,
                height: 1,
                background: i < step ? "#2563EB" : "#E5E7EB",
                margin: "0 8px",
                flexShrink: 0,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
