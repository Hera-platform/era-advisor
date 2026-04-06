"use client";

import { cn } from "@/lib/utils";
import type {
  EnrichmentResult,
  SourceId,
  Sourced,
  FinancialYear,
} from "@/lib/enrichment/types";
import { SOURCE_LABELS, SOURCE_COLORS } from "@/lib/enrichment/types";
import { TeaserPreview } from "./teaser-preview";
import { InfoMemoPreview } from "./info-memo-preview";
import type { TeaserContent, InfoMemoContent } from "@/lib/supabase/types";

interface ToolResultCardProps {
  toolName: string;
  result: Record<string, unknown>;
  isAuthenticated: boolean;
  onDownload: () => void;
}

export function ToolResultCard({
  toolName,
  result,
  isAuthenticated,
  onDownload,
}: ToolResultCardProps) {
  if (toolName === "run_enrichment") {
    return <EnrichmentCard data={result as unknown as EnrichmentResult} />;
  }
  if (toolName === "create_deal") {
    return <DealCreatedCard data={result} />;
  }
  if (toolName === "generate_teaser") {
    if (result.status === "error") {
      return (
        <GenerationErrorCard
          type="Teaser"
          error={String(result.error ?? "Unknown error")}
        />
      );
    }
    const content: TeaserContent = {
      headline: String(result.headline ?? ""),
      description: String(result.description ?? ""),
      highlights: Array.isArray(result.highlights)
        ? result.highlights.map(String)
        : [],
      financial_summary: String(result.financial_summary ?? ""),
      opportunity: String(result.opportunity ?? ""),
      process: String(result.process ?? ""),
    };
    return (
      <TeaserPreview
        content={content}
        materialId={String(result.material_id ?? "")}
        status={String(result.status ?? "draft")}
        isAuthenticated={isAuthenticated}
        onDownload={onDownload}
      />
    );
  }
  if (toolName === "generate_info_memo") {
    if (result.status === "error") {
      return (
        <GenerationErrorCard
          type="Info Memo"
          error={String(result.error ?? "Unknown error")}
        />
      );
    }
    const content: InfoMemoContent = {
      executive_summary: String(result.executive_summary ?? ""),
      company_overview: String(result.company_overview ?? ""),
      products_services: String(result.products_services ?? ""),
      market_analysis: String(result.market_analysis ?? ""),
      financial_overview: String(result.financial_overview ?? ""),
      growth_opportunities: String(result.growth_opportunities ?? ""),
      transaction_overview: String(result.transaction_overview ?? ""),
    };
    return (
      <InfoMemoPreview
        content={content}
        materialId={String(result.material_id ?? "")}
        status={String(result.status ?? "draft")}
        isAuthenticated={isAuthenticated}
        onDownload={onDownload}
      />
    );
  }
  return null;
}

// ── Source Badge ────────────────────────────────────────
function SourceBadge({ source }: { source: SourceId }) {
  return (
    <span
      className={cn(
        "text-[10px] px-1.5 py-0.5 rounded font-medium leading-none",
        SOURCE_COLORS[source]
      )}
    >
      {SOURCE_LABELS[source]}
    </span>
  );
}

// ── Financial Chip ─────────────────────────────────────
function FinancialChip({
  label,
  value,
  highlight,
  source,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  source: SourceId;
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
      <div className="mt-1 flex justify-center">
        <SourceBadge source={source} />
      </div>
    </div>
  );
}

// ── Stat ───────────────────────────────────────────────
function Stat({
  label,
  value,
  source,
}: {
  label: string;
  value: string;
  source?: SourceId;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-gray-text">{label}:</span>
      <span className="text-foreground font-medium">{value}</span>
      {source && <SourceBadge source={source} />}
    </div>
  );
}

// ── Format EUR ─────────────────────────────────────────
function formatEur(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${(value / 1_000).toFixed(0)}K`;
  return `€${value}`;
}

// Helper to safely extract Sourced values from potentially untyped data
function sourced<T>(val: unknown): Sourced<T> | undefined {
  if (val && typeof val === "object" && "value" in val && "source" in val) {
    return val as Sourced<T>;
  }
  return undefined;
}

// ── Enrichment Card ────────────────────────────────────
function EnrichmentCard({ data }: { data: EnrichmentResult }) {
  const sector = sourced<string>(data.sector);
  const location = sourced<string>(data.location);
  const employees = sourced<number>(data.employees);
  const foundedYear = sourced<number>(data.founded_year);
  const legalForm = sourced<string>(data.legal_form);
  const description = sourced<string>(data.description);
  const ebitdaMargin = sourced<number>(data.ebitda_margin);
  const revenueGrowth = sourced<number>(data.revenue_growth_yoy);

  const revenue = data.revenue as FinancialYear[] | undefined;
  const ebitda = data.ebitda as FinancialYear[] | undefined;
  const shareholders = data.shareholders;
  const management = data.management;

  return (
    <div className="bg-navy-light border border-white/10 rounded-xl overflow-hidden mt-2">
      {/* Header */}
      <div className="px-4 py-2.5 bg-gold/10 border-b border-white/10 flex items-center gap-2 flex-wrap">
        <div className="w-2 h-2 rounded-full bg-gold" />
        <span className="text-sm font-medium text-gold">Company Research</span>

        {/* Confidence */}
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-medium",
            data.confidence === "high"
              ? "bg-emerald-500/15 text-emerald-300"
              : data.confidence === "medium"
                ? "bg-amber-500/15 text-amber-300"
                : "bg-red-500/15 text-red-300"
          )}
        >
          {data.confidence === "high" ? "verified" : data.confidence}
        </span>

        {/* Source pills */}
        <div className="flex gap-1">
          {data.sources?.map((s) => (
            <SourceBadge key={s} source={s} />
          ))}
        </div>

        {/* Freshness */}
        {data.enriched_at && (
          <span className="ml-auto text-[10px] text-gray-text/60">
            {new Date(data.enriched_at).toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Company basics */}
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
          {location && (
            <Stat
              label="Location"
              value={location.value}
              source={location.source}
            />
          )}
          {sector && (
            <Stat
              label="Sector"
              value={sector.value}
              source={sector.source}
            />
          )}
          {employees && (
            <Stat
              label="Employees"
              value={String(employees.value)}
              source={employees.source}
            />
          )}
          {foundedYear && (
            <Stat
              label="Founded"
              value={String(foundedYear.value)}
              source={foundedYear.source}
            />
          )}
          {legalForm && (
            <Stat
              label="Legal Form"
              value={legalForm.value}
              source={legalForm.source}
            />
          )}
        </div>

        {/* Revenue */}
        {revenue && revenue.length > 0 && (
          <div>
            <div className="text-xs text-gray-text mb-2 uppercase tracking-wide">
              Revenue
            </div>
            <div className="flex flex-wrap gap-2">
              {revenue.map((r) => (
                <FinancialChip
                  key={r.year}
                  label={String(r.year)}
                  value={formatEur(r.value)}
                  source={r.source}
                />
              ))}
              {revenueGrowth && (
                <FinancialChip
                  label="YoY Growth"
                  value={`+${revenueGrowth.value.toFixed(1)}%`}
                  source={revenueGrowth.source}
                />
              )}
            </div>
          </div>
        )}

        {/* EBITDA — independent of revenue */}
        {ebitda && ebitda.length > 0 && (
          <div>
            <div className="text-xs text-gray-text mb-2 uppercase tracking-wide">
              EBITDA
            </div>
            <div className="flex flex-wrap gap-2">
              {ebitda.map((e) => (
                <FinancialChip
                  key={e.year}
                  label={String(e.year)}
                  value={formatEur(e.value)}
                  source={e.source}
                />
              ))}
              {ebitdaMargin !== undefined && (
                <FinancialChip
                  label="Margin"
                  value={`${ebitdaMargin.value.toFixed(1)}%`}
                  highlight
                  source={ebitdaMargin.source}
                />
              )}
            </div>
          </div>
        )}

        {/* Shareholders */}
        {shareholders && shareholders.length > 0 && (
          <div className="text-sm">
            <span className="text-gray-text">Shareholders: </span>
            {shareholders.map((s, i) => (
              <span key={s.name} className="text-foreground">
                {i > 0 && ", "}
                {s.name} ({s.share}%, {s.role})
              </span>
            ))}
            <span className="ml-1.5">
              <SourceBadge source={shareholders[0].source} />
            </span>
          </div>
        )}

        {/* Management */}
        {management && management.length > 0 && (
          <div className="text-sm">
            <span className="text-gray-text">Management: </span>
            {management.map((m, i) => (
              <span key={m.name} className="text-foreground">
                {i > 0 && ", "}
                {m.name}
                <span className="text-gray-text"> ({m.role})</span>
              </span>
            ))}
            <span className="ml-1.5">
              <SourceBadge source={management[0].source} />
            </span>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="space-y-1">
            <p className="text-sm text-gray-text leading-relaxed">
              {description.value.length > 500
                ? description.value.slice(0, 500) + "..."
                : description.value}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-text/50">Source:</span>
              <SourceBadge source={description.source} />
            </div>
          </div>
        )}

        {/* Note */}
        {data._note && (
          <p className="text-xs text-gold/60 italic">{data._note}</p>
        )}
      </div>
    </div>
  );
}

// ── Deal Created Card ──────────────────────────────────
function DealCreatedCard({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="bg-navy-light border border-green-500/20 rounded-xl px-4 py-3 mt-2 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-green-400"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <div className="text-sm font-medium text-white">Deal Created</div>
        <div className="text-xs text-gray-text">
          {String(data.company_name || "")} — {String(data.status || "")}
        </div>
      </div>
    </div>
  );
}

// ── Generation Error Card ─────────────────────────────────
function GenerationErrorCard({
  type,
  error,
}: {
  type: string;
  error: string;
}) {
  return (
    <div className="bg-navy-light border border-red-500/20 rounded-xl px-4 py-3 mt-2 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-red-400"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <div className="text-sm font-medium text-white">
          {type} Generation Failed
        </div>
        <div className="text-xs text-gray-text mt-0.5">{error}</div>
      </div>
    </div>
  );
}

// ── Material Card ──────────────────────────────────────
function MaterialCard({
  type,
  data,
}: {
  type: string;
  data: Record<string, unknown>;
}) {
  const sections = data.sections as string[] | undefined;
  return (
    <div className="bg-navy-light border border-gold/20 rounded-xl overflow-hidden mt-2">
      <div className="px-4 py-2.5 bg-gold/10 border-b border-gold/15 flex items-center gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gold"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span className="text-sm font-medium text-gold">
          {type} Generated
        </span>
        <span
          className={cn(
            "ml-auto text-xs px-2 py-0.5 rounded-full",
            data.status === "draft"
              ? "bg-yellow-500/15 text-yellow-400"
              : "bg-green-500/15 text-green-400"
          )}
        >
          {String(data.status || "draft")}
        </span>
      </div>
      <div className="p-4">
        {"preview" in data && data.preview ? (
          <p className="text-sm text-foreground mb-3">
            {String(data.preview)}
          </p>
        ) : null}
        {sections && (
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <span
                key={s}
                className="text-xs bg-navy-lighter text-gray-text px-2.5 py-1 rounded-md"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
