"use client";

import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function AccountsPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  // In a real app, this would fetch from the backend: POST /api/v1/plaid/link-token
  const generateToken = () => {
    setLoading(true);
    setTimeout(() => {
      // Use a fake token for the UI demo since we might not have a running backend yet
      setLinkToken("link-sandbox-fake-token-for-ui-demo");
      setLoading(false);
    }, 1000);
  };

  const onSuccess = (public_token: string, metadata: any) => {
    // In a real app, exchange this token: POST /api/v1/plaid/exchange-token
    console.log("Plaid Link Success", public_token, metadata);
    setConnected(true);
  };

  const { open, ready } = usePlaidLink({
    token: linkToken!,
    onSuccess,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Connected Accounts
        </h2>
        <p className="text-slate-500 text-sm">
          Link your bank and payment processor accounts to enable fee analysis.
        </p>
      </div>

      <div className="glass rounded-2xl p-10 text-center relative overflow-hidden">
        {connected ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
            <div>
              <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Account Connected!
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Your bank account has been successfully linked. We are now ready to scan for hidden fees.
              </p>
            </div>
            <a href="/dashboard/analysis" className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm">
              Run fee analysis →
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-5xl mb-2 animate-float inline-block">🏦</div>
            <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Securely connect your bank
            </h3>
            <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Fee X-ray uses Plaid to securely connect to your financial institutions. We never store your login credentials.
            </p>
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-4">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {!linkToken ? (
              <button 
                onClick={generateToken} 
                disabled={loading}
                className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
              >
                {loading ? "Preparing secure connection..." : "Connect Bank Account"}
              </button>
            ) : (
              <button 
                onClick={() => open()} 
                disabled={!ready}
                className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
              >
                Launch Plaid Link
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
