/**
 * News search using Tavily API.
 * Finds recent news and press about a company.
 */

export interface NewsItem {
  title: string;
  url: string;
  content: string;
  published_date?: string;
  score?: number;
}

export interface NewsSearchResult {
  items: NewsItem[];
  summary?: string; // AI-generated summary from Tavily
}

export async function searchCompanyNews(
  companyName: string
): Promise<NewsSearchResult | null> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey || apiKey === "tvly-your-key") {
    console.log("[NEWS] No Tavily API key, returning empty results");
    return { items: [], summary: undefined };
  }

  try {
    const { tavily } = await import("@tavily/core");
    const tvly = tavily({ apiKey });

    console.log(`[NEWS] Searching news for: ${companyName}`);

    // Search in both Italian and English contexts
    const query = `"${companyName}" acquisizione OR crescita OR fatturato OR investimento OR acquisition OR growth OR revenue`;

    const results = await tvly.search(query, {
      topic: "news",
      days: 365,
      maxResults: 5,
      searchDepth: "basic",
      includeAnswer: true,
    });

    return {
      items: results.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        published_date: r.publishedDate,
        score: r.score,
      })),
      summary: results.answer,
    };
  } catch (error) {
    console.error("[NEWS] Tavily error:", error);
    return { items: [], summary: undefined };
  }
}
