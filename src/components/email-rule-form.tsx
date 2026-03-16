"use client";

import { useState } from "react";

export function EmailRuleForm({ initial }: { initial?: Record<string, unknown> }) {
  const [name, setName] = useState(String(initial?.name ?? ""));
  const [triggerStage, setTriggerStage] = useState(String(initial?.triggerStage ?? "S6"));
  const [delayHours, setDelayHours] = useState(Number(initial?.delayHours ?? 24));
  const [condition, setCondition] = useState(String(initial?.condition ?? "STILL_IN_STAGE"));
  const [recipientRole, setRecipientRole] = useState(String(initial?.recipientRole ?? "ASSIGNED_COUNSELOR"));
  const [ccEmails, setCcEmails] = useState(Array.isArray(initial?.ccEmails) ? (initial.ccEmails as string[]).join(",") : "");
  const [emailSubject, setEmailSubject] = useState(String(initial?.emailSubject ?? ""));
  const [emailBody, setEmailBody] = useState(String(initial?.emailBody ?? ""));

  async function submit() {
    const payload = {
      name,
      triggerStage,
      delayHours,
      condition,
      recipientRole,
      ccEmails: ccEmails.split(",").map((value) => value.trim()).filter(Boolean),
      emailSubject,
      emailBody,
      isActive: true
    };

    if (initial?.id) {
      await fetch(`/api/automations/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return;
    }

    await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rule name" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <input value={triggerStage} onChange={(e) => setTriggerStage(e.target.value)} placeholder="Trigger stage" />
        <input type="number" value={delayHours} onChange={(e) => setDelayHours(Number(e.target.value))} placeholder="Delay hours" />
        <input value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="Condition" />
      </div>
      <input value={recipientRole} onChange={(e) => setRecipientRole(e.target.value)} placeholder="Recipient role" />
      <input value={ccEmails} onChange={(e) => setCcEmails(e.target.value)} placeholder="CC emails (comma separated)" />
      <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject" />
      <textarea rows={6} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Email body" />
      <button onClick={() => void submit()} style={{ justifySelf: "start", background: "var(--accent)", color: "white", border: 0, borderRadius: 8, padding: "0.45rem 0.75rem" }}>
        Save rule
      </button>
    </div>
  );
}
