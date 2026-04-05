import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
