import ReactPDF, {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { TeaserContent, InfoMemoContent } from "@/lib/supabase/types";

// ── Styles ───────────────────────────────────────────────

const colors = {
  navy: "#0D1830",
  gold: "#BF9000",
  white: "#FFFFFF",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
};

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.navy,
  },
  header: {
    backgroundColor: colors.navy,
    padding: 30,
    marginBottom: 30,
    marginTop: -50,
    marginLeft: -50,
    marginRight: -50,
  },
  headerTitle: {
    color: colors.gold,
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },
  headerSubtitle: {
    color: colors.white,
    fontSize: 11,
    opacity: 0.8,
  },
  confidential: {
    color: colors.gold,
    fontSize: 7,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    marginTop: 15,
  },
  sectionLabel: {
    color: colors.gold,
    fontSize: 7,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.navy,
    marginBottom: 10,
  },
  bulletItem: {
    flexDirection: "row" as const,
    marginBottom: 6,
    paddingLeft: 5,
  },
  bulletDot: {
    width: 4,
    height: 4,
    backgroundColor: colors.gold,
    borderRadius: 2,
    marginTop: 4,
    marginRight: 10,
  },
  bulletText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.navy,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  footer: {
    position: "absolute" as const,
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: colors.gray,
  },
});

// ── Teaser PDF ───────────────────────────────────────────

function TeaserPDF({ content }: { content: TeaserContent }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.confidential}>
            STRICTLY PRIVATE AND CONFIDENTIAL
          </Text>
          <Text style={styles.headerTitle}>Investment Opportunity</Text>
          <Text style={styles.headerSubtitle}>{content.headline}</Text>
        </View>

        {/* Description */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionLabel}>Business Description</Text>
          <Text style={styles.paragraph}>{content.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* Highlights */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionLabel}>Key Highlights</Text>
          {content.highlights.map((h, i) => (
            <View key={i} style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{h}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Financial Summary */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionLabel}>Financial Summary</Text>
          <Text style={styles.paragraph}>{content.financial_summary}</Text>
        </View>

        <View style={styles.divider} />

        {/* Opportunity */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionLabel}>Investment Opportunity</Text>
          <Text style={styles.paragraph}>{content.opportunity}</Text>
        </View>

        <View style={styles.divider} />

        {/* Process */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionLabel}>Process</Text>
          <Text style={styles.paragraph}>{content.process}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Prepared by ERA — AI M&A Advisory
          </Text>
          <Text style={styles.footerText}>
            This document is strictly confidential
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// ── Info Memo PDF ────────────────────────────────────────

const MEMO_SECTIONS: Array<{
  key: keyof InfoMemoContent;
  title: string;
  number: string;
}> = [
  { key: "executive_summary", title: "Executive Summary", number: "1" },
  { key: "company_overview", title: "Company Overview", number: "2" },
  { key: "products_services", title: "Products & Services", number: "3" },
  { key: "market_analysis", title: "Market Analysis", number: "4" },
  { key: "financial_overview", title: "Financial Overview", number: "5" },
  { key: "growth_opportunities", title: "Growth Opportunities", number: "6" },
  { key: "transaction_overview", title: "Transaction Overview", number: "7" },
];

function InfoMemoPDF({ content }: { content: InfoMemoContent }) {
  return (
    <Document>
      {/* Cover page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.confidential}>
            CONFIDENTIAL INFORMATION MEMORANDUM
          </Text>
          <Text style={styles.headerTitle}>Information Memorandum</Text>
          <Text style={styles.headerSubtitle}>
            Prepared by ERA — AI M&A Advisory
          </Text>
        </View>

        {/* Table of contents */}
        <View style={{ marginTop: 40 }}>
          <Text style={styles.sectionLabel}>Table of Contents</Text>
          {MEMO_SECTIONS.map((s) => (
            <View
              key={s.key}
              style={{
                flexDirection: "row",
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#F3F4F6",
              }}
            >
              <Text
                style={{
                  width: 25,
                  fontSize: 10,
                  fontFamily: "Helvetica-Bold",
                  color: colors.gold,
                }}
              >
                {s.number}.
              </Text>
              <Text style={{ fontSize: 10, color: colors.navy }}>
                {s.title}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ERA — Confidential</Text>
          <Text style={styles.footerText}>Page 1</Text>
        </View>
      </Page>

      {/* Content pages */}
      {MEMO_SECTIONS.map((s, pageIdx) => {
        const text = content[s.key];
        if (!text) return null;

        return (
          <Page key={s.key} size="A4" style={styles.page}>
            <Text style={styles.sectionLabel}>
              Section {s.number}
            </Text>
            <Text style={styles.sectionTitle}>{s.title}</Text>

            {text.split("\n\n").map((paragraph, i) => (
              <Text key={i} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}

            <View style={styles.footer}>
              <Text style={styles.footerText}>ERA — Confidential</Text>
              <Text style={styles.footerText}>
                Page {pageIdx + 2}
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

// ── Export functions ──────────────────────────────────────

export async function generateTeaserPDF(
  content: TeaserContent
): Promise<Buffer> {
  const stream = await ReactPDF.renderToStream(
    <TeaserPDF content={content} />
  );
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function generateInfoMemoPDF(
  content: InfoMemoContent
): Promise<Buffer> {
  const stream = await ReactPDF.renderToStream(
    <InfoMemoPDF content={content} />
  );
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
