"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/dashboard/Navbar";
import Hero from "@/components/dashboard/Hero";
import ActionGrid from "@/components/dashboard/ActionGrid";
import ContinueWork from "@/components/dashboard/ContinueWork";
import Sidebar from "@/components/dashboard/Sidebar";
import { getCurrentUser } from "@/services/user";

import { getSession } from "@/services/session";

export default function DashboardPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
    const session = await getSession();

    if (!session) {
      router.replace("/auth");
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }

    setLoading(false);
  }

    checkAuth();
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
      />

      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
      />

      <Hero name={user?.name} />

      <ActionGrid />

      <ContinueWork
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    </main>
  );
}