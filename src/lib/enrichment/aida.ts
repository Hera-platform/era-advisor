/**
 * AIDA / Atoka API client — Italian business database.
 *
 * STUB: Returns realistic mock data. Designed so swapping in the
 * real API is a single file change — just implement the same interface.
 */

import type { FinancialYear, Shareholder, Sourced } from "./types";

export interface AidaCompanyData {
  legal_name: Sourced<string>;
  sector: Sourced<string>;
  subsector: Sourced<string>;
  location: Sourced<string>;
  legal_form: Sourced<string>;
  founded_year: Sourced<number>;
  employees: Sourced<number>;
  ateco_code?: string;
  revenue: FinancialYear[];
  ebitda: FinancialYear[];
  ebitda_margin: Sourced<number>;
  revenue_growth_yoy: Sourced<number>;
  shareholders: Shareholder[];
}

export async function fetchAidaData(
  companyName: string,
  _partitaIva?: string
): Promise<AidaCompanyData | null> {
  // TODO: Replace with real AIDA/Atoka API call
  // Real implementation would:
  // 1. Search by P.IVA (exact match) or company name (fuzzy)
  // 2. Pull bilancio data (P&L, balance sheet) for 3-5 years
  // 3. Pull shareholder structure from visura camerale
  // 4. Pull ATECO classification

  console.log(`[AIDA STUB] Fetching data for: ${companyName}`);

  // Simulate API latency
  await new Promise((r) => setTimeout(r, 500));

  // Generate plausible mock data based on company name
  const seed = companyName.length;
  const baseRevenue = (8 + (seed % 15)) * 1_000_000; // 8M-22M range
  const marginPct = 12 + (seed % 12); // 12-23%

  return {
    legal_name: { value: `${companyName} Srl`, source: "AIDA" },
    sector: {
      value: ["Manufacturing", "Technology", "Food & Beverage", "Healthcare", "Industrial Services"][seed % 5],
      source: "AIDA",
    },
    subsector: {
      value: ["Precision Components", "Software", "Organic Food", "Medical Devices", "Engineering Services"][seed % 5],
      source: "AIDA",
    },
    location: {
      value: ["Milan", "Bergamo", "Bologna", "Turin", "Padova"][seed % 5] + ", Italy",
      source: "AIDA",
    },
    legal_form: { value: seed % 3 === 0 ? "SpA" : "Srl", source: "AIDA" },
    founded_year: {
      value: 1995 + (seed % 20),
      source: "AIDA",
    },
    employees: { value: 40 + seed * 5, source: "AIDA" },
    ateco_code: `${20 + (seed % 30)}.${10 + (seed % 90)}`,
    revenue: [
      { year: 2022, value: Math.round(baseRevenue * 0.85), source: "AIDA" as const },
      { year: 2023, value: Math.round(baseRevenue * 0.93), source: "AIDA" as const },
      { year: 2024, value: baseRevenue, source: "AIDA" as const },
    ],
    ebitda: [
      { year: 2022, value: Math.round(baseRevenue * 0.85 * (marginPct / 100)), source: "AIDA" as const },
      { year: 2023, value: Math.round(baseRevenue * 0.93 * (marginPct / 100)), source: "AIDA" as const },
      { year: 2024, value: Math.round(baseRevenue * (marginPct / 100)), source: "AIDA" as const },
    ],
    ebitda_margin: { value: marginPct, source: "AIDA" },
    revenue_growth_yoy: {
      value: Math.round(((baseRevenue / (baseRevenue * 0.93)) - 1) * 1000) / 10,
      source: "AIDA",
    },
    shareholders: [
      {
        name: ["Marco Rossi", "Giuseppe Bianchi", "Antonio Ferrari", "Lucia Conti", "Paolo Moretti"][seed % 5],
        share: 60 + (seed % 15),
        role: "CEO & Founder",
        source: "AIDA" as const,
      },
      {
        name: ["Anna Rossi", "Maria Bianchi", "Elena Ferrari", "Sara Conti", "Laura Moretti"][seed % 5],
        share: 40 - (seed % 15),
        role: seed % 2 === 0 ? "CFO" : "Board Member",
        source: "AIDA" as const,
      },
    ],
  };
}
