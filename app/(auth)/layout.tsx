import { NAV_CONTENT } from "@/config/content";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ds-surface-base flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand Name */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-ds-xl bg-ds-brand-accent flex items-center justify-center">
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
  );
}
