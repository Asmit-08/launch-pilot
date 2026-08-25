"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  Settings,
  CreditCard,
  LogOut,
  Loader2,
} from "lucide-react";

import { signOut } from "@/services/auth";

interface UserMenuProps {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

type LoadingAction =
  | "dashboard"
  | "settings"
  | "billing"
  | "logout"
  | null;

export default function UserMenu({
  name = "",
  email = "",
  avatarUrl,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loadingAction, setLoadingAction] =
    useState<LoadingAction>(null);

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

  function handleNavigation(
    action: Exclude<LoadingAction, "logout" | null>,
    href: string
  ) {
    if (loadingAction) return;

    setOpen(false);
    setLoadingAction(action);

    router.push(href);
  }

  async function handleLogout() {
    if (loadingAction) return;

    try {
      setOpen(false);
      setLoadingAction("logout");

      await signOut();

      router.replace("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoadingAction(null);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => {
          if (!loadingAction) {
            setOpen((prev) => !prev);
          }
        }}
        disabled={!!loadingAction}
        aria-label="Open account menu"
        className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 transition hover:border-slate-300 hover:shadow-sm disabled:cursor-wait"
      >
        {avatarUrl && !imageError ? (
          <img
            src={avatarUrl}
            alt={name || "User"}
            className="h-9 w-9 rounded-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            {name
              ? name.charAt(0).toUpperCase()
              : "?"}
          </div>
        )}

        <div className="hidden text-left md:block">
          <p className="max-w-[120px] truncate text-sm font-semibold text-slate-900">
            {name || "User"}
          </p>

          <p className="max-w-[140px] truncate text-xs text-slate-500">
            {email || "Loading..."}
          </p>
        </div>

        {loadingAction ? (
          <Loader2
            size={17}
            className="animate-spin text-blue-600"
          />
        ) : (
          <ChevronDown
            size={17}
            className={`text-slate-400 transition ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      <div
        className={`
          absolute right-0 mt-3 w-72 origin-top-right overflow-hidden
          rounded-2xl border border-slate-200 bg-white
          shadow-[0_20px_60px_rgba(15,23,42,0.12)]
          transition-all duration-200
          ${
            open
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-2 scale-95 opacity-0"
          }
        `}
      >
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            {avatarUrl && !imageError ? (
              <img
                src={avatarUrl}
                alt={name || "User"}
                className="h-11 w-11 rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                {name
                  ? name.charAt(0).toUpperCase()
                  : "?"}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {name || "User"}
              </p>

              <p className="truncate text-sm text-slate-500">
                {email || "Loading..."}
              </p>
            </div>
          </div>
        </div>

        <div className="p-2">
          <MenuItem
            icon={
              loadingAction === "dashboard" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LayoutDashboard size={18} />
              )
            }
            label={
              loadingAction === "dashboard"
                ? "Opening..."
                : "Dashboard"
            }
            loading={loadingAction === "dashboard"}
            disabled={!!loadingAction}
            onClick={() =>
              handleNavigation("dashboard", "/dashboard")
            }
          />

          <MenuItem
            icon={
              loadingAction === "settings" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Settings size={18} />
              )
            }
            label={
              loadingAction === "settings"
                ? "Opening..."
                : "Settings"
            }
            loading={loadingAction === "settings"}
            disabled={!!loadingAction}
            onClick={() =>
              handleNavigation("settings", "/settings")
            }
          />

          <MenuItem
            icon={
              loadingAction === "billing" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CreditCard size={18} />
              )
            }
            label={
              loadingAction === "billing"
                ? "Opening..."
                : "Billing & Premium"
            }
            loading={loadingAction === "billing"}
            disabled={!!loadingAction}
            onClick={() =>
              handleNavigation("billing", "/billing")
            }
          />
        </div>

        <div className="border-t border-slate-100 p-2">
          <MenuItem
            icon={
              loadingAction === "logout" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogOut size={18} />
              )
            }
            label={
              loadingAction === "logout"
                ? "Signing out..."
                : "Log Out"
            }
            danger
            loading={loadingAction === "logout"}
            disabled={!!loadingAction}
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
  danger?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function MenuItem({
  icon,
  label,
  danger = false,
  loading = false,
  disabled = false,
  onClick,
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        group flex w-full items-center gap-3 rounded-xl
        px-4 py-3 text-left text-sm transition
        ${
          danger
            ? "hover:bg-red-50"
            : "hover:bg-slate-50"
        }
        ${loading ? "bg-slate-50" : ""}
      `}
    >
      <span
        className={
          danger
            ? "text-red-500"
            : loading
              ? "text-blue-600"
              : "text-slate-400 group-hover:text-slate-700"
        }
      >
        {icon}
      </span>

      <span
        className={
          danger
            ? "font-medium text-red-600"
            : loading
              ? "font-medium text-blue-700"
              : "font-medium text-slate-700"
        }
      >
        {label}
      </span>
    </button>
  );
}