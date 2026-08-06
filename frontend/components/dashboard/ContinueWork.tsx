"use client";

import { ArrowRight, History } from "lucide-react";

interface ContinueWorkProps {
  onOpenSidebar: () => void;
}

export default function ContinueWork({
  onOpenSidebar,
}: ContinueWorkProps) {
  return (
    <section className="mx-auto mt-12 max-w-7xl px-6 pb-10">
      <button
        onClick={onOpenSidebar}
        className="
          group
          flex w-full items-center justify-between
          rounded-3xl
          border border-white/10
          bg-white/5
          p-6
          backdrop-blur-xl
          transition-all duration-300
          hover:border-blue-500/40
          hover:bg-white/[0.07]
        "
      >
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg">
            <History size={24} />
          </div>

          <div className="text-left">
            <h3 className="text-xl font-semibold text-white">
              Continue Previous Work
            </h3>

            <p className="mt-1 text-gray-400">
              Open one of your previous audits and continue where you left off.
            </p>
          </div>
        </div>

        <ArrowRight
          className="text-gray-400 transition-transform duration-300 group-hover:translate-x-1"
          size={22}
        />
      </button>
    </section>
  );
}