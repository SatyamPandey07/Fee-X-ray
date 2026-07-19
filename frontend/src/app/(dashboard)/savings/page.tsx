"use client";

import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import FindingsList, { Finding } from "@/components/FindingsList";

// Mock data for the chart
const chartData = [
  { month: "Jan", savings: 0 },
  { month: "Feb", savings: 150 },
  { month: "Mar", savings: 320 },
  { month: "Apr", savings: 480 },
  { month: "May", savings: 850 },
  { month: "Jun", savings: 1200 },
];

// Mock data for the findings
const MOCK_FINDINGS: Finding[] = [
  {
    id: "f-1",
    category: "Payment Gateway",
    description: "Your processor is charging a non-qualified rate on standard domestic transactions, effectively adding 1.5% overhead.",
    dollarImpact: 4500.0,
    severity: "HIGH",
    dateDetected: new Date().toISOString(),
    isActionable: true,
  },
  {
    id: "f-2",
    category: "Bank Fees",
    description: "Detected multiple 'Account Maintenance' fees that were supposed to be waived under your current deposit tier.",
    dollarImpact: 300.0,
    severity: "MEDIUM",
    dateDetected: new Date(Date.now() - 86400000 * 2).toISOString(),
    isActionable: true,
  },
  {
    id: "f-3",
    category: "Subscription",
    description: "Found a recurring SaaS charge for a service that hasn't been actively used in over 6 months.",
    dollarImpact: 120.0,
    severity: "LOW",
    dateDetected: new Date(Date.now() - 86400000 * 5).toISOString(),
    isActionable: false,
  },
];

export default function SavingsPage() {
  const [activeTab, setActiveTab] = useState<"findings" | "history">("findings");

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-slide-up">
      {/* Header section with total money found */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Findings Dashboard
          </h2>
          <p className="text-slate-400">Discover and resolve hidden fees affecting your bottom line.</p>
        </div>
        
        <div className="glass rounded-2xl p-5 md:min-w-[280px] border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs text-emerald-400 uppercase tracking-wider font-bold mb-1">Total Money Found</div>
          <div className="text-4xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            $4,920<span className="text-xl text-emerald-500/80">.00</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">Potential annual savings</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Chart & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <section className="glass rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Savings over time
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSavings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Payment Processor</span>
                <span className="text-sm font-bold text-white">$4,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Bank Fees</span>
                <span className="text-sm font-bold text-white">$300</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Subscriptions</span>
                <span className="text-sm font-bold text-white">$120</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Findings List */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 border-b border-white/10 mb-6">
            <button
              onClick={() => setActiveTab("findings")}
              className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${
                activeTab === "findings" ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Active Findings ({MOCK_FINDINGS.length})
              {activeTab === "findings" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${
                activeTab === "history" ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Resolved
              {activeTab === "history" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
              )}
            </button>
          </div>

          {activeTab === "findings" ? (
            <FindingsList findings={MOCK_FINDINGS} />
          ) : (
            <div className="glass rounded-2xl p-10 text-center">
              <div className="text-4xl mb-4 opacity-50">🏆</div>
              <h3 className="text-base font-bold text-white mb-2">No resolved findings yet</h3>
              <p className="text-slate-500 text-sm">When you take action on a finding, it will appear here in your history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
