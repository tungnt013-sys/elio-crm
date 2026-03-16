"use client";

import { Providers } from "@/components/providers";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100vh", gap: 16,
            fontFamily: "sans-serif",
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong</h2>
            <button
              onClick={reset}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: "#d4a04a", color: "#fff", cursor: "pointer", fontSize: 14,
              }}
            >
              Try again
            </button>
          </div>
        </Providers>
      </body>
    </html>
  );
}
