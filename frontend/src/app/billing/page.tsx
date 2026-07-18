"use client";

import React, { useEffect, useState } from "react";

interface UserProfile {
  authenticated: boolean;
  email: string;
  name: string;
  roles: string[];
}

interface Organization {
  id: string;
  name: string;
  subscriptionTier: string;
  subscriptionStatus: string;
}

export default function BillingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const profileData = await meRes.json();
          setProfile(profileData);

          const orgsRes = await fetch("http://localhost:8081/api/v1/orgs");
          if (orgsRes.ok) {
            const orgs = await orgsRes.json();
            if (orgs && orgs.length > 0) {
              setOrg(orgs[0]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUpgrade = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManage = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/v1/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  const isPro = org?.subscriptionTier?.toUpperCase() === "PRO" && org?.subscriptionStatus === "active";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

      <div className="max-w-xl w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Billing & Subscription
        </h1>
        <p className="text-slate-400 mb-8">
          Manage your organization plan tier and billing preferences.
        </p>

        <div className="space-y-6 mb-8">
          <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <div>
              <span className="block text-sm text-slate-500 font-medium">Organization</span>
              <span className="text-lg font-semibold">{org?.name || "Loading..."}</span>
            </div>
            <div className="text-right">
              <span className="block text-sm text-slate-500 font-medium">Current Plan</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                isPro ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-slate-800 text-slate-300 border border-slate-700"
              }`}>
                {isPro ? "PRO" : "FREE"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <span className="block text-sm text-slate-500 font-medium mb-3">Feature Entitlements</span>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Bank Connections Limit</span>
                <span className="text-sm font-semibold">{isPro ? "Unlimited" : "1 Active Connection"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Auto Fee Analysis</span>
                <span className="text-sm font-semibold">{isPro ? "Hourly Scheduled" : "Manual Runs Only"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {isPro ? (
            <button
              onClick={handleManage}
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl font-semibold bg-slate-800 hover:bg-slate-750 active:bg-slate-800 border border-slate-700 transition duration-200 text-white flex items-center justify-center gap-2"
            >
              {actionLoading ? "Processing..." : "Manage Subscription"}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 active:scale-[0.99] transition duration-200 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {actionLoading ? "Processing..." : "Upgrade to Pro ($29/mo)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
