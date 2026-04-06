import { tool } from "ai";
import { z } from "zod";

export const advisorTools = {
  run_enrichment: tool({
    description:
      "Research a company using public databases (AIDA, web, news). Call this immediately when the user mentions a company name or Partita IVA. Returns structured company profile with financials, shareholders, and business description.",
    inputSchema: z.object({
      company_name: z.string().describe("The name of the company to research"),
      partita_iva: z
        .string()
        .optional()
        .describe("Italian tax ID (P.IVA) if provided"),
    }),
    execute: async (input) => {
      // Stub: will be replaced with real enrichment pipeline in B3
      console.log("[ERA] run_enrichment called:", input);
      return {
        company_name: input.company_name,
        legal_name: `${input.company_name} Srl`,
        sector: "Manufacturing",
        subsector: "Industrial Components",
        location: "Milan, Italy",
        founded_year: 2005,
        legal_form: "Srl",
        employees: 85,
        description: `${input.company_name} is a mid-sized Italian manufacturer specializing in precision industrial components. The company serves clients across the automotive, aerospace, and energy sectors, with a strong reputation for quality and reliability. Founded in 2005, the company has grown steadily through a combination of organic growth and product line expansion.`,
        revenue: [
          { year: 2022, value: 10100000 },
          { year: 2023, value: 11200000 },
          { year: 2024, value: 12300000 },
        ],
        ebitda: [
          { year: 2022, value: 1720000 },
          { year: 2023, value: 1960000 },
          { year: 2024, value: 2214000 },
        ],
        ebitda_margin: 18.0,
        revenue_growth_yoy: 9.8,
        shareholders: [
          { name: "Marco Rossi", share: 65, role: "CEO & Founder" },
          { name: "Anna Rossi", share: 35, role: "CFO" },
        ],
        management: [
          { name: "Marco Rossi", role: "CEO" },
          { name: "Anna Rossi", role: "CFO" },
          { name: "Luca Bianchi", role: "COO" },
        ],
        website: `www.${input.company_name.toLowerCase().replace(/\s+/g, "")}.it`,
        sources: ["AIDA", "Company Website", "News"],
        enriched_at: new Date().toISOString(),
        confidence: "medium" as const,
        _note:
          "This is mock data. Real enrichment will be connected in the next step.",
      };
    },
  }),

  create_deal: tool({
    description:
      "Create a new deal record for a company the seller wants to bring to market. Call this after enrichment succeeds and the user confirms they want to proceed.",
    inputSchema: z.object({
      company_name: z.string().describe("The company name"),
      partita_iva: z.string().optional().describe("P.IVA if known"),
    }),
    execute: async (input) => {
      // Stub: will create real Supabase record in B4
      console.log("[ERA] create_deal called:", input);
      return {
        deal_id: crypto.randomUUID(),
        company_name: input.company_name,
        status: "discovery",
        created_at: new Date().toISOString(),
        message: "Deal created successfully. Ready to collect additional information.",
      };
    },
  }),

  update_deal: tool({
    description:
      "Update deal information when the seller provides new details: motivation for sale, buyer preferences, EBITDA adjustments, timeline, or any other relevant context.",
    inputSchema: z.object({
      deal_id: z.string().describe("The deal ID to update"),
      motivation: z
        .string()
        .optional()
        .describe("Why the owner wants to sell"),
      preferred_buyer_type: z
        .string()
        .optional()
        .describe("Strategic, financial, family office, etc."),
      deal_structure: z
        .string()
        .optional()
        .describe("Full exit, majority, minority, etc."),
      timeline: z
        .string()
        .optional()
        .describe("Expected timeline for the transaction"),
      ebitda_adjustments: z
        .string()
        .optional()
        .describe("Any EBITDA adjustments or one-off items to normalize"),
      additional_notes: z
        .string()
        .optional()
        .describe("Any other relevant information"),
    }),
    execute: async (input) => {
      // Stub: will update real Supabase record in B4
      console.log("[ERA] update_deal called:", input);
      return {
        deal_id: input.deal_id,
        updated: true,
        fields_updated: Object.keys(input).filter(
          (k) => k !== "deal_id" && input[k as keyof typeof input]
        ),
        message: "Deal information updated.",
      };
    },
  }),

  generate_teaser: tool({
    description:
      "Generate an anonymous teaser document for the deal. Call this when you have enough data: company profile, financials, and deal context. The teaser will be fully anonymized — no company name or identifying details.",
    inputSchema: z.object({
      deal_id: z.string().describe("The deal ID to generate a teaser for"),
    }),
    execute: async (input) => {
      // Stub: will generate real teaser in C1
      console.log("[ERA] generate_teaser called:", input);
      return {
        deal_id: input.deal_id,
        material_id: crypto.randomUUID(),
        type: "teaser",
        status: "draft",
        message:
          "Teaser generated successfully. The seller can review it inline.",
        preview:
          "A Northern Italian industrial components manufacturer with €12.3M revenue and 18% EBITDA margin, serving automotive, aerospace, and energy sectors.",
      };
    },
  }),

  generate_info_memo: tool({
    description:
      "Generate a full Information Memorandum for the deal. Call this after the teaser is generated. Produces a comprehensive 7-section document covering company overview, financials, market analysis, and transaction details.",
    inputSchema: z.object({
      deal_id: z.string().describe("The deal ID to generate an info memo for"),
    }),
    execute: async (input) => {
      // Stub: will generate real info memo in C2
      console.log("[ERA] generate_info_memo called:", input);
      return {
        deal_id: input.deal_id,
        material_id: crypto.randomUUID(),
        type: "info_memo",
        status: "draft",
        sections: [
          "Executive Summary",
          "Company Overview",
          "Products & Services",
          "Market Analysis",
          "Financial Overview",
          "Growth Opportunities",
          "Transaction Overview",
        ],
        message:
          "Information Memorandum generated with 7 sections. The seller can review each section inline.",
      };
    },
  }),
};
