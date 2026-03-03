import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface CtaButton {
  label: string;
  href: string;
  variant?: "primary" | "outline";
}

interface PublicPageHeroProps {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  cta?: CtaButton[];
  align?: "center" | "left";
  className?: string;
}

/**
 * Reusable hero section for all public pages.
 * Tighter padding than the original per-page implementations.
 */
export default function PublicPageHero({
  eyebrow,
  headline,
  subheadline,
  cta,
  align = "center",
  className,
}: PublicPageHeroProps) {
  const isCenter = align === "center";

  return (
    <section
      className={cn(
        "max-w-4xl mx-auto px-6 pt-12 pb-10",
        isCenter && "text-center",
        className,
      )}>
      {eyebrow && (
        <p className="text-sm font-semibold text-ds-brand-accent uppercase tracking-wider mb-4">
          {eyebrow}
        </p>
      )}
      <h1 className="text-4xl md:text-5xl font-extrabold text-ds-text-primary leading-tight tracking-tight mb-5">
        {headline}
      </h1>
      {subheadline && (
        <p
          className={cn(
            "text-lg text-ds-text-secondary",
            isCenter && "max-w-2xl mx-auto",
          )}>
          {subheadline}
        </p>
      )}
      {cta && cta.length > 0 && (
        <div
          className={cn(
            "flex flex-wrap gap-4 mt-8",
            isCenter && "justify-center",
          )}>
          {cta.map((btn) => (
            <Link
              key={btn.href}
              href={btn.href}
              className={cn(
                "px-8 py-3 rounded-ds-xl font-semibold text-base transition-all",
                btn.variant === "outline"
                  ? "border border-ds-border-base text-ds-text-primary hover:border-ds-brand-accent hover:text-ds-brand-accent"
                  : "bg-ds-brand-accent text-white hover:bg-ds-brand-accent-hover hover:glow-border",
              )}>
              {btn.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
