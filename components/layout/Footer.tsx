import Link from "next/link";
import { DASHBOARD_FOOTER_CONTENT } from "@/config/content";

/**
 * Footer — dashboard app shell footer.
 *
 * Server component — no client state needed.
 * All content comes from config/content.ts (DASHBOARD_FOOTER_CONTENT).
 */
export default function Footer() {
  return (
    <footer className="shrink-0 glass-footer py-4 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Quick links */}
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          {DASHBOARD_FOOTER_CONTENT.quickLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="text-xs text-ds-text-subtle hover:text-ds-brand-accent transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Attribution + legal */}
        <div className="text-right text-xs text-ds-text-disabled space-y-0.5">
          <div>
            {DASHBOARD_FOOTER_CONTENT.developer.label}{" "}
            <a
              href={DASHBOARD_FOOTER_CONTENT.developer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ds-text-subtle hover:text-ds-brand-accent transition-colors">
              {DASHBOARD_FOOTER_CONTENT.developer.name}
            </a>
          </div>
          <div>{DASHBOARD_FOOTER_CONTENT.legal}</div>
        </div>
      </div>
    </footer>
  );
}
