"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { ReactNode } from "react";

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  disabled?: boolean;
  badge?: string;
  premium?: boolean;
}

export default function ActionCard({
  title,
  description,
  href,
  icon,
  disabled = false,
  badge,
  premium = false,
}: ActionCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    if (disabled || loading) return;

    setLoading(true);
    router.push(href);
  };

  return (
    <div
      onClick={disabled ? undefined : handleNavigate}
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? undefined : 0}
      onKeyDown={(event) => {
        if (
          !disabled &&
          !loading &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          handleNavigate();
        }
      }}
      aria-disabled={disabled || loading}
      className={`
        group relative overflow-hidden rounded-2xl border
        bg-white p-6 shadow-sm ring-1 ring-slate-100
        transition-all duration-200

        ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : loading
              ? "cursor-wait border-blue-200"
              : "cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div
          className={`
            flex h-12 w-12 items-center justify-center rounded-xl
            ${
              disabled
                ? "bg-slate-100 text-slate-400"
                : "bg-slate-950 text-white"
            }
          `}
        >
          {loading ? (
            <Loader2 size={21} className="animate-spin" />
          ) : (
            icon
          )}
        </div>

        {premium && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Premium
          </span>
        )}

        {badge && !premium && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {badge}
          </span>
        )}
      </div>

      <h3 className="mt-6 text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 min-h-[56px] text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        <span
          className={`text-sm font-semibold ${
            disabled ? "text-slate-400" : "text-slate-900"
          }`}
        >
          {loading
            ? "Opening..."
            : disabled
              ? "Coming soon"
              : premium
                ? "Unlock"
                : "Open"}
        </span>

        {disabled ? (
          <Lock size={16} className="text-slate-400" />
        ) : loading ? (
          <Loader2 size={17} className="animate-spin text-blue-600" />
        ) : (
          <ArrowRight
            size={17}
            className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-900"
          />
        )}
      </div>
    </div>
  );
}