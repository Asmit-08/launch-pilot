export default function JsonLd() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Plavtora AI User Persona Generator",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://plavtora.com/persona",
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
          item: "https://plavtora.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "AI User Persona Generator",
          item: "https://plavtora.com/persona",
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
            text: "A user persona is a structured representation of a target customer based on research, evidence, and informed assumptions. It describes characteristics such as goals, problems, motivations, behaviours, needs, and buying considerations so a team can make decisions around a specific type of customer.",
          },
        },
        {
          "@type": "Question",
          name: "What is an AI user persona generator?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An AI user persona generator uses artificial intelligence to turn information about a product, service, or startup into a structured customer persona. Plavtora generates an initial customer hypothesis that can include an ideal customer profile, persona description, pain points, goals, motivations, buying triggers, objections, channels, messaging, and content ideas depending on the plan.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between a user persona and an ICP?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An ideal customer profile, or ICP, describes the type of customer or organization that is the best fit for a product. A user persona describes a representative person within that target audience, including their goals, problems, motivations, behaviour, and decision-making context. For B2B products, an ICP and user persona are often used together.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between a user persona and a buyer persona?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A user persona focuses on the person who uses a product, while a buyer persona focuses on the person involved in purchasing it. They can be the same person, but in B2B products the user, decision-maker, and economic buyer may be different people.",
          },
        },
        {
          "@type": "Question",
          name: "How does Plavtora's AI User Persona Generator work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You describe what you are building, explain the product and problem it solves, and optionally provide additional context such as competitors, pricing, market, location, or existing customers. Plavtora turns those inputs into a structured ICP and customer persona hypothesis.",
          },
        },
        {
          "@type": "Question",
          name: "How accurate are AI-generated user personas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An AI-generated persona should be treated as a hypothesis rather than verified customer research. Its usefulness depends on the quality and specificity of the information provided. Validate important assumptions with customer interviews, user behaviour, analytics, surveys, and actual demand before making major decisions.",
          },
        },
        {
          "@type": "Question",
          name: "Can I use an AI-generated persona for my startup?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. An AI-generated persona can be useful as a starting point for customer discovery, product positioning, messaging, content planning, and validation. It should become more evidence-based as you learn from real customers.",
          },
        },
        {
          "@type": "Question",
          name: "Is Plavtora's AI User Persona Generator free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Plavtora lets users try the persona generator with limited free usage. The Free plan includes up to 2 persona generations per month. Premium provides up to 20 persona generations per month and unlocks deeper customer intelligence such as pain points, motivations, buying triggers, objections, marketing channels, messaging recommendations, and content ideas.",
          },
        },
        {
          "@type": "Question",
          name: "What information should I provide to generate a good persona?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Start with a clear description of what you are building, the problem it solves, who you believe needs it, and why they might choose it. Additional context such as pricing, competitors, geography, product stage, existing customers, and unique features can make the resulting hypothesis more useful.",
          },
        },
        {
          "@type": "Question",
          name: "Does an AI persona generator replace customer interviews?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. AI can help structure assumptions quickly, but it does not replace direct customer research. Interviews, observations, analytics, surveys, and real product behaviour are important for determining whether the generated persona reflects reality.",
          },
        },
        {
          "@type": "Question",
          name: "How can user personas improve marketing?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A clear persona can help marketers choose more relevant messaging, address specific customer problems, identify potential acquisition channels, create more targeted content, and improve landing-page communication. The persona should be updated when new evidence changes the understanding of the customer.",
          },
        },
        {
          "@type": "Question",
          name: "How often should I update a user persona?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Update a persona whenever meaningful customer evidence changes your understanding of the audience. That can happen after customer interviews, product changes, new market evidence, major positioning changes, or changes in customer behaviour.",
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