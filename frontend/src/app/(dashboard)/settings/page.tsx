"use client";

import { useEffect, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────── */
interface SessionData {
  authenticated: boolean;
  email: string;
  name: string;
  roles: string[];
  orgName: string;
  plan: string;
}

interface TeamMember {
  id: string;
  email: string;
  role: "OWNER" | "MEMBER";
}

/* ─── Invite form ────────────────────────────────────────────────── */
function InviteSection({ isOwner }: { isOwner: boolean }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MEMBER" | "OWNER">("MEMBER");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch("http://localhost:8081/api/v1/users", { credentials: "include" })
      .then((r) => r.json())
      .then((data: TeamMember[]) => setMembers(data))
      .catch(() => {/* non-fatal */});
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("http://localhost:8081/api/v1/users/invite", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage(`Invitation sent to ${email}`);
      setStatus("success");
      setEmail("");
    } catch {
      setMessage("Failed to send invitation. Check the email address and try again.");
      setStatus("error");
    }
  };

  return (
    <section aria-label="Team management" className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Team members
        </h3>
        <p className="text-sm text-slate-500">
          {isOwner
            ? "Invite colleagues to view fee analysis results and manage your account."
            : "You are a team member. Contact your organization owner to manage invitations."}
        </p>
      </div>

      {/* Current members list */}
      {members.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800/60">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current members</span>
          </div>
          <ul className="divide-y divide-slate-800/40">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
                    aria-hidden="true"
                  >
                    {m.email[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300">{m.email}</span>
                </div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    m.role === "OWNER"
                      ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/25"
                      : "bg-slate-700/40 text-slate-400 border-slate-600/25"
                  }`}
                >
                  {m.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Invite form — OWNER only */}
      {isOwner ? (
        <form onSubmit={handleInvite} className="glass rounded-2xl p-6 space-y-4" id="invite-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-1 flex-1">
              <label htmlFor="invite-email" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Email address
              </label>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-600
                  bg-slate-900/60 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                  outline-none transition-colors duration-150"
              />
            </div>
            <div>
              <label htmlFor="invite-role" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Role
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "MEMBER" | "OWNER")}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200
                  bg-slate-900/60 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                  outline-none transition-colors duration-150 cursor-pointer"
              >
                <option value="MEMBER">Member — view only</option>
                <option value="OWNER">Owner — full access</option>
              </select>
            </div>
          </div>

          {status !== "idle" && (
            <div
              className={`p-3 rounded-xl text-sm border ${
                status === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : status === "error"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
              }`}
              role="alert"
            >
              {status === "loading" ? "Sending invitation…" : message}
            </div>
          )}

          <button
            id="invite-submit-btn"
            type="submit"
            disabled={status === "loading" || !email.trim()}
            className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Sending…" : "Send invitation"}
          </button>
        </form>
      ) : (
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">🔒</div>
          <p className="text-slate-500 text-sm">
            Only organization owners can invite team members.
          </p>
        </div>
      )}
    </section>
  );
}

/* ─── Billing section ────────────────────────────────────────────── */
function BillingSection({
  plan,
  isOwner,
}: {
  plan: string;
  isOwner: boolean;
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const isPro = plan === "PRO";

  const handlePortal = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/v1/billing/portal", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/v1/billing/checkout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section aria-label="Billing management" className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Billing & Subscription
        </h3>
        <p className="text-sm text-slate-500">
          Manage your plan and billing preferences.
        </p>
      </div>

      {/* Plan overview */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Current plan</div>
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl font-black ${isPro ? "gradient-text" : "text-slate-300"}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {isPro ? "Pro" : "Free"}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isPro
                    ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/25"
                    : "bg-slate-700/40 text-slate-400 border-slate-600/25"
                }`}
              >
                {isPro ? "Active" : "Limited"}
              </span>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-3">
              {isPro ? (
                <button
                  id="billing-portal-btn"
                  onClick={handlePortal}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300
                    hover:border-slate-500 hover:text-white transition-all duration-200 disabled:opacity-50"
                >
                  {actionLoading ? "Loading…" : "Manage subscription →"}
                </button>
              ) : (
                <button
                  id="billing-upgrade-btn"
                  onClick={handleUpgrade}
                  disabled={actionLoading}
                  className="btn-primary px-5 py-2 text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  {actionLoading ? "Loading…" : "Upgrade to Pro — $29/mo →"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Feature comparison */}
        <div className="space-y-2.5 border-t border-slate-800/60 pt-5">
          {[
            { label: "Bank connections",     free: "1 account",         pro: "Unlimited" },
            { label: "Analysis runs",        free: "Manual only",       pro: "Hourly scheduled" },
            { label: "Transaction history",  free: "30 days",           pro: "Full history" },
            { label: "Team members",         free: "Owner only",        pro: "Unlimited invites" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{row.label}</span>
              <span className={`font-semibold ${isPro ? "text-indigo-300" : "text-slate-400"}`}>
                {isPro ? row.pro : row.free}
              </span>
            </div>
          ))}
        </div>

        {!isOwner && (
          <div className="mt-5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-500">
            Only organization owners can manage billing.
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then(setSession)
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false));
  }, []);

  const isOwner = session?.roles?.includes("OWNER") ?? false;
  const plan = (session?.plan ?? "FREE").toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Settings
        </h2>
        <p className="text-slate-500 text-sm">Manage your team and subscription.</p>
      </div>

      <InviteSection isOwner={isOwner} />
      <BillingSection plan={plan} isOwner={isOwner} />
    </div>
  );
}
