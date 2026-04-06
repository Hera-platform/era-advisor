import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getDealById, saveMaterial } from "@/lib/supabase/deals";
import type { TeaserContent } from "@/lib/supabase/types";

export interface TeaserGeneratorResult {
  material_id: string;
  content: TeaserContent;
  status: "draft";
}

/**
 * Generate a fully anonymous teaser document from deal data.
 *
 * Anonymization is STRUCTURAL: company name, shareholder names, and
 * management names are never passed to the model. Location is downsampled
 * to region. Employee count is converted to a range.
 */
export async function generateTeaserContent(
  dealId: string
): Promise<TeaserGeneratorResult> {
  const deal = await getDealById(dealId);
  if (!deal) throw new Error(`Deal ${dealId} not found`);

  const prompt = buildTeaserPrompt(deal);

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    maxOutputTokens: 1200,
  });

  // Parse JSON response
  let content: TeaserContent;
  try {
    const cleaned = text
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.headline || !parsed.description || !Array.isArray(parsed.highlights)) {
      throw new Error("Missing required fields in teaser response");
    }

    content = {
      headline: String(parsed.headline),
      description: String(parsed.description),
      highlights: (parsed.highlights as unknown[]).map(String),
      financial_summary: String(parsed.financial_summary ?? ""),
      opportunity: String(parsed.opportunity ?? ""),
      process: String(parsed.process ?? ""),
    };
  } catch (err) {
    console.error("[TEASER] Raw model output:", text);
    throw new Error(`Failed to parse teaser content: ${err}`);
  }

  const material = await saveMaterial(dealId, "teaser", content);

  return {
    material_id: material.id,
    content,
    status: "draft",
  };
}

// ── Prompt builder ───────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTeaserPrompt(deal: any): string {
  const p = deal.company_profile ?? {};
  const f = deal.financial_data ?? {};
  const ctx = deal.deal_context ?? {};

  const revenueLines = (f.revenue ?? [])
    .map(
      (r: { year: number; value: number }) =>
        `  - ${r.year}: €${(r.value / 1_000_000).toFixed(1)}M`
    )
    .join("\n");

  const ebitdaLines = (f.ebitda ?? [])
    .map(
      (e: { year: number; value: number }) =>
        `  - ${e.year}: €${(e.value / 1_000_000).toFixed(1)}M`
    )
    .join("\n");

  // Extract values from Sourced<T> fields if present
  const val = (field: unknown): string | undefined => {
    if (!field) return undefined;
    if (typeof field === "object" && field !== null && "value" in field) {
      return String((field as { value: unknown }).value);
    }
    return String(field);
  };

  const numVal = (field: unknown): number | undefined => {
    if (!field) return undefined;
    if (typeof field === "object" && field !== null && "value" in field) {
      return Number((field as { value: unknown }).value);
    }
    return Number(field);
  };

  return `You are an M&A advisor writing an anonymous teaser document for a sell-side mandate.

IMPORTANT ANONYMIZATION RULES:
- Do NOT mention the company name, brand name, or any registered trademark
- Do NOT mention any shareholder names, management names, or founder names
- Do NOT mention the specific municipality or any location more precise than the region
- Use general descriptors: "the Company", "the Group", "the business"
- Financial figures may be presented as ranges (±10%) to prevent identification
- Write in professional investment banking English

DEAL DATA (sanitized):
Sector: ${val(p.sector) ?? "Manufacturing"}
Sub-sector: ${val(p.subsector) ?? "industrial components"}
Geography: ${anonymizeLocation(val(p.location) ?? "Northern Italy")}
Employee count range: ${employeeRange(numVal(p.employees))}
Founded: ${val(p.founded_year) ? `circa ${Math.floor(Number(val(p.founded_year)) / 10) * 10}s` : "established business"}
Legal form: ${val(p.legal_form) ?? "Srl"}

Revenue:
${revenueLines || "  Not provided"}
EBITDA:
${ebitdaLines || "  Not provided"}
EBITDA margin: ${numVal(f.ebitda_margin) != null ? `${numVal(f.ebitda_margin)!.toFixed(1)}%` : "not provided"}
Revenue growth: ${numVal(f.revenue_growth_yoy) != null ? `${numVal(f.revenue_growth_yoy)!.toFixed(1)}%` : "not provided"}

Transaction context:
Structure: ${ctx.structure ?? "majority / full exit"}
Motivation (generic): ${ctx.motivation ?? "generational transition"}
Timeline: ${ctx.timeline ?? "2025"}
Ideal buyer: ${ctx.ideal_buyer_profile ?? "strategic or financial investor"}

OUTPUT FORMAT:
Return ONLY a valid JSON object with exactly these keys. No markdown, no preamble:
{
  "headline": "8-14 words, e.g. 'A Northern Italian manufacturer of precision industrial components'",
  "description": "3-4 sentences. What the business does, market position, competitive strengths. Anonymous.",
  "highlights": ["4-6 bullet points. Each starts with a strong noun or metric."],
  "financial_summary": "2-3 sentences. Revenues, EBITDA, margin, growth. Use ranges where appropriate.",
  "opportunity": "2-3 sentences. Why this is an attractive acquisition.",
  "process": "2 sentences. Standard: 'Interested parties are invited to submit a non-binding expression of interest. Further details will be shared under NDA.'"
}`;
}

function anonymizeLocation(location: string): string {
  const regionMap: Record<string, string> = {
    milan: "Lombardy", milano: "Lombardy",
    bergamo: "Lombardy", brescia: "Lombardy", como: "Lombardy",
    venice: "Veneto", venezia: "Veneto", verona: "Veneto", padova: "Veneto",
    bologna: "Emilia-Romagna", modena: "Emilia-Romagna", parma: "Emilia-Romagna",
    torino: "Piedmont", turin: "Piedmont",
    florence: "Tuscany", firenze: "Tuscany",
    rome: "Central Italy", roma: "Central Italy",
    naples: "Southern Italy", napoli: "Southern Italy",
  };
  const lower = location.toLowerCase();
  for (const [city, region] of Object.entries(regionMap)) {
    if (lower.includes(city)) return region;
  }
  return "Northern Italy";
}

function employeeRange(employees?: number): string {
  if (!employees) return "50-250";
  if (employees < 20) return "10-25";
  if (employees < 50) return "25-75";
  if (employees < 100) return "75-150";
  if (employees < 250) return "150-300";
  if (employees < 500) return "300-600";
  return "500+";
}
