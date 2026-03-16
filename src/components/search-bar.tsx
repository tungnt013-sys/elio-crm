"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchStudentResult } from "@/types";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchStudentResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const handle = setTimeout(async () => {
      const res = await fetch(`/api/students/search?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) return;
      const data = (await res.json()) as SearchStudentResult[];
      setResults(data);
      setOpen(true);
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div style={{ position: "relative", width: "min(480px, 100%)" }}>
      <div className="search-wrap">
        <span className="search-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.4" />
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          placeholder="Search students, parents, phone…"
          className="field field-search"
          style={{ width: "100%" }}
        />
      </div>

      {open && results.length > 0 && (
        <div
          className="panel fade-in"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            width: "100%",
            zIndex: 30,
            maxHeight: 320,
            overflow: "auto",
            padding: 6,
          }}
        >
          {results.map((item) => (
            <Link
              key={item.id}
              href={`/students/${item.id}`}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "9px 10px",
                borderRadius: 8,
                transition: "background 100ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "")}
            >
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>
                {item.fullName}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>
                {item.parentName ?? "No parent"} · {item.email ?? "No email"} · {item.parentPhone ?? "No phone"}
              </div>
              <div style={{ marginTop: 6 }}>
                <span className="badge">{item.currentStage ?? "No stage"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
