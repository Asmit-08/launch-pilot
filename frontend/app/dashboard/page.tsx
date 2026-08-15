"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/dashboard/Navbar";
import Hero from "@/components/dashboard/Hero";
import ActionGrid from "@/components/dashboard/ActionGrid";
import ContinueWork from "@/components/dashboard/ContinueWork";
import Sidebar from "@/components/dashboard/Sidebar";

import { getCurrentUser } from "@/services/user";
import { getProjects } from "@/services/projects";
import { getSession } from "@/services/session";

interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

interface Project {
  id: string;
  name: string;
  stage: string;
  updated_at: string;
  created_at?: string;
  description?: string | null;
  website?: string | null;
  industry?: string | null;
  is_archived?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const session = await getSession();

        if (!session) {
          router.replace("/auth");
          return;
        }

        const [currentUser, projectData] = await Promise.all([
          getCurrentUser(),
          getProjects(),
        ]);

        if (cancelled) return;

        setUser(currentUser);
        setProjects(projectData ?? []);
      } catch (error) {
        if (cancelled) return;

        console.error("Dashboard loading failed:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-15%] top-[-20%] h-[600px] w-[600px] rounded-full bg-violet-600/[0.08] blur-[150px]" />

          <div className="absolute right-[-10%] top-[5%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.06] blur-[140px]" />

          <div className="absolute bottom-[-20%] left-[25%] h-[500px] w-[500px] rounded-full bg-fuchsia-500/[0.04] blur-[150px]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:56px_56px]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.06]">
                <span className="text-sm font-semibold text-violet-200">
                  P
                </span>
              </div>

              <div className="h-4 w-24 animate-pulse rounded-md bg-white/[0.06]" />
            </div>

            <div className="h-9 w-24 animate-pulse rounded-xl bg-white/[0.05]" />
          </div>

          {/* Main loader */}
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-violet-400/10" />

              <div className="absolute inset-2 rounded-full border border-white/[0.05]" />

              <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-violet-400/80 border-r-blue-400/30" />

              <div className="absolute h-10 w-10 animate-pulse rounded-full bg-violet-500/[0.08] blur-md" />

              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-300" />
              </div>
            </div>

            <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.25em] text-violet-300/80">
              Plavtora workspace
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
              Preparing your dashboard
            </h1>

            <p className="mt-4 max-w-md text-center text-sm leading-6 text-zinc-500">
              Loading your account and startup workspace. This should only
              take a moment.
            </p>

            {/* Progress bar */}
            <div className="mt-8 w-full max-w-xs">
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
                <div className="h-full w-1/3 animate-[dashboardProgress_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400" />
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="mt-14 grid w-full max-w-4xl gap-4 md:grid-cols-3">
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </div>

            <div className="mt-4 h-28 w-full max-w-4xl animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
          </div>
        </div>

        <style jsx>{`
          @keyframes dashboardProgress {
            0% {
              transform: translateX(-120%);
            }

            100% {
              transform: translateX(360%);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={projects}
      />

      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
      />

      <Hero name={user?.name} />

      <ActionGrid />

      <ContinueWork
        projects={projects}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    </main>
  );
}

function LoadingCard() {
  return (
    <div className="h-36 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="h-3 w-24 rounded bg-white/[0.06]" />

      <div className="mt-5 h-7 w-20 rounded bg-white/[0.06]" />

      <div className="mt-4 h-2 w-32 rounded bg-white/[0.04]" />
    </div>
  );
}