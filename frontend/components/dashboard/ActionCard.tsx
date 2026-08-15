"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  disabled?: boolean;
  badge?: string;
}

export default function ActionCard({
  title,
  description,
  href,
  icon,
  disabled = false,
  badge,
}: ActionCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    if (disabled || loading) return;

    setLoading(true);
    router.push(href);
  };

  const content = (
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
        group relative overflow-hidden rounded-3xl border
        border-white/10 bg-white/5 p-6
        backdrop-blur-xl
        transition-all duration-300

        ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : loading
              ? "cursor-wait border-blue-500/30 bg-white/[0.07] opacity-80"
              : "cursor-pointer hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.07] hover:shadow-2xl"
        }
      `}
    >
      {/* Glow */}
      <div
        className={`
          absolute right-0 top-0 h-32 w-32
          translate-x-10 -translate-y-10
          rounded-full bg-blue-500/10 blur-3xl
          transition-all duration-500
          ${
            !disabled && !loading
              ? "group-hover:bg-blue-500/20"
              : ""
          }
        `}
      />

      <div className="relative flex h-full flex-col">
        {/* Icon */}
        <div
          className={`
            mb-6 flex h-14 w-14 items-center justify-center
            rounded-2xl bg-gradient-to-br
            from-blue-500 to-violet-600 text-white shadow-lg
            transition-transform duration-300
            ${
              loading
                ? "scale-95"
                : "group-hover:scale-[1.03]"
            }
          `}
        >
          {loading ? (
            <Loader2
              size={24}
              className="animate-spin"
            />
          ) : (
            icon
          )}
        </div>

        {/* Badge */}
        {badge && (
          <span className="mb-3 w-fit rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            {badge}
          </span>
        )}

        {/* Title */}
        <h3 className="text-xl font-semibold text-white">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-3 flex-1 leading-7 text-gray-400">
          {description}
        </p>

        {/* Bottom */}
        <div className="mt-8 flex items-center justify-between">
          <span
            className={`text-sm font-medium ${
              loading
                ? "text-blue-300"
                : "text-blue-400"
            }`}
          >
            {loading ? "Opening..." : "Open"}
          </span>

          {loading ? (
            <Loader2
              size={18}
              className="animate-spin text-blue-300"
            />
          ) : (
            <ArrowRight
              className="transition-transform duration-300 group-hover:translate-x-1"
              size={18}
            />
          )}
        </div>
      </div>
    </div>
  );

  return content;
}