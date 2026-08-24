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
    default: "Plavtora | AI Startup Validation & Launch Analysis",
    template: "%s | Plavtora",
  },

  description:
    "Plavtora is an AI second opinion for founders. Pressure-test your startup, ICP, positioning, landing page, and launch decisions before the market does.",

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
    title: "Plavtora | AI Startup Validation & Launch Analysis",
    description:
      "An AI second opinion for founders. Pressure-test your startup, ICP, positioning, landing page, and launch decisions.",
    url: "https://plavtora.com",
    siteName: "Plavtora",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 1200,
        height: 630,
        alt: "Plavtora — AI Startup Validation & Launch Analysis",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Plavtora | AI Startup Validation & Launch Analysis",
    description:
      "An AI second opinion for founders. Pressure-test your startup before the market does.",
    images: ["/icon.png"],
  },

  robots: {
    index: true,
    follow: true,
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