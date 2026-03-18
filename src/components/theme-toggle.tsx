"use client";

import { useEffect, useState } from "react";

// ── Dimensions ───────────────────────────────────────────────
const W      = 56;            // pill width  (compact, Apple-like)
const H      = 28;            // pill height
const RADIUS = H / 2;         // full stadium
const PAD    = 3;             // thumb inset
const THUMB  = H - PAD * 2;   // 22 px
const ICON   = 15;            // icon render size (smaller → breathing room)
const INSET  = (THUMB - ICON) / 2;  // 3.5 px centering offset

// ── Colours ──────────────────────────────────────────────────
const LIGHT_BG = "#7BA4F7";   // soft periwinkle
const DARK_BG  = "#2F2F3D";   // neutral charcoal, whisper of blue

// 5-pointed star with curved tips (quadratic bezier through outer points)
function starPath(s: number) {
  const cx = s / 2, cy = s / 2, R = s / 2, r = s / 4.5;
  const outer: number[][] = [], inner: number[][] = [];
  for (let i = 0; i < 5; i++) {
    const oa = (i * 72 - 90) * Math.PI / 180;
    const ia = (i * 72 + 36 - 90) * Math.PI / 180;
    outer.push([cx + R * Math.cos(oa), cy + R * Math.sin(oa)]);
    inner.push([cx + r * Math.cos(ia), cy + r * Math.sin(ia)]);
  }
  let d = `M${inner[4][0].toFixed(2)} ${inner[4][1].toFixed(2)}`;
  for (let i = 0; i < 5; i++) {
    d += ` Q${outer[i][0].toFixed(2)} ${outer[i][1].toFixed(2)} ${inner[i][0].toFixed(2)} ${inner[i][1].toFixed(2)}`;
  }
  return d + " Z";
}

export function ThemeToggle() {
  const [theme,   setTheme]   = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("elio:theme");
    const resolved = saved === "light" ? "light" : "dark";
    setTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved === "dark" ? "dark" : "");
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("elio:theme", next);
    document.documentElement.setAttribute("data-theme", next === "dark" ? "dark" : "");
  };

  if (!mounted) {
    return <div aria-hidden style={{ width: W, height: H, borderRadius: RADIUS, flexShrink: 0 }} />;
  }

  const isDark    = theme === "dark";
  const thumbLeft = isDark ? W - PAD - THUMB : PAD;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position:     "relative",
        width:        W,
        height:       H,
        borderRadius: RADIUS,
        background:   isDark ? DARK_BG : LIGHT_BG,
        boxShadow:    isDark
          ? "inset 0 0 0 1px rgba(255,255,255,0.06)"
          : "0 1px 3px rgba(0,0,0,0.10)",
        border:       "none",
        cursor:       "pointer",
        padding:      0,
        overflow:     "hidden",
        flexShrink:   0,
        transition:   "background 0.4s ease, box-shadow 0.4s ease",
      }}
    >

      {/* ═══ LIGHT: 2 white dots — right side ═══════════════════ */}
      {/* Large dot — upper right */}
      <div style={{
        position:      "absolute",
        width:         6,
        height:        6,
        borderRadius:  "50%",
        background:    "white",
        top:           6,
        right:         9,
        opacity:       isDark ? 0 : 1,
        transition:    "opacity 0.3s ease",
        pointerEvents: "none",
      }} />
      {/* Small dot — lower, slightly left */}
      <div style={{
        position:      "absolute",
        width:         4,
        height:        4,
        borderRadius:  "50%",
        background:    "white",
        top:           17,
        right:         12,
        opacity:       isDark ? 0 : 1,
        transition:    "opacity 0.3s ease 0.04s",
        pointerEvents: "none",
      }} />

      {/* ═══ DARK: 3 stars + 2 dots — left side (night sky) ════ */}
      {/* Large 5-pt star — upper left */}
      <svg width={7} height={7} viewBox="0 0 7 7" style={{
        position: "absolute", top: 5, left: 9,
        opacity: isDark ? 1 : 0, transition: "opacity 0.3s ease 0.04s",
        pointerEvents: "none",
      }}>
        <path d={starPath(7)} fill="white" />
      </svg>
      {/* Small dot — upper center */}
      <div style={{
        position:      "absolute",
        width:         2,
        height:        2,
        borderRadius:  "50%",
        background:    "white",
        top:           9,
        left:          21,
        opacity:       isDark ? 0.8 : 0,
        transition:    "opacity 0.3s ease 0.07s",
        pointerEvents: "none",
      }} />
      {/* Medium 5-pt star — center left */}
      <svg width={5} height={5} viewBox="0 0 5 5" style={{
        position: "absolute", top: 15, left: 7,
        opacity: isDark ? 0.9 : 0, transition: "opacity 0.3s ease 0.05s",
        pointerEvents: "none",
      }}>
        <path d={starPath(5)} fill="white" />
      </svg>
      {/* Tiny dot — mid-center */}
      <div style={{
        position:      "absolute",
        width:         1.5,
        height:        1.5,
        borderRadius:  "50%",
        background:    "white",
        top:           13,
        left:          24,
        opacity:       isDark ? 0.6 : 0,
        transition:    "opacity 0.3s ease 0.09s",
        pointerEvents: "none",
      }} />
      {/* Small 5-pt star — lower center */}
      <svg width={4} height={4} viewBox="0 0 4 4" style={{
        position: "absolute", top: 19, left: 16,
        opacity: isDark ? 0.85 : 0, transition: "opacity 0.3s ease 0.06s",
        pointerEvents: "none",
      }}>
        <path d={starPath(4)} fill="white" />
      </svg>

      {/* ═══ SLIDING THUMB ════════════════════════════════════════ */}
      <div style={{
        position:   "absolute",
        top:        PAD,
        left:       thumbLeft,
        width:      THUMB,
        height:     THUMB,
        transition: "left 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)",
      }}>

        {/* Light: wreath icon in white — floats centered in thumb */}
        <svg
          width={ICON}
          height={ICON}
          viewBox="0 0 43 43"
          fill="none"
          style={{
            position:   "absolute",
            top:        INSET,
            left:       INSET,
            opacity:    isDark ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          <path
            d="M40.5716 15.8138C40.5716 15.8138 36.5715 0.885179 22.3897 5.06613C8.56533 9.14173 12.0176 23.4648 12.0176 23.4648"
            stroke="white" strokeWidth="3.5" strokeLinecap="round"
          />
          <path
            d="M27.1696 40.2327C27.1696 40.2327 42.0982 36.2326 37.9173 22.0509C33.8417 8.22646 19.5186 11.6787 19.5186 11.6787"
            stroke="white" strokeWidth="3.5" strokeLinecap="round"
          />
          <path
            d="M2.63349 26.36C2.63349 26.36 6.63361 41.2886 20.8154 37.1077C34.6397 33.0321 31.1875 18.709 31.1875 18.709"
            stroke="white" strokeWidth="3.5" strokeLinecap="round"
          />
          <path
            d="M16.3919 2.35712C16.3919 2.35712 1.4633 6.35724 5.64426 20.539C9.71986 34.3634 24.043 30.9111 24.043 30.9111"
            stroke="white" strokeWidth="3.5" strokeLinecap="round"
          />
        </svg>

        {/* Dark: crescent moon — floats centered, moon-in-the-sky */}
        <svg
          width={ICON}
          height={ICON}
          viewBox="0 0 22 22"
          style={{
            position:   "absolute",
            top:        INSET,
            left:       INSET,
            opacity:    isDark ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <defs>
            <mask id="tm-crescent">
              <rect width="22" height="22" fill="white" />
              <circle cx="7" cy="5" r="8" fill="black" />
            </mask>
          </defs>
          <circle cx="11" cy="11" r="10" fill="white" mask="url(#tm-crescent)" />
        </svg>

      </div>

    </button>
  );
}
