"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ActivityRow = {
  id: string;
  type: string;
  direction: string;
  content: string;
  createdAt: string;
  staff: { name: string };
};

type Meeting = {
  id: string;
  title: string;
  content: string;
  meetingDate: string;
};

export type QuickViewCard = {
  id: string;
  stage: string;
  enteredAt: string;
  student: {
    id: string;
    fullName: string;
    parents: { fullName: string }[];
  };
  assignedTo: { name: string };
};

const TYPE_COLOR: Record<string, string> = {
  CALL:            "var(--success)",
  TEXT:            "#16A34A",
  EMAIL:           "var(--warning)",
  ZALO:            "#0891B2",
  MEETING:         "#EA580C",
  NOTE:            "var(--ink-3)",
  DOCUMENT_UPLOAD: "var(--danger)",
};

const TYPE_LABEL: Record<string, string> = {
  CALL: "Call", TEXT: "Text", EMAIL: "Email",
  ZALO: "Zalo", MEETING: "Meeting", NOTE: "Note", DOCUMENT_UPLOAD: "Document",
};

function daysInStage(enteredAt: string) {
  return Math.floor((Date.now() - new Date(enteredAt).getTime()) / 86_400_000);
}

function extractNextSteps(content: string): string[] {
  const lines = content.split("\n");
  const idx   = lines.findIndex((l) => l.toLowerCase().includes("next step"));
  if (idx === -1) return [];
  return lines
    .slice(idx + 1)
    .filter((l) => l.trim().startsWith("-"))
    .map((l) => l.trim().slice(1).trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function StudentQuickView({
  card,
  onClose,
}: {
  card: QuickViewCard;
  onClose: () => void;
}) {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [meetings,   setMeetings]   = useState<Meeting[]>([]);
  const [loading,    setLoading]    = useState(true);

  const days      = daysInStage(card.enteredAt);
  const isOverdue = (card.stage === "S1" && days > 2) || (card.stage === "S8" && days > 1);

  useEffect(() => {
    const sid = card.student.id;
    setLoading(true);
    Promise.all([
      fetch(`/api/activities?studentId=${sid}`).then((r) => r.json()),
      fetch(`/api/meetings?studentId=${sid}`).then((r) => r.json()),
    ]).then(([acts, meets]) => {
      setActivities(acts);
      setMeetings(meets);
      setLoading(false);
    });
  }, [card.student.id]);

  const latestMeeting = meetings[0] ?? null;
  const nextSteps     = latestMeeting ? extractNextSteps(latestMeeting.content) : [];

  return (
    <>
      <div className="slide-over-backdrop" onClick={onClose} />
      <div className="slide-over">
        {/* Header */}
        <div className="slide-over-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: "-0.025em" }}>
                {card.student.fullName}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7, flexWrap: "wrap" }}>
                <span className="badge badge-blue">{card.stage}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: isOverdue ? "var(--danger)" : "var(--ink-3)" }}>
                  {days === 0 ? "Entered today" : `${days} day${days !== 1 ? "s" : ""} in stage`}
                </span>
                {isOverdue && <span className="badge badge-danger">Overdue</span>}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 26, height: 26, border: "1px solid var(--line)",
                background: "var(--bg)", borderRadius: "50%", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", marginTop: 12, fontSize: 13, color: "var(--ink-2)" }}>
            <div>
              <span style={{ color: "var(--ink-3)", fontSize: 10.5, fontWeight: 660, textTransform: "uppercase", letterSpacing: "0.06em" }}>Parent</span>
              <div style={{ marginTop: 2, fontWeight: 500, color: "var(--ink)" }}>
                {card.student.parents[0]?.fullName ?? "—"}
              </div>
            </div>
            <div>
              <span style={{ color: "var(--ink-3)", fontSize: 10.5, fontWeight: 660, textTransform: "uppercase", letterSpacing: "0.06em" }}>Owner</span>
              <div style={{ marginTop: 2, fontWeight: 500, color: "var(--ink)" }}>{card.assignedTo.name}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="slide-over-body">
          {loading ? (
            <div style={{ color: "var(--ink-3)", fontSize: 13.5, padding: "24px 0", textAlign: "center" }}>Loading…</div>
          ) : (
            <>
              {/* Next Steps */}
              {nextSteps.length > 0 && (
                <section style={{ marginBottom: 22 }}>
                  <div className="kpi-label" style={{ marginBottom: 10 }}>Next Steps</div>
                  <div style={{ display: "grid", gap: 7 }}>
                    {nextSteps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{
                          width: 18, height: 18, borderRadius: "50%",
                          background: "var(--brand-soft)", color: "var(--brand)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2,
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Latest meeting note */}
              {latestMeeting && (
                <section style={{ marginBottom: 22 }}>
                  <div className="kpi-label" style={{ marginBottom: 10 }}>Latest Note</div>
                  <div style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: "-0.01em" }}>
                        {latestMeeting.title}
                      </span>
                      <span style={{ fontSize: 11.5, color: "var(--ink-3)", flexShrink: 0, marginLeft: 10 }}>
                        {new Date(latestMeeting.meetingDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{
                      margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55,
                      display: "-webkit-box", WebkitLineClamp: 5,
                      WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "pre-line",
                    }}>
                      {latestMeeting.content}
                    </p>
                  </div>
                </section>
              )}

              {/* Recent activity */}
              <section>
                <div className="kpi-label" style={{ marginBottom: 10 }}>Recent Activity</div>
                {activities.length === 0 ? (
                  <div style={{ color: "var(--ink-3)", fontSize: 13.5, padding: "12px 0" }}>
                    No activity recorded yet
                  </div>
                ) : (
                  <div>
                    {activities.slice(0, 6).map((act, i) => (
                      <div
                        key={act.id}
                        style={{
                          display: "flex", gap: 10, padding: "10px 0",
                          borderBottom: i < Math.min(activities.length, 6) - 1 ? "1px solid var(--line)" : "none",
                        }}
                      >
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: TYPE_COLOR[act.type] ?? "var(--brand)",
                          marginTop: 5, flexShrink: 0,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{
                              fontSize: 11, fontWeight: 660, textTransform: "uppercase",
                              letterSpacing: "0.06em", color: TYPE_COLOR[act.type] ?? "var(--ink-2)",
                            }}>
                              {TYPE_LABEL[act.type] ?? act.type}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                              {act.staff.name} · {new Date(act.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {act.content && (
                            <div style={{
                              fontSize: 12.5, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.45,
                              display: "-webkit-box", WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}>
                              {act.content}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {activities.length === 0 && !latestMeeting && nextSteps.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--ink-3)", fontSize: 13.5 }}>
                  No notes or activity for this student yet.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="slide-over-footer">
          <Link href={`/students/${card.student.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
            View Full Profile
          </Link>
          <button onClick={onClose} className="btn">Dismiss</button>
        </div>
      </div>
    </>
  );
}
