import { generateText } from "ai";
import { generationModel } from "@/lib/ai/model";
import { getDealById, saveMaterial } from "@/lib/supabase/deals";
import type { InfoMemoContent } from "@/lib/supabase/types";

export interface InfoMemoGeneratorResult {
  material_id: string;
  content: InfoMemoContent;
  status: "draft";
}

export async function generateInfoMemoContent(
  dealId: string
): Promise<InfoMemoGeneratorResult> {
  const deal = await getDealById(dealId);
  if (!deal) throw new Error(`Deal ${dealId} not found`);

  const prompt = buildInfoMemoPrompt(deal);

  const { text } = await generateText({
    model: generationModel,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    maxOutputTokens: 4000,
  });

  let content: InfoMemoContent;
  try {
    const cleaned = text
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    content = {
      executive_summary: String(parsed.executive_summary ?? ""),
      company_overview: String(parsed.company_overview ?? ""),
      products_services: String(parsed.products_services ?? ""),
      market_analysis: String(parsed.market_analysis ?? ""),
      financial_overview: String(parsed.financial_overview ?? ""),
      growth_opportunities: String(parsed.growth_opportunities ?? ""),
      transaction_overview: String(parsed.transaction_overview ?? ""),
    };
  } catch (err) {
    console.error("[INFO MEMO] Raw model output:", text.slice(0, 500));
    throw new Error(`Failed to parse info memo content: ${err}`);
  }

  const material = await saveMaterial(dealId, "info_memo", content);

  return {
    material_id: material.id,
    content,
    status: "draft",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildInfoMemoPrompt(deal: any): string {
  const p = deal.company_profile ?? {};
  const f = deal.financial_data ?? {};
  const ctx = deal.deal_context ?? {};
  const enrichment = deal.enrichment_data ?? {};

  const val = (field: unknown): string | undefined => {
    if (!field) return undefined;
    if (typeof field === "object" && field !== null && "value" in field)
      return String((field as { value: unknown }).value);
    return String(field);
  };

  const revenueTable = (f.revenue ?? [])
    .map(
      (r: { year: number; value: number }) =>
        `| ${r.year} | €${(r.value / 1_000_000).toFixed(1)}M |`
    )
    .join("\n");

  const ebitdaTable = (f.ebitda ?? [])
    .map(
      (e: { year: number; value: number }) =>
        `| ${e.year} | €${(e.value / 1_000_000).toFixed(1)}M |`
    )
    .join("\n");

  // Gather website description if available
  const websiteDesc = val(enrichment.description) || val(p.description) || "";

  return `You are a senior M&A advisor writing a Confidential Information Memorandum for a sell-side mandate. This is a comprehensive document that potential buyers will use to evaluate the acquisition opportunity.

ANONYMIZATION: This document is NOT anonymous (unlike the teaser). It will be shared under NDA. However, do NOT include shareholder names or management personal details beyond their roles. Use "the Company" throughout.

COMPANY DATA:
Company name: ${deal.company_name}
Sector: ${val(p.sector) ?? "Manufacturing"}
Sub-sector: ${val(p.subsector) ?? "industrial components"}
Location: ${val(p.location) ?? "Northern Italy"}
Employees: ${val(p.employees) ?? "not specified"}
Founded: ${val(p.founded_year) ?? "not specified"}
Legal form: ${val(p.legal_form) ?? "Srl"}
Website description: ${websiteDesc.slice(0, 1000)}

FINANCIAL DATA:
Revenue by year:
${revenueTable || "Not provided"}
EBITDA by year:
${ebitdaTable || "Not provided"}
EBITDA margin: ${val(f.ebitda_margin) ?? "not provided"}%
Revenue growth YoY: ${val(f.revenue_growth_yoy) ?? "not provided"}%

TRANSACTION CONTEXT:
Motivation: ${ctx.motivation ?? "generational transition"}
Structure: ${ctx.structure ?? "majority / full exit"}
Timeline: ${ctx.timeline ?? "2025"}
Ideal buyer: ${ctx.ideal_buyer_profile ?? "strategic or financial investor"}
EBITDA adjustments: ${ctx.ebitda_adjustments ?? "none noted"}
Additional context: ${ctx.additional_notes ?? "none"}

OUTPUT FORMAT:
Return ONLY a valid JSON object with exactly these 7 keys. Each value should be 2-4 paragraphs of professional investment banking prose. No markdown code fences.

{
  "executive_summary": "2-3 paragraphs. Overview of the opportunity: what the company does, key financial metrics, why it's attractive, transaction structure. This is the first thing a buyer reads — make it compelling.",

  "company_overview": "3-4 paragraphs. Company history, legal structure, ownership, management team (roles only, no names), organizational structure, key milestones, geographic footprint.",

  "products_services": "2-3 paragraphs. Product/service portfolio, competitive positioning, key differentiators, IP/proprietary technology, customer segmentation, top client concentration (use percentages, not names).",

  "market_analysis": "2-3 paragraphs. Addressable market size, growth drivers, competitive landscape (generic descriptions), regulatory environment, industry trends, company's market share or positioning.",

  "financial_overview": "3-4 paragraphs. Historical financial performance analysis. Revenue trends and drivers. Profitability analysis (EBITDA margins, trends). Working capital dynamics. CapEx profile. Key financial ratios. Include specific numbers from the data provided.",

  "growth_opportunities": "2-3 paragraphs. Organic growth levers (new products, geographic expansion, price increases). Inorganic opportunities (bolt-on acquisitions, vertical integration). Operational improvements. Synergy potential for different buyer types.",

  "transaction_overview": "2 paragraphs. Transaction structure (majority/minority, full exit). Timeline. Process description. Contact information for ERA as the advisor."
}`;
}
