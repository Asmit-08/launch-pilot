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
      <main className="min-h-screen bg-[#f8fafc] text-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />

              <div>
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-36 animate-pulse rounded bg-slate-100" />
              </div>
            </div>

            <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
          </div>

          <div className="mt-12 animate-pulse">
            <div className="h-3 w-32 rounded bg-slate-200" />

            <div className="mt-5 h-12 w-96 max-w-full rounded-xl bg-slate-200" />

            <div className="mt-4 h-5 w-[520px] max-w-full rounded bg-slate-100" />
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <LoadingCard />
            <LoadingCard />
          </div>

          <div className="mt-8 h-36 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
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
    <div className="h-44 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
      <div className="h-12 w-12 rounded-xl bg-slate-100" />

      <div className="mt-6 h-5 w-40 rounded bg-slate-100" />

      <div className="mt-3 h-3 w-64 max-w-full rounded bg-slate-100" />
    </div>
  );
}