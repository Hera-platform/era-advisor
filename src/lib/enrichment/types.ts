export type SourceId = "AIDA" | "website" | "news" | "manual";

export interface Sourced<T> {
  value: T;
  source: SourceId;
}

export interface FinancialYear {
  year: number;
  value: number; // EUR, raw
  source: SourceId;
}

export interface Shareholder {
  name: string;
  share: number; // percentage
  role: string;
  source: SourceId;
}

export interface ManagementMember {
  name: string;
  role: string;
  source: SourceId;
}

export interface EnrichmentResult {
  company_name: string;
  legal_name?: Sourced<string>;
  sector?: Sourced<string>;
  subsector?: Sourced<string>;
  location?: Sourced<string>;
  founded_year?: Sourced<number>;
  legal_form?: Sourced<string>;
  employees?: Sourced<number>;
  website?: Sourced<string>;
  description?: Sourced<string>;

  revenue?: FinancialYear[];
  ebitda?: FinancialYear[];
  ebitda_margin?: Sourced<number>;
  revenue_growth_yoy?: Sourced<number>;

  shareholders?: Shareholder[];
  management?: ManagementMember[];

  confidence: "high" | "medium" | "low";
  enriched_at: string; // ISO
  sources: SourceId[];
  _note?: string;
}

// UI helpers
export const SOURCE_LABELS: Record<SourceId, string> = {
  AIDA: "AIDA",
  website: "Web",
  news: "News",
  manual: "Manual",
};

export const SOURCE_COLORS: Record<SourceId, string> = {
  AIDA: "bg-blue-500/15 text-blue-300",
  website: "bg-emerald-500/15 text-emerald-300",
  news: "bg-amber-500/15 text-amber-300",
  manual: "bg-purple-500/15 text-purple-300",
};
