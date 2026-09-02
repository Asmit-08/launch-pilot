"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import Image from "next/image";

const auditFindings = [
  {
    label: "ICP",
    score: "6.2",
    status: "Needs refinement",
    tone: "amber",
  },
  {
    label: "Positioning",
    score: "8.1",
    status: "Strong",
    tone: "emerald",
  },
  {
    label: "Validation",
    score: "5.7",
    status: "Weak evidence",
    tone: "rose",
  },
  {
    label: "Launch readiness",
    score: "7.4",
    status: "Almost ready",
    tone: "blue",
  },
];

const capabilities = [
  {
    number: "01",
    title: "Diagnose",
    headline: "Find the weak assumptions inside the startup.",
    description:
      "Pressure-test your product, customer, positioning, validation, launch readiness, and risks before deciding what deserves attention.",
  },
  {
    number: "02",
    title: "Decide",
    headline: "Know which uncertainty is worth testing next.",
    description:
      "Plavtora turns the current state of your startup into a focused next objective instead of giving you another giant list of things to do.",
  },
  {
    number: "03",
    title: "Act",
    headline: "Turn the decision into something you can actually test.",
    description:
      "Each Daily Objective gives you a concrete action, what evidence to look for, and what would count as success or failure.",
  },
  {
    number: "04",
    title: "Learn",
    headline: "Let evidence change what you do next.",
    description:
      "Record what happened, update the strength of the underlying belief, and let Plavtora identify the next unresolved decision.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Tell Plavtora what you're building",
    text: "Give it the product, target customer, traction, positioning, budget, and assumptions that matter.",
  },
  {
    number: "02",
    title: "Get the startup pressure-tested",
    text: "Plavtora examines the startup from multiple decision-making angles and surfaces the assumptions and evidence gaps that matter most.",
  },
  {
    number: "03",
    title: "Take the next Daily Objective",
    text: "Instead of a generic roadmap, Plavtora gives you one focused objective aimed at reducing the most important unresolved uncertainty.",
  },
  {
    number: "04",
    title: "Bring back the evidence",
    text: "Record what happened. Plavtora evaluates the result, updates what it believes, and determines what deserves investigation next.",
  },
];

const founderInsights = [
  {
    quote:
      "Founders don't need more content. They need help researching, challenging assumptions, and making better decisions.",
    role: "SaaS Founder",
  },
  {
    quote:
      "The real problem isn't knowing what to do. It's knowing which thing is actually worth doing next.",
    role: "Indie Hacker",
  },
  {
    quote:
      "Validation matters when it changes a decision, not simply because you completed a few interviews.",
    role: "SaaS Founder",
  },
];

function ToneDot({ tone }: { tone: string }) {
  const styles: Record<string, string> = {
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    blue: "bg-blue-500",
  };

  return <span className={`h-2 w-2 rounded-full ${styles[tone] ?? styles.blue}`} />;
}

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
    setActiveInsight((current) => (current + 1) % founderInsights.length);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f5] text-[#111113] selection:bg-violet-200">
      {/* Background system */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-15%] h-[650px] w-[650px] rounded-full bg-violet-200/35 blur-[130px]" />
        <div className="absolute right-[-12%] top-[8%] h-[600px] w-[600px] rounded-full bg-blue-200/30 blur-[130px]" />
        <div className="absolute left-[35%] top-[42%] h-[500px] w-[500px] rounded-full bg-amber-100/35 blur-[130px]" />
      </div>

      {navigatingTo && (
        <div className="fixed left-0 right-0 top-0 z-[80] h-0.5 overflow-hidden bg-black/5">
          <div className="h-full w-1/3 animate-[routeProgress_1.1s_ease-in-out_infinite] bg-[#111113]" />
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-black/[0.07] bg-[#f7f7f5]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="Plavtora"
              width={34}
              height={34}
              priority
              className="rounded-[10px]"
            />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">
              Plavtora
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <a href="#product" className="nav-link">
              Product
            </a>
            <a href="#capabilities" className="nav-link">
              Capabilities
            </a>
            <a href="#pricing" className="nav-link">
              Pricing
            </a>
            <a href="#how-it-works" className="nav-link">
              How it works
            </a>
            <Button
              type="button"
              size="sm"
              onClick={() => navigateWithLoading("/auth")}
              disabled={!!navigatingTo}
              className="ml-2 rounded-lg bg-[#111113] px-4 text-white hover:bg-black"
            >
              Start with an audit
            </Button>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => navigateWithLoading("/auth")}
            disabled={!!navigatingTo}
            className="rounded-lg bg-[#111113] px-4 text-white hover:bg-black md:hidden"
          >
            Try it
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <AnimatedSection>
        <section className="relative px-5 pb-20 pt-32 sm:px-6 sm:pt-36 lg:px-8 lg:pb-28 lg:pt-40">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
              <div className="max-w-2xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Startup decision intelligence
                </div>

                <h1 className="text-[clamp(3.1rem,6vw,5.7rem)] font-semibold leading-[0.96] tracking-[-0.055em]">
                  Stop guessing
                  <span className="block text-zinc-400">
                    what to do next.
                  </span>
                </h1>

                <p className="mt-7 max-w-xl text-[17px] leading-7 text-zinc-600 sm:text-lg">
                  Plavtora stress-tests your startup, identifies the most
                  important unresolved uncertainty, and turns it into a focused
                  next objective — then uses the evidence you bring back to
                  decide what deserves attention next.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    size="lg"
                    disabled={!!navigatingTo}
                    onClick={() => navigateWithLoading("/auth")}
                    className="h-12 rounded-xl bg-[#111113] px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(17,17,19,0.16)] hover:-translate-y-0.5 hover:bg-black"
                  >
                    {navigatingTo === "/auth"
                      ? "Opening Plavtora..."
                      : "Start with my startup"}
                    <span className="ml-1">→</span>
                  </Button>

                  <a
                    href="#product"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-black/[0.09] bg-white/65 px-6 text-sm font-semibold text-zinc-700 transition hover:bg-white"
                  >
                    See how it works
                  </a>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
                  <span>Startup audit</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-300" />
                  <span>Daily Objectives</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-300" />
                  <span>Evidence tracking</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-300" />
                  <span>Next decision</span>
                </div>
              </div>

              {/* Real-product-style hero preview */}
              <div className="relative">
                <div className="absolute -inset-8 rounded-[40px] bg-violet-200/30 blur-3xl" />

                <div className="relative overflow-hidden rounded-[28px] border border-black/[0.09] bg-[#101014] p-2 shadow-[0_35px_100px_rgba(17,17,19,0.18)]">
                  <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-white/25" />
                      <span className="h-2 w-2 rounded-full bg-white/15" />
                      <span className="h-2 w-2 rounded-full bg-white/10" />
                    </div>

                    <div className="rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[9px] text-white/40">
                      plavtora / decision engine
                    </div>

                    <span className="w-8" />
                  </div>

                  <div className="p-5 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                          Current startup state
                        </p>

                        <div className="mt-2 flex items-end gap-2">
                          <span className="text-5xl font-semibold tracking-[-0.05em] text-white">
                            68
                          </span>
                          <span className="pb-1 text-sm text-white/35">
                            /100
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.07] px-3 py-2">
                        <p className="text-[9px] uppercase tracking-[0.16em] text-amber-200/60">
                          Uncertainty
                        </p>
                        <p className="mt-1 text-xs font-medium text-amber-200">
                          ICP evidence
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-violet-400 to-blue-400" />
                    </div>

                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      {auditFindings.map((finding) => (
                        <div
                          key={finding.label}
                          className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[10px] uppercase tracking-[0.14em] text-white/35">
                              {finding.label}
                            </span>

                            <span className="flex items-center gap-1.5 text-[10px] text-white/45">
                              <ToneDot tone={finding.tone} />
                              {finding.score}
                            </span>
                          </div>

                          <p className="mt-3 text-sm font-medium text-white/80">
                            {finding.status}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 rounded-2xl border border-violet-300/10 bg-violet-300/[0.05] p-4">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-violet-200/60">
                        Today's objective
                      </p>

                      <p className="mt-2 text-sm leading-6 text-white/75">
                        Test whether your most likely ICP will take a real
                        buying action before you spend more on acquisition.
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-[10px] text-white/35">
                          Collect evidence
                        </span>

                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] text-white/55">
                          Decision in progress
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-black/[0.08] bg-white px-4 py-3 shadow-[0_15px_45px_rgba(0,0,0,0.12)] sm:block">
                  <p className="text-[9px] uppercase tracking-[0.17em] text-zinc-400">
                    Plavtora loop
                  </p>

                  <p className="mt-1.5 text-xs font-semibold text-zinc-800">
                    Decide → Act → Learn → Repeat
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-3 border-y border-black/[0.07] py-5 text-center sm:grid-cols-4">
              {[
                ["01", "Audit"],
                ["02", "Objective"],
                ["03", "Evidence"],
                ["04", "Next decision"],
              ].map(([number, label]) => (
                <div
                  key={number}
                  className="border-r border-black/[0.06] last:border-0"
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                    {number}
                  </p>

                  <p className="mt-1 text-sm font-medium text-zinc-700">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Problem */}
      <AnimatedSection>
        <section className="border-y border-black/[0.07] bg-white/45 px-5 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <p className="section-kicker">The problem</p>

            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Founders don't lack things to do.
              <span className="block text-zinc-400">
                They lack confidence about what deserves doing.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-600">
              More features, more content, and more AI-generated task lists
              don't solve that. The hard part is knowing which assumption is
              weak, which evidence matters, and which decision is worth making
              next.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Product */}
      <AnimatedSection>
        <section
          id="product"
          className="px-5 py-24 sm:px-6 lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="section-kicker">What you actually get</p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                An audit that becomes
                <span className="block text-zinc-400">
                  a decision loop.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-600">
                Plavtora starts with your startup context, identifies the
                important weaknesses and evidence gaps, then turns the current
                state into a focused objective worth testing.
              </p>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="overflow-hidden rounded-[30px] border border-black/[0.08] bg-white p-6 shadow-[0_20px_70px_rgba(0,0,0,0.06)] sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                      Audit overview
                    </p>

                    <h3 className="mt-2 text-xl font-semibold tracking-tight">
                      Understand the starting state
                    </h3>
                  </div>

                  <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-[10px] font-medium text-zinc-500">
                    Example output
                  </span>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-4">
                  {[
                    ["Product", "8.0", "Strong"],
                    ["Validation", "5.7", "Weak"],
                    ["Launch", "7.4", "Near ready"],
                    ["Risk", "6", "Review"],
                  ].map(([label, value, status]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-black/[0.07] bg-[#fafafa] p-4"
                    >
                      <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                        {label}
                      </p>

                      <p className="mt-3 text-2xl font-semibold tracking-tight">
                        {value}
                      </p>

                      <p className="mt-1 text-[10px] text-zinc-500">
                        {status}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-2xl bg-[#111113] p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                        Highest-priority uncertainty
                      </p>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                        Your ICP may be broad enough to make acquisition
                        expensive. Stronger evidence is needed before scaling
                        traffic.
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-white/55">
                      High impact
                    </span>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-violet-300/10 bg-violet-50 p-5">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-violet-500">
                    Next Daily Objective
                  </p>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-700">
                    Test whether your most likely customers will take a real
                    buying action before you invest further in acquisition.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-zinc-500">
                    <span className="rounded-full bg-white px-3 py-1.5">
                      Focused action
                    </span>
                    <span className="rounded-full bg-white px-3 py-1.5">
                      Evidence required
                    </span>
                    <span className="rounded-full bg-white px-3 py-1.5">
                      Clear success signal
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-black/[0.08] bg-[#111113] p-6 text-white shadow-[0_20px_70px_rgba(0,0,0,0.12)] sm:p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300">
                  The point
                </p>

                <p className="mt-6 text-6xl font-semibold tracking-[-0.06em]">
                  01
                </p>

                <h3 className="mt-4 text-2xl font-semibold">
                  Know what to test next.
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/50">
                  The output is not supposed to impress you. It is supposed to
                  change what you do next and give you a way to learn from what
                  actually happens.
                </p>

                <div className="mt-8 space-y-2">
                  {[
                    "Weak assumptions",
                    "Critical evidence gaps",
                    "Most important unresolved decision",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] p-3"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                      <span className="text-xs text-white/65">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Capabilities */}
      <AnimatedSection>
        <section
          id="capabilities"
          className="border-y border-black/[0.07] bg-white/50 px-5 py-24 sm:px-6 lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="section-kicker">The decision loop</p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Don't ask AI for
                <span className="block text-zinc-400">
                  a bigger task list.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
                Ask it to identify the uncertainty that matters most, tell you
                how to test it, and update the next decision from the evidence
                you bring back.
              </p>
            </div>

            <div className="mt-14 grid gap-px overflow-hidden rounded-[30px] border border-black/[0.08] bg-black/[0.08] md:grid-cols-2">
              {capabilities.map((capability) => (
                <div
                  key={capability.number}
                  className="group bg-[#f7f7f5] p-7 transition hover:bg-white sm:p-9"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400">
                      {capability.number}
                    </span>

                    <span className="h-2 w-2 rounded-full bg-zinc-300 transition group-hover:bg-violet-500" />
                  </div>

                  <p className="mt-12 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                    {capability.title}
                  </p>

                  <h3 className="mt-3 max-w-md text-2xl font-semibold tracking-tight">
                    {capability.headline}
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-600">
                    {capability.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Decision loop feature */}
      <AnimatedSection>
        <section className="px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="max-w-xl">
                <p className="section-kicker">Daily Objectives</p>

                <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  One meaningful decision
                  <span className="block text-zinc-400">
                    at a time.
                  </span>
                </h2>

                <p className="mt-6 text-base leading-7 text-zinc-600">
                  Your startup does not follow a fixed checklist. The right
                  question changes as evidence comes in. Plavtora uses the
                  current state of your startup to determine what uncertainty
                  deserves testing next.
                </p>
              </div>

              <div className="rounded-[32px] border border-black/[0.08] bg-white p-5 shadow-[0_25px_80px_rgba(0,0,0,0.07)] sm:p-7">
                <div className="rounded-[26px] bg-[#111113] p-6 text-white sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                        Today's objective
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        Validate the next uncertainty
                      </p>
                    </div>

                    <span className="rounded-full border border-violet-300/15 bg-violet-300/[0.07] px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-violet-200/70">
                      Active
                    </span>
                  </div>

                  <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
                    <p className="text-[9px] uppercase tracking-[0.17em] text-white/35">
                      What to do
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white/75">
                      Speak with five high-probability customers and ask for a
                      concrete buying action rather than general feedback.
                    </p>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                      <p className="text-[9px] uppercase tracking-[0.17em] text-white/30">
                        Success signal
                      </p>

                      <p className="mt-2 text-sm leading-6 text-white/65">
                        Customers demonstrate real buying intent.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                      <p className="text-[9px] uppercase tracking-[0.17em] text-white/30">
                        Evidence
                      </p>

                      <p className="mt-2 text-sm leading-6 text-white/65">
                        Behavioral or paid evidence.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-[10px] text-white/30">
                    Complete the objective → record what happened → get the
                    next decision.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Founder research */}
      <AnimatedSection>
        <section className="px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="section-kicker">Founder research</p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Built around the decisions founders struggle to make.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600">
                Uncertainty, weak validation, unclear ICPs, positioning drift,
                acquisition difficulty, and deciding what deserves attention
                next.
              </p>
            </div>

            <div className="mt-12 rounded-[30px] border border-black/[0.08] bg-white p-7 shadow-[0_20px_70px_rgba(0,0,0,0.05)] sm:p-10">
              <div className="flex items-center justify-between">
                <button
                  onClick={previousInsight}
                  aria-label="Previous founder insight"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] text-zinc-500 transition hover:bg-zinc-50 hover:text-black"
                >
                  ←
                </button>

                <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                  {String(activeInsight + 1).padStart(2, "0")} /{" "}
                  {String(founderInsights.length).padStart(2, "0")}
                </span>

                <button
                  onClick={nextInsight}
                  aria-label="Next founder insight"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] text-zinc-500 transition hover:bg-zinc-50 hover:text-black"
                >
                  →
                </button>
              </div>

              <div className="mx-auto mt-12 max-w-3xl text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-xl text-violet-500">
                  “
                </div>

                <blockquote className="mt-7 text-2xl font-medium leading-9 tracking-[-0.025em] text-zinc-800 sm:text-3xl">
                  “{founderInsights[activeInsight].quote}”
                </blockquote>

                <p className="mt-7 text-xs font-medium text-zinc-500">
                  {founderInsights[activeInsight].role}
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                  Anonymized founder research
                </p>
              </div>

              <div className="mt-10 flex justify-center gap-2">
                {founderInsights.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveInsight(index)}
                    aria-label={`Show founder insight ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeInsight
                        ? "w-8 bg-zinc-900"
                        : "w-1.5 bg-zinc-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Pricing */}
      <AnimatedSection>
        <section
          id="pricing"
          className="border-y border-black/[0.07] bg-white/50 px-5 py-24 sm:px-6 lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-kicker">Pricing</p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Experience the decision loop for free.
                <span className="block text-zinc-400">
                  Stay in it with Premium.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600">
                Start with your first three Daily Objectives on each project.
                Premium removes the objective limit and gives serious builders
                more capacity across the rest of Plavtora.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {/* Free */}
              <div className="rounded-[30px] border border-black/[0.08] bg-[#f7f7f5] p-7 sm:p-9">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                  Free
                </p>

                <h3 className="mt-3 text-2xl font-semibold">
                  Experience the loop
                </h3>

                <div className="mt-7 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.05em]">
                    $0
                  </span>

                  <span className="pb-1 text-sm text-zinc-400">
                    forever
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-zinc-600">
                  Understand your startup, test a few important decisions, and
                  see how Plavtora turns what happens into what you should
                  investigate next.
                </p>

                <div className="mt-7 space-y-2">
                  {[
                    ["Daily Objectives", "3 / project"],
                    ["Launch audits", "3 / month"],
                    ["AI Co-Founder chat", "3 messages / month"],
                    ["ICP / Persona analyses", "2 / month"],
                    ["Landing page analyses", "2 / month"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl border border-black/[0.07] bg-white/70 px-4 py-3"
                    >
                      <span className="text-sm text-zinc-600">{label}</span>

                      <span className="text-sm font-semibold text-zinc-800">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 space-y-3 border-t border-black/[0.07] pt-7">
                  {[
                    "Startup audit and core findings",
                    "Evidence-driven Daily Objectives",
                    "Product, validation, launch, and risk analysis",
                    "Basic ICP / persona generation",
                    "Basic landing page analysis",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex gap-3 text-sm text-zinc-600"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px]">
                        ✓
                      </span>

                      {item}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={!!navigatingTo}
                  onClick={() => navigateWithLoading("/auth")}
                  className="mt-8 h-12 w-full rounded-xl border-black/[0.09] bg-white font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  {navigatingTo === "/auth"
                    ? "Opening Plavtora..."
                    : "Start free"}
                </Button>
              </div>

              {/* Premium */}
              <div className="relative rounded-[30px] bg-[#111113] p-7 text-white shadow-[0_25px_80px_rgba(17,17,19,0.18)] sm:p-9">
                <div className="absolute right-7 top-7 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/65">
                  For serious builders
                </div>

                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300">
                  Premium
                </p>

                <h3 className="mt-3 text-2xl font-semibold">
                  Stay in the loop
                </h3>

                <div className="mt-7 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.05em]">
                    $8.99
                  </span>

                  <span className="pb-1 text-sm text-white/40">
                    / month
                  </span>
                </div>

                <p className="mt-4 max-w-lg text-sm leading-6 text-white/50">
                  Keep working with Plavtora as your startup evolves. Premium
                  gives you unlimited Daily Objectives plus deeper analysis and
                  more capacity across the rest of the platform.
                </p>

                <div className="mt-7 space-y-2">
                  {[
                    ["Daily Objectives", "Unlimited"],
                    ["Launch audits", "20 / month"],
                    ["AI Co-Founder chat", "100 messages / month"],
                    ["ICP / Persona analyses", "20 / month"],
                    ["Landing page analyses", "20 / month"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3"
                    >
                      <span className="text-sm text-white/60">{label}</span>

                      <span className="text-sm font-semibold text-white">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 space-y-3 border-t border-white/[0.08] pt-7">
                  {[
                    "Everything in Free",
                    "Unlimited Daily Objectives",
                    "Evidence-driven next objectives",
                    "Full landing page analysis including ICP alignment",
                    "Deeper Persona / ICP insights",
                    "Prioritized recommendations",
                    "Strategic guidance through AI Co-Founder chat",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex gap-3 text-sm text-white/65"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-400/10 text-[10px] text-violet-300">
                        ✓
                      </span>

                      {item}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  size="lg"
                  disabled={!!navigatingTo}
                  onClick={() => navigateWithLoading("/billing")}
                  className="mt-8 h-12 w-full rounded-xl bg-white font-semibold text-black hover:bg-zinc-100"
                >
                  {navigatingTo === "/billing"
                    ? "Opening Premium..."
                    : "Unlock Premium"}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* How it works */}
      <AnimatedSection>
        <section
          id="how-it-works"
          className="px-5 py-24 sm:px-6 lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="section-kicker">How it works</p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                From uncertainty
                <span className="block text-zinc-400">
                  to evidence, then the next decision.
                </span>
              </h2>
            </div>

            <div className="mt-14 grid gap-3 md:grid-cols-2">
              {workflow.map((step) => (
                <div
                  key={step.number}
                  className="group rounded-[24px] border border-black/[0.08] bg-white/60 p-6 transition hover:-translate-y-0.5 hover:bg-white sm:p-7"
                >
                  <div className="flex items-start gap-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xs font-medium text-zinc-500">
                      {step.number}
                    </span>

                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-zinc-600">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-black/[0.08] bg-[#111113] p-6 text-white sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-300">
                    The loop
                  </p>

                  <p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                    Audit → Decide → Act → Capture Evidence → Update → Next
                    Objective
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs text-white/45">
                  Not a fixed roadmap
                </span>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Landing page analyzer */}
      <AnimatedSection>
        <section className="px-5 py-8 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-[#111113] p-7 text-white shadow-[0_30px_100px_rgba(17,17,19,0.16)] sm:p-10 lg:p-14">
            <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-300">
                  Free landing page analyzer
                </p>

                <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  Put your landing page
                  <span className="block text-white/35">
                    under a microscope.
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-base leading-7 text-white/50">
                  See how clearly your page communicates value, positioning,
                  messaging, trust, and conversion intent before you spend more
                  on traffic.
                </p>

                <Button
                  type="button"
                  size="lg"
                  disabled={!!navigatingTo}
                  onClick={() =>
                    navigateWithLoading("/landing_page_analyzer")
                  }
                  className="mt-8 rounded-xl bg-white px-6 font-semibold text-black hover:bg-zinc-100"
                >
                  {navigatingTo === "/landing_page_analyzer"
                    ? "Opening Analyzer..."
                    : "Analyze my landing page"}
                </Button>
              </div>

              <div className="rounded-[26px] border border-white/[0.09] bg-white/[0.035] p-4">
                <div className="rounded-[22px] border border-white/[0.07] bg-[#0b0b0e] p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">
                        AI landing page analysis
                      </p>

                      <p className="mt-2 text-sm font-medium">
                        yourproduct.com
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-[10px] font-medium text-emerald-300">
                      74 / 100
                    </span>
                  </div>

                  <div className="mt-6 grid gap-2 sm:grid-cols-3">
                    {[
                      ["Messaging", "8.1"],
                      ["Clarity", "7.6"],
                      ["CTA", "6.9"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"
                      >
                        <p className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                          {label}
                        </p>

                        <p className="mt-3 text-2xl font-semibold">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-2xl border border-violet-300/10 bg-violet-300/[0.05] p-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-violet-200/60">
                      Challenge
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white/65">
                      Your headline explains what the product does, but not why
                      the target customer should care now.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Final CTA */}
      <AnimatedSection>
        <section className="px-5 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-32">
          <div className="mx-auto max-w-4xl text-center">
            <p className="section-kicker">Make the next decision better</p>

            <h2 className="mt-5 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Stop guessing.
              <span className="block text-zinc-400">
                Start learning what matters.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
              Put your startup through a second opinion, test the most
              important uncertainty, and let evidence shape the next move.
            </p>

            <Button
              type="button"
              size="lg"
              disabled={!!navigatingTo}
              onClick={() => navigateWithLoading("/auth")}
              className="mt-9 h-13 rounded-xl bg-[#111113] px-7 font-semibold text-white shadow-[0_15px_40px_rgba(17,17,19,0.15)] hover:-translate-y-0.5 hover:bg-black"
            >
              {navigatingTo === "/auth"
                ? "Opening Plavtora..."
                : "Start with my startup"}
              <span className="ml-1">→</span>
            </Button>

            <p className="mt-4 text-xs text-zinc-400">
              Start free · No credit card required
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="border-t border-black/[0.07] px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="Plavtora"
              width={24}
              height={24}
              className="rounded-lg opacity-75"
            />
            <span>© 2026 Plavtora</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Built for founders who want sharper decisions.</span>

            <Link
              href="/privacy"
              className="transition hover:text-zinc-900"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-zinc-900"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .nav-link {
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          color: rgb(113 113 122);
          transition: all 180ms ease;
        }

        .nav-link:hover {
          background: rgba(0, 0, 0, 0.035);
          color: rgb(24 24 27);
        }

        .section-kicker {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgb(124 58 237);
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