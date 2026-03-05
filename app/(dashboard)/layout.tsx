"use client";

// DashboardLayout is a Client Component because it manages mobile drawer state.
// The sidebar open/close state lives here so both Sidebar and Header can share it.
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ICONS } from "@/config/icons";
import { cn } from "@/lib/utils/cn";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-close the mobile drawer whenever the user navigates to a new route
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Show scroll-to-top FAB after 300px of scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 300);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setMobileOpen(true)} />
        {/* Scrollable region — header stays fixed above, only content + footer scroll */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <main className="p-3 sm:p-4 md:p-6">
            {children}
          </main>
          <Footer />
        </div>
      </div>

      {/* Scroll-to-top FAB — appears after 300px of downward scroll.
           Styled to match the FloatingActions glass buttons for consistency. */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className={cn(
            "fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50",
            "w-10 h-10 flex items-center justify-center rounded-ds-xl",
            "border border-ds-border-base bg-ds-surface-elevated/80 backdrop-blur-sm",
            "text-ds-text-secondary shadow-lg",
            "hover:text-ds-brand-accent hover:border-ds-brand-accent/50 hover:bg-ds-surface-elevated",
            "transition-all duration-200",
          )}>
          <ICONS.arrowUp className="text-sm" />
        </button>
      )}
    </div>
  );
}
