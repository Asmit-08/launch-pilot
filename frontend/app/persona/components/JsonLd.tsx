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
        "Generate AI-powered user personas with goals, pain points, motivations, buying behavior, and customer insights in seconds.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
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

    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a user persona?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A user persona is a fictional representation of your ideal customer based on research, assumptions, and customer insights.",
          },
        },
        {
          "@type": "Question",
          name: "Is Plavtora's AI User Persona Generator free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Plavtora's AI User Persona Generator is free to use.",
          },
        },
        {
          "@type": "Question",
          name: "Can AI generate accurate personas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "AI provides an excellent starting point, but personas should always be validated through customer interviews and feedback.",
          },
        },
        {
          "@type": "Question",
          name: "Who should use this tool?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Startup founders, marketers, SaaS teams, agencies, product managers, and entrepreneurs can all benefit from using AI-generated user personas.",
          },
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