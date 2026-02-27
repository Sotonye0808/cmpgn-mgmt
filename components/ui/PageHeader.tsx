import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Right-side slot — CTAs, filters, segmented controls, etc. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader — DS-compliant page header block.
 *
 * Replaces the repeated
 *   `flex flex-col sm:flex-row sm:items-center justify-between gap-4`
 *   + h1 + p pattern found across 10+ dashboard pages.
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        className,
      )}>
      <div>
        <h1 className="text-2xl font-bold text-ds-text-primary">{title}</h1>
        {subtitle && (
          <p className="text-sm text-ds-text-subtle mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      )}
    </div>
  );
}
