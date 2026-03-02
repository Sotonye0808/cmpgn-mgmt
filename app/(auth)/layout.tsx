import { NAV_CONTENT } from "@/config/content";
import PublicFooter from "@/components/layout/PublicFooter";
import CookieConsent from "@/components/ui/CookieConsent";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ds-surface-base flex flex-col relative overflow-hidden">
      {/* Ambient background glow — gives glass surfaces something to blur against */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 ambient-glow-auth"
      />

      {/* Centred card area */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand Name */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-ds-xl bg-ds-brand-accent glow-border flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-2xl font-extrabold text-ds-text-primary">
                {NAV_CONTENT.brandName}
              </span>
            </div>
          </div>
          {children}
        </div>
      </div>

      <PublicFooter />
      <CookieConsent />
    </div>
  );
}
