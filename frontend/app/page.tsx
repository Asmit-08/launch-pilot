import { Button } from "@/components/ui/button";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import Typewriter from "@/components/Typewriter";
import HeroContent from "@/components/HeroContent";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
  style={{
    position: "absolute",
    top: "-250px",
    left: "-250px",
    width: "800px",
    height: "800px",
    borderRadius: "9999px",
    background:
      "radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0) 70%)",
    pointerEvents: "none",
  }}
/>


<div
  style={{
    position: "absolute",
    top: "-200px",
    right: "-250px",
    width: "800px",
    height: "800px",
    borderRadius: "9999px",
    background:
      "radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(168,85,247,0) 70%)",
    pointerEvents: "none",
  }}
/>

<div
  style={{
    position: "absolute",
    top: "100px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "1000px",
    height: "700px",
    borderRadius: "9999px",
    background:
      "radial-gradient(circle, rgba(120,119,255,0.12) 0%, rgba(120,119,255,0) 70%)",
    pointerEvents: "none",
  }}
/>

<div
  style={{
    position: "absolute",
    top: "800px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "1400px",
    height: "1400px",
    borderRadius: "9999px",
    background:
      "radial-gradient(circle, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0) 70%)",
    pointerEvents: "none",
  }}
/>

<div
  style={{
    position: "absolute",
    top: "1700px",
    right: "-300px",
    width: "1200px",
    height: "1200px",
    borderRadius: "9999px",
    background:
      "radial-gradient(circle, rgba(168,85,247,0.05) 0%, rgba(168,85,247,0) 70%)",
    pointerEvents: "none",
  }}
/>

<div
 className = "aurora"
  style={{
    position: "absolute",
    top: "0",
    left: "50%",
    transform: "translateX(-50%)",
    width: "1400px",
    height: "700px",
    background:
      "linear-gradient(90deg, rgba(59,130,246,0.08), rgba(168,85,247,0.08), rgba(59,130,246,0.08))",
    filter: "blur(120px)",
    pointerEvents: "none",
  }}
/>

      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
    

    <div className="flex items-center gap-3">
      <div className="flex items-center gap-4 -ml-4">
  <Image 
    src="/LaunchPilot-Icon.png"
    alt="Launch Pilot"
    width={50}
    height={50}
    priority
  />
  </div>
</div>

    <div className="flex items-center gap-2">

      <div className="hidden md:flex gap-3">
        <Button asChild variant="ghost">
          <a href="#features">
            Features
          </a>
        </Button>

        <Button asChild variant="ghost">
          <a href="#how-it-works">
            How It Works
          </a>
        </Button>
      </div>

      <Button asChild size="lg">
        <Link href="/audit">
          Run Launch Audit
        </Link>
      </Button>

    </div>

  </div>
</nav>
<AnimatedSection>
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        
        <div className="mb-6 rounded-full border border-white/20 px-4 py-2 text-sm text-zinc-400">
          🚀 AI-Powered SaaS Launch Analysis
        </div>

        <h1 className="text-7xl font-bold tracking-tight">
          Launch
          <Typewriter />
        </h1>

        <HeroContent delay={1}>
          <p className="mt-8 text-2xl text-zinc-400">
            Your AI Co-Founder for SaaS Launches
          </p>
        </HeroContent>

        <HeroContent delay={1.3}>
        <p className="mt-6 max-w-3xl text-lg text-zinc-500">
          Identify launch risks, weak validation,
          missing assets, and hidden business
          problems before going public.
        </p>
      </HeroContent>
    <HeroContent delay ={1.3}>
        <div className="mt-10 flex gap-4">
          <Button asChild size="lg">
            <Link href="/audit">
              Run Launch Audit
            </Link>
          </Button>

         <Button asChild variant="outline" size="lg">
          <a href="#demo">
            View Demo
          </a>
        </Button>
        </div>
      </HeroContent>

      </section>
      </AnimatedSection>
<AnimatedSection>
      <section className="px-6 pb-32"
      id = "features">
  <div className="mx-auto max-w-6xl">
    

    <h2 className="mb-12 text-center text-4xl font-bold">
      Your AI Launch Team
    </h2>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

      <div
  className="rounded-2xl p-6 transition-all duration-300 hover:-scale-110"
  style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
  }}
>
        <h3 className="mb-3 text-xl font-semibold">
          📦 Product Analysis
        </h3>
        <p className="text-zinc-400">
          Evaluate your product quality, differentiation,
          and readiness before launch.
        </p>
      </div>

      <div
  className="rounded-2xl p-6 transition-all duration-300 hover:-scale-110"
  style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
  }}
>
        <h3 className="mb-3 text-xl font-semibold">
          📈 Validation Analysis
        </h3>
        <p className="text-zinc-400">
          Measure market validation, traction,
          and confidence signals.
        </p>
      </div>

     <div
  className="rounded-2xl p-6 transition-all duration-300 hover:-scale-110"
  style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
  }}
>
        <h3 className="mb-3 text-xl font-semibold">
          🚀 Launch Readiness
        </h3>
        <p className="text-zinc-400">
          Identify missing launch assets and
          preparation gaps.
        </p>
      </div>

      <div
  className="rounded-2xl p-6 transition-all duration-300 hover:-scale-110"
  style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
  }}
>
        <h3 className="mb-3 text-xl font-semibold">
          ⚠️ Risk Detection
        </h3>
        <p className="text-zinc-400">
          Discover financial, competitive,
          and business risks before launch.
        </p>
      </div>

    </div>

  </div>
</section>
</AnimatedSection>

<AnimatedSection>
<section
  id="how-it-works"
  className="px-6 py-32"
>
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
</AnimatedSection>


<AnimatedSection>
<section className="px-6 py-32" id = "demo">
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
</AnimatedSection>

<AnimatedSection>
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
      <Button asChild size="lg">
        <Link href="/audit">
          Run Launch Audit
        </Link>
      </Button>
    </div>

  </div>
</section>
</AnimatedSection>

<footer className="border-t border-white/10 py-8 text-center text-zinc-500">
  <p>© 2026 Launch Pilot. Built for founders.</p>
</footer>

    </main>
  );
}