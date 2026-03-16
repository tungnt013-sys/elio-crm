"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@/lib/roles";
import { ALL_ROLES, ROLE_LABELS } from "@/lib/roles";

type AllowedUser = { id: string; email: string; role: UserRole; name: string };

export default function UsersPage() {
  const [users, setUsers] = useState<AllowedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("COUNSELOR");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("COUNSELOR");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addUser() {
    if (!email.trim()) return;
    setAdding(true);
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), role, name: name.trim() || email.trim() }),
    });
    setEmail(""); setName(""); setRole("COUNSELOR");
    await load();
    setAdding(false);
  }

  async function removeUser(userEmail: string) {
    await fetch(`/api/admin/users/${encodeURIComponent(userEmail)}`, { method: "DELETE" });
    load();
  }

  async function saveEdit(userEmail: string) {
    await fetch(`/api/admin/users/${encodeURIComponent(userEmail)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: editRole }),
    });
    setEditId(null);
    load();
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 760 }}>
      <h2 className="section-title" style={{ marginBottom: 20 }}>Authorised Users</h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 24 }}>
        Only users listed here can sign in. Admins can manage this list.
      </p>

      {/* Add user form */}
      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Add User</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            className="form-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUser()}
            style={{ flex: "2 1 200px" }}
          />
          <input
            className="form-input"
            placeholder="Display name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: "2 1 160px" }}
          />
          <select
            className="form-input"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            style={{ flex: "1 1 140px" }}
          >
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={addUser} disabled={adding || !email.trim()}>
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {/* Users table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--ink-3)" }}>Loading…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--ink-3)" }}>No users yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name / Email</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{u.email}</div>
                  </td>
                  <td>
                    {editId === u.id ? (
                      <select
                        className="form-input"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        style={{ fontSize: 12 }}
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontSize: 12 }}>{ROLE_LABELS[u.role] ?? u.role}</span>
                    )}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {editId === u.id ? (
                      <>
                        <button className="btn btn-sm btn-primary" onClick={() => saveEdit(u.email)} style={{ marginRight: 4 }}>Save</button>
                        <button className="btn btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm"
                          onClick={() => { setEditId(u.id); setEditRole(u.role); }}
                          style={{ marginRight: 4 }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => removeUser(u.email)}
                          style={{ color: "var(--danger)" }}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
