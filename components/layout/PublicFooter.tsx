import Link from "next/link";
import { PUBLIC_FOOTER_CONTENT } from "@/config/content";

/**
 * PublicFooter — shared footer for auth and public (landing) layouts.
 *
 * Server component — no client state needed.
 * All content comes from config/content.ts (PUBLIC_FOOTER_CONTENT).
 */
export default function PublicFooter() {
  return (
    <footer className="glass-footer py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top row: brand + columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-ds-lg bg-ds-brand-accent glow-border flex items-center justify-center">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <span className="font-bold text-ds-text-primary text-sm">
                {PUBLIC_FOOTER_CONTENT.brand.name}
              </span>
            </div>
            <p className="text-xs text-ds-text-subtle leading-relaxed">
              {PUBLIC_FOOTER_CONTENT.brand.tagline}
            </p>
          </div>

          {/* Link columns */}
          {PUBLIC_FOOTER_CONTENT.columns.map((col) => (
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

        {/* Divider */}
        <div className="border-t border-ds-border-glass pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-ds-text-disabled">
            © {new Date().getFullYear()} {PUBLIC_FOOTER_CONTENT.legal.copyright.entity}
          </p>
          <div className="flex items-center gap-3 text-xs text-ds-text-disabled">
            <span>{PUBLIC_FOOTER_CONTENT.legal.rights}</span>
            <span aria-hidden className="text-ds-border-strong">
              ·
            </span>
            <span>
              {PUBLIC_FOOTER_CONTENT.developer.label}{" "}
              <a
                href={PUBLIC_FOOTER_CONTENT.developer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ds-text-subtle hover:text-ds-brand-accent transition-colors">
                {PUBLIC_FOOTER_CONTENT.developer.name}
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
