"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, Bell } from "lucide-react";

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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open dashboard menu"
            className="rounded-xl p-2 transition hover:bg-white/5"
          >
            <Menu className="h-5 w-5 text-gray-300" />
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
              <h1 className="text-lg font-semibold text-white">
                Plavtora
              </h1>

              <p className="text-xs text-gray-500">
                AI decision support for founders
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-xl p-2 transition hover:bg-white/5"
          >
            <Bell className="h-5 w-5 text-gray-300" />
          </button>

          {userLoading ? (
            <div className="flex items-center gap-3">
              <div className="hidden space-y-2 sm:block">
                <div className="ml-auto h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
                <div className="ml-auto h-2.5 w-28 animate-pulse rounded bg-white/[0.04]" />
              </div>

              <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />
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