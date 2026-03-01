import { NAV_CONTENT } from "@/config/content";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import PublicFooter from "@/components/layout/PublicFooter";
import CookieConsent from "@/components/ui/CookieConsent";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ds-surface-base flex flex-col relative overflow-hidden">
      {/* Ambient radial glows — give glass surfaces meaningful content to blur against */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(124,58,237,0.12) 0%, transparent 65%), radial-gradient(ellipse 50% 35% at 85% 100%, rgba(124,58,237,0.08) 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 10% 80%, rgba(16,185,129,0.05) 0%, transparent 50%)",
        }}
      />
      <header className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-ds-lg bg-ds-brand-accent glow-border flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-ds-text-primary">
              {NAV_CONTENT.brandName}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.HOW_IT_WORKS}
              className="text-ds-text-secondary hover:text-ds-brand-accent text-sm font-medium transition-colors">
              How It Works
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="text-ds-text-secondary hover:text-ds-brand-accent text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className="px-4 py-2 bg-ds-brand-accent text-white rounded-ds-lg text-sm font-medium hover:bg-ds-brand-accent-hover hover:glow-border transition-all">
              Enlist Now
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <PublicFooter />
      <CookieConsent />
    </div>
  );
}
