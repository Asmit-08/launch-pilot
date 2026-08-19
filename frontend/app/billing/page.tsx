"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (mounted) {
            setIsPremium(data?.subscription === "premium");
          }
        }
      } catch (err) {
        console.error("Failed to load billing state:", err);
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
          data?.detail || "Unable to start Premium checkout."
        );
      }

      if (!data?.checkout_url) {
        throw new Error(
          "Dodo did not return a checkout URL."
        );
      }

      window.location.href = data.checkout_url;
    } catch (err) {
      console.error("Upgrade flow failed:", err);

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
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/[0.06] blur-[150px]" />
        </div>

        <div className="relative flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />

          <p className="text-sm text-zinc-500">
            Loading your plan...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-15%] top-[-15%] h-[700px] w-[700px] rounded-full bg-blue-600/[0.07] blur-[160px]" />

        <div className="absolute right-[-15%] top-[5%] h-[700px] w-[700px] rounded-full bg-violet-600/[0.08] blur-[170px]" />

        <div className="absolute bottom-[-20%] left-[25%] h-[600px] w-[600px] rounded-full bg-fuchsia-500/[0.04] blur-[160px]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>

      <header className="relative z-10 border-b border-white/[0.06] bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.06] text-violet-300">
              P
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Plavtora
            </span>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.07] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
            Plavtora Premium
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Make better startup decisions
            <span className="block text-zinc-500">
              with deeper intelligence.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
            Premium gives you significantly more analysis capacity and
            unlocks deeper intelligence so you can move from basic signals
            to sharper diagnosis, stronger recommendations, and clearer
            next moves.
          </p>
        </div>

        {isPremium && (
          <div className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-5 py-4 text-center text-sm text-emerald-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/[0.1] text-xs">
              ✓
            </span>

            You already have Plavtora Premium access.
          </div>
        )}

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 lg:grid-cols-2">
          {/* =====================================================
              FREE
          ===================================================== */}

          <section className="relative rounded-[30px] border border-white/[0.08] bg-white/[0.02] p-7 sm:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Free
                </p>

                <h2 className="mt-3 text-2xl font-semibold">
                  Get the signal
                </h2>
              </div>

              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                $0
              </span>
            </div>

            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tight">
                $0
              </span>

              <span className="text-sm text-zinc-600">
                / forever
              </span>
            </div>

            <p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">
              Start with genuinely useful analysis and understand where your
              startup stands without paying anything.
            </p>

            <div className="my-8 h-px bg-white/[0.06]" />

            <div>
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
                Monthly usage
              </p>

              <div className="space-y-4">
                {freeFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 text-sm text-zinc-400"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[10px] text-zinc-500">
                      ✓
                    </span>

                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-10 h-12 w-full rounded-xl border border-white/10 bg-white/[0.02] text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              Continue with Free
            </button>
          </section>

          {/* =====================================================
              PREMIUM
          ===================================================== */}

          <section className="relative">
            <div className="absolute -inset-[1px] rounded-[31px] bg-gradient-to-br from-violet-400/45 via-blue-400/15 to-transparent blur-[1px]" />

            <div className="relative h-full overflow-hidden rounded-[30px] border border-violet-400/20 bg-[#09090d] p-7 shadow-[0_30px_120px_rgba(139,92,246,0.14)] sm:p-9">
              <div className="pointer-events-none absolute right-[-100px] top-[-120px] h-[350px] w-[350px] rounded-full bg-violet-500/[0.08] blur-[100px]" />

              <div className="relative">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                      For serious builders
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold">
                      Plavtora Premium
                    </h2>
                  </div>

                  <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] font-medium text-emerald-300">
                    Higher limits
                  </span>
                </div>

                <div className="mt-8 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-tight">
                    $8.99
                  </span>

                  <span className="pb-1 text-sm text-zinc-500">
                    / month
                  </span>
                </div>

                <p className="mt-4 max-w-md text-sm leading-6 text-zinc-400">
                  Go beyond surface-level answers. Get substantially more
                  usage plus the deeper analysis, explanations, and
                  recommendations needed to make stronger startup decisions.
                </p>

                <div className="my-8 h-px bg-white/[0.07]" />

                <div>
                  <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300">
                    Monthly usage
                  </p>

                  <div className="space-y-4">
                    {premiumFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-3 text-sm text-zinc-300"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-400/[0.1] text-[10px] text-violet-300">
                          ✓
                        </span>

                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={isPremium || checkoutLoading}
                  className="mt-10 h-13 w-full rounded-xl bg-white px-6 text-sm font-semibold text-black shadow-[0_0_45px_rgba(139,92,246,0.15)] transition hover:-translate-y-0.5 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPremium
                    ? "Premium Active"
                    : checkoutLoading
                      ? "Preparing checkout..."
                      : "Upgrade to Premium"}
                </button>

                {error && (
                  <p className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] px-4 py-3 text-center text-xs leading-5 text-amber-300">
                    {error}
                  </p>
                )}

                <p className="mt-4 text-center text-[10px] text-zinc-700">
                  Monthly subscription · Usage limits reset each month.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* =====================================================
            COMPARISON / POSITIONING
        ===================================================== */}

        <section className="mx-auto mt-16 max-w-5xl rounded-[28px] border border-white/[0.07] bg-white/[0.018] p-7 sm:p-9">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Free
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Get real startup analysis with defined monthly limits. Enough
                to understand your product, test the workflow, and decide
                whether deeper analysis is useful.
              </p>
            </div>

            <div className="hidden h-auto w-px bg-white/[0.06] md:block" />

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300">
                Premium
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Get substantially higher monthly limits plus deeper ICP,
                conversion, risk, recommendation, and AI decision-support
                capabilities.
              </p>
            </div>

            <div className="hidden h-auto w-px bg-white/[0.06] md:block" />

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Philosophy
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Free gives real value. Premium gives more capacity and more
                depth—not artificial censorship. Both plans have defined
                usage limits.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            LIMIT SUMMARY
        ===================================================== */}

        <section className="mx-auto mt-8 max-w-5xl">
          <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.018] p-7 sm:p-9">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Monthly usage at a glance
              </p>

              <h3 className="mt-3 text-xl font-semibold">
                More room to analyze, iterate, and decide
              </h3>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.06]">
              <div className="grid grid-cols-3 border-b border-white/[0.06] bg-white/[0.025] px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                <span>Capability</span>
                <span className="text-center">Free</span>
                <span className="text-center text-violet-300">
                  Premium
                </span>
              </div>

              <div className="divide-y divide-white/[0.06]">
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
        </section>
      </div>
    </main>
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
    <div className="grid grid-cols-3 items-center px-5 py-4 text-sm">
      <span className="text-zinc-400">
        {label}
      </span>

      <span className="text-center text-zinc-500">
        {free}
      </span>

      <span className="text-center font-medium text-violet-300">
        {premium}
      </span>
    </div>
  );
}