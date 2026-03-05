import Link from "next/link";
import { DASHBOARD_FOOTER_CONTENT } from "@/config/content";
import BrandLogo from "@/components/ui/BrandLogo";

/**
 * Footer — dashboard app shell footer.
 *
 * Server component — no client state needed.
 * Modern columnar layout mirroring the public footer style.
 * All content comes from config/content.ts (DASHBOARD_FOOTER_CONTENT).
 */
export default function Footer() {
  const { brand, columns, legal, developer } = DASHBOARD_FOOTER_CONTENT;
  return (
    <footer className="glass-footer py-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top grid: brand + link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <BrandLogo size="xs" glow={false} />
              <span className="font-bold text-ds-text-primary text-sm">
                {brand.name}
              </span>
            </div>
            <p className="text-xs text-ds-text-subtle leading-relaxed">
              {brand.tagline}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
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

        {/* Bottom bar */}
        <div className="border-t border-ds-border-glass pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-ds-text-disabled">
            © {new Date().getFullYear()} {legal.copyright.entity}
          </p>
          <div className="flex items-center gap-3 text-xs text-ds-text-disabled">
            <span>{legal.rights}</span>
            <span aria-hidden className="text-ds-border-strong">·</span>
            <span>
              {developer.label}{" "}
              <a
                href={developer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ds-text-subtle hover:text-ds-brand-accent transition-colors">
                {developer.name}
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
