"use client";

export default function AccountsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Connected Accounts
        </h2>
        <p className="text-slate-500 text-sm">
          Link your bank and payment processor accounts to enable fee analysis.
        </p>
      </div>

      <div className="glass rounded-2xl p-10 text-center">
        <div className="text-5xl mb-5 animate-float inline-block">🏦</div>
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Bank connections
        </h3>
        <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
          Plaid-powered bank linking will appear here. This feature ships in a future phase.
        </p>
        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
          Coming soon — Phase 5 & 6
        </div>
      </div>
    </div>
  );
}
