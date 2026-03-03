"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import BrandLogo from "@/components/ui/BrandLogo";

const NAV_LINKS = [
  { label: "How It Works", href: ROUTES.HOW_IT_WORKS },
  { label: "About", href: ROUTES.ABOUT },
  { label: "Contact", href: ROUTES.CONTACT },
] as const;

interface Props {
  className?: string;
}

/**
 * Lightweight cookie-based auth check — avoids a network round-trip.
 * Returns true when the httpOnly access-token cookie exists (set by the
 * auth system). This is not a security gate — just a UI hint.
 */
function useIsAuthenticated(): boolean {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    // The JWT middleware uses "access_token" as the cookie name.
    setAuthed(document.cookie.split(";").some((c) => c.trim().startsWith("access_token=")));
  }, []);
  return authed;
}

export default function PublicHeader({ className }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close menu on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <header className={`glass-nav sticky top-0 z-40 ${className ?? ""}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* ─── Brand ─── */}
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo size="sm" />
          <span className="font-bold text-ds-text-primary">
            {NAV_CONTENT.brandName}
          </span>
        </Link>

        {/* ─── Desktop nav (md+) ─── */}
        <div className="hidden md:flex items-center gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="public-nav-link text-ds-text-secondary hover:text-ds-brand-accent text-sm font-medium transition-colors">
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link
              href={ROUTES.DASHBOARD}
              className="public-nav-cta px-4 py-2 bg-ds-brand-accent text-white rounded-ds-lg text-sm font-medium hover:bg-ds-brand-accent-hover hover:glow-border transition-all">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href={ROUTES.LOGIN}
                className="public-nav-link text-ds-text-secondary hover:text-ds-brand-accent text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link
                href={ROUTES.REGISTER}
                className="public-nav-cta px-4 py-2 bg-ds-brand-accent text-white rounded-ds-lg text-sm font-medium hover:bg-ds-brand-accent-hover hover:glow-border transition-all">
                Enlist Now
              </Link>
            </>
          )}
        </div>

        {/* ─── Mobile hamburger (< md) ─── */}
        <button
          ref={buttonRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden relative w-8 h-8 flex items-center justify-center text-ds-text-primary">
          {/* Animated hamburger → X */}
          <span className="sr-only">{open ? "Close" : "Menu"}</span>
          <span
            aria-hidden
            className={`absolute h-0.5 w-5 bg-current rounded transition-all duration-200 ${
              open ? "rotate-45 translate-y-0" : "-translate-y-1.5"
            }`}
          />
          <span
            aria-hidden
            className={`absolute h-0.5 w-5 bg-current rounded transition-all duration-200 ${
              open ? "opacity-0 scale-x-0" : "opacity-100"
            }`}
          />
          <span
            aria-hidden
            className={`absolute h-0.5 w-5 bg-current rounded transition-all duration-200 ${
              open ? "-rotate-45 translate-y-0" : "translate-y-1.5"
            }`}
          />
        </button>
      </div>

      {/* ─── Mobile dropdown ─── */}
      <div
        ref={menuRef}
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}>
        <nav className="px-6 pb-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="public-nav-link block py-2 text-sm font-medium text-ds-text-secondary hover:text-ds-brand-accent transition-colors">
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link
              href={ROUTES.DASHBOARD}
              className="public-nav-cta mt-1 block text-center px-4 py-2 bg-ds-brand-accent text-white rounded-ds-lg text-sm font-medium hover:bg-ds-brand-accent-hover transition-all">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href={ROUTES.LOGIN}
                className="public-nav-link block py-2 text-sm font-medium text-ds-text-secondary hover:text-ds-brand-accent transition-colors">
                Sign In
              </Link>
              <Link
                href={ROUTES.REGISTER}
                className="public-nav-cta mt-1 block text-center px-4 py-2 bg-ds-brand-accent text-white rounded-ds-lg text-sm font-medium hover:bg-ds-brand-accent-hover transition-all">
                Enlist Now
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
