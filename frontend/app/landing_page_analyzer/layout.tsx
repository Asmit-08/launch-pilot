import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Landing Page Analyzer | Analyze Messaging & Conversion",
  description:
    "Analyze a landing page with AI to evaluate messaging, value proposition, audience alignment, trust, calls to action, and conversion clarity.",
  alternates: {
    canonical: "/landing_page_analyzer",
  },
  openGraph: {
    title: "AI Landing Page Analyzer | Analyze Messaging & Conversion",
    description:
      "Analyze a landing page with AI to evaluate messaging, positioning, audience alignment, trust, calls to action, and conversion clarity.",
    url: "https://plavtora.com/landing_page_analyzer",
    siteName: "Plavtora",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPageAnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}