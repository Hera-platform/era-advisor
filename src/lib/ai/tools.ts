import { tool } from "ai";
import { z } from "zod";
import { runEnrichmentPipeline } from "@/lib/enrichment/pipeline";

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
      console.log("[ERA] run_enrichment called:", input);
      return runEnrichmentPipeline(input.company_name, input.partita_iva);
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
