"use client";

// DashboardLayout is a Client Component because it manages mobile drawer state.
// The sidebar open/close state lives here so both Sidebar and Header can share it.
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-ds-surface-base relative">
      {/* Ambient glow — gives glass nav + sidebar brand block something to blur against */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 ambient-glow-dashboard"
      />
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
