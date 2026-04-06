import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERA — Sell your business with AI",
  description:
    "ERA is your AI M&A advisor. Tell us your company name and we'll prepare institutional-quality materials, find matching buyers, and guide you through the entire process.",
  keywords: [
    "sell business",
    "M&A advisor",
    "AI",
    "company valuation",
    "teaser",
    "information memorandum",
    "SME",
    "private equity",
    "family office",
  ],
  openGraph: {
    title: "ERA — Sell your business with AI",
    description:
      "Your AI M&A advisor. Institutional-quality deal materials from a single conversation.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
