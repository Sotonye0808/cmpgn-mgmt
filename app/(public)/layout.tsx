import { LANDING_CONTENT } from "@/config/content";
import { NAV_CONTENT } from "@/config/content";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ds-surface-base flex flex-col">
      <header className="border-b border-ds-border-base bg-ds-surface-elevated/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-ds-lg bg-ds-brand-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-ds-text-primary">
              {NAV_CONTENT.brandName}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.LOGIN}
              className="text-ds-text-secondary hover:text-ds-brand-accent text-sm font-medium transition-colors">
              {LANDING_CONTENT.hero.cta === "Get Started"
                ? "Sign In"
                : "Sign In"}
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className="px-4 py-2 bg-ds-brand-accent text-white rounded-ds-lg text-sm font-medium hover:bg-ds-brand-accent-hover transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ds-border-base py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-ds-text-subtle text-sm">
            {LANDING_CONTENT.footer.copyright}
          </p>
          <p className="text-ds-text-disabled text-xs mt-1">
            {LANDING_CONTENT.footer.tagline}
          </p>
        </div>
      </footer>
    </div>
  );
}
