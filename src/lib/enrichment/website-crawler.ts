/**
 * Website crawler using Firecrawl API.
 * Extracts structured company data from any website.
 */

import type { Sourced, ManagementMember } from "./types";

export interface WebsiteData {
  description?: Sourced<string>;
  products_services?: Array<{ name: string; description: string }>;
  management?: ManagementMember[];
  locations?: Array<{ city: string; country: string; type: string }>;
  certifications?: string[];
  website: Sourced<string>;
}

export async function crawlWebsite(
  companyName: string,
  websiteUrl?: string
): Promise<WebsiteData | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey || apiKey === "fc-your-key") {
    console.log("[WEBSITE] No Firecrawl API key, using fallback extraction");
    return fallbackExtraction(companyName);
  }

  try {
    // Dynamic import to avoid issues when key isn't set
    const FirecrawlModule = await import("@mendable/firecrawl-js");
    const Firecrawl = FirecrawlModule.default;
    const firecrawl = new Firecrawl({ apiKey });

    const url = websiteUrl || `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.it`;

    console.log(`[WEBSITE] Crawling: ${url}`);

    // Use scrape for a single page (faster + cheaper than extract for MVP)
    const result = await firecrawl.scrape(url, {
      formats: ["markdown"],
    });

    const markdown = result.markdown;
    if (!markdown) {
      console.log("[WEBSITE] Scrape returned no content, using fallback");
      return fallbackExtraction(companyName);
    }

    // Return raw content — the AI advisor will interpret it
    return {
      description: {
        value: markdown.slice(0, 2000), // Truncate for context window
        source: "website" as const,
      },
      website: { value: url, source: "website" as const },
    };
  } catch (error) {
    console.error("[WEBSITE] Firecrawl error:", error);
    return fallbackExtraction(companyName);
  }
}

/**
 * Fallback: try a simple fetch + text extraction when Firecrawl isn't available
 */
async function fallbackExtraction(companyName: string): Promise<WebsiteData | null> {
  const possibleUrls = [
    `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.it`,
    `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
    `https://${companyName.toLowerCase().replace(/\s+/g, "")}.it`,
  ];

  for (const url of possibleUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ERA-Bot/1.0)",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) continue;

      const html = await response.text();

      // Basic extraction: grab text between common tags
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const metaDescMatch = html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i
      );

      const description = metaDescMatch?.[1] || titleMatch?.[1] || null;

      if (description) {
        return {
          description: { value: description, source: "website" },
          website: { value: url, source: "website" },
        };
      }
    } catch {
      continue;
    }
  }

  return null;
}
