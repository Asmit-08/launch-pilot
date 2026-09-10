import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://plavtora.com"),

  title: "Startup Validation Tool | Validate Your Startup Idea with AI",

  description:
    "Validate your startup idea with AI before investing more time and resources. Plavtora helps founders examine the problem, customer, solution, positioning, assumptions, and evidence to identify uncertainty and decide what to do next.",

  applicationName: "Plavtora",

  authors: [
    {
      name: "Plavtora",
      url: "https://plavtora.com",
    },
  ],

  creator: "Plavtora",
  publisher: "Plavtora",

  category: "Business Software",

  keywords: [
    "startup validation",
    "startup validation tool",
    "startup idea validation",
    "validate startup idea",
    "AI startup validation",
    "AI startup idea validator",
    "startup idea validator",
    "startup validation tool AI",
    "startup analysis",
    "startup idea analysis",
    "validate business idea",
    "business idea validation",
    "startup research",
    "startup assumptions",
    "startup decision making",
  ],

  alternates: {
    canonical: "/startup-validation",
  },

  openGraph: {
    title: "Startup Validation Tool | Plavtora",
    description:
      "Validate your startup idea with AI. Examine the problem, customer, solution, positioning, assumptions, and evidence to identify uncertainty and decide what deserves attention next.",
    url: "https://plavtora.com/startup-validation",
    siteName: "Plavtora",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 1200,
        height: 630,
        alt: "Plavtora AI Startup Validation Tool",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Startup Validation Tool | Plavtora",
    description:
      "Validate your startup idea with AI and identify the assumptions and uncertainty that deserve attention next.",
    images: ["/icon.png"],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function StartupValidationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}