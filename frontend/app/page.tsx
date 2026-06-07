import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

    <h1 className="text-xl font-bold">
      Launch <span className="text-blue-500">Pilot</span>
    </h1>

    <div className="flex items-center gap-2">

      <div className="hidden md:flex gap-3">
        <Button variant="ghost">
          Features
        </Button>

        <Button variant="ghost">
          How It Works
        </Button>
      </div>

      <Button size="sm">
        Run Audit
      </Button>

    </div>

  </div>
</nav>
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">

        <div className="mb-6 rounded-full border border-white/20 px-4 py-2 text-sm text-zinc-400">
          🚀 AI-Powered SaaS Launch Analysis
        </div>

        <h1 className="text-7xl font-bold tracking-tight">
          Launch
          <span className="text-blue-500"> Pilot</span>
        </h1>

        <p className="mt-8 text-2xl text-zinc-400">
          Your AI Co-Founder for SaaS Launches
        </p>

        <p className="mt-6 max-w-3xl text-lg text-zinc-500">
          Identify launch risks, weak validation, missing assets,
          and hidden business problems before going public.
        </p>

        <div className="mt-10 flex gap-4">
          <Button size="lg">
            Run Launch Audit
          </Button>

          <Button variant="outline" size="lg">
            View Demo
          </Button>
        </div>

      </section>

      <section className="px-6 pb-32">
  <div className="mx-auto max-w-6xl">

    <h2 className="mb-12 text-center text-4xl font-bold">
      Your AI Launch Team
    </h2>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

      <div className="rounded-2xl border border-white/10 p-6">
        <h3 className="mb-3 text-xl font-semibold">
          Product Analysis
        </h3>
        <p className="text-zinc-400">
          Evaluate your product quality, differentiation,
          and readiness before launch.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 p-6">
        <h3 className="mb-3 text-xl font-semibold">
          Validation Analysis
        </h3>
        <p className="text-zinc-400">
          Measure market validation, traction,
          and confidence signals.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 p-6">
        <h3 className="mb-3 text-xl font-semibold">
          Launch Readiness
        </h3>
        <p className="text-zinc-400">
          Identify missing launch assets and
          preparation gaps.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 p-6">
        <h3 className="mb-3 text-xl font-semibold">
          Risk Detection
        </h3>
        <p className="text-zinc-400">
          Discover financial, competitive,
          and business risks before launch.
        </p>
      </div>

    </div>

  </div>
</section>

<section className="px-6 py-32">
  <div className="mx-auto max-w-5xl">

    <h2 className="mb-16 text-center text-4xl font-bold">
      How Launch Pilot Works
    </h2>

    <div className="grid gap-8 md:grid-cols-4">

      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-xl font-bold">
          1
        </div>

        <h3 className="mb-3 text-lg font-semibold">
          Describe Your Startup
        </h3>

        <p className="text-zinc-400">
          Tell Launch Pilot about your product, audience,
          pricing, competitors, and launch plans.
        </p>
      </div>

      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-xl font-bold">
          2
        </div>

        <h3 className="mb-3 text-lg font-semibold">
          AI Agents Analyze
        </h3>

        <p className="text-zinc-400">
          Specialized AI agents review product quality,
          validation, launch readiness, and risks.
        </p>
      </div>

      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-xl font-bold">
          3
        </div>

        <h3 className="mb-3 text-lg font-semibold">
          Receive Audit Report
        </h3>

        <p className="text-zinc-400">
          Get detailed scores, strengths, weaknesses,
          risks, and recommendations.
        </p>
      </div>

      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-xl font-bold">
          4
        </div>

        <h3 className="mb-3 text-lg font-semibold">
          Launch With Confidence
        </h3>

        <p className="text-zinc-400">
          Fix issues before launch and dramatically
          improve your chances of success.
        </p>
      </div>

    </div>
  </div>
</section>

<section className="px-6 py-32">
  <div className="mx-auto max-w-5xl">

    <h2 className="mb-4 text-center text-4xl font-bold">
      Example Audit Report
    </h2>

    <p className="mb-16 text-center text-zinc-400">
      See exactly what Launch Pilot delivers before you launch.
    </p>

    <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-8">

      <div className="mb-10 text-center">
        <h3 className="text-5xl font-bold text-blue-500">
          57
        </h3>

        <p className="mt-2 text-zinc-400">
          Overall Launch Score
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">

        <div className="rounded-xl border border-white/10 p-4">
          <h4 className="font-semibold">
            Product Analysis
          </h4>

          <p className="mt-2 text-zinc-400">
            Score: 7/10
          </p>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <h4 className="font-semibold">
            Validation Analysis
          </h4>

          <p className="mt-2 text-zinc-400">
            Score: 5/10
          </p>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <h4 className="font-semibold">
            Launch Readiness
          </h4>

          <p className="mt-2 text-zinc-400">
            Score: 6/10
          </p>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <h4 className="font-semibold">
            Risk Detection
          </h4>

          <p className="mt-2 text-zinc-400">
            Score: 4/10
          </p>
        </div>

      </div>
    </div>

  </div>
</section>

<section className="px-6 py-32 text-center">
  <div className="mx-auto max-w-4xl">

    <h2 className="text-5xl font-bold">
      Ready to Launch Smarter?
    </h2>

    <p className="mt-6 text-xl text-zinc-400">
      Stop guessing. Let AI identify risks, weak validation,
      and missing launch assets before your product goes live.
    </p>

    <div className="mt-10">
      <Button size="lg">
        Run Launch Audit
      </Button>
    </div>

  </div>
</section>

<footer className="border-t border-white/10 py-8 text-center text-zinc-500">
  <p>© 2026 Launch Pilot. Built for founders.</p>
</footer>

    </main>
  );
}