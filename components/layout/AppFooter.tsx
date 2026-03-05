import Link from "next/link";
import {
  DASHBOARD_FOOTER_CONTENT,
  PUBLIC_FOOTER_CONTENT,
} from "@/config/content";
import BrandLogo from "@/components/ui/BrandLogo";

export type FooterVariant = "dashboard" | "public";

interface AppFooterProps {
  variant?: FooterVariant;
}

/**
 * AppFooter — unified footer for both the dashboard and public/auth layouts.
 *
 * Server component — no client state needed.
 * variant="dashboard"  → dashboard shell; brand links to /dashboard; shows app-internal columns
 * variant="public"     → landing + auth shells; brand links to /; shows public columns
 *
 * All content is config-driven (DASHBOARD_FOOTER_CONTENT / PUBLIC_FOOTER_CONTENT).
 */
export default function AppFooter({ variant = "public" }: AppFooterProps) {
  const isDashboard = variant === "dashboard";
  const content = isDashboard
    ? DASHBOARD_FOOTER_CONTENT
    : PUBLIC_FOOTER_CONTENT;
  const homeHref = isDashboard ? "/dashboard" : "/";

  return (
    <footer className="glass-footer py-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top grid: brand column + link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand column — links to home */}
          <div className="md:col-span-1">
            <Link
              href={homeHref}
              className="inline-flex items-center gap-2 mb-3 group"
              aria-label="Go to home page">
              <BrandLogo size="xs" glow={false} />
              <span className="font-bold text-ds-text-primary text-sm group-hover:text-ds-brand-accent transition-colors">
                {content.brand.name}
              </span>
            </Link>
            <p className="text-xs text-ds-text-subtle leading-relaxed">
              {content.brand.tagline}
            </p>
          </div>

          {/* Link columns */}
          {content.columns.map((col) => (
            <div key={col.key}>
              <h3 className="text-xs font-semibold text-ds-text-secondary uppercase tracking-wider mb-3">
                {col.heading}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-sm text-ds-text-subtle hover:text-ds-brand-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar — 3-slot layout on sm+ so the centered dev credit never
            overlaps the fixed FloatingActions button at bottom-right.
            Mobile: stacked column, all centered.
            sm+:   grid with copyright left | dev credit center | rights right
                   The rights slot carries sm:pr-16 to clear the FAB button. */}
        <div className="border-t border-ds-border-glass pt-6">
          {/* Mobile stack */}
          <div className="flex flex-col items-center gap-1.5 text-xs text-ds-text-disabled sm:hidden">
            <span>
              © {new Date().getFullYear()} {content.legal.copyright.entity}
            </span>
            <span>
              {content.developer.label}{" "}
              <a
                href={content.developer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ds-text-subtle hover:text-ds-brand-accent transition-colors">
                {content.developer.name}
              </a>
            </span>
            <span>{content.legal.rights}</span>
          </div>

          {/* sm+ three-column */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 text-xs text-ds-text-disabled">
            {/* Left — copyright */}
            <p>
              © {new Date().getFullYear()} {content.legal.copyright.entity}
            </p>

            {/* Center — dev credit */}
            <p className="text-center whitespace-nowrap">
              {content.developer.label}{" "}
              <a
                href={content.developer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ds-text-subtle hover:text-ds-brand-accent transition-colors">
                {content.developer.name}
              </a>
            </p>

            {/* Right — rights text; pr-16 clears the 40px FAB + 24px gap at right-6 */}
            <p className="text-right pr-16">{content.legal.rights}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
