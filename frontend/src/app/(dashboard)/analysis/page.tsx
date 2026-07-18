"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface AnalysisJob {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  resultsSummary: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  PENDING:   "bg-amber-500/15 text-amber-400 border-amber-500/25",
  RUNNING:   "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  FAILED:    "bg-red-500/15 text-red-400 border-red-500/25",
};

export default function AnalysisPage() {
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8081/api/v1/analysis/jobs", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRunAnalysis = async () => {
    setRunning(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8081/api/v1/analysis/run", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to start");
      const job: AnalysisJob = await res.json();
      setJobs((prev) => [job, ...prev]);
    } catch {
      setError("Could not start analysis. Ensure your bank account is connected.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Fee Analysis
          </h2>
          <p className="text-slate-500 text-sm">Run a scan to find hidden fees in your transactions.</p>
        </div>
        <button
          id="analysis-run-btn"
          onClick={handleRunAnalysis}
          disabled={running}
          className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50"
        >
          {running ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Running…
            </span>
          ) : (
            "Run analysis now →"
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" role="alert">
          {error}
          <Link href="/dashboard/accounts" className="ml-2 underline">Connect an account →</Link>
        </div>
      )}

      {/* Job history */}
      <section aria-label="Analysis job history">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Analysis history</h3>

        {loading ? (
          <div className="flex items-center gap-3 text-slate-500 text-sm p-6">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            Loading jobs…
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-slate-500 text-sm">No analysis runs yet. Hit the button above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="glass rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 card-hover">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-slate-600 mb-1">{job.id}</div>
                  <div className="text-sm text-slate-300 truncate">
                    {job.resultsSummary ?? "Analysis pending…"}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-600">
                    {new Date(job.createdAt).toLocaleString()}
                  </span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLES[job.status] ?? ""}`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
