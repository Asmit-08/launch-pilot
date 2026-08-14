"use client";

import {
  Rocket,
  Globe,
  MessageSquare,
  BarChart3,
} from "lucide-react";

import ActionCard from "./ActionCard";

const actions = [
  {
    title: "Run SaaS Audit",
    description:
      "Validate your SaaS before investing months building it.",
    href: "/audit",
    icon: <Rocket size={24} />,
  },
  {
    title: "Landing Page Review",
    description:
      "Analyze your landing page and improve messaging, trust and conversions.",
    href: "/landing_page_analyzer",
    icon: <Globe size={24} />,
  },
  {
    title: "AI Co-founder",
    description:
      "Brainstorm ideas, solve launch problems and refine your strategy.",
    href: "#",
    icon: <MessageSquare size={24} />,
    disabled: true,
    badge: "Coming Soon",
  },
  {
    title: "Launch Readiness",
    description:
      "Track your launch progress and prepare for release.",
    href: "#",
    icon: <BarChart3 size={24} />,
    disabled: true,
    badge: "Coming Soon",
  },
];

export default function ActionGrid() {
  return (
    <section className="mx-auto mt-10 max-w-7xl px-6">
      <div className="grid gap-6 md:grid-cols-2">
        {actions.map((action) => (
          <ActionCard
            key={action.title}
            title={action.title}
            description={action.description}
            href={action.href}
            icon={action.icon}
            disabled={action.disabled}
            badge={action.badge}
          />
        ))}
      </div>
    </section>
  );
}