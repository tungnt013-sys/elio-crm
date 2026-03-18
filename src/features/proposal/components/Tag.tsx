import styles from "../proposal.module.css";

interface TagProps {
  label: string;
  color?: string;
  bg?: string;
}

export default function Tag({ label, color = "#2563EB", bg = "#EFF6FF" }: TagProps) {
  return (
    <span className={styles.tag} style={{ color, background: bg }}>
      {label}
    </span>
  );
}
