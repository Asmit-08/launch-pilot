"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function AuditStage({
  icon,
  title,
  active,
  complete,
}: {
  icon: string;
  title: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={`
        group flex items-center gap-4 rounded-xl px-4 py-3
        transition-all duration-700
        ${
          active
            ? "bg-white/[0.07] shadow-[0_0_30px_rgba(139,92,246,0.08)]"
            : complete
              ? "opacity-60"
              : "opacity-25"
        }
      `}
    >
      <div
        className={`
          flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
          text-sm transition-all duration-700
          ${
            active
              ? "bg-violet-500/15 ring-1 ring-violet-400/20"
              : complete
                ? "bg-emerald-500/10"
                : "bg-white/[0.03]"
          }
        `}
      >
        {complete ? "✓" : icon}
      </div>

      <div className="flex-1">
        <p
          className={`
            text-sm font-medium transition-colors duration-500
            ${
              active
                ? "text-white"
                : complete
                  ? "text-zinc-400"
                  : "text-zinc-600"
            }
          `}
        >
          {title}
        </p>
      </div>

      {active && (
        <div className="flex gap-1">
          <span className="h-1 w-1 animate-pulse rounded-full bg-violet-400" />

          <span
            className="h-1 w-1 animate-pulse rounded-full bg-violet-400"
            style={{ animationDelay: "150ms" }}
          />

          <span
            className="h-1 w-1 animate-pulse rounded-full bg-violet-400"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      )}
    </div>
  );
}

export default function AuditPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState("");

  /*
   * Usage limit state
   */
  const [limitReached, setLimitReached] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{
    plan: string;
    resource: string;
    used: number;
    limit: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    product_name: "",
    one_line_pitch: "",
    description: "",

    target_audience: "",
    competitors: "",
    unique_value_proposition: "",

    beta_users: 0,
    feedback_collected: false,

    mvp_completed: false,
    critical_bugs: false,

    landing_page: false,
    demo_video: false,
    social_media_presence: false,

    waitlist: false,
    launch_channels: "",

    budget: 0,
    currency: "USD",
    pricing_model: "",
  });

  const loadingStages = [
    {
      icon: "🧠",
      title: "Understanding your startup",
    },
    {
      icon: "📊",
      title: "Evaluating validation",
    },
    {
      icon: "🚀",
      title: "Assessing launch readiness",
    },
    {
      icon: "⚠️",
      title: "Stress-testing risks",
    },
    {
      icon: "✦",
      title: "Synthesizing your audit",
    },
  ];

  useEffect(() => {
    if (!loading) {
      setLoadingStage(0);
      return;
    }

    const timers = [
      setTimeout(() => setLoadingStage(1), 1200),
      setTimeout(() => setLoadingStage(2), 2400),
      setTimeout(() => setLoadingStage(3), 3600),
      setTimeout(() => setLoadingStage(4), 5000),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [loading]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    /*
     * Reset previous states
     */
    setLoading(true);
    setLoadingStage(0);
    setError("");
    setLimitReached(false);
    setLimitInfo(null);

    try {
      /*
       * Prepare payload
       */
      const payload = {
        ...formData,

        competitors: formData.competitors
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        launch_channels: formData.launch_channels
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      /*
       * Authentication
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth");
        return;
      }

      /*
       * Backend URL
       */
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          "The backend URL is not configured."
        );
      }

      /*
       * ONE backend request.
       *
       * The backend checks the usage limit BEFORE
       * generating the audit.
       */
      const response = await fetch(`${apiUrl}/audit`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },

        body: JSON.stringify(payload),
      });

      /*
       * ----------------------------------------------------
       * USAGE LIMIT HANDLING
       * ----------------------------------------------------
       */

      if (response.status === 429) {
        let errorData: any = null;

        try {
          errorData = await response.json();
        } catch {
          // Ignore malformed error response.
        }

        const detail = errorData?.detail;

        if (
          detail &&
          typeof detail === "object" &&
          detail.error === "usage_limit_reached"
        ) {
          setLimitReached(true);

          setLimitInfo({
            plan: detail.plan || "free",
            resource: detail.resource || "audits",
            used: Number(detail.used ?? 0),
            limit: Number(detail.limit ?? 0),
          });

          setLoading(false);

          return;
        }

        throw new Error(
          "You've reached your usage limit. Upgrade to Premium to continue."
        );
      }

      /*
       * ----------------------------------------------------
       * OTHER BACKEND ERRORS
       * ----------------------------------------------------
       */

      if (!response.ok) {
        let errorMessage = "Failed to generate audit.";

        try {
          const errorData = await response.json();

          if (errorData?.detail) {
            if (typeof errorData.detail === "string") {
              errorMessage = errorData.detail;
            } else if (
              typeof errorData.detail === "object" &&
              errorData.detail.error
            ) {
              errorMessage =
                errorData.detail.message ||
                "Unable to generate the audit.";
            }
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Keep default error message.
        }

        throw new Error(errorMessage);
      }

      /*
       * ----------------------------------------------------
       * SUCCESS
       * ----------------------------------------------------
       */

      const result = await response.json();

      if (!result.project_id || !result.audit_id) {
        throw new Error(
          "Audit was generated, but the report information is missing."
        );
      }

      /*
       * Backend persists the audit.
       *
       * Report page retrieves:
       *
       * /projects/{project_id}/audits/{audit_id}
       */

      router.push(
        `/projects/${result.project_id}/audits/${result.audit_id}`
      );
    } catch (error) {
      console.error(
        "Audit generation error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating your audit."
      );

      setLoading(false);
    }
  };

  /*
   * ----------------------------------------------------
   * USAGE LIMIT SCREEN
   * ----------------------------------------------------
   */

  if (limitReached) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.08] blur-[150px]" />

          <div className="absolute left-[10%] top-[20%] h-40 w-40 rounded-full bg-blue-500/[0.04] blur-[80px]" />

          <div className="absolute bottom-[10%] right-[15%] h-48 w-48 rounded-full bg-violet-500/[0.04] blur-[90px]" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="rounded-3xl border border-violet-400/20 bg-white/[0.035] p-8 shadow-2xl backdrop-blur-xl">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
              <span className="text-3xl">✦</span>
            </div>

            {/* Heading */}
            <div className="mt-6 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300">
                Free Plan Limit Reached
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight">
                You've used all your audits
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-400">
                You've reached your monthly Launch Audit
                limit. Upgrade to Premium to continue
                pressure-testing your startup.
              </p>
            </div>

            {/* Usage */}
            {limitInfo && (
              <div className="mt-7 rounded-2xl border border-white/[0.08] bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">
                    Launch Audits
                  </span>

                  <span className="text-sm font-semibold text-white">
                    {limitInfo.used}/{limitInfo.limit}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                    style={{
                      width: `${Math.min(
                        (limitInfo.used /
                          Math.max(limitInfo.limit, 1)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-zinc-600">
                  Your {limitInfo.plan} plan limit has been
                  reached.
                </p>
              </div>
            )}

            {/* Premium benefits */}
            <div className="mt-6 rounded-2xl border border-violet-400/10 bg-violet-500/[0.04] p-5">
              <p className="text-sm font-semibold text-violet-200">
                Premium gives you more room to validate.
              </p>

              <div className="mt-4 space-y-3 text-sm text-zinc-400">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400">✓</span>
                  <span>
                    Up to 20 Launch Audits per month
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-emerald-400">✓</span>
                  <span>
                    More AI analysis and conversations
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-emerald-400">✓</span>
                  <span>
                    Keep pressure-testing before you build
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-7 flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => router.push("/billing")}
                className="h-12 w-full rounded-xl bg-white font-semibold text-black transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Upgrade to Premium →
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLimitReached(false);
                  setLimitInfo(null);
                }}
                className="h-12 w-full rounded-xl border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.07] hover:text-white"
              >
                Back to Audit
              </Button>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-zinc-700">
            Your usage resets at the beginning of the next
            billing period.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------------------------
   * PREMIUM AUDIT LOADING SCREEN
   * ----------------------------------------------------
   */

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.06] blur-[120px]" />

          <div className="absolute left-[20%] top-[20%] h-40 w-40 rounded-full bg-blue-500/[0.03] blur-[80px]" />

          <div className="absolute bottom-[15%] right-[20%] h-40 w-40 rounded-full bg-violet-500/[0.03] blur-[80px]" />
        </div>

        {/* Main card */}
        <div className="relative z-10 w-full max-w-lg px-6">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-8 shadow-2xl backdrop-blur-xl">
            {/* Brand */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping rounded-2xl bg-violet-500/10" />

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.05] shadow-[0_0_40px_rgba(139,92,246,0.12)]">
                  <span className="text-2xl">
                    ✦
                  </span>
                </div>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Plavtora is thinking
              </h1>

              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                Pressure-testing your startup from multiple angles.
              </p>
            </div>

            {/* Current activity */}
            <div className="mt-8 rounded-2xl border border-violet-400/[0.08] bg-violet-400/[0.025] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-50" />

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-400" />
                </div>

                <span className="text-sm text-zinc-300">
                  {loadingStages[loadingStage].title}
                </span>
              </div>
            </div>

            {/* Analysis stages */}
            <div className="mt-6 space-y-1">
              {loadingStages.map((stage, index) => (
                <AuditStage
                  key={stage.title}
                  icon={stage.icon}
                  title={stage.title}
                  active={index === loadingStage}
                  complete={index < loadingStage}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="mt-7 flex items-center justify-between border-t border-white/[0.06] pt-5">
              <span className="text-xs text-zinc-600">
                One comprehensive AI analysis
              </span>

              <span className="text-xs text-zinc-600">
                Please wait
              </span>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-zinc-700">
            Your audit is being generated. This may take a moment.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------------------------
   * AUDIT FORM
   * ----------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-5xl font-bold">
          Plavtora Launch Audit
        </h1>

        <p className="mt-3 text-zinc-400">
          Tell Plavtora about your startup.
        </p>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="font-medium">
            Estimated completion time: 2–3 minutes
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Plavtora will evaluate your product,
            validation, launch readiness, and business
            risks in one comprehensive audit.
          </p>
        </div>

        <form
          className="mt-8 space-y-8"
          onSubmit={handleSubmit}
        >
          {/* Product */}
          <Card
            style={{
              background: "rgba(255,255,255,0.03)",
              border:
                "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <CardHeader>
              <CardTitle>
                🚀 Product
              </CardTitle>

              <p className="text-sm text-zinc-500">
                Tell us what you're building.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label>
                  Product Name
                </Label>

                <Input
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>
                  One Line Pitch
                </Label>

                <Input
                  name="one_line_pitch"
                  value={formData.one_line_pitch}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>
                  Description
                </Label>

                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Market */}
          <Card
            style={{
              background: "rgba(255,255,255,0.03)",
              border:
                "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <CardHeader>
              <CardTitle>
                🎯 Market
              </CardTitle>

              <p className="text-sm text-zinc-500">
                Describe your audience and competitors.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label>
                  Target Audience
                </Label>

                <Input
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleChange}
                  placeholder="SaaS Founders, Indie Hackers"
                  required
                />
              </div>

              <div>
                <Label>
                  Competitors
                </Label>

                <Textarea
                  name="competitors"
                  value={formData.competitors}
                  onChange={handleChange}
                  placeholder="Product Hunt, Indie Hackers, StartupBolt"
                />
              </div>

              <div>
                <Label>
                  Unique Value Proposition
                </Label>

                <Textarea
                  name="unique_value_proposition"
                  value={formData.unique_value_proposition}
                  onChange={handleChange}
                  placeholder="What makes your product different?"
                />
              </div>
            </CardContent>
          </Card>

          {/* Validation */}
          <Card
            style={{
              background: "rgba(255,255,255,0.03)",
              border:
                "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <CardHeader>
              <CardTitle>
                📈 Validation
              </CardTitle>

              <p className="text-sm text-zinc-500">
                Show evidence that users want it.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <Label>
                  Beta Users
                </Label>

                <Input
                  type="number"
                  name="beta_users"
                  value={formData.beta_users}
                  onChange={handleChange}
                  min={0}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="feedback_collected"
                  checked={
                    formData.feedback_collected
                  }
                  onChange={handleChange}
                />

                <Label>
                  Feedback Collected
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Product Status */}
          <Card
            style={{
              background: "rgba(255,255,255,0.03)",
              border:
                "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <CardHeader>
              <CardTitle>
                🛠 Product Status
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="mvp_completed"
                  checked={
                    formData.mvp_completed
                  }
                  onChange={handleChange}
                />

                <Label>
                  MVP Completed
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="critical_bugs"
                  checked={
                    formData.critical_bugs
                  }
                  onChange={handleChange}
                />

                <Label>
                  Critical Bugs Present
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Marketing */}
          <Card
            style={{
              background: "rgba(255,255,255,0.03)",
              border:
                "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <CardHeader>
              <CardTitle>
                📢 Marketing
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="landing_page"
                  checked={
                    formData.landing_page
                  }
                  onChange={handleChange}
                />

                <Label>
                  Landing Page Ready
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="demo_video"
                  checked={
                    formData.demo_video
                  }
                  onChange={handleChange}
                />

                <Label>
                  Demo Video Ready
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="social_media_presence"
                  checked={
                    formData.social_media_presence
                  }
                  onChange={handleChange}
                />

                <Label>
                  Social Media Presence
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Distribution */}
          <Card
            style={{
              background: "rgba(255,255,255,0.03)",
              border:
                "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <CardHeader>
              <CardTitle>
                🌍 Distribution
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="waitlist"
                  checked={
                    formData.waitlist
                  }
                  onChange={handleChange}
                />

                <Label>
                  Waitlist Created
                </Label>
              </div>

              <div>
                <Label>
                  Launch Channels
                </Label>

                <Textarea
                  name="launch_channels"
                  value={
                    formData.launch_channels
                  }
                  onChange={handleChange}
                  placeholder="Product Hunt, LinkedIn, Reddit"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business */}
          <Card
            style={{
              background: "rgba(255,255,255,0.03)",
              border:
                "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <CardHeader>
              <CardTitle>
                💰 Business
              </CardTitle>

              <p className="text-sm text-zinc-500">
                Revenue, pricing, and financial planning.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label>
                  Budget
                </Label>

                <Input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  min={0}
                  placeholder="500"
                />
              </div>

              <div>
                <Label>
                  Currency
                </Label>

                <Input
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  placeholder="USD"
                />
              </div>

              <div>
                <Label>
                  Pricing Model
                </Label>

                <Input
                  name="pricing_model"
                  value={formData.pricing_model}
                  onChange={handleChange}
                  placeholder="Freemium"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="mt-8 w-full"
            disabled={loading}
          >
            🚀 Run Launch Audit
          </Button>
        </form>
      </div>
    </main>
  );
}