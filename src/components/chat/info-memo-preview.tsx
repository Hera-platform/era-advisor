"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { InfoMemoContent } from "@/lib/supabase/types";

const SECTIONS: Array<{ key: keyof InfoMemoContent; label: string; number: string }> = [
  { key: "executive_summary", label: "Executive Summary", number: "1" },
  { key: "company_overview", label: "Company Overview", number: "2" },
  { key: "products_services", label: "Products & Services", number: "3" },
  { key: "market_analysis", label: "Market Analysis", number: "4" },
  { key: "financial_overview", label: "Financial Overview", number: "5" },
  { key: "growth_opportunities", label: "Growth Opportunities", number: "6" },
  { key: "transaction_overview", label: "Transaction Overview", number: "7" },
];

interface InfoMemoPreviewProps {
  content: InfoMemoContent;
  materialId: string;
  status: string;
  isAuthenticated: boolean;
  onDownload: () => void;
}

export function InfoMemoPreview({
  content,
  status,
  isAuthenticated,
  onDownload,
}: InfoMemoPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sectionCount = SECTIONS.filter((s) => content[s.key]).length;

  return (
    <div className="bg-navy-light border border-gold/25 rounded-xl overflow-hidden mt-2 w-full">
      {/* Header */}
      <div className="px-4 py-2.5 bg-gold/10 border-b border-gold/15 flex items-center gap-2.5">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gold flex-shrink-0"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="text-sm font-medium text-gold">
          Information Memorandum
        </span>
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-medium",
            status === "draft"
              ? "bg-amber-500/15 text-amber-300"
              : "bg-green-500/15 text-green-300"
          )}
        >
          {status}
        </span>
        <span className="text-[10px] text-gray-text/50 ml-auto">
          {sectionCount} sections
        </span>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-2 text-gray-text hover:text-foreground transition-colors flex items-center gap-1 text-xs"
        >
          {expanded ? "Collapse" : "Preview"}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={cn("transition-transform", expanded ? "rotate-180" : "")}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Collapsed: table of contents */}
      {!expanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 gap-1.5">
            {SECTIONS.map((s) => (
              <div
                key={s.key}
                className="flex items-center gap-2.5 text-sm py-1"
              >
                <span className="w-5 h-5 rounded bg-gold/15 flex items-center justify-center text-[10px] font-semibold text-gold flex-shrink-0">
                  {s.number}
                </span>
                <span className="text-foreground/80">{s.label}</span>
                {content[s.key] && (
                  <span className="ml-auto text-[10px] text-green-400">
                    ready
                  </span>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="mt-3 text-xs text-gold/70 hover:text-gold transition-colors underline underline-offset-2"
          >
            View full document
          </button>
        </div>
      )}

      {/* Expanded: full document with expandable sections */}
      {expanded && (
        <div>
          {SECTIONS.map((s) => {
            const sectionContent = content[s.key];
            if (!sectionContent) return null;
            const isOpen = expandedSection === s.key;

            return (
              <div
                key={s.key}
                className="border-b border-white/[0.06] last:border-b-0"
              >
                <button
                  onClick={() =>
                    setExpandedSection(isOpen ? null : s.key)
                  }
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="w-6 h-6 rounded bg-gold/15 flex items-center justify-center text-[11px] font-semibold text-gold flex-shrink-0">
                    {s.number}
                  </span>
                  <span className="text-sm font-medium text-foreground text-left">
                    {s.label}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={cn(
                      "ml-auto text-gray-text transition-transform",
                      isOpen ? "rotate-180" : ""
                    )}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pl-14">
                    {sectionContent.split("\n\n").map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-sm text-foreground/85 leading-relaxed mb-3 last:mb-0"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div className="px-5 py-3 bg-navy-lighter/40 flex items-center justify-between gap-4 border-t border-white/[0.06]">
            <p className="text-[10px] text-gray-text/50 leading-relaxed max-w-[60%]">
              This document is strictly private and confidential. Prepared by
              ERA for the exclusive use of the recipient under NDA.
            </p>
            <button
              onClick={onDownload}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors flex-shrink-0",
                isAuthenticated
                  ? "bg-gold text-navy hover:bg-gold-light"
                  : "bg-navy border border-gold/30 text-gold/70 hover:border-gold/60 hover:text-gold"
              )}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {isAuthenticated ? "Download PDF" : "Sign in to download"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
