"use client";

interface HeroProps {
  name?: string;
}

export default function Hero({
  name = "Founder",
}: HeroProps) {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  return (
    <section className="mx-auto mt-16 max-w-7xl px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
        {/* Glow */}
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-blue-400">
            Launch Workspace
          </p>

          <h1 className="text-5xl font-bold leading-tight text-white">
            {greeting},{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {name}
            </span>{" "}
            👋
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            What are we working on today?
            <br />
            Choose where you'd like to continue building and
            launching your SaaS.
          </p>
        </div>
      </div>
    </section>
  );
}