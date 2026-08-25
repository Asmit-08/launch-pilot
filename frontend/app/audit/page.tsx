"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Loader2,
  LockKeyhole,
  Sparkles,
  Target,
  TriangleAlert,
  WalletCards,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FormData {
  product_name: string;
  one_line_pitch: string;
  description: string;

  target_audience: string;
  competitors: string;
  unique_value_proposition: string;

  beta_users: number;
  feedback_collected: boolean;

  mvp_completed: boolean;
  critical_bugs: boolean;

  landing_page: boolean;
  demo_video: boolean;
  social_media_presence: boolean;

  waitlist: boolean;
  launch_channels: string;

  budget: number;
  currency: string;
  pricing_model: string;
}

interface SectionProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function AuditStage({
  number,
  title,
  active,
  complete,
}: {
  number: string;
  title: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={`
        flex items-center gap-3 rounded-xl border px-3.5 py-3
        transition-all duration-300
        ${
          active
            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
            : complete
              ? "border-emerald-100 bg-emerald-50"
              : "border-slate-200 bg-white"
        }
      `}
    >
      <div
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold
          ${
            active
              ? "bg-white/10 text-white"
              : complete
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-400"
          }
        `}
      >
        {complete ? <Check size={15} /> : number}
      </div>

      <p
        className={`flex-1 text-sm font-medium ${
          active
            ? "text-white"
            : complete
              ? "text-emerald-800"
              : "text-slate-500"
        }`}
      >
        {title}
      </p>

      {active && (
        <div className="flex gap-1">
          <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
          <span
            className="h-1 w-1 animate-pulse rounded-full bg-white"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1 w-1 animate-pulse rounded-full bg-white"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      )}
    </div>
  );
}

function Section({
  eyebrow,
  title,
  description,
  icon,
  children,
}: SectionProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            {icon}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {eyebrow}
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              {title}
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-7 sm:py-7">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <Label className="text-sm font-semibold text-slate-800">
          {label}
        </Label>

        {hint && (
          <span className="text-[10px] text-slate-400">
            {hint}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

function ToggleField({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
        checked
          ? "border-blue-200 bg-blue-50"
          : "border-slate-200 bg-slate-50 hover:bg-white"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          checked
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-transparent"
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </span>

      <span>
        <span className="block text-sm font-semibold text-slate-800">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
    </button>
  );
}

const loadingStages = [
  {
    title: "Understanding your startup",
    description: "Mapping the product, market, and core promise.",
  },
  {
    title: "Evaluating validation",
    description: "Checking evidence, traction, and customer signals.",
  },
  {
    title: "Assessing launch readiness",
    description: "Looking for gaps that could slow the launch.",
  },
  {
    title: "Stress-testing risks",
    description: "Surfacing business, product, and distribution risks.",
  },
  {
    title: "Synthesizing your audit",
    description: "Turning the analysis into priorities and next moves.",
  },
];

export default function AuditPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState("");

  const [limitReached, setLimitReached] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{
    plan: string;
    resource: string;
    used: number;
    limit: number;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
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

    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(formData.product_name.trim()),
      Boolean(formData.one_line_pitch.trim()),
      Boolean(formData.description.trim()),
      Boolean(formData.target_audience.trim()),
      Boolean(formData.unique_value_proposition.trim()),
      formData.beta_users > 0,
      formData.feedback_collected,
      formData.mvp_completed,
      Boolean(formData.pricing_model.trim()),
      Boolean(formData.launch_channels.trim()),
    ];

    const completed = checks.filter(Boolean).length;

    return Math.round((completed / checks.length) * 100);
  }, [formData]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : value,
    }));
  };

  const toggleField = (name: keyof FormData) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setLoadingStage(0);
    setError("");
    setLimitReached(false);
    setLimitInfo(null);

    try {
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

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          "The backend URL is not configured."
        );
      }

      const response = await fetch(`${apiUrl}/audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        let errorData: any = null;

        try {
          errorData = await response.json();
        } catch {
          // Keep fallback.
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

      if (!response.ok) {
        let errorMessage =
          "Failed to generate audit.";

        try {
          const errorData = await response.json();

          if (errorData?.detail) {
            if (
              typeof errorData.detail ===
              "string"
            ) {
              errorMessage =
                errorData.detail;
            } else if (
              typeof errorData.detail ===
                "object" &&
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
          // Keep default.
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.project_id || !result.audit_id) {
        throw new Error(
          "Audit was generated, but the report information is missing."
        );
      }

      router.push(
        `/projects/${result.project_id}/audits/${result.audit_id}`
      );
    } catch (error) {
      console.error("Audit generation error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating your audit."
      );

      setLoading(false);
    }
  };

  if (limitReached) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] px-5 py-10 text-slate-950 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <LockKeyhole size={25} />
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                Monthly limit reached
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                You've used all your audits.
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
                Your current plan has no audit capacity left this month.
                Upgrade to continue pressure-testing your startup.
              </p>
            </div>

            {limitInfo && (
              <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Launch Audits
                  </span>

                  <span className="text-sm font-bold text-slate-950">
                    {limitInfo.used}/{limitInfo.limit}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-violet-600"
                    style={{
                      width: `${Math.min(
                        (limitInfo.used /
                          Math.max(
                            limitInfo.limit,
                            1
                          )) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  {limitInfo.plan} plan
                </p>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <p className="font-semibold text-slate-900">
                Premium gives you room to keep iterating.
              </p>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {[
                  "20 Launch Audits per month",
                  "100 AI Co-Founder messages per month",
                  "20 ICP / Persona analyses",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-violet-600">
                      <Check size={11} />
                    </span>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => router.push("/billing")}
                className="h-12 rounded-xl bg-slate-950 font-semibold text-white hover:bg-violet-600"
              >
                Upgrade to Premium
                <ArrowRight size={16} />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLimitReached(false);
                  setLimitInfo(null);
                }}
                className="h-12 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                Back to Audit
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] px-5 py-10 text-slate-950 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg items-center justify-center">
          <div className="w-full rounded-[30px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <Sparkles size={23} />
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                Plavtora is thinking
              </p>

              <h1 className="mt-3 text-2xl font-bold tracking-tight">
                Building your startup diagnosis
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                One comprehensive analysis across product, validation,
                launch readiness, and risk.
              </p>
            </div>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-violet-500 opacity-40" />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-violet-500" />
                </div>

                <span className="text-sm font-medium text-slate-700">
                  {loadingStages[loadingStage].title}
                </span>
              </div>

              <p className="mt-2 pl-5 text-xs leading-5 text-slate-500">
                {loadingStages[loadingStage].description}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              {loadingStages.map((stage, index) => (
                <AuditStage
                  key={stage.title}
                  number={`0${index + 1}`}
                  title={stage.title}
                  active={index === loadingStage}
                  complete={index < loadingStage}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 size={13} className="animate-spin" />
              Generating your report
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f8fc]/90 backdrop-blur-xl">
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
                Launch Audit
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Autosave ready
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Exit
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        {/* Intro */}
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
              <Sparkles size={13} />
              Launch intelligence
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl">
              Put your startup
              <span className="block text-slate-400">
                under pressure.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Give Plavtora the context behind your startup. It will turn
              those inputs into one comprehensive assessment of your product,
              validation, launch readiness, and risks.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Audit progress
              </p>

              <span className="text-sm font-bold text-slate-950">
                {completion}%
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-950 transition-all duration-300"
                style={{ width: `${completion}%` }}
              />
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              More context produces a sharper diagnosis. Focus on the
              information that will change a decision.
            </p>

            <div className="mt-5 flex items-start gap-2 text-xs text-slate-500">
              <CircleHelp
                size={14}
                className="mt-0.5 shrink-0 text-slate-400"
              />
              Estimated completion: 2–3 minutes
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            <TriangleAlert
              size={18}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        )}

        <form
          className="mt-10 grid gap-5"
          onSubmit={handleSubmit}
        >
          <Section
            eyebrow="01 / Product"
            title="What are you building?"
            description="Start with the core promise. This is the foundation of the audit."
            icon={<Wrench size={19} />}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Product name">
                <Input
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleTextChange}
                  placeholder="e.g. Plavtora"
                  required
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white"
                />
              </Field>

              <Field
                label="One-line pitch"
                hint="Keep it specific"
              >
                <Input
                  name="one_line_pitch"
                  value={formData.one_line_pitch}
                  onChange={handleTextChange}
                  placeholder="What does it help customers accomplish?"
                  required
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white"
                />
              </Field>
            </div>

            <Field label="Product description">
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleTextChange}
                placeholder="Explain what the product does, how it works, and what problem it solves."
                required
                className="min-h-32 resize-y rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </Field>
          </Section>

          <Section
            eyebrow="02 / Market"
            title="Who is this for?"
            description="Help Plavtora distinguish your intended customer from a broad market."
            icon={<Target size={19} />}
          >
            <Field label="Target audience">
              <Input
                name="target_audience"
                value={formData.target_audience}
                onChange={handleTextChange}
                placeholder="e.g. SaaS founders with 0–5 person teams"
                required
                className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </Field>

            <Field
              label="Competitors"
              hint="Comma separated"
            >
              <Textarea
                name="competitors"
                value={formData.competitors}
                onChange={handleTextChange}
                placeholder="e.g. Competitor A, Competitor B, Competitor C"
                className="min-h-28 resize-y rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </Field>

            <Field label="Unique value proposition">
              <Textarea
                name="unique_value_proposition"
                value={formData.unique_value_proposition}
                onChange={handleTextChange}
                placeholder="What makes this materially different or better?"
                className="min-h-28 resize-y rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </Field>
          </Section>

          <Section
            eyebrow="03 / Validation"
            title="How much evidence do you have?"
            description="Validation changes the quality of the diagnosis. Don't inflate the numbers."
            icon={<Sparkles size={19} />}
          >
            <div className="max-w-sm">
              <Field label="Beta users">
                <Input
                  type="number"
                  name="beta_users"
                  value={formData.beta_users}
                  onChange={handleTextChange}
                  min={0}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:bg-white"
                />
              </Field>
            </div>

            <ToggleField
              checked={formData.feedback_collected}
              onChange={() =>
                toggleField("feedback_collected")
              }
              title="I've collected user feedback"
              description="Interviews, usage feedback, objections, feature requests, or other direct evidence."
            />
          </Section>

          <Section
            eyebrow="04 / Product status"
            title="How ready is the product?"
            description="Be direct. Weaknesses are useful only when they are visible."
            icon={<Wrench size={19} />}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <ToggleField
                checked={formData.mvp_completed}
                onChange={() =>
                  toggleField("mvp_completed")
                }
                title="MVP is completed"
                description="The core product is usable end-to-end."
              />

              <ToggleField
                checked={formData.critical_bugs}
                onChange={() =>
                  toggleField("critical_bugs")
                }
                title="Critical bugs are present"
                description="Important issues currently block or materially disrupt the core experience."
              />
            </div>
          </Section>

          <Section
            eyebrow="05 / Marketing"
            title="Could people discover and understand it?"
            description="Launch readiness depends on more than having a working product."
            icon={<ArrowRight size={19} />}
          >
            <div className="grid gap-3 md:grid-cols-3">
              <ToggleField
                checked={formData.landing_page}
                onChange={() =>
                  toggleField("landing_page")
                }
                title="Landing page ready"
                description="A live page communicates the offer."
              />

              <ToggleField
                checked={formData.demo_video}
                onChange={() =>
                  toggleField("demo_video")
                }
                title="Demo video ready"
                description="A clear product demonstration exists."
              />

              <ToggleField
                checked={
                  formData.social_media_presence
                }
                onChange={() =>
                  toggleField(
                    "social_media_presence"
                  )
                }
                title="Social presence"
                description="You have channels to distribute the launch."
              />
            </div>
          </Section>

          <Section
            eyebrow="06 / Distribution"
            title="How will you reach the market?"
            description="A product without a credible acquisition path is a launch risk."
            icon={<ChevronRight size={19} />}
          >
            <ToggleField
              checked={formData.waitlist}
              onChange={() => toggleField("waitlist")}
              title="Waitlist created"
              description="You already have a place to capture interested prospects."
            />

            <Field
              label="Launch channels"
              hint="Comma separated"
            >
              <Textarea
                name="launch_channels"
                value={formData.launch_channels}
                onChange={handleTextChange}
                placeholder="e.g. Product Hunt, LinkedIn, Reddit"
                className="min-h-28 resize-y rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </Field>
          </Section>

          <Section
            eyebrow="07 / Business"
            title="What is the business model?"
            description="Budget, pricing, and monetization shape the risk profile of the launch."
            icon={<WalletCards size={19} />}
          >
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Budget">
                <Input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleTextChange}
                  min={0}
                  placeholder="500"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:bg-white"
                />
              </Field>

              <Field label="Currency">
                <Input
                  name="currency"
                  value={formData.currency}
                  onChange={handleTextChange}
                  placeholder="USD"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:bg-white"
                />
              </Field>

              <Field label="Pricing model">
                <Input
                  name="pricing_model"
                  value={formData.pricing_model}
                  onChange={handleTextChange}
                  placeholder="Freemium"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:bg-white"
                />
              </Field>
            </div>
          </Section>

          {/* Final CTA */}
          <section className="mt-2 overflow-hidden rounded-[30px] bg-slate-950 p-7 text-white shadow-xl shadow-slate-900/10 sm:p-9">
            <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-violet-300">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                    Ready for the diagnosis?
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Run your startup through Plavtora.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                  One comprehensive audit. Four angles of analysis. A clearer
                  picture of what deserves your attention next.
                </p>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/40">
                  <span>Product</span>
                  <span>Validation</span>
                  <span>Launch readiness</span>
                  <span>Risk</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="h-13 rounded-xl bg-white px-7 font-bold text-slate-950 hover:bg-slate-100"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    Run Launch Audit
                    <ArrowRight size={17} />
                  </>
                )}
              </Button>
            </div>
          </section>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-[10px] uppercase tracking-[0.14em] text-slate-400">
          <span>One comprehensive AI analysis</span>
          <span className="hidden h-3 w-px bg-slate-200 sm:block" />
          <span>Your audit is saved automatically</span>
          <span className="hidden h-3 w-px bg-slate-200 sm:block" />
          <span>Results open in your project workspace</span>
        </div>
      </div>
    </main>
  );
}