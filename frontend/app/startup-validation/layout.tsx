import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startup Validation | Validate Your Startup Idea",
  description:
    "Validate your startup idea before you build further. Plavtora helps founders pressure-test their problem, customer, solution, positioning, and assumptions to identify what deserves attention next.",

  alternates: {
    canonical: "/startup-validation",
  },

  openGraph: {
    title: "Startup Validation | Plavtora",
    description:
      "Pressure-test your startup idea, identify important uncertainty, and decide what deserves attention next.",
    url: "https://plavtora.com/startup-validation",
    siteName: "Plavtora",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 1200,
        height: 630,
        alt: "Plavtora — Startup Validation",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Startup Validation | Plavtora",
    description:
      "Pressure-test your startup idea and identify what deserves attention next.",
    images: ["/icon.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function StartupValidationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}