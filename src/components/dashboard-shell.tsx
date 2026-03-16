"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import { SearchBar } from "@/components/search-bar";
import type { UserRole } from "@/lib/roles";

// UI role: what view is active in the shell
export type Role = "sales" | "sales_view" | "counselor" | "admin";

const RoleContext = createContext<{ role: Role; setRole: (r: Role) => void }>({
  role: "admin",
  setRole: () => {},
});

export function useRole() {
  return useContext(RoleContext);
}

const ROLE_LABELS: Record<Role, string> = {
  sales: "Sales",
  sales_view: "Sales",
  counselor: "Counselor",
  admin: "Admin",
};

function sessionRoleToUiRole(r: UserRole | undefined): Role {
  if (r === "ADMIN") return "admin";
  if (r === "COUNSELOR") return "counselor";
  if (r === "SALES_VIEW") return "sales_view";
  return "sales";
}

const NAV: { href: string; label: string; roles: Role[]; icon: React.ReactNode; section?: string }[] = [
  {
    section: "Overview",
    href: "/sales",
    label: "Pipeline",
    roles: ["sales", "sales_view", "admin"],
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="6" width="2.5" height="7" rx="1" fill="currentColor" />
        <rect x="5.5" y="3" width="2.5" height="10" rx="1" fill="currentColor" />
        <rect x="10" y="1" width="2.5" height="12" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/counselor",
    label: "Students",
    roles: ["counselor", "admin"],
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="4.5" r="2.5" fill="currentColor" />
        <path d="M2 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "Reports",
    roles: ["admin", "sales", "sales_view"],
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 12h12M3 9v3M6 6.5v5.5M9 4v8M12 1.5v10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    section: "Manage",
    href: "/admin/contracts",
    label: "Contracts",
    roles: ["admin"],
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2.5" y="1" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 5h4M5 7.5h4M5 10h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/automations",
    label: "Automations",
    roles: ["admin"],
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M8 1L3 7.5h3.5L5 14l7-7.5H8.5L8 1z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/admin/pricing",
    label: "Pricing",
    roles: ["admin"],
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7.5 1.5h4a1 1 0 011 1V6.5L6 13 1 8l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="10.5" cy="4" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    roles: ["admin"],
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="5" cy="4" r="2" fill="currentColor" />
        <path d="M1 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="11" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.1" />
        <path d="M11 8v-.5M13 10c0-1.1-.9-2-2-2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [role, setRoleState] = useState<Role>("admin");

  const sessionRole = session?.user?.role;
  const isAdmin = sessionRole === "ADMIN";

  // Initialize role from session
  useEffect(() => {
    if (status === "authenticated" && sessionRole) {
      const defaultRole = sessionRoleToUiRole(sessionRole);
      setRoleState(defaultRole);
      if (typeof window !== "undefined") {
        localStorage.setItem("elio:sidebar-hidden", "0");
      }
    }
  }, [status, sessionRole]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSidebarHidden(localStorage.getItem("elio:sidebar-hidden") === "1");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("elio:sidebar-hidden", sidebarHidden ? "1" : "0");
    }
  }, [sidebarHidden]);

  const ROLE_DEFAULT_PAGE: Record<Role, string> = {
    sales: "/sales",
    sales_view: "/sales",
    counselor: "/counselor",
    admin: "/sales",
  };

  const setRole = (r: Role) => {
    setRoleState(r);
    router.push(ROLE_DEFAULT_PAGE[r]);
  };

  const visibleNav = NAV.filter((item) => item.roles.includes(role));
  const userName = session?.user?.name ?? session?.user?.email ?? "User";
  const initials = userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  let lastSection = "";

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <div className={`dashboard${sidebarHidden ? " sidebar-hidden" : ""}`}>
        <aside className="sidebar" aria-hidden={sidebarHidden}>
          <div className="brand-area">
            <div className="brand-mark">E</div>
            <span className="brand-text">Elio CRM</span>
          </div>

          <nav className="nav">
            {visibleNav.map((item) => {
              const showSection = item.section && item.section !== lastSection;
              if (item.section) lastSection = item.section;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <div key={item.href}>
                  {showSection && <div className="nav-section-label">{item.section}</div>}
                  <Link href={item.href} className={`nav-link${isActive ? " active" : ""}`}>
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user" onClick={() => signOut({ callbackUrl: "/login" })} style={{ cursor: "pointer" }}>
              <div className="user-avatar">{initials}</div>
              <div>
                <div className="user-name">{userName}</div>
                <div className="user-role-label">Sign out</div>
              </div>
            </div>
          </div>
        </aside>

        <div className="main-wrapper">
          <header className="topbar">
            <div className="topbar-left">
              <button
                type="button"
                className="btn btn-sm btn-ghost sidebar-toggle"
                onClick={() => setSidebarHidden((prev) => !prev)}
                aria-label={sidebarHidden ? "Show sidebar" : "Hide sidebar"}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 3h10M2 7h10M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
              <SearchBar />
            </div>
            {isAdmin && (
              <div style={{ display: "flex", gap: 2 }}>
                {(["sales", "counselor", "admin"] as Role[]).map((r) => (
                  <button
                    key={r}
                    className={`role-tab${r === role ? " active" : ""}`}
                    onClick={() => setRole(r)}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            )}
          </header>

          <main className="main fade-in">{children}</main>
        </div>
      </div>
    </RoleContext.Provider>
  );
}
