"use client";

import React, { useEffect, useState } from "react";

interface Organization {
  id: string;
  name: string;
  subscriptionTier: string;
  subscriptionStatus: string;
}

export default function BillingPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8081/api/v1/orgs", { credentials: "include" })
      .then((r) => r.json())
      .then((orgs: Organization[]) => {
        if (orgs?.length > 0) setOrg(orgs[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  const handleManage = async () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const isPro =
    org?.subscriptionTier?.toUpperCase() === "PRO" && org?.subscriptionStatus === "active";

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Billing & Subscription
        </h2>
        <p className="text-slate-500 text-sm">Manage your organization plan and billing preferences.</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-6">
        {/* Org + plan */}
        <div className="flex justify-between items-center p-4 rounded-xl glass-light">
          <div>
            <span className="block text-xs text-slate-500 font-medium mb-0.5">Organization</span>
            <span className="text-base font-semibold text-slate-200">{org?.name ?? "—"}</span>
          </div>
          <div className="text-right">
            <span className="block text-xs text-slate-500 font-medium mb-0.5">Current Plan</span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                isPro
                  ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/25"
                  : "bg-slate-700/40 text-slate-400 border-slate-600/30"
              }`}
            >
              {isPro ? "PRO" : "FREE"}
            </span>
          </div>
        </div>

        {/* Entitlements */}
        <div className="p-4 rounded-xl glass-light space-y-3">
          <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
            Feature Entitlements
          </span>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Bank Connections</span>
            <span className="font-semibold text-slate-200">{isPro ? "Unlimited" : "1 Active"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Auto Fee Analysis</span>
            <span className="font-semibold text-slate-200">{isPro ? "Hourly Scheduled" : "Manual Runs Only"}</span>
          </div>
        </div>

        {/* Action */}
        {isPro ? (
          <button
            id="billing-manage-btn"
            onClick={handleManage}
            disabled={actionLoading}
            className="w-full py-3.5 rounded-xl font-semibold border border-slate-700 text-slate-300
              hover:border-slate-500 hover:text-white transition-all duration-200 text-sm disabled:opacity-50"
          >
            {actionLoading ? "Loading…" : "Manage Subscription →"}
          </button>
        ) : (
          <button
            id="billing-upgrade-btn"
            onClick={handleUpgrade}
            disabled={actionLoading}
            className="btn-primary w-full py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            {actionLoading ? "Loading…" : "Upgrade to Pro — $29/month →"}
          </button>
        )}
      </div>
    </div>
  );
}
