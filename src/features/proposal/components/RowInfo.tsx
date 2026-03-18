import styles from "../proposal.module.css";

interface RowInfoProps {
  label: string;
  value?: string;
}

export default function RowInfo({ label, value }: RowInfoProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className={styles.fieldLabel}>{label}</div>
      <div style={{ fontSize: 13, color: "#111827" }}>{value || "—"}</div>
    </div>
  );
}
