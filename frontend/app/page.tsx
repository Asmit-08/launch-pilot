"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import HeroContent from "@/components/HeroContent";
import Image from "next/image";

const tools = [
  {
    number: "01",
    eyebrow: "UNDERSTAND",
    title: "Know who you're building for.",
    description:
      "Build a sharper ICP and persona from what you actually know about your product, customers, and market.",
    accent: "from-blue-500/20 to-cyan-500/5",
    icon: "◎",
  },
  {
    number: "02",
    eyebrow: "CHALLENGE",
    title: "Pressure-test your positioning.",
    description:
      "Analyze your landing page, messaging, CTA, trust signals, and conversion clarity before the market does.",
    accent: "from-violet-500/20 to-fuchsia-500/5",
    icon: "◈",
  },
  {
    number: "03",
    eyebrow: "ASSESS",
    title: "See what's actually risky.",
    description:
      "Surface product, validation, launch, competitive, and business risks that are easy to miss when you're too close to the idea.",
    accent: "from-amber-500/20 to-orange-500/5",
    icon: "△",
  },
  {
    number: "04",
    eyebrow: "DECIDE",
    title: "Know what deserves attention.",
    description:
      "Turn scattered findings into clear priorities, stronger decisions, and concrete next moves.",
    accent: "from-emerald-500/20 to-teal-500/5",
    icon: "→",
  },
];

const dashboardCards = [
  {
    label: "Overall readiness",
    value: "68",
    suffix: "/100",
    change: "+12",
    color: "blue",
  },
  {
    label: "Top risk",
    value: "ICP",
    suffix: "",
    change: "Needs work",
    color: "violet",
  },
  {
    label: "Next move",
    value: "02",
    suffix: "",
    change: "Priority",
    color: "emerald",
  },
];

const founderInsights = [
  {
    quote:
      "Founders don't need more content. They need help researching, challenging assumptions, and making better decisions.",
    role: "SaaS Founder",
    label: "Founder research insight",
  },
  {
    quote:
      "The real problem isn't knowing what to do. It's knowing which thing is actually worth doing next.",
    role: "Indie Hacker",
    label: "Founder research insight",
  },
  {
    quote:
      "Validation matters when it changes a decision, not simply because you completed a few interviews.",
    role: "SaaS Founder",
    label: "Founder research insight",
  },
  {
    quote:
      "Customer acquisition and distribution become major bottlenecks long before founders run out of things to build.",
    role: "Solo Founder",
    label: "Founder research insight",
  },
  {
    quote:
      "Founders often need help deciding what not to build as much as they need help deciding what to build.",
    role: "Product Founder",
    label: "Founder research insight",
  },
  {
    quote:
      "Strong founder decisions come from clearer evidence, not from having an AI agree with you.",
    role: "Indie SaaS Founder",
    label: "Founder research insight",
  },
];

export default function Home() {
  const router = useRouter();
  const [activeInsight, setActiveInsight] = useState(0);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const navigateWithLoading = (href: string) => {
    if (navigatingTo) return;
    setNavigatingTo(href);
    router.push(href);
  };

  const previousInsight = () => {
    setActiveInsight((current) =>
      current === 0 ? founderInsights.length - 1 : current - 1
    );
  };

  const nextInsight = () => {
    setActiveInsight(
      (current) => (current + 1) % founderInsights.length
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-violet-500/30">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-20%] top-[-18%] h-[700px] w-[700px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute right-[-15%] top-[8%] h-[650px] w-[650px] rounded-full bg-violet-600/10 blur-[150px]" />

        <div className="absolute left-[25%] top-[30%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.04] blur-[150px]" />

        <div className="absolute bottom-[-20%] right-[10%] h-[700px] w-[700px] rounded-full bg-fuchsia-500/[0.04] blur-[180px]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black_0%,transparent_82%)]" />
      </div>

      {navigatingTo && (
        <div className="fixed left-0 right-0 top-0 z-[70] h-0.5 overflow-hidden bg-white/[0.04]">
          <div className="h-full w-1/3 animate-[routeProgress_1.1s_ease-in-out_infinite] bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400" />
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-black/55 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="Plavtora"
              width={38}
              height={38}
              priority
              className="rounded-xl"
            />

            <span className="text-lg font-semibold tracking-tight">
              Plavtora
            </span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <a
              href="#product"
              className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Product
            </a>

            <a
              href="#features"
              className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Features
            </a>

            <a
              href="#pricing"
              className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Pricing
            </a>

            <a
              href="#how-it-works"
              className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              How it works
            </a>

            <Button asChild className="ml-2">
              <Link href="/auth?redirect=/audit">Try Plavtora</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Button asChild size="sm">
              <Link href="/auth?redirect=/audit">Try it</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <AnimatedSection>
        <section className="relative z-10 px-6 pb-20 pt-36 sm:pt-44 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
              <div className="max-w-3xl">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.06] px-4 py-2 text-xs font-medium tracking-wide text-violet-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                  BUILT FOR FOUNDERS
                </div>

                <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl xl:text-[82px]">
                  Your startup
                  <span className="block bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                    needs a second opinion.
                  </span>
                </h1>

                <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
                  Plavtora challenges your assumptions, analyzes your product,
                  and helps you figure out what actually deserves your
                  attention next.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    size="lg"
                    disabled={!!navigatingTo}
                    onClick={() =>
                      navigateWithLoading("/auth?redirect=/audit")
                    }
                    className="h-13 rounded-xl px-7 text-sm font-semibold shadow-[0_0_40px_rgba(139,92,246,0.18)] disabled:cursor-wait disabled:opacity-90"
                  >
                    {navigatingTo === "/auth?redirect=/audit" ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                        Starting Plavtora...
                      </span>
                    ) : (
                      "Run your startup through Plavtora"
                    )}
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-13 rounded-xl border-white/10 bg-white/[0.02] px-7 text-sm font-semibold text-zinc-200 hover:bg-white/[0.06]"
                  >
                    <a href="#product">See how it works</a>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-500">
                  <span>Launch analysis</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-700" />
                  <span>ICP & persona</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-700" />
                  <span>Landing pages</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-700" />
                  <span>Risk analysis</span>
                </div>
              </div>

              {/* Hero product panel */}
              <div className="relative">
                <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-blue-500/10 via-violet-500/[0.08] to-transparent blur-3xl" />

                <div className="relative rounded-[28px] border border-white/10 bg-[#0a0a0d]/95 p-3 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400/70" />
                      <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
                      <span className="h-2 w-2 rounded-full bg-green-400/70" />
                    </div>

                    <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] text-zinc-500">
                      plavtora.com/dashboard
                    </div>

                    <div className="w-10" />
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                          Startup overview
                        </p>

                        <h3 className="mt-2 text-xl font-semibold">
                          Your next moves
                        </h3>
                      </div>

                      <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-2 text-right">
                        <p className="text-[9px] uppercase tracking-wider text-emerald-400/70">
                          Status
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-emerald-300">
                          Review
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {dashboardCards.map((card, index) => (
                        <div
                          key={card.label}
                          className={`animate-[float_5s_ease-in-out_infinite] rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 ${
                            index === 1 ? "[animation-delay:700ms]" : ""
                          } ${index === 2 ? "[animation-delay:1400ms]" : ""}`}
                        >
                          <p className="text-[10px] text-zinc-500">
                            {card.label}
                          </p>

                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-2xl font-semibold">
                              {card.value}
                            </span>

                            {card.suffix && (
                              <span className="text-xs text-zinc-600">
                                {card.suffix}
                              </span>
                            )}
                          </div>

                          <p
                            className={`mt-2 text-[10px] ${
                              card.color === "emerald"
                                ? "text-emerald-400"
                                : card.color === "violet"
                                  ? "text-violet-400"
                                  : "text-blue-400"
                            }`}
                          >
                            {card.change}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                            Priority
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            Tighten ICP before increasing acquisition.
                          </p>
                        </div>

                        <div className="rounded-lg border border-violet-400/15 bg-violet-400/[0.07] px-2.5 py-1.5 text-[10px] text-violet-300">
                          High impact
                        </div>
                      </div>

                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                        <div className="h-full w-[72%] animate-[loadbar_2s_ease-out_forwards] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-blue-400/10 bg-blue-400/[0.04] p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300/70">
                          Landing page
                        </p>

                        <div className="mt-2 flex items-end justify-between">
                          <span className="text-2xl font-semibold">74</span>

                          <span className="text-xs text-blue-300">
                            Good foundation
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300/70">
                          Risk
                        </p>

                        <div className="mt-2 flex items-end justify-between">
                          <span className="text-2xl font-semibold">3</span>

                          <span className="text-xs text-amber-300">
                            Needs review
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/10 bg-[#0c0c10]/95 px-4 py-3 shadow-2xl sm:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      ✦
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        AI challenge
                      </p>

                      <p className="mt-1 text-xs font-medium">
                        Your assumption may be weak.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-24 flex justify-center">
              <a
                href="#product"
                className="group flex flex-col items-center gap-3 text-zinc-600 transition hover:text-zinc-400"
              >
                <span className="text-[10px] uppercase tracking-[0.22em]">
                  Explore
                </span>

                <span className="flex h-10 w-7 items-start justify-center rounded-full border border-white/10 p-1">
                  <span className="h-2 w-1 animate-bounce rounded-full bg-zinc-500" />
                </span>
              </a>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Thesis */}
      <AnimatedSection>
        <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.015] px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-violet-300">
              The problem
            </p>

            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Founders don't lack things to do.
              <span className="block text-zinc-500">
                They lack confidence about what deserves doing.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-zinc-400">
              More features, more content, more dashboards, more AI-generated
              tasks won't solve that. The hard part is knowing which
              assumptions are strong, which are weak, and what to do next.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Product */}
      <AnimatedSection>
        <section id="product" className="relative z-10 px-6 py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.7fr]">
              <div className="max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-blue-300">
                  One founder workspace
                </p>

                <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  Your startup's intelligence layer.
                </h2>
              </div>

              <p className="max-w-xl text-base leading-7 text-zinc-500 lg:justify-self-end">
                Bring the important pieces of your startup into one place and
                use AI to examine them from multiple angles—not just generate
                more output.
              </p>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-white/15">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.08] via-transparent to-transparent opacity-70" />

                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">
                        Startup command center
                      </p>

                      <h3 className="mt-3 text-2xl font-semibold">
                        See the whole picture.
                      </h3>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-500">
                      Live analysis
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Product", "Strong differentiation"],
                      ["Customer", "ICP needs refinement"],
                      ["Positioning", "Clear but broad"],
                      ["Risk", "Acquisition is weak"],
                    ].map(([label, value], index) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/[0.07] bg-black/20 p-4 transition duration-300 group-hover:border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500">
                            {label}
                          </span>

                          <span className="text-[10px] text-zinc-700">
                            0{index + 1}
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-medium text-zinc-200">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-violet-400/10 bg-violet-400/[0.035] p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                        ✦
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-violet-300/70">
                          Plavtora challenge
                        </p>

                        <p className="mt-2 text-sm leading-6 text-zinc-300">
                          You are focusing on feature depth before proving
                          the acquisition channel.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025] p-7">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] to-transparent" />

                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300">
                    Next best action
                  </p>

                  <div className="mt-5 text-6xl font-semibold tracking-tight">
                    02
                  </div>

                  <p className="mt-3 text-lg font-medium">
                    Customer conversations
                  </p>

                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Gather stronger evidence before investing further in
                    acquisition.
                  </p>

                  <div className="mt-8 space-y-3">
                    {[
                      "Talk to 5 target users",
                      "Compare objections",
                      "Update ICP assumptions",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-[10px] text-zinc-500">
                          {index + 1}
                        </span>

                        <span className="text-xs text-zinc-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Features */}
      <AnimatedSection>
        <section id="features" className="relative z-10 px-6 py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-300">
                Built for the hard parts
              </p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Not another AI that
                <span className="block text-zinc-500">
                  tells you what you want to hear.
                </span>
              </h2>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-2">
              {tools.map((tool) => (
                <div
                  key={tool.number}
                  className={`group relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br ${tool.accent} p-7 transition duration-500 hover:-translate-y-1 hover:border-white/15`}
                >
                  <div className="absolute right-[-30px] top-[-30px] text-[180px] font-semibold leading-none text-white/[0.02] transition duration-700 group-hover:text-white/[0.04]">
                    {tool.number}
                  </div>

                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-lg text-zinc-300">
                        {tool.icon}
                      </span>

                      <span className="text-[10px] tracking-[0.2em] text-zinc-600">
                        {tool.number}
                      </span>
                    </div>

                    <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                      {tool.eyebrow}
                    </p>

                    <h3 className="mt-3 max-w-lg text-2xl font-semibold tracking-tight">
                      {tool.title}
                    </h3>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">
                      {tool.description}
                    </p>

                    <div className="mt-7 flex items-center gap-2 text-xs font-medium text-zinc-400 transition group-hover:text-white">
                      Explore capability
                      <span className="transition duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Founder research insights */}
      <AnimatedSection>
        <section className="relative z-10 overflow-hidden px-6 py-28 lg:px-8">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.04] blur-[140px]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-violet-300">
                Built from founder conversations
              </p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                The problems founders keep running into.
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-500">
                Plavtora is shaped around recurring problems founders describe:
                uncertainty, weak validation, unclear ICPs, positioning drift,
                acquisition difficulty, and deciding what deserves attention.
              </p>
            </div>

            <div className="mt-16">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={previousInsight}
                  aria-label="Previous founder insight"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  ←
                </button>

                <div className="flex items-center gap-2">
                  {founderInsights.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveInsight(index)}
                      aria-label={`Show insight ${index + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === activeInsight
                          ? "w-8 bg-violet-400"
                          : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextInsight}
                  aria-label="Next founder insight"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  →
                </button>
              </div>

              <div className="mx-auto mt-10 flex max-w-5xl items-center justify-center">
                <div className="grid w-full gap-4 md:grid-cols-3">
                  {[1, 0, 2].map((offset) => {
                    const index =
                      (activeInsight + offset) % founderInsights.length;

                    const insight = founderInsights[index];
                    const isActive = offset === 0;

                    return (
                      <button
                        key={`${index}-${offset}`}
                        onClick={() => setActiveInsight(index)}
                        className={`group relative text-left transition-all duration-500 ${
                          isActive
                            ? "z-20 scale-[1.03] md:-translate-y-3"
                            : "scale-100 opacity-60 hover:opacity-90"
                        }`}
                      >
                        <div
                          className={`absolute -inset-px rounded-[26px] transition-all duration-500 ${
                            isActive
                              ? "bg-gradient-to-br from-violet-400/40 via-blue-400/15 to-transparent opacity-100 blur-[1px]"
                              : "bg-white/5 opacity-0"
                          }`}
                        />

                        <div
                          className={`relative h-full rounded-[26px] border bg-[#0a0a0d]/95 p-7 transition-all duration-500 ${
                            isActive
                              ? "border-violet-400/25 shadow-[0_20px_80px_rgba(139,92,246,0.12)]"
                              : "border-white/[0.07]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-500 ${
                                isActive
                                  ? "border-violet-400/20 bg-violet-400/[0.08] text-violet-300"
                                  : "border-white/10 bg-white/[0.03] text-zinc-500"
                              }`}
                            >
                              “
                            </div>

                            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                              Insight {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <p
                            className={`mt-7 leading-7 transition-all duration-500 ${
                              isActive
                                ? "text-lg text-zinc-200"
                                : "text-sm text-zinc-500"
                            }`}
                          >
                            “{insight.quote}”
                          </p>

                          <div className="mt-8 border-t border-white/[0.06] pt-5">
                            <p
                              className={`text-xs font-medium transition-all duration-500 ${
                                isActive ? "text-zinc-200" : "text-zinc-400"
                              }`}
                            >
                              {insight.role}
                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                              {insight.label}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mt-8 text-center text-[10px] text-zinc-700">
                Anonymized founder research · Statements are presented as
                research insights, not customer testimonials.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Pricing */}
      <AnimatedSection>
        <section
          id="pricing"
          className="relative z-10 overflow-hidden px-6 py-28 lg:px-8"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.035] blur-[150px]" />

          <div className="relative mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-violet-300">
                Simple pricing
              </p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Start free.
                <span className="block text-zinc-500">
                  Go deeper when you need to.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-500">
                Get useful answers for free. Upgrade when you need deeper
                analysis, stronger recommendations, and a more complete view
                of your startup.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2">
              {/* Free */}
              <div className="relative rounded-[30px] border border-white/[0.08] bg-white/[0.02] p-7 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Free
                    </p>

                    <h3 className="mt-3 text-2xl font-semibold">
                      Explore Plavtora
                    </h3>
                  </div>

                  <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                    FREE
                  </div>
                </div>

                <div className="mt-8 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-tight">
                    $0
                  </span>

                  <span className="text-sm text-zinc-600">forever</span>
                </div>

                <p className="mt-4 text-sm leading-6 text-zinc-500">
                  Enough to understand where your startup stands before
                  deciding whether you need more.
                </p>

                <div className="mt-7 h-px bg-white/[0.06]" />

                <div className="mt-7 space-y-3">
                  {[
                    "Overall analysis scores",
                    "Executive summaries",
                    "Basic messaging analysis",
                    "Useful first-pass insights",
                    "Access to selected free tools",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 text-sm text-zinc-400"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[10px] text-zinc-500">
                        ✓
                      </span>

                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={!!navigatingTo}
                  onClick={() =>
                    navigateWithLoading("/auth?redirect=/dashboard")
                  }
                  className="mt-9 h-12 w-full rounded-xl border-white/10 bg-white/[0.02] text-sm font-semibold hover:bg-white/[0.05] disabled:cursor-wait disabled:opacity-90"
                >
                  {navigatingTo === "/auth?redirect=/dashboard" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Opening Plavtora...
                    </span>
                  ) : (
                    "Start Free"
                  )}
                </Button>
              </div>

              {/* Premium */}
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-[31px] bg-gradient-to-br from-violet-400/40 via-blue-400/15 to-transparent opacity-90 blur-[1px]" />

                <div className="relative overflow-hidden rounded-[30px] border border-violet-400/20 bg-[#0a0a0e] p-7 shadow-[0_25px_100px_rgba(139,92,246,0.12)] sm:p-8">
                  <div className="absolute right-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-violet-500/[0.08] blur-[80px]" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-300">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                          Best for serious builders
                        </div>

                        <h3 className="mt-4 text-2xl font-semibold">
                          Plavtora Premium
                        </h3>
                      </div>

                      <div className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-medium text-emerald-300">
                        Full access
                      </div>
                    </div>

                    <div className="mt-8 flex items-end gap-2">
                      <span className="text-5xl font-semibold tracking-tight">
                        $8.99
                      </span>

                      <span className="pb-1 text-sm text-zinc-500">
                        / month
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className="rounded-full bg-violet-400/[0.08] px-2.5 py-1 text-[10px] font-medium text-violet-300">
                        Monthly subscription
                      </span>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-zinc-400">
                      Unlock the deeper layer of Plavtora: more context,
                      sharper diagnosis, and actionable recommendations.
                    </p>

                    <div className="mt-7 h-px bg-white/[0.07]" />

                    <div className="mt-7 space-y-3">
                      {[
                        "Everything in Free",
                        "Full ICP alignment analysis",
                        "CTA & conversion analysis",
                        "Trust & credibility analysis",
                        "Conversion clarity breakdown",
                        "Conversion problems",
                        "Prioritized recommendations",
                        "Deeper Persona / ICP insights",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className={`flex items-start gap-3 text-sm ${
                            index === 0
                              ? "text-zinc-300"
                              : "text-zinc-400"
                          }`}
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-400/[0.1] text-[10px] text-violet-300">
                            ✓
                          </span>

                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      size="lg"
                      disabled={!!navigatingTo}
                      onClick={() => navigateWithLoading("/billing")}
                      className="mt-9 h-12 w-full rounded-xl bg-white text-sm font-semibold text-black shadow-[0_0_40px_rgba(139,92,246,0.14)] transition hover:-translate-y-0.5 hover:bg-zinc-100 disabled:cursor-wait disabled:opacity-90"
                    >
                      {navigatingTo === "/billing" ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                          Opening Premium...
                        </span>
                      ) : (
                        "Upgrade to Premium"
                      )}
                    </Button>

                    <p className="mt-3 text-center text-[10px] text-zinc-700">
                      Premium subscription
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[10px] uppercase tracking-[0.16em] text-zinc-700">
              <span>Free plan available</span>

              <span className="h-1 w-1 rounded-full bg-zinc-800" />

              <span>Premium at $8.99/month</span>

              <span className="h-1 w-1 rounded-full bg-zinc-800" />

              <span>Deeper analysis when you need it</span>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* How it works */}
      <AnimatedSection>
        <section
          id="how-it-works"
          className="relative z-10 border-y border-white/[0.06] bg-white/[0.012] px-6 py-28 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-300">
                  The workflow
                </p>

                <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  From uncertainty
                  <span className="block text-zinc-500">
                    to a clearer next move.
                  </span>
                </h2>

                <p className="mt-6 max-w-md text-base leading-7 text-zinc-500">
                  Plavtora is built around the founder's actual problem:
                  deciding what deserves attention when the information is
                  incomplete.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    number: "01",
                    title: "Bring the evidence",
                    text: "Your product, audience, landing page, competitors, traction, pricing, and assumptions.",
                  },
                  {
                    number: "02",
                    title: "Challenge the assumptions",
                    text: "Plavtora examines the weak points and highlights where your reasoning is unsupported.",
                  },
                  {
                    number: "03",
                    title: "See what matters",
                    text: "Separate important problems from noise and distinguish current state from suggestions.",
                  },
                  {
                    number: "04",
                    title: "Act on the next move",
                    text: "Leave with clearer priorities instead of another pile of AI-generated tasks.",
                  },
                ].map((step, index) => (
                  <div
                    key={step.number}
                    className="group flex gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition duration-300 hover:border-white/[0.13] hover:bg-white/[0.03]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-xs text-zinc-500 transition group-hover:border-violet-400/20 group-hover:text-violet-300">
                      {step.number}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">{step.title}</h3>

                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {step.text}
                      </p>
                    </div>

                    {index < 3 && (
                      <div className="ml-auto hidden self-center text-zinc-700 sm:block">
                        ↓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Landing Page Analyzer */}
      <AnimatedSection>
        <section className="relative z-10 px-6 py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a0d] p-7 sm:p-10 lg:p-12">
              <div className="absolute right-[-120px] top-[-140px] h-[500px] w-[500px] rounded-full bg-blue-600/[0.08] blur-[120px]" />

              <div className="absolute bottom-[-180px] left-[-100px] h-[500px] w-[500px] rounded-full bg-violet-600/[0.08] blur-[120px]" />

              <div className="relative grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-300">
                    Free tool
                  </p>

                  <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                    Put your landing page
                    <span className="block text-zinc-500">
                      under a microscope.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-xl text-base leading-7 text-zinc-500">
                    See how clearly your page communicates value, positioning,
                    messaging, and conversion intent before spending more on
                    traffic.
                  </p>

                  <div className="mt-8">
                    <Button
                      type="button"
                      size="lg"
                      disabled={!!navigatingTo}
                      onClick={() =>
                        navigateWithLoading("/landing_page_analyzer")
                      }
                      className="rounded-xl px-6 disabled:cursor-wait disabled:opacity-90"
                    >
                      {navigatingTo === "/landing_page_analyzer" ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                          Opening Analyzer...
                        </span>
                      ) : (
                        "Analyze a landing page"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/[0.08] bg-black/30 p-4">
                  <div className="rounded-[22px] border border-white/[0.06] bg-[#0c0c10] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                          AI landing page analysis
                        </p>

                        <p className="mt-2 text-sm font-medium">
                          yourproduct.com
                        </p>
                      </div>

                      <div className="rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-1 text-[10px] text-emerald-300">
                        74/100
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <p className="text-[10px] text-zinc-600">Messaging</p>
                        <p className="mt-3 text-2xl font-semibold">8.1</p>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <p className="text-[10px] text-zinc-600">Clarity</p>
                        <p className="mt-3 text-2xl font-semibold">7.6</p>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <p className="text-[10px] text-zinc-600">CTA</p>
                        <p className="mt-3 text-2xl font-semibold">6.9</p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl border border-violet-400/10 bg-violet-400/[0.035] p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-violet-300/70">
                        Challenge
                      </p>

                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        Your headline explains what the product does, but not
                        why the target customer should care now.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Final CTA */}
      <AnimatedSection>
        <section className="relative z-10 px-6 pb-28 pt-16 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-violet-300">
              Build with more certainty
            </p>

            <h2 className="mt-5 text-5xl font-semibold tracking-[-0.045em] sm:text-6xl">
              Stop guessing what matters.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-500">
              Put your startup through a second opinion before the market does.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                disabled={!!navigatingTo}
                onClick={() =>
                  navigateWithLoading("/auth?redirect=/audit")
                }
                className="rounded-xl px-7 shadow-[0_0_40px_rgba(139,92,246,0.16)] disabled:cursor-wait disabled:opacity-90"
              >
                {navigatingTo === "/auth?redirect=/audit" ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                    Starting Plavtora...
                  </span>
                ) : (
                  "Start with Plavtora"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={!!navigatingTo}
                onClick={() =>
                  navigateWithLoading("/landing_page_analyzer")
                }
                className="rounded-xl border-white/10 bg-white/[0.02] px-7 hover:bg-white/[0.05] disabled:cursor-wait disabled:opacity-90"
              >
                {navigatingTo === "/landing_page_analyzer" ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Opening Analyzer...
                  </span>
                ) : (
                  "Analyze a landing page"
                )}
              </Button>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-zinc-600 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="Plavtora"
              width={24}
              height={24}
              className="rounded-lg opacity-80"
            />

            <span>© 2026 Plavtora</span>
          </div>

          <span>Built for founders who want sharper decisions.</span>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes loadbar {
          from {
            width: 0%;
          }

          to {
            width: 72%;
          }
        }

        @keyframes routeProgress {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(320%);
          }
        }
      `}</style>
    </main>
  );
}