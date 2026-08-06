"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import { signOut } from "@/services/auth";

interface UserMenuProps {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export default function UserMenu({
  name = "",
  email = "",
  avatarUrl,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function handleLogout() {
    try {
      setOpen(false);

      await signOut();

      router.replace("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition-all duration-300 hover:border-blue-500/40 hover:bg-white/10"
      >
        {avatarUrl && !imageError ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-9 w-9 rounded-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white">
            {name ? name.charAt(0).toUpperCase() : "?"}
          </div>
        )}

        <div className="hidden text-left md:block">
          <p className="text-sm font-medium text-white">
            {name || "User"}
          </p>

          <p className="max-w-[170px] truncate text-xs text-gray-400">
            {email || "Loading..."}
          </p>
        </div>

        <ChevronDown
          size={18}
          className={`text-gray-400 transition-all duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={`
          absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl
          border border-white/10
          bg-slate-900/95
          backdrop-blur-xl
          shadow-[0_20px_60px_rgba(0,0,0,0.45)]
          transition-all duration-300 origin-top-right

          ${
            open
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-2 scale-95 opacity-0"
          }
        `}
      >
        {/* User Info */}
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-4">
            {avatarUrl && !imageError ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-12 w-12 rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white font-semibold">
                {name ? name.charAt(0).toUpperCase() : "?"}
              </div>
            )}

            <div>
              <p className="font-semibold text-white">
                {name || "User"}
              </p>

              <p className="text-sm text-gray-400">
                {email || "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-2">
          <MenuItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            onClick={() => {
              setOpen(false);
              router.push("/dashboard");
            }}
          />

          <MenuItem
            icon={<Settings size={18} />}
            label="Settings"
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
          />

          <MenuItem
            icon={<CreditCard size={18} />}
            label="Billing"
            badge="Soon"
            onClick={() => {
              setOpen(false);
              router.push("/billing");
            }}
          />
        </div>

        {/* Logout */}
        <div className="border-t border-white/10 p-2">
          <MenuItem
            icon={<LogOut size={18} />}
            label="Log Out"
            danger
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  danger?: boolean;
  onClick?: () => void;
}

function MenuItem({
  icon,
  label,
  badge,
  danger = false,
  onClick,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group
        flex
        w-full
        items-center
        justify-between
        rounded-2xl
        px-4
        py-3
        transition-all
        duration-200

        ${
          danger
            ? "hover:bg-red-500/10"
            : "hover:bg-white/5"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span
          className={
            danger
              ? "text-red-400"
              : "text-gray-400 transition-colors group-hover:text-blue-400"
          }
        >
          {icon}
        </span>

        <span
          className={
            danger
              ? "text-red-400"
              : "text-white"
          }
        >
          {label}
        </span>
      </div>

      {badge && (
        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs text-blue-300">
          {badge}
        </span>
      )}
    </button>
  );
}