import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface CtaButton {
  label: string;
  href: string;
  variant?: "primary" | "outline";
}

interface PublicCtaSectionProps {
  heading: string;
  body: string;
  buttons: CtaButton[];
  className?: string;
}

/**
 * Reusable bottom CTA section for public pages.
 */
export default function PublicCtaSection({
  heading,
  body,
  buttons,
  className,
}: PublicCtaSectionProps) {
  return (
    <section
      className={cn(
        "border-t border-ds-border-base py-14 text-center",
        className,
      )}>
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-ds-text-primary mb-4">
          {heading}
        </h2>
        <p className="text-ds-text-secondary mb-8">{body}</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {buttons.map((btn) => (
            <Link
              key={btn.href}
              href={btn.href}
              className={cn(
                "px-10 py-3 rounded-ds-xl font-semibold text-base transition-all",
                btn.variant === "outline"
                  ? "border border-ds-border-base text-ds-text-primary hover:border-ds-brand-accent hover:text-ds-brand-accent"
                  : "bg-ds-brand-accent text-white hover:bg-ds-brand-accent-hover hover:glow-border",
              )}>
              {btn.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
