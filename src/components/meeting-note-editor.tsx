"use client";

import { useEffect, useRef, useState } from "react";

type Meeting = {
  id: string;
  title: string;
  content: string;
  meetingDate: string;
};

export function MeetingNoteEditor({ studentId, canEdit }: { studentId: string; canEdit: boolean }) {
  const [rows, setRows] = useState<Meeting[]>([]);
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"saved" | "unsaved" | "saving">("saved");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    fetch(`/api/meetings?studentId=${studentId}`)
      .then((r) => r.json())
      .then((data) => setRows(data));
  }, [studentId]);

  async function createMeeting() {
    if (!title || !content) return;
    setStatus("saving");
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, title, content, meetingDate, pipelineStage: "S6" }),
    });

    if (!res.ok) {
      setStatus("unsaved");
      return;
    }

    setStatus("saved");
    const latest = await fetch(`/api/meetings?studentId=${studentId}`).then((r) => r.json());
    setRows(latest);
    setTitle("");
    setContent("");
  }

  function scheduleAutosave() {
    if (!canEdit) return;
    setStatus("unsaved");
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => void createMeeting(), 30000);
  }

  const statusLabel = { saved: "Saved ✓", unsaved: "Unsaved", saving: "Saving…" }[status];
  const statusColor = { saved: "var(--success)", unsaved: "var(--warning)", saving: "var(--ink-3)" }[status];

  return (
    <div className="panel">
      <h3 className="section-title" style={{ marginBottom: 16 }}>Meeting Notes</h3>

      {canEdit && (
        <div
          style={{
            display: "grid",
            gap: 10,
            marginBottom: 20,
            paddingBottom: 20,
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={scheduleAutosave}
              placeholder="Meeting title"
              className="field"
            />
            <input
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              type="date"
              className="field"
              style={{ width: "auto" }}
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={scheduleAutosave}
            rows={8}
            className="field"
            style={{ resize: "vertical", minHeight: 180 }}
            placeholder="Meeting notes…"
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12.5, color: statusColor, fontWeight: 500 }}>
              {statusLabel}
            </span>
            <button onClick={() => void createMeeting()} className="btn btn-primary btn-sm">
              Save Note
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((row) => (
          <article
            key={row.id}
            style={{
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              padding: "14px 16px",
              background: "var(--bg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 620, fontSize: 14, letterSpacing: "-0.01em" }}>
                {row.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-3)",
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                {new Date(row.meetingDate).toLocaleDateString()}
              </div>
            </div>
            <p
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 13.5,
                color: "var(--ink-2)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {row.content}
            </p>
          </article>
        ))}
        {rows.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "28px 0",
              color: "var(--ink-3)",
              fontSize: 14,
            }}
          >
            No meeting notes yet
          </div>
        )}
      </div>
    </div>
  );
}
