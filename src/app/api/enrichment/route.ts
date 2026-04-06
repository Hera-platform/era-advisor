import { NextRequest, NextResponse } from "next/server";
import { runEnrichmentPipeline } from "@/lib/enrichment/pipeline";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { company_name, partita_iva } = await req.json();

    if (!company_name) {
      return NextResponse.json(
        { error: "company_name is required" },
        { status: 400 }
      );
    }

    const result = await runEnrichmentPipeline(company_name, partita_iva);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ENRICHMENT API] Error:", error);
    return NextResponse.json(
      { error: "Enrichment failed" },
      { status: 500 }
    );
  }
}
