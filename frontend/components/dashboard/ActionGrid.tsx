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
      "Get an AI assessment of your product, market, validation, launch readiness and biggest risks.",
    href: "/audit",
    icon: <Rocket size={21} />,
  },
  {
    title: "Landing Page Review",
    description:
      "Find messaging, positioning, trust and conversion problems before sending more traffic.",
    href: "/landing_page_analyzer",
    icon: <Globe size={21} />,
  },
  {
    title: "AI Co-founder",
    description:
      "Have deeper strategic conversations around your product, launch and growth decisions.",
    href: "/billing",
    icon: <MessageSquare size={21} />,
    premium: true,
  },
  {
    title: "Launch Readiness",
    description:
      "Turn your product assessment into a clearer launch plan and track what still needs attention.",
    href: "/billing",
    icon: <BarChart3 size={21} />,
    premium: true,
  },
];

export default function ActionGrid() {
  return (
    <section className="mx-auto mt-8 max-w-7xl px-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Product intelligence
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            What do you want to evaluate?
          </h2>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {actions.map((action) => (
          <ActionCard
            key={action.title}
            title={action.title}
            description={action.description}
            href={action.href}
            icon={action.icon}
            premium={action.premium}
          />
        ))}
      </div>
    </section>
  );
}