import { cn } from "@/lib/utils/cn";

const PADDING_MAP = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
} as const;

interface GlassCardProps {
  /** Controls internal padding. Defaults to "md" (p-5). */
  padding?: keyof typeof PADDING_MAP;
  className?: string;
  children: React.ReactNode;
}

/**
 * GlassCard — DS-compliant glass surface container.
 *
 * DS glassmorphism applies ONLY to:
 *   - KPI/stat bento cards → use StatCard instead
 *   - Analytics overview blocks
 *   - Modal headers
 *
 * NOT for: data tables, forms, sidebar, dense list screens.
 *
 * Centralising the glass-surface class here means the A1 globals.css
 * fix propagates automatically to all 12+ usage sites.
 */
export default function GlassCard({
  padding = "md",
  className,
  children,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-surface rounded-ds-xl",
        PADDING_MAP[padding],
        className,
      )}>
      {children}
    </div>
  );
}
