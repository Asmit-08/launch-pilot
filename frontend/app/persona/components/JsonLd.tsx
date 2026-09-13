export default function JsonLd() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Plavtora AI User Persona Generator",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://www.plavtora.com/persona",
      description:
        "Generate a structured ideal customer profile and user persona with AI. Understand customer goals, pain points, motivations, buying behaviour, objections, marketing channels, and messaging opportunities.",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description:
          "Free plan with limited persona generations. Premium provides additional persona generations and deeper customer intelligence.",
      },
    },

    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.plavtora.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "AI User Persona Generator",
          item: "https://www.plavtora.com/persona",
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}
