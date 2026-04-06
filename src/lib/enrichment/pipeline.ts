/**
 * Enrichment Pipeline — orchestrates all data sources in parallel.
 *
 * Given a company name (+ optional P.IVA), runs:
 * 1. AIDA/Atoka (Italian business database) → financials, shareholders
 * 2. Website crawler (Firecrawl) → description, products, team
 * 3. News search (Tavily) → recent press, context
 *
 * Returns a merged EnrichmentResult with per-field source attribution.
 */

import type { EnrichmentResult, SourceId } from "./types";
import { fetchAidaData } from "./aida";
import { crawlWebsite } from "./website-crawler";
import { searchCompanyNews } from "./news-search";

export async function runEnrichmentPipeline(
  companyName: string,
  partitaIva?: string
): Promise<EnrichmentResult> {
  console.log(`[PIPELINE] Starting enrichment for: ${companyName}`);
  const startTime = Date.now();

  // Run all sources in parallel
  const [aidaResult, websiteResult, newsResult] = await Promise.allSettled([
    fetchAidaData(companyName, partitaIva),
    crawlWebsite(companyName),
    searchCompanyNews(companyName),
  ]);

  const aida = aidaResult.status === "fulfilled" ? aidaResult.value : null;
  const website = websiteResult.status === "fulfilled" ? websiteResult.value : null;
  const news = newsResult.status === "fulfilled" ? newsResult.value : null;

  // Track which sources returned data
  const sourcesUsed: SourceId[] = [];
  if (aida) sourcesUsed.push("AIDA");
  if (website) sourcesUsed.push("website");
  if (news && news.items.length > 0) sourcesUsed.push("news");

  // Determine confidence based on data quality
  let confidence: "high" | "medium" | "low" = "low";
  if (aida && website) confidence = "high";
  else if (aida || website) confidence = "medium";

  // Merge results — AIDA is primary for structured data, website for qualitative
  const result: EnrichmentResult = {
    company_name: companyName,
    confidence,
    enriched_at: new Date().toISOString(),
    sources: sourcesUsed,

    // AIDA data (structured, high-trust)
    ...(aida && {
      legal_name: aida.legal_name,
      sector: aida.sector,
      subsector: aida.subsector,
      location: aida.location,
      legal_form: aida.legal_form,
      founded_year: aida.founded_year,
      employees: aida.employees,
      revenue: aida.revenue,
      ebitda: aida.ebitda,
      ebitda_margin: aida.ebitda_margin,
      revenue_growth_yoy: aida.revenue_growth_yoy,
      shareholders: aida.shareholders,
    }),

    // Website data (qualitative, medium-trust)
    ...(website && {
      description: website.description,
      website: website.website,
      management: website.management,
    }),

    // If AIDA didn't provide description but website did, use website
    // If neither, provide a note
    ...(!aida?.legal_name &&
      !website?.description && {
        _note: `Limited data available for "${companyName}". Consider providing more details or a website URL.`,
      }),
  };

  // Add news summary to description if we have it and no website description
  if (news?.summary && !result.description) {
    result.description = {
      value: news.summary,
      source: "news",
    };
  }

  const elapsed = Date.now() - startTime;
  console.log(
    `[PIPELINE] Enrichment complete in ${elapsed}ms. Sources: ${sourcesUsed.join(", ")}`
  );

  return result;
}
