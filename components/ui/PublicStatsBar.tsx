import { cn } from "@/lib/utils/cn";

interface StatItem {
  key: string;
  label: string;
  value: string;
}

interface PublicStatsBarProps {
  stats: readonly StatItem[];
  cols?: 2 | 3 | 4;
  className?: string;
}

/**
 * Reusable stats bar for public pages (homepage, how-it-works, about).
 */
export default function PublicStatsBar({
  stats,
  cols = 4,
  className,
}: PublicStatsBarProps) {
  const gridCols: Record<2 | 3 | 4, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <section
      className={cn(
        "border-y border-ds-border-base py-10 bg-ds-surface-elevated/40",
        className,
      )}>
      <div className="max-w-5xl mx-auto px-6">
        <div className={cn("grid gap-6 text-center", gridCols[cols])}>
          {stats.map((stat) => (
            <div key={stat.key}>
              <div className="text-3xl font-extrabold text-ds-brand-accent font-ds-mono">
                {stat.value}
              </div>
              <div className="text-sm text-ds-text-subtle mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
