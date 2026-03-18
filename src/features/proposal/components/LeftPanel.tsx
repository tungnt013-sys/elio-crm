import type { Student } from "../types";
import styles from "../proposal.module.css";
import Tag from "./Tag";
import Dot from "./Dot";
import RowInfo from "./RowInfo";

interface LeftPanelProps {
  student: Student;
}

export default function LeftPanel({ student }: LeftPanelProps) {
  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        overflowY: "auto",
        borderRight: "1px solid #E5E7EB",
        padding: "24px 20px",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{student.name}</div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
          {student.school} · {student.grade}
        </div>
        <div style={{ marginTop: 8 }}>
          <Tag label="Proposal Pending" color="#B45309" bg="#FEF3C7" />
        </div>
      </div>

      <div className={styles.sep} />

      <RowInfo label="Desired Field" value={student.major} />
      <RowInfo label="Target" value={student.targets} />
      <RowInfo label="Budget" value={student.budget} />
      <RowInfo label="Counselor" value={student.counselor} />

      <div className={styles.sep} />

      <RowInfo label="GPA" value={student.gpa} />
      <RowInfo label="SAT" value={student.sat} />
      <RowInfo label="IELTS" value={student.ielts} />

      <div className={styles.sep} />

      <div className={styles.fieldLabel} style={{ marginBottom: 10 }}>
        Extracurriculars
      </div>
      {student.activities.map((a, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
          <Dot />
          <span style={{ fontSize: 13, color: "#374151" }}>{a}</span>
        </div>
      ))}

      <div className={styles.sep} />

      <div className={styles.fieldLabel} style={{ marginBottom: 8 }}>
        Consultant Notes
      </div>
      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.65 }}>{student.notes}</div>

      <div className={styles.sep} />

      <div style={{ fontSize: 11, color: "#9CA3AF" }}>Referral · {student.referral}</div>
    </div>
  );
}
