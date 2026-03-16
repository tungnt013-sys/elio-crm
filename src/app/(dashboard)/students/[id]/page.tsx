"use client";

import { use } from "react";
import Link from "next/link";
import { STUDENT_ROSTER } from "@/lib/mock-data";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const student = STUDENT_ROSTER.find((s) => s.id === id);

  if (!student) {
    return (
      <div className="panel empty-state">
        Student not found. <Link href="/counselor" style={{ color: "var(--accent)" }}>Back to roster</Link>
      </div>
    );
  }

  const BADGE_CLASS: Record<string, string> = {
    grad: "badge-grad", g11: "badge-g11", g9: "badge-g9", done: "badge-done",
  };

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/counselor" className="btn btn-sm btn-ghost">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2.5l-4 3.5 4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </Link>
      </div>

      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 className="page-title">{student.fullName}</h1>
              <span className={`badge ${BADGE_CLASS[student.group]}`}>{student.level}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
              Assigned to {student.assignedTo}
              {student.contractCode && <> · Contract: <code style={{ fontSize: 11, background: "var(--bg-2)", padding: "1px 4px", borderRadius: 3 }}>{student.contractCode}</code></>}
              {student.paymentStatus && <> · <span className="badge badge-green" style={{ fontSize: 10 }}>{student.paymentStatus}</span></>}
            </div>
          </div>
        </div>

        {student.issues.length > 0 && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "var(--danger-soft)", borderRadius: "var(--r-md)", display: "flex", gap: 8, alignItems: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="var(--danger)" strokeWidth="1.2" /><path d="M7 4.5v3M7 9.5h.01" stroke="var(--danger)" strokeWidth="1.2" strokeLinecap="round" /></svg>
            <span style={{ fontSize: 13, color: "var(--danger)", fontWeight: 500 }}>{student.issues.join(" · ")}</span>
          </div>
        )}
      </div>

      <div className="detail-grid">
        <div className="panel">
          <div className="section-title" style={{ marginBottom: 12 }}>Student Information</div>
          <div className="detail-value" style={{ lineHeight: 1.6 }}>{student.studentInfo}</div>
          {student.email && (
            <div style={{ marginTop: 8 }}>
              <span className="detail-label">Email: </span>
              <span style={{ fontSize: 13 }}>{student.email}</span>
            </div>
          )}
          {student.school && (
            <div style={{ marginTop: 4 }}>
              <span className="detail-label">School: </span>
              <span style={{ fontSize: 13 }}>{student.school}</span>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="section-title" style={{ marginBottom: 12 }}>Parent Information</div>
          <div className="detail-value" style={{ lineHeight: 1.6 }}>{student.parentInfo}</div>
          {student.parents.map((p, i) => (
            <div key={i} style={{ marginTop: 8, display: "flex", gap: 16 }}>
              <div>
                <span className="detail-label">Name: </span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{p.fullName}</span>
              </div>
              {p.phone && (
                <div>
                  <span className="detail-label">Phone: </span>
                  <span style={{ fontSize: 13 }}>{p.phone}</span>
                </div>
              )}
              {p.email && (
                <div>
                  <span className="detail-label">Email: </span>
                  <span style={{ fontSize: 13 }}>{p.email}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-title" style={{ marginBottom: 12 }}>Key Notes & Action Items</div>
        <div className="detail-value" style={{ lineHeight: 1.7 }}>{student.keyNotes}</div>
        {student.tags.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
            {student.tags.map((tag, i) => (
              <span key={i} className="action-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
