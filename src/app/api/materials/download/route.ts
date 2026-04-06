import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLatestMaterial } from "@/lib/supabase/deals";
import { generateTeaserPDF, generateInfoMemoPDF } from "@/lib/materials/pdf-export";
import type { TeaserContent, InfoMemoContent } from "@/lib/supabase/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Auth required for downloads
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in to download materials" },
      { status: 401 }
    );
  }

  const dealId = req.nextUrl.searchParams.get("deal_id");
  const type = req.nextUrl.searchParams.get("type") as
    | "teaser"
    | "info_memo"
    | null;

  if (!dealId || !type || !["teaser", "info_memo"].includes(type)) {
    return NextResponse.json(
      { error: "deal_id and type (teaser|info_memo) required" },
      { status: 400 }
    );
  }

  const material = await getLatestMaterial(dealId, type);
  if (!material) {
    return NextResponse.json(
      { error: "Material not found" },
      { status: 404 }
    );
  }

  try {
    let pdfBuffer: Buffer;
    let filename: string;

    if (type === "teaser") {
      pdfBuffer = await generateTeaserPDF(material.content as TeaserContent);
      filename = `ERA_Teaser_v${material.version}.pdf`;
    } else {
      pdfBuffer = await generateInfoMemoPDF(
        material.content as InfoMemoContent
      );
      filename = `ERA_Information_Memorandum_v${material.version}.pdf`;
    }

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[PDF] Generation error:", error);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
