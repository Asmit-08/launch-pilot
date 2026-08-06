"use client";

import { useEffect, useState } from "react";
import { Menu, Bell } from "lucide-react";
import UserMenu from "./Usermenu";
import { getCurrentUser } from "@/services/user";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }

    loadUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-xl p-2 transition hover:bg-white/5"
          >
            <Menu className="h-5 w-5 text-gray-300" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 font-bold text-white shadow-lg">
              LP
            </div>

            <div>
              <h1 className="text-lg font-semibold text-white">
                Launch Pilot
              </h1>

              <p className="text-xs text-gray-500">
                AI Co-Founder
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button className="rounded-xl p-2 transition hover:bg-white/5">
            <Bell className="h-5 w-5 text-gray-300" />
          </button>

          <UserMenu
            name={user?.name}
            email={user?.email}
            avatarUrl={user?.avatar_url}
          />
        </div>
      </div>
    </header>
  );
}