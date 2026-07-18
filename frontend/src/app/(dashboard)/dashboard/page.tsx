"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface AnalysisJob {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  resultsSummary: string | null;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  PENDING:   "bg-amber-500/15 text-amber-400 border-amber-500/25",
  RUNNING:   "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  FAILED:    "bg-red-500/15 text-red-400 border-red-500/25",
};

const QUICK_ACTIONS = [
  {
    icon: "🏦",
    title: "Connect a bank account",
    desc: "Link your first account via Plaid to start analysis.",
    href: "/dashboard/accounts",
    id: "quick-connect-bank",
  },
  {
    icon: "🔍",
    title: "Run fee analysis",
    desc: "Scan your transactions for hidden fees right now.",
    href: "/dashboard/analysis",
    id: "quick-run-analysis",
  },
  {
    icon: "⚙️",
    title: "Invite your team",
    desc: "Add your CFO or bookkeeper to collaborate.",
    href: "/dashboard/settings",
    id: "quick-invite-team",
  },
];

export default function DashboardPage() {
  const [latestJob, setLatestJob] = useState<AnalysisJob | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8081/api/v1/analysis/jobs/latest", { credentials: "include" })
      .then((r) => r.json())
      .then(setLatestJob)
      .catch(() => {/* no prior job */})
      .finally(() => setLoadingJob(false));
  }, []);

  const handleRunAnalysis = async () => {
    setRunning(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8081/api/v1/analysis/run", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to start analysis");
      const job: AnalysisJob = await res.json();
      setLatestJob(job);
    } catch {
      setError("Could not start analysis. Ensure your bank account is connected.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Good to see you 👋
        </h2>
        <p className="text-slate-500 text-sm">Here&apos;s a snapshot of your fee health.</p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Last scan", value: latestJob ? new Date(latestJob.createdAt).toLocaleDateString() : "—" },
          { label: "Status", value: latestJob?.status ?? "No runs yet" },
          { label: "Summary", value: latestJob?.resultsSummary ?? "Run your first analysis" },
        ].map((card) => (
          <div
            key={card.label}
            className="glass rounded-2xl px-6 py-5 card-hover"
          >
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{card.label}</div>
            <div className="text-sm font-semibold text-slate-200 leading-snug">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Latest job panel */}
      <section aria-label="Latest analysis job" className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Fee Analysis
          </h3>
          {latestJob && (
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLOR[latestJob.status] ?? ""}`}
            >
              {latestJob.status}
            </span>
          )}
        </div>

        {loadingJob ? (
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            Loading…
          </div>
        ) : latestJob ? (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">{latestJob.resultsSummary ?? "Analysis is in progress…"}</p>
            <p className="text-xs text-slate-600">Job ID: <span className="font-mono">{latestJob.id}</span></p>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No analysis runs yet. Connect a bank account and run your first scan.</p>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          id="run-analysis-btn"
          onClick={handleRunAnalysis}
          disabled={running}
          className="btn-primary mt-5 px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Starting scan…
            </span>
          ) : (
            "Run fee analysis now →"
          )}
        </button>
      </section>

      {/* Quick actions */}
      <section aria-label="Quick actions">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Quick actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              id={action.id}
              className="glass rounded-2xl p-5 card-hover group block"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200 inline-block">
                {action.icon}
              </div>
              <div className="text-sm font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {action.title}
              </div>
              <div className="text-xs text-slate-500">{action.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
