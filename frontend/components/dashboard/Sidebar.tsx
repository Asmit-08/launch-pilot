"use client";

import {
  X,
  History,
  Pin,
  Globe,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-90 bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          ${
            isOpen
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-100
          h-screen w-80
          border-r border-white/10
          bg-[#020617]
          transition-transform duration-300
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">

          <div>
            <h2 className="text-xl font-semibold text-white">
              Launch Pilot
            </h2>

            <p className="text-sm text-gray-400">
              Workspace
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-white/5"
          >
            <X size={20} />
          </button>

        </div>

        {/* Navigation */}
        <nav className="space-y-2 p-5">

          <SidebarItem
            icon={<History size={20} />}
            title="Recent Work"
          />

          <SidebarItem
            icon={<Pin size={20} />}
            title="Pinned"
          />

          <SidebarItem
            icon={<Globe size={20} />}
            title="Landing Pages"
          />

        </nav>

        <div className="mx-5 border-t border-white/10" />

        <nav className="space-y-2 p-5">

          <SidebarItem
            icon={<Settings size={20} />}
            title="Settings"
          />

          <SidebarItem
            icon={<HelpCircle size={20} />}
            title="Help"
          />

          <SidebarItem
            icon={<LogOut size={20} />}
            title="Logout"
          />

        </nav>

      </aside>
    </>
  );
}

function SidebarItem({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      className="
        group
        flex
        w-full
        items-center
        gap-4
        rounded-2xl
        p-4
        transition-all
        duration-300
        hover:bg-white/5
      "
    >
      <div className="text-gray-400 group-hover:text-blue-400">
        {icon}
      </div>

      <span className="text-white">
        {title}
      </span>
    </button>
  );
}