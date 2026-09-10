import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://plavtora.com"),

  title: "Free AI User Persona Generator | ICP & Customer Persona",

  description:
    "Generate an AI-powered user persona and ideal customer profile for your startup, SaaS, or business. Identify customer goals, pain points, motivations, buying behaviour, objections, marketing channels, and messaging insights.",

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

  alternates: {
    canonical: "/persona",
  },

  openGraph: {
    title: "Free AI User Persona Generator | Plavtora",
    description:
      "Generate an AI-powered user persona and ideal customer profile. Understand customer goals, pain points, motivations, buying behaviour, objections, channels, and messaging.",
    url: "https://plavtora.com/persona",
    siteName: "Plavtora",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icon.png",
        alt: "Plavtora AI User Persona Generator",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Free AI User Persona Generator | Plavtora",
    description:
      "Generate an AI-powered user persona and ideal customer profile for your startup or SaaS.",
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

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}