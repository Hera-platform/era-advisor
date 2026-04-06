export type DealStatus =
  | "discovery"
  | "materials_draft"
  | "materials_review"
  | "live"
  | "matched"
  | "engaged"
  | "closed";

export type MaterialType = "teaser" | "info_memo";
export type MaterialStatus = "generating" | "draft" | "approved";

export interface Seller {
  id: string;
  email: string;
  name: string | null;
  auth_id: string | null;
  is_anonymous: boolean;
  created_at: string;
}

export interface CompanyProfile {
  sector?: string;
  description?: string;
  products?: string[];
  location?: string;
  employees?: number;
  management?: Array<{ name: string; role: string }>;
  founded?: string;
  legal_form?: string;
  website?: string;
}

export interface FinancialData {
  revenue?: Array<{ year: number; value: number }>;
  ebitda?: Array<{ year: number; value: number }>;
  ebitda_margin?: number;
  growth_rate?: number;
  adjustments?: string[];
}

export interface DealContext {
  motivation?: string;
  structure?: string; // full_exit, partial, majority, minority
  timeline?: string;
  ideal_buyer_profile?: string;
  additional_notes?: string;
}

export interface EnrichmentData {
  aida?: Record<string, unknown>;
  website?: Record<string, unknown>;
  linkedin?: Record<string, unknown>;
  news?: Array<{ title: string; url: string; date: string }>;
  enriched_at?: string;
  sources_used?: string[];
}

export interface ValuationRange {
  low?: number;
  mid?: number;
  high?: number;
  methodology?: string;
  comps_used?: string[];
}

export interface Deal {
  id: string;
  seller_id: string;
  company_name: string;
  p_iva: string | null;
  status: DealStatus;
  company_profile: CompanyProfile;
  financial_data: FinancialData;
  deal_context: DealContext;
  enrichment_data: EnrichmentData;
  valuation_range: ValuationRange | null;
  created_at: string;
  updated_at: string;
}

export interface TeaserContent {
  headline: string;
  description: string;
  highlights: string[];
  financial_summary: string;
  opportunity: string;
  process: string;
}

export interface InfoMemoContent {
  executive_summary: string;
  company_overview: string;
  products_services: string;
  market_analysis: string;
  financial_overview: string;
  growth_opportunities: string;
  transaction_overview: string;
}

export interface Material {
  id: string;
  deal_id: string;
  type: MaterialType;
  version: number;
  content: TeaserContent | InfoMemoContent;
  pdf_url: string | null;
  status: MaterialStatus;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  tool_calls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
    result?: unknown;
  }>;
}

export interface Conversation {
  id: string;
  deal_id: string | null;
  messages: ChatMessage[];
  context_snapshot: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
