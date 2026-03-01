import { ICONS } from "@/config/icons";
import { cn } from "@/lib/utils/cn";

interface FaqItem {
  key: string;
  question: string;
  answer: string;
}

interface PublicFaqAccordionProps {
  items: readonly FaqItem[];
  title?: string;
  className?: string;
}

/**
 * Reusable FAQ accordion for public pages.
 * Uses native <details> for zero-JS expand/collapse.
 */
export default function PublicFaqAccordion({
  items,
  title = "Frequently Asked Questions",
  className,
}: PublicFaqAccordionProps) {
  return (
    <section className={cn("border-t border-ds-border-base", className)}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        {title && (
          <h2 className="text-3xl font-bold text-ds-text-primary text-center mb-10">
            {title}
          </h2>
        )}
        <div className="space-y-3">
          {items.map((item) => (
            <details
              key={item.key}
              className="glass-surface rounded-ds-xl p-5 group cursor-pointer">
              <summary className="font-semibold text-ds-text-primary list-none flex items-center justify-between gap-3">
                <span>{item.question}</span>
                <ICONS.arrowDown className="text-ds-text-subtle shrink-0 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-3 text-ds-text-secondary text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
