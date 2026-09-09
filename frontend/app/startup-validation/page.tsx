"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/[0.08]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="text-[17px] font-medium tracking-[-0.02em] text-[#111113]">
          {question}
        </span>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-3xl text-[15px] leading-7 text-zinc-600">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StartupValidationPage() {
  const router = useRouter();

  const navigateToAuth = () => {
    router.push("/auth");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f5] text-[#111113] selection:bg-violet-200">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-15%] top-[-12%] h-[500px] w-[500px] rounded-full bg-violet-300/20 blur-[120px]" />
        <div className="absolute right-[-10%] top-[12%] h-[450px] w-[450px] rounded-full bg-blue-300/15 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[30%] h-[400px] w-[400px] rounded-full bg-amber-200/20 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-black/[0.07] bg-[#f7f7f5]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5"
          >
            <Image
              src="/icon.png"
              alt="Plavtora"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-[17px] font-semibold tracking-[-0.04em]">
              Plavtora
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#validation"
              className="text-sm text-zinc-600 transition-colors hover:text-[#111113]"
            >
              Validation
            </a>

            <a
              href="#process"
              className="text-sm text-zinc-600 transition-colors hover:text-[#111113]"
            >
              How it works
            </a>

            <a
              href="#faq"
              className="text-sm text-zinc-600 transition-colors hover:text-[#111113]"
            >
              FAQ
            </a>
          </div>

          <button
            onClick={navigateToAuth}
            className="rounded-full bg-[#111113] px-4 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          >
            Start validation
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-36 sm:px-8 sm:pt-44 lg:pb-32">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <AnimatedSection>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              Startup validation
            </div>

            <h1 className="max-w-4xl text-[clamp(3.2rem,6.2vw,5.9rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
              Validate your startup before you build further.
            </h1>

            <p className="mt-7 max-w-2xl text-[17px] leading-8 text-zinc-600 sm:text-[18px]">
              Turn assumptions about your startup into explicit questions,
              pressure-test what matters, and identify what still needs
              evidence before you commit more time and resources.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={navigateToAuth}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#111113] px-6 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Start with a validation audit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <a
                href="#validation"
                className="inline-flex items-center justify-center rounded-full border border-black/[0.1] bg-white/60 px-6 py-3.5 text-sm font-medium text-[#111113] transition-colors hover:bg-white"
              >
                See what gets validated
              </a>
            </div>
          </AnimatedSection>

          {/* Focused validation visual */}
          <AnimatedSection className="lg:pl-8">
            <div className="relative">
              <div className="absolute -inset-8 rounded-[50px] bg-violet-200/20 blur-3xl" />

              <div className="relative overflow-hidden rounded-[30px] border border-black/[0.08] bg-white p-5 shadow-[0_25px_80px_rgba(0,0,0,0.07)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-600">
                      Validation audit
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      Startup uncertainty
                    </p>
                  </div>

                  <div className="rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-medium text-violet-700">
                    In progress
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: "Problem",
                      text: "Is the problem meaningful enough to solve?",
                      status: "Examined",
                    },
                    {
                      label: "ICP",
                      text: "Who experiences this problem most strongly?",
                      status: "Examined",
                    },
                    {
                      label: "Solution",
                      text: "Does the proposed solution address the core need?",
                      status: "Testing",
                    },
                    {
                      label: "Evidence",
                      text: "What assumption still lacks evidence?",
                      status: "Next",
                    },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-black/[0.07] bg-[#fafaf8] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                            index < 2
                              ? "bg-violet-100 text-violet-700"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {index < 2 ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                              {item.label}
                            </p>

                            <span className="text-[10px] font-medium text-zinc-400">
                              {item.status}
                            </span>
                          </div>

                          <p className="mt-1.5 text-sm leading-6 text-zinc-700">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-[#111113] p-4 text-white">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300">
                    Next objective
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-white/85">
                    Gather evidence around the strongest unresolved customer
                    assumption.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Definition */}
      <section id="validation" className="border-y border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-28">
          <AnimatedSection className="max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-600">
              What validation means
            </p>

            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Startup validation is not proving that your idea is good.
              <span className="text-zinc-400">
                {" "}
                It is reducing the uncertainty around whether it deserves to
                be built.
              </span>
            </h2>

            <p className="mt-6 max-w-3xl text-[16px] leading-8 text-zinc-600">
              Every startup begins with assumptions. The problem, customer,
              willingness to pay, positioning, solution and market are all
              hypotheses until evidence makes them more credible. Good
              validation makes those assumptions visible and determines which
              ones deserve attention first.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* What gets validated */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <AnimatedSection>
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-600">
              What gets validated
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              The idea is only one part of the startup.
            </h2>

            <p className="mt-4 text-[16px] leading-7 text-zinc-600">
              Validation needs to examine the assumptions that determine
              whether the business can actually work.
            </p>
          </div>
        </AnimatedSection>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              number: "01",
              title: "The problem",
              description:
                "Is there a meaningful problem, and is it painful enough for people to care about solving it?",
            },
            {
              number: "02",
              title: "The customer",
              description:
                "Is the target customer specific enough, and does the problem actually exist for that group?",
            },
            {
              number: "03",
              title: "The solution",
              description:
                "Does the proposed product address the underlying problem rather than just its symptoms?",
            },
            {
              number: "04",
              title: "The value proposition",
              description:
                "Can the startup communicate a clear reason why the customer should choose this solution?",
            },
            {
              number: "05",
              title: "The positioning",
              description:
                "Is the product differentiated enough to occupy a meaningful position in the customer's mind?",
            },
            {
              number: "06",
              title: "The evidence",
              description:
                "Which assumptions are supported, which are weak, and which still need to be tested?",
            },
          ].map((item) => (
            <AnimatedSection key={item.number}>
              <div className="group h-full rounded-[26px] border border-black/[0.07] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-[0.15em] text-violet-600">
                    {item.number}
                  </span>

                  <ArrowRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-zinc-500" />
                </div>

                <h3 className="mt-8 text-xl font-semibold tracking-[-0.03em]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-600">
                  {item.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Why validation fails */}
      <section className="bg-[#111113] text-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <AnimatedSection>
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                  The validation problem
                </p>

                <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                  More research does not automatically mean more certainty.
                </h2>
              </div>

              <div className="space-y-6 text-[16px] leading-8 text-white/65">
                <p>
                  Founders can spend weeks reading market reports, talking to
                  users and collecting opinions without ever identifying the
                  assumption that matters most.
                </p>

                <p>
                  Validation becomes useful when research changes a decision.
                  The objective is not to collect information indefinitely.
                  It is to determine what you believe, what you know, what you
                  do not know, and what should happen next.
                </p>

                <p className="text-white">
                  The real output of validation is not a score. It is better
                  decision-making.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <AnimatedSection>
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-600">
              The Plavtora approach
            </p>

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Validation becomes a decision loop.
            </h2>

            <p className="mt-5 text-[16px] leading-8 text-zinc-600">
              Plavtora does not treat startup validation as a one-time report.
              It uses analysis to identify the most important uncertainty,
              turns that uncertainty into an objective, and uses new evidence
              to determine what deserves attention next.
            </p>
          </div>
        </AnimatedSection>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              title: "Diagnose",
              text: "Surface the assumptions and uncertainties surrounding the startup.",
            },
            {
              step: "02",
              title: "Decide",
              text: "Determine which unresolved issue has the greatest impact on the next decision.",
            },
            {
              step: "03",
              title: "Act",
              text: "Turn that uncertainty into a focused objective that can produce useful evidence.",
            },
            {
              step: "04",
              title: "Learn",
              text: "Bring the evidence back and reassess what deserves attention next.",
            },
          ].map((item) => (
            <AnimatedSection key={item.step}>
              <div className="h-full rounded-[26px] border border-black/[0.07] bg-white p-7">
                <span className="text-[11px] font-semibold tracking-[0.15em] text-violet-600">
                  {item.step}
                </span>

                <h3 className="mt-8 text-xl font-semibold tracking-[-0.03em]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-600">
                  {item.text}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Outputs */}
      <section className="border-y border-black/[0.06] bg-white/45">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <AnimatedSection>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-600">
                What you get
              </p>

              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                A clearer picture of what deserves attention.
              </h2>

              <p className="mt-5 text-[16px] leading-8 text-zinc-600">
                A useful validation process should leave you with more than a
                verdict. It should make the next decision easier.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="rounded-[30px] border border-black/[0.07] bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.05)] sm:p-9">
                <div className="space-y-6">
                  {[
                    "A structured view of your startup assumptions",
                    "The strongest unresolved uncertainty",
                    "Areas where your current reasoning is weak or incomplete",
                    "A focused next objective",
                    "A framework for bringing new evidence back into the decision",
                  ].map((item) => (
                    <div key={item} className="flex gap-4">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100">
                        <Check className="h-3.5 w-3.5 text-violet-700" />
                      </div>

                      <p className="text-[15px] leading-7 text-zinc-700">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <AnimatedSection>
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-600">
              Built for founders
            </p>

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Especially useful when the next move is unclear.
            </h2>

            <p className="mt-5 text-[16px] leading-8 text-zinc-600">
              Whether you are still evaluating an idea, building an early SaaS
              product, refining your ICP or trying to decide what to test next,
              the goal is the same: reduce the uncertainty that is blocking a
              better decision.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-black/[0.06]">
        <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8 lg:py-32">
          <AnimatedSection>
            <div className="mb-12 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-600">
                FAQ
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Startup validation questions.
              </h2>
            </div>

            <div>
              <FAQItem
                question="What is startup validation?"
                answer="Startup validation is the process of testing the assumptions behind a startup idea and reducing uncertainty around the problem, customer, solution, positioning and evidence supporting the business."
              />

              <FAQItem
                question="When should I validate my startup idea?"
                answer="As early as possible, particularly before committing significant time or resources to building. Validation can also be useful later when you are facing uncertainty around your ICP, positioning, product direction or next growth decision."
              />

              <FAQItem
                question="Does validation guarantee that a startup will succeed?"
                answer="No. Validation cannot eliminate uncertainty or predict the future. Its purpose is to make the important assumptions visible, test what can be tested, and improve the quality of the decisions you make."
              />

              <FAQItem
                question="How is Plavtora different from startup idea generators?"
                answer="Plavtora is designed around decision-making rather than generating more ideas. It examines the startup you bring to it, identifies important uncertainty, and turns that uncertainty into a focused next objective."
              />

              <FAQItem
                question="Can I use Plavtora after I have already launched?"
                answer="Yes. Startup validation is not limited to pre-launch ideas. The same decision process can be used when you are evaluating product direction, ICP, positioning, customer evidence or other important startup decisions."
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-8 sm:px-8 lg:pb-32">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-[34px] bg-[#111113] px-7 py-14 text-white sm:px-12 sm:py-16 lg:px-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                Make the next decision with better evidence
              </p>

              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                Stop guessing whether your startup deserves more time.
              </h2>

              <p className="mt-5 max-w-2xl text-[16px] leading-8 text-white/60">
                Start with a structured validation audit and find the
                uncertainty that deserves your attention next.
              </p>

              <button
                onClick={navigateToAuth}
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-[#111113] transition-transform hover:-translate-y-0.5"
              >
                Start validation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5"
          >
            <Image
              src="/icon.png"
              alt="Plavtora"
              width={24}
              height={24}
              className="rounded-md"
            />

            <span className="text-sm font-semibold tracking-[-0.03em]">
              Plavtora
            </span>
          </button>

          <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
            <a
              href="#validation"
              className="transition-colors hover:text-[#111113]"
            >
              Validation
            </a>

            <a
              href="#process"
              className="transition-colors hover:text-[#111113]"
            >
              How it works
            </a>

            <a
              href="#faq"
              className="transition-colors hover:text-[#111113]"
            >
              FAQ
            </a>
          </div>

          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Plavtora
          </p>
        </div>
      </footer>
    </main>
  );
}