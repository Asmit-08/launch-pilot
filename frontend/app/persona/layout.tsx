import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI User Persona Generator | Launch Pilot",

  description:
    "Generate detailed AI-powered user personas for your startup, SaaS, or business. Create customer personas with goals, pain points, motivations, buying behavior, and marketing insights in seconds.",

  keywords: [
    "User Persona Generator",
    "AI User Persona Generator",
    "Customer Persona Generator",
    "Buyer Persona Generator",
    "Create User Persona",
    "User Persona Maker",
    "Startup User Persona",
    "SaaS User Persona",
    "Customer Persona",
    "AI Customer Persona",
  ],

  alternates: {
    canonical:
      "https://launch-pilot-flax.vercel.app/persona",
  },

  openGraph: {
    title:
      "Free AI User Persona Generator | Launch Pilot",

    description:
      "Generate detailed customer personas in seconds using AI. Perfect for startup founders, marketers, and SaaS teams.",

    url:
      "https://launch-pilot-flax.vercel.app/persona",

    siteName: "Launch Pilot",

    images: [
      {
        url: "/og-user-persona-generator.png",
        width: 1200,
        height: 630,
        alt: "Launch Pilot AI User Persona Generator",
      },
    ],

    locale: "en_US",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Free AI User Persona Generator",

    description:
      "Generate detailed customer personas with AI in seconds.",

    images: [
      "/og-user-persona-generator.png",
    ],
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

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}