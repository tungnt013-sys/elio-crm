"use client";

import { useState, useEffect } from "react";
import { STUDENT_ROSTER, SEED_GAME_PLANS, type StudentDetail } from "@/lib/mock-data";
import { GamePlanModal, normalizeByWho, type GamePlan, type GamePlanItem } from "../_components/game-plan-modal";

// Migrate old localStorage data: convert byWho string → string[]
function migratePlan(plan: GamePlan): GamePlan {
  return { ...plan, items: plan.items.map((it) => ({ ...it, byWho: normalizeByWho(it.byWho) })) };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CounselorTasksPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [gamePlans, setGamePlansState] = useState<Record<string, GamePlan>>({});
  const [doneStudents, setDoneStudentsState] = useState<Set<string>>(
    new Set(STUDENT_ROSTER.filter((s) => s.group === "done").map((s) => s.id))
  );
  const [modalStudentId, setModalStudentId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("elio:gamePlans") ?? "{}");
      const raw: Record<string, GamePlan> = Object.keys(saved).length > 0 ? saved : (SEED_GAME_PLANS as Record<string, GamePlan>);
      setGamePlansState(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, migratePlan(v)])));
    } catch {}
    try {
      const savedDone = JSON.parse(localStorage.getItem("elio:doneStudents") ?? "null");
      if (savedDone) setDoneStudentsState(new Set<string>(savedDone));
    } catch {}
  }, []);

  const setGamePlans = (val: Record<string, GamePlan> | ((prev: Record<string, GamePlan>) => Record<string, GamePlan>)) => {
    setGamePlansState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      if (typeof window !== "undefined") localStorage.setItem("elio:gamePlans", JSON.stringify(next));
      return next;
    });
  };

  // Group tasks by counselor (student.assignedTo)
  type TaskRow = { studentId: string; studentName: string; item: GamePlanItem };
  const byCounselor: Record<string, TaskRow[]> = {};

  STUDENT_ROSTER.forEach((student) => {
    if (doneStudents.has(student.id)) return;
    const plan = gamePlans[student.id];
    if (!plan) return;
    const counselor = (student.assignedTo ?? "").trim();
    if (!counselor) return;
    plan.items.forEach((item) => {
      if (!byCounselor[counselor]) byCounselor[counselor] = [];
      byCounselor[counselor].push({ studentId: student.id, studentName: student.fullName, item });
    });
  });

  const counselors = Object.keys(byCounselor).sort();

  const modalStudent = modalStudentId ? STUDENT_ROSTER.find((s) => s.id === modalStudentId) ?? null : null;

  const saveGamePlan = (studentId: string, plan: GamePlan) => {
    setGamePlans((prev) => ({ ...prev, [studentId]: plan }));
    setModalStudentId(null);
  };

  return (
    <section style={{ display: "grid", gap: 20 }}>
      <h1 className="page-title" style={{ margin: 0 }}>Tasks by Counselor</h1>

      {counselors.length === 0 ? (
        <div className="panel-flush">
          <div className="empty-state" style={{ padding: 40, fontSize: 13, color: "var(--ink-3)" }}>
            No counselor tasks yet. Set up game plans to populate this view.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {counselors.map((counselor) => {
            const rows = byCounselor[counselor].sort((a, b) => {
              // Pending first, then done
              if (a.item.done !== b.item.done) return a.item.done ? 1 : -1;
              if (!a.item.deadline && !b.item.deadline) return 0;
              if (!a.item.deadline) return 1;
              if (!b.item.deadline) return -1;
              return a.item.deadline.localeCompare(b.item.deadline);
            });
            const overdueCount = rows.filter((r) => !r.item.done && r.item.deadline && r.item.deadline < today).length;
            const doneCount = rows.filter((r) => r.item.done).length;
            const openCount = rows.length - doneCount;

            return (
              <div key={counselor} className="panel-flush">
                {/* Counselor header */}
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--accent-soft)", color: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {counselor.charAt(0).toUpperCase()}
                  </div>
                  <span className="section-title">{counselor}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{openCount} open · {doneCount} done</span>
                  {overdueCount > 0 && (
                    <span style={{ fontSize: 11, color: "var(--danger)", fontWeight: 600 }}>
                      ⚠ {overdueCount} overdue
                    </span>
                  )}
                </div>

                {/* Task rows */}
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Student</th>
                        <th>By</th>
                        <th>Deadline</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ studentId, studentName, item }) => {
                        const overdue = !item.done && item.deadline && item.deadline < today;
                        return (
                          <tr key={item.id} style={{ opacity: item.done ? 0.5 : 1 }}>
                            <td style={{ fontSize: 13, color: "var(--ink)", maxWidth: 320 }}>
                              {item.done && <span style={{ color: "var(--success)", marginRight: 6 }}>✓</span>}
                              <span style={{
                                textDecoration: item.done ? "line-through" : "none",
                                color: item.done ? "var(--ink-3)" : "var(--ink)",
                              }}>
                                {item.item || "—"}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => setModalStudentId(studentId)}
                                style={{
                                  background: "none", border: "none", padding: 0, cursor: "pointer",
                                  fontSize: 12, fontWeight: 500, color: "var(--accent)", textDecoration: "none",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                              >
                                {studentName}
                              </button>
                            </td>
                            <td style={{ fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
                              {normalizeByWho(item.byWho).join(", ") || "—"}
                            </td>
                            <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>
                              {item.deadline ? (
                                <span style={{
                                  color: overdue ? "var(--danger)" : "var(--ink-2)",
                                  fontWeight: overdue ? 600 : 400,
                                }}>
                                  {overdue ? "⚠ " : ""}{item.deadline}
                                </span>
                              ) : <span style={{ color: "var(--ink-3)" }}>—</span>}
                            </td>
                            <td>
                              {item.done ? (
                                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--bg-2)", color: "var(--ink-3)", fontWeight: 500 }}>Done</span>
                              ) : overdue ? (
                                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--danger-soft)", color: "var(--danger)", fontWeight: 600 }}>Overdue</span>
                              ) : (
                                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 500 }}>Open</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Game Plan Modal */}
      {modalStudent && (
        <GamePlanModal
          student={modalStudent}
          existing={gamePlans[modalStudent.id]}
          isDone={doneStudents.has(modalStudent.id)}
          onSave={(plan) => saveGamePlan(modalStudent.id, plan)}
          onMarkDone={() => {}}
          onClose={() => setModalStudentId(null)}
        />
      )}
    </section>
  );
}
