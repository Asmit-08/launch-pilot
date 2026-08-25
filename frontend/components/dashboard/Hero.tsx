"use client";

import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

interface HeroProps {
  name?: string;
}

export default function Hero({
  name = "Founder",
}: HeroProps) {
  const hour = new Date().getHours();

  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pt-10">
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-violet-100 blur-3xl" />

        <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
          {/* Copy */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Sparkles size={15} />
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Founder workspace
              </span>
            </div>

            <p className="text-sm font-medium text-blue-600">
              {greeting}, {name}
            </p>

            <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Make better SaaS decisions{" "}
              <span className="text-slate-400">
                before you spend months building.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Validate your product, analyze your positioning, and identify
              launch risks with AI-powered decision support built for founders.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/audit";
                }}
                className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Run a SaaS Audit
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <ShieldCheck size={16} className="text-emerald-600" />
                No credit card required to start
              </div>
            </div>
          </div>

          {/* Decision card */}
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:w-[300px]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your next move
            </p>

            <h2 className="mt-3 text-lg font-bold text-slate-900">
              Test the idea before investing more time.
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Start with an audit and let Plavtora identify the biggest
              opportunities and risks.
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/audit";
              }}
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:shadow-sm"
            >
              Start now
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}