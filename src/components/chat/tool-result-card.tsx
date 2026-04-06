"use client";

import { cn } from "@/lib/utils";

interface ToolResultCardProps {
  toolName: string;
  result: Record<string, unknown>;
}

export function ToolResultCard({ toolName, result }: ToolResultCardProps) {
  if (toolName === "run_enrichment") {
    return <EnrichmentCard data={result} />;
  }
  if (toolName === "create_deal") {
    return <DealCreatedCard data={result} />;
  }
  if (toolName === "generate_teaser") {
    return <MaterialCard type="Teaser" data={result} />;
  }
  if (toolName === "generate_info_memo") {
    return <MaterialCard type="Information Memorandum" data={result} />;
  }
  // update_deal and unknown tools: no card needed
  return null;
}

function EnrichmentCard({ data }: { data: Record<string, unknown> }) {
  const revenue = data.revenue as Array<{ year: number; value: number }> | undefined;
  const ebitda = data.ebitda as Array<{ year: number; value: number }> | undefined;
  const shareholders = data.shareholders as Array<{ name: string; share: number; role: string }> | undefined;
  const sources = data.sources as string[] | undefined;

  const formatEur = (value: number) => {
    if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `€${(value / 1_000).toFixed(0)}K`;
    return `€${value}`;
  };

  return (
    <div className="bg-navy-light border border-white/10 rounded-xl overflow-hidden mt-2">
      <div className="px-4 py-2.5 bg-gold/10 border-b border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-gold" />
        <span className="text-sm font-medium text-gold">Company Research</span>
        {sources && (
          <span className="ml-auto text-xs text-gray-text">
            Sources: {sources.join(", ")}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Company info row */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {"location" in data && data.location ? (
            <Stat label="Location" value={String(data.location)} />
          ) : null}
          {"sector" in data && data.sector ? (
            <Stat label="Sector" value={String(data.sector)} />
          ) : null}
          {"employees" in data && data.employees ? (
            <Stat label="Employees" value={String(data.employees)} />
          ) : null}
          {"founded_year" in data && data.founded_year ? (
            <Stat label="Founded" value={String(data.founded_year)} />
          ) : null}
          {"legal_form" in data && data.legal_form ? (
            <Stat label="Legal Form" value={String(data.legal_form)} />
          ) : null}
        </div>

        {/* Financials */}
        {revenue && revenue.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {revenue.map((r) => (
              <div
                key={r.year}
                className="bg-navy-lighter rounded-lg px-3 py-2 text-center"
              >
                <div className="text-xs text-gray-text">{r.year} Revenue</div>
                <div className="text-sm font-semibold text-white">
                  {formatEur(r.value)}
                </div>
              </div>
            ))}
            {ebitda && ebitda.length > 0 && (
              <div className="bg-navy-lighter rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-gray-text">
                  {ebitda[ebitda.length - 1].year} EBITDA
                </div>
                <div className="text-sm font-semibold text-white">
                  {formatEur(ebitda[ebitda.length - 1].value)}
                </div>
              </div>
            )}
            {"ebitda_margin" in data && data.ebitda_margin ? (
              <div className="bg-navy-lighter rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-gray-text">EBITDA Margin</div>
                <div className="text-sm font-semibold text-gold">
                  {String(data.ebitda_margin)}%
                </div>
              </div>
            ) : null}
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
          </div>
        )}

        {/* Description */}
        {"description" in data && data.description ? (
          <p className="text-sm text-gray-text leading-relaxed">
            {String(data.description)}
          </p>
        ) : null}

        {"_note" in data && data._note ? (
          <p className="text-xs text-gold/60 italic">{String(data._note)}</p>
        ) : null}
      </div>
    </div>
  );
}

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
          {String(data.company_name)} — {String(data.status)}
        </div>
      </div>
    </div>
  );
}

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
        <span className="text-sm font-medium text-gold">{type} Generated</span>
        <span
          className={cn(
            "ml-auto text-xs px-2 py-0.5 rounded-full",
            data.status === "draft"
              ? "bg-yellow-500/15 text-yellow-400"
              : "bg-green-500/15 text-green-400"
          )}
        >
          {String(data.status)}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-text">{label}: </span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
