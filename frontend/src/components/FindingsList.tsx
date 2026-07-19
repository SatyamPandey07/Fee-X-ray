"use client";

import React from "react";
import { AlertCircle, ArrowDownCircle, CheckCircle2, DollarSign } from "lucide-react";
import clsx from "clsx";

export type FindingSeverity = "HIGH" | "MEDIUM" | "LOW";

export interface Finding {
  id: string;
  category: string;
  description: string;
  dollarImpact: number;
  severity: FindingSeverity;
  dateDetected: string;
  isActionable: boolean;
}

interface FindingsListProps {
  findings: Finding[];
}

const SEVERITY_STYLES: Record<FindingSeverity, { bg: string; text: string; icon: React.ReactNode }> = {
  HIGH: {
    bg: "bg-red-500/15 border-red-500/25",
    text: "text-red-400",
    icon: <AlertCircle className="w-4 h-4 text-red-400" />,
  },
  MEDIUM: {
    bg: "bg-amber-500/15 border-amber-500/25",
    text: "text-amber-400",
    icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
  },
  LOW: {
    bg: "bg-blue-500/15 border-blue-500/25",
    text: "text-blue-400",
    icon: <CheckCircle2 className="w-4 h-4 text-blue-400" />,
  },
};

export default function FindingsList({ findings }: FindingsListProps) {
  if (findings.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center flex flex-col items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4 opacity-80" />
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          No hidden fees found
        </h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          We scanned your transactions and didn&apos;t detect any unnecessary fees. Your accounts are looking healthy!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding) => {
        const severityStyle = SEVERITY_STYLES[finding.severity];
        return (
          <div
            key={finding.id}
            className="glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover relative overflow-hidden"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className={clsx("p-2.5 rounded-xl border flex-shrink-0 mt-1 sm:mt-0", severityStyle.bg)}>
                {severityStyle.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-bold text-slate-200">{finding.category}</h4>
                  <span className={clsx("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border", severityStyle.bg, severityStyle.text)}>
                    {finding.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-2">
                  {finding.description}
                </p>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span>Detected: {new Date(finding.dateDetected).toLocaleDateString()}</span>
                  {finding.isActionable && (
                    <span className="text-indigo-400 flex items-center gap-1">
                      <ArrowDownCircle className="w-3.5 h-3.5" /> Action Required
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 sm:w-48">
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Impact / yr</span>
              <div className="flex items-center text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <DollarSign className="w-5 h-5 text-slate-400" />
                <span>{finding.dollarImpact.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
