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

        setUser(currentUser);
        setProjects(projectData ?? []);
      } catch (error) {
        console.error("Dashboard loading failed:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading...
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