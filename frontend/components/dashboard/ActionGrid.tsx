"use client";

import {
  Rocket,
  Globe,
  UserRound,
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
    title: "Persona Generator",
    description:
      "Build a clearer picture of your ideal customer and understand who your product is actually for.",
    href: "/person",
    icon: <UserRound size={21} />,
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
          />
        ))}
      </div>
    </section>
  );
}