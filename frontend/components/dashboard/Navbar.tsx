"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, Bell, Sparkles } from "lucide-react";

import UserMenu from "./Usermenu";
import { getCurrentUser } from "@/services/user";

interface NavbarProps {
  onMenuClick: () => void;
}

interface User {
  name?: string;
  email?: string;
  avatar_url?: string;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load user:", error);
        }
      } finally {
        if (!cancelled) {
          setUserLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open dashboard menu"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="Plavtora"
              width={40}
              height={40}
              priority
              className="h-10 w-10 rounded-xl object-cover"
            />

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Plavtora
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                SaaS decision intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => window.location.href = "/billing"}
            className="hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:flex"
          >
            <Sparkles size={16} />
            Upgrade
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell className="h-5 w-5" />
          </button>

          {userLoading ? (
            <div className="flex items-center gap-3">
              <div className="hidden space-y-2 sm:block">
                <div className="ml-auto h-3 w-20 animate-pulse rounded bg-slate-200" />
                <div className="ml-auto h-2.5 w-28 animate-pulse rounded bg-slate-100" />
              </div>

              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
            </div>
          ) : (
            <UserMenu
              name={user?.name}
              email={user?.email}
              avatarUrl={user?.avatar_url}
            />
          )}
        </div>
      </div>
    </header>
  );
}