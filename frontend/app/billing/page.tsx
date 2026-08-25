"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
  Loader2,
  Zap,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

const freeFeatures = [
  "3 Launch Audits per month",
  "3 AI Co-Founder messages per month",
  "2 ICP / Persona analyses per month",
  "2 Landing Page Analyses per month",
  "Overall analysis scores",
  "Executive summaries",
  "Basic messaging analysis",
  "Useful first-pass insights",
  "Access to selected free tools",
];

const premiumFeatures = [
  "20 Launch Audits per month",
  "100 AI Co-Founder messages per month",
  "20 ICP / Persona analyses per month",
  "20 Landing Page Analyses per month",
  "Full ICP alignment analysis",
  "CTA & conversion analysis",
  "Trust & credibility analysis",
  "Conversion clarity breakdown",
  "Conversion problems and risks",
  "Prioritized recommendations",
  "Deeper Persona / ICP insights",
  "Premium AI decision support",
];

export default function BillingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPlan() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace(
            `/auth?redirect=${encodeURIComponent("/billing")}`
          );
          return;
        }

        const apiBaseUrl =
          "https://launch-pilot-backend.onrender.com";

        const response = await fetch(
          `${apiBaseUrl}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (mounted) {
            setIsPremium(
              data?.subscription === "premium"
            );
          }
        }
      } catch (err) {
        console.error(
          "Failed to load billing state:",
          err
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPlan();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleUpgrade() {
    setError("");

    try {
      setCheckoutLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push(
          `/auth?redirect=${encodeURIComponent("/billing")}`
        );
        return;
      }

      const apiBaseUrl =
        "https://launch-pilot-backend.onrender.com";

      const response = await fetch(
        `${apiBaseUrl}/billing/create-checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to start Premium checkout."
        );
      }

      if (!data?.checkout_url) {
        throw new Error(
          "Dodo did not return a checkout URL."
        );
      }

      window.location.href = data.checkout_url;
    } catch (err) {
      console.error(
        "Upgrade flow failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start checkout."
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return <BillingLoader />;
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[-180px] h-[550px] w-[550px] rounded-full bg-violet-100/60 blur-[140px]" />

        <div className="absolute right-[-180px] top-[5%] h-[600px] w-[600px] rounded-full bg-blue-100/50 blur-[150px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3"
          >
            <img
              src="/icon.png"
              alt="Plavtora"
              className="h-9 w-9 rounded-xl"
            />

            <div className="text-left">
              <p className="text-[17px] font-bold tracking-tight text-slate-950">
                Plavtora
              </p>

              <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
                Startup decision intelligence
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
        {/* Hero */}
        <section className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
            <Sparkles size={13} />
            Plavtora Premium
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl">
            Get more than a signal.
            <span className="block text-slate-400">
              Get a deeper diagnosis.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Free gives you a real starting point. Premium gives you
            significantly more analysis capacity and deeper intelligence
            when you're ready to keep working on the problem.
          </p>
        </section>

        {/* Existing premium state */}
        {isPremium && (
          <div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm font-medium text-emerald-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
              <Check size={15} />
            </span>

            You already have active Plavtora Premium access.
          </div>
        )}

        {/* Pricing */}
        <section className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Free */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Free
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                  Get the signal
                </h2>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                $0
              </span>
            </div>

            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-[-0.05em]">
                $0
              </span>

              <span className="text-sm text-slate-400">
                forever
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              A genuinely useful starting plan. Understand your startup,
              test Plavtora, and see whether deeper analysis is worth it.
            </p>

            <div className="mt-8 border-t border-slate-100 pt-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Included
              </p>

              <div className="mt-5 space-y-3">
                {freeFeatures.map((feature) => (
                  <FeatureItem
                    key={feature}
                    text={feature}
                    premium={false}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-9 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Continue with Free
            </button>
          </div>

          {/* Premium */}
          <div className="relative">
            <div className="absolute -inset-px rounded-[29px] bg-gradient-to-br from-violet-300 via-blue-200 to-transparent" />

            <div className="relative h-full overflow-hidden rounded-[28px] border border-violet-200 bg-white p-7 shadow-[0_25px_80px_rgba(99,102,241,0.12)] sm:p-8">
              <div className="absolute right-[-100px] top-[-100px] h-72 w-72 rounded-full bg-violet-100/80 blur-3xl" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-700">
                      <Zap size={12} />
                      For serious builders
                    </div>

                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                      Plavtora Premium
                    </h2>
                  </div>

                  <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 sm:block">
                    Best value
                  </span>
                </div>

                <div className="mt-8 flex items-end gap-2">
                  <span className="text-5xl font-bold tracking-[-0.05em] text-slate-950">
                    $8.99
                  </span>

                  <span className="pb-1 text-sm text-slate-400">
                    / month
                  </span>
                </div>

                <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">
                  More capacity and deeper intelligence for founders who
                  want to repeatedly analyze, challenge, and improve their
                  startup.
                </p>

                {/* Main value strip */}
                <div className="mt-7 grid gap-2 sm:grid-cols-3">
                  <ValueBlock
                    value="20"
                    label="Launch audits"
                  />

                  <ValueBlock
                    value="100"
                    label="AI messages"
                  />

                  <ValueBlock
                    value="20"
                    label="Landing analyses"
                  />
                </div>

                <div className="mt-7 border-t border-slate-100 pt-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                    Everything you get
                  </p>

                  <div className="mt-5 space-y-3">
                    {premiumFeatures.map((feature) => (
                      <FeatureItem
                        key={feature}
                        text={feature}
                        premium
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={
                    isPremium || checkoutLoading
                  }
                  className="mt-9 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(15,23,42,0.15)] transition hover:-translate-y-0.5 hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPremium ? (
                    "Premium Active"
                  ) : checkoutLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Preparing checkout...
                    </>
                  ) : (
                    <>
                      Upgrade to Premium
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs leading-5 text-red-600">
                    {error}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                  <ShieldCheck size={13} />
                  Monthly subscription · Limits reset monthly
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Decision section */}
        <section className="mx-auto mt-12 max-w-5xl">
          <div className="rounded-[26px] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                The difference
              </p>

              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                Free helps you diagnose.
                Premium helps you keep going.
              </h3>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Premium isn't about hiding the useful part behind a paywall.
                It gives you substantially more room to run the workflow
                repeatedly and access deeper decision support.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <DecisionCard
                number="01"
                title="Test"
                description="Use the free plan to understand your startup and see whether Plavtora finds useful problems."
              />

              <DecisionCard
                number="02"
                title="Go deeper"
                description="Premium gives you much higher limits and deeper analysis when you need more than a first pass."
              />

              <DecisionCard
                number="03"
                title="Iterate"
                description="Keep auditing, questioning assumptions, and improving instead of stopping after a single pass."
              />
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="mx-auto mt-8 max-w-5xl">
          <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-7 py-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Monthly limits
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-950">
                More room to analyze, iterate, and decide.
              </h3>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <span>Capability</span>

                  <span className="text-center">
                    Free
                  </span>

                  <span className="text-center text-violet-600">
                    Premium
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  <LimitRow
                    label="Launch Audits"
                    free="3 / month"
                    premium="20 / month"
                  />

                  <LimitRow
                    label="AI Co-Founder messages"
                    free="3 / month"
                    premium="100 / month"
                  />

                  <LimitRow
                    label="ICP / Persona analyses"
                    free="2 / month"
                    premium="20 / month"
                  />

                  <LimitRow
                    label="Landing Page Analyses"
                    free="2 / month"
                    premium="20 / month"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom trust */}
        <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 text-center text-xs text-slate-400">
          <ShieldCheck size={15} />
          Secure checkout · Cancel according to your subscription terms
        </div>
      </div>
    </main>
  );
}

function FeatureItem({
  text,
  premium,
}: {
  text: string;
  premium: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          premium
            ? "bg-violet-50 text-violet-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </span>

      <span
        className={`text-sm leading-6 ${
          premium
            ? "text-slate-700"
            : "text-slate-600"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

function ValueBlock({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
      <p className="text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700">
        {label}
      </p>
    </div>
  );
}

function DecisionCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <span className="text-[10px] font-bold tracking-[0.16em] text-violet-600">
        {number}
      </span>

      <h4 className="mt-4 font-bold text-slate-950">
        {title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function LimitRow({
  label,
  free,
  premium,
}: {
  label: string;
  free: string;
  premium: string;
}) {
  return (
    <div className="grid grid-cols-3 items-center px-6 py-4 text-sm">
      <span className="font-medium text-slate-600">
        {label}
      </span>

      <span className="text-center text-slate-400">
        {free}
      </span>

      <span className="text-center font-bold text-violet-700">
        {premium}
      </span>
    </div>
  );
}

function BillingLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950">
          <Loader2
            size={20}
            className="animate-spin text-white"
          />
        </div>

        <p className="text-sm font-medium text-slate-500">
          Loading your plan...
        </p>
      </div>
    </main>
  );
}