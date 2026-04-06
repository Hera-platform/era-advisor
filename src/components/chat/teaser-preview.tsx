"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TeaserContent } from "@/lib/supabase/types";

interface TeaserPreviewProps {
  content: TeaserContent;
  materialId: string;
  status: string;
  isAuthenticated: boolean;
  onDownload: () => void;
}

export function TeaserPreview({
  content,
  status,
  isAuthenticated,
  onDownload,
}: TeaserPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  const revenueChip = extractEurFigure(content.financial_summary);
  const marginChip = extractMargin(content.financial_summary);

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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span className="text-sm font-medium text-gold">Teaser</span>
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
          STRICTLY CONFIDENTIAL
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

      {/* Collapsed */}
      {!expanded && (
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-foreground leading-snug mb-3">
            {content.headline}
          </p>
          <div className="flex flex-wrap gap-2">
            {revenueChip && <Chip label="Revenue" value={revenueChip} />}
            {marginChip && <Chip label="EBITDA Margin" value={marginChip} highlight />}
            <Chip
              label="Highlights"
              value={String(content.highlights.length)}
            />
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="mt-3 text-xs text-gold/70 hover:text-gold transition-colors underline underline-offset-2"
          >
            View full teaser document
          </button>
        </div>
      )}

      {/* Expanded */}
      {expanded && (
        <div className="divide-y divide-white/[0.06]">
          <Section label="Transaction">
            <h2 className="text-base font-semibold text-foreground leading-snug mt-1">
              {content.headline}
            </h2>
          </Section>

          <Section label="Business Description">
            <p className="text-sm text-foreground/90 leading-relaxed mt-1.5">
              {content.description}
            </p>
          </Section>

          <Section label="Key Highlights">
            <ul className="mt-2 space-y-2">
              {content.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                  <span className="text-sm text-foreground/90 leading-relaxed">
                    {h}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section label="Financial Summary">
            <p className="text-sm text-foreground/90 leading-relaxed mt-1.5">
              {content.financial_summary}
            </p>
          </Section>

          <Section label="Investment Opportunity">
            <p className="text-sm text-foreground/90 leading-relaxed mt-1.5">
              {content.opportunity}
            </p>
          </Section>

          <Section label="Process">
            <p className="text-sm text-foreground/90 leading-relaxed mt-1.5">
              {content.process}
            </p>
          </Section>

          {/* Footer */}
          <div className="px-5 py-3 bg-navy-lighter/40 flex items-center justify-between gap-4">
            <p className="text-[10px] text-gray-text/50 leading-relaxed max-w-[60%]">
              This document is strictly private and confidential. It is intended
              solely for the named recipient and may not be reproduced or
              distributed.
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

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-gold/70">
        {label}
      </div>
      {children}
    </div>
  );
}

function Chip({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-navy-lighter rounded-lg px-3 py-2 text-center min-w-[85px]">
      <div className="text-xs text-gray-text mb-0.5">{label}</div>
      <div
        className={cn(
          "text-sm font-semibold",
          highlight ? "text-gold" : "text-white"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function extractEurFigure(text: string): string | null {
  const match = text.match(/€[\d.]+([-–—][\d.]+)?M/);
  return match ? match[0] : null;
}

function extractMargin(text: string): string | null {
  const match = text.match(
    /(\d+[-–—]\d+%|\d+\.?\d*%)\s*(EBITDA|margin)/i
  );
  return match ? match[1] : null;
}
