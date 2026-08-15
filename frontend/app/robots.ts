import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/auth/",
        "/dashboard/",
        "/audit/",
        "/audit-history/",
        "/billing/",
        "/api/",
      ],
    },

    sitemap: "https://plavtora.com/sitemap.xml",
  };
}