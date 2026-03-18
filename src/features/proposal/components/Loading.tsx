import styles from "../proposal.module.css";

interface LoadingProps {
  msg: string;
  sub?: string;
}

export default function Loading({ msg, sub }: LoadingProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 14,
      }}
    >
      <div className={styles.spinner} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{msg}</div>
        {sub && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}
