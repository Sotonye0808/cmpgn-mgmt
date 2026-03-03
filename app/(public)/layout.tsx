import PublicFooter from "@/components/layout/PublicFooter";
import PublicHeader from "@/components/layout/PublicHeader";
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
        className="pointer-events-none fixed inset-0 -z-10 ambient-glow-public"
      />
      <PublicHeader />

      <main className="flex-1">{children}</main>

      <PublicFooter />
      <CookieConsent />
    </div>
  );
}
