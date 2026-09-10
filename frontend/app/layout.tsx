import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://plavtora.com"),

  title: {
    default: "Plavtora | AI Startup Decision System for Founders",
    template: "%s | Plavtora",
  },

  description:
    "Plavtora is an AI-powered startup decision system for founders. Pressure-test startup ideas, validate your ICP and positioning, identify risks and assumptions, assess launch readiness, and determine what to focus on next.",

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
    canonical: "/",
  },

  verification: {
    google: "9otnB3v3-9coblTOK4kMpw14UH0F-HStwGpTLy2z4ko",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  openGraph: {
    title: "Plavtora | AI Startup Decision System for Founders",
    description:
      "Pressure-test startup ideas, validate your ICP and positioning, identify risks and assumptions, assess launch readiness, and determine what to focus on next.",
    url: "https://plavtora.com",
    siteName: "Plavtora",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 1200,
        height: 630,
        alt:
          "Plavtora — AI-powered startup decision system for founders",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Plavtora | AI Startup Decision System for Founders",
    description:
      "Pressure-test startup ideas, validate ICP and positioning, identify risks, assess launch readiness, and make better startup decisions with AI.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}

        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!}
        />
      </body>
    </html>
  );
}