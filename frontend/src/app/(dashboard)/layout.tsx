"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

/* ─── Types ──────────────────────────────────────────────────────── */
interface NavItem {
  href: string;
  label: string;
  icon: string;
  id: string;
}

/* ─── Navigation structure ───────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",          label: "Overview",    icon: "📊", id: "nav-overview" },
  { href: "/dashboard/analysis", label: "Fee Analysis", icon: "🔍", id: "nav-analysis" },
  { href: "/dashboard/accounts", label: "Accounts",    icon: "🏦", id: "nav-accounts" },
  { href: "/dashboard/settings", label: "Settings",    icon: "⚙️",  id: "nav-settings" },
];

/* ─── Sidebar ────────────────────────────────────────────────────── */
function Sidebar({
  orgName,
  plan,
  isOpen,
  onClose,
}: {
  orgName: string;
  plan: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: 240, background: "var(--surface-1)", borderRight: "1px solid var(--border-subtle)" }}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 h-16 px-5 border-b" style={{ borderColor: "var(--border-subtle)", fontFamily: "'Outfit', sans-serif" }}>
          <span className="text-xl">🔍</span>
          <span className="text-lg font-bold gradient-text">Fee X-ray</span>
        </div>

        {/* Org info badge */}
        <div className="mx-4 mt-4 mb-2 px-3 py-3 rounded-xl glass-light">
          <div className="text-xs text-slate-500 mb-0.5 font-medium">Organization</div>
          <div className="text-sm font-semibold text-slate-200 truncate">{orgName || "My Company"}</div>
          <div className="mt-1.5">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                plan === "PRO"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-slate-700/50 text-slate-400 border border-slate-600/30"
              }`}
            >
              {plan || "FREE"}
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Dashboard navigation">
          <ul className="space-y-0.5" role="list">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    id={item.id}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="text-lg leading-none">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom: sign out */}
        <div className="p-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          <Link
            href="/api/auth/logout"
            id="nav-signout"
            className="sidebar-link w-full"
          >
            <span className="text-lg">🚪</span>
            <span>Sign out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

/* ─── Header ─────────────────────────────────────────────────────── */
function Header({
  orgName,
  plan,
  userEmail,
  onMenuClick,
}: {
  orgName: string;
  plan: string;
  userEmail: string;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const pageTitle = NAV_ITEMS.find(
    (n) => n.href === pathname || (pathname.startsWith(n.href) && n.href !== "/dashboard")
  )?.label ?? "Overview";

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b"
      style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}
    >
      {/* Mobile hamburger */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          id="mobile-menu-btn"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-slate-200" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {pageTitle}
        </h1>
      </div>

      {/* Right: plan + user */}
      <div className="flex items-center gap-3">
        {plan !== "PRO" && (
          <Link
            href="/dashboard/billing"
            id="header-upgrade-btn"
            className="hidden sm:block text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #9333ea)",
              color: "white",
            }}
          >
            Upgrade to Pro
          </Link>
        )}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
          style={{ background: "var(--surface-3)", border: "1px solid var(--border-subtle)" }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
            aria-hidden="true"
          >
            {userEmail?.[0]?.toUpperCase() ?? "U"}
          </div>
          <span className="text-slate-400 text-xs truncate max-w-32">{userEmail || "user@example.com"}</span>
        </div>
      </div>
    </header>
  );
}

/* ─── Protected shell ────────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgName, setOrgName] = useState("My Company");
  const [plan, setPlan] = useState("FREE");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Fetch user session from Next.js API route
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.email) setUserEmail(data.email);
        if (data?.orgName) setOrgName(data.orgName);
        if (data?.plan) setPlan(data.plan.toUpperCase());
      })
      .catch(() => {/* non-fatal — show defaults */});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface-0)" }}>
      <Sidebar
        orgName={orgName}
        plan={plan}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          orgName={orgName}
          plan={plan}
          userEmail={userEmail}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6" id="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
