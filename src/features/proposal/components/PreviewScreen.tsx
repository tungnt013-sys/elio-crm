import type { Student, Project } from "../types";
import styles from "../proposal.module.css";

interface PreviewScreenProps {
  student: Student;
  selectedProject: Project | undefined;
}

export default function PreviewScreen({ student, selectedProject }: PreviewScreenProps) {
  return (
    <div className={styles.screen} style={{ padding: "28px 32px 60px", maxWidth: 700 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 3 }}>
            Proposal Ready
          </div>
          <div style={{ fontSize: 13, color: "#6B7280" }}>
            Review the full draft before exporting to PDF.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className={styles.btnGhost}>Save draft</button>
          <button className={styles.btnPrimary}>Export PDF ↓</button>
        </div>
      </div>

      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: 28,
          background: "#FAFAFA",
          lineHeight: 1.8,
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 20,
            paddingBottom: 20,
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <div
            style={{ fontSize: 14, fontWeight: 700, color: "#111827", letterSpacing: ".05em" }}
          >
            ELIO EDUCATION
          </div>
          <div style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>
            Lộ trình Ứng tuyển Đại học Mỹ – Cá nhân hóa
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#6B7280", lineHeight: 1.8 }}>
            <div>
              Học sinh: <strong>{student.name}</strong> · {student.school}
            </div>
            <div>
              Ngành: {student.major} · Mục tiêu: {student.targets}
            </div>
            <div>
              Triển khai: 03/2026 – 08/2027 · Cố vấn: {student.counselor}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, color: "#111827", marginBottom: 8 }}>
            I. Chiến lược tổng thể
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Phương pháp Elio:</strong> Tập trung chiều sâu, chọn 2–3 hoạt động tiêu biểu,
            đầu tư bài bản, gắn kết chặt chẽ với câu chuyện cá nhân và ngành học.
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Nguyên tắc:</strong> Không chạy theo số lượng hoạt động; mọi trải nghiệm đều
            được chọn lọc và triển khai để tạo thành &quot;hành trình&quot; nhất quán.
          </div>
          <div style={{ marginBottom: 20 }}>
            <strong>Kết quả mong muốn:</strong> Hồ sơ thuyết phục cả về học thuật, cá nhân, và
            tầm nhìn nghề nghiệp.
          </div>

          <div style={{ fontWeight: 700, color: "#111827", marginBottom: 8 }}>
            II. Lộ trình theo năm học
          </div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Lớp 11 – Tăng tốc và hoàn thiện</div>
          {selectedProject && (
            <>
              <div style={{ marginBottom: 8 }}>
                <strong>Signature Project: {selectedProject.name}.</strong>{" "}
                {selectedProject.concept}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>ME Link:</strong> {selectedProject.link}
              </div>
            </>
          )}
          <div style={{ marginBottom: 8 }}>
            <strong>SAT:</strong> Cải thiện từ 1400 lên 1500+ — mục tiêu thi tháng 3 hoặc 5/2026.
            Đây là ưu tiên số một.
          </div>
          <div
            style={{
              marginTop: 16,
              color: "#9CA3AF",
              fontStyle: "italic",
              fontSize: 12,
            }}
          >
            … Lộ trình Lớp 12, Hậu xét tuyển, Visa &amp; Pre-Departure, Cam kết
          </div>
        </div>
      </div>
    </div>
  );
}
