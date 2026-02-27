import { CONTACT_PAGE_CONTENT } from "@/config/content";
import { ICONS } from "@/config/icons";

export const metadata = {
  title: CONTACT_PAGE_CONTENT.meta.title,
  description: CONTACT_PAGE_CONTENT.meta.description,
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
        <p className="text-sm font-semibold text-ds-brand-accent uppercase tracking-wider mb-4">
          {CONTACT_PAGE_CONTENT.hero.eyebrow}
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-ds-text-primary leading-tight tracking-tight mb-6">
          {CONTACT_PAGE_CONTENT.hero.headline}
        </h1>
        <p className="text-lg text-ds-text-secondary max-w-2xl mx-auto">
          {CONTACT_PAGE_CONTENT.hero.subheadline}
        </p>
      </section>

      {/* Channels grid */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CONTACT_PAGE_CONTENT.channels.map((ch) => {
            const Icon = ICONS[ch.icon];
            return (
              <div
                key={ch.key}
                className="rounded-ds-xl border border-ds-border-base bg-ds-surface-elevated p-6 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-ds-lg bg-ds-brand-accent-subtle border border-ds-brand-accent/30 flex items-center justify-center text-ds-brand-accent text-xl">
                  {Icon ? <Icon /> : null}
                </div>
                <div>
                  <p className="text-xs font-semibold text-ds-text-subtle uppercase tracking-wider mb-1">
                    {ch.label}
                  </p>
                  <p className="text-sm font-medium text-ds-text-primary mb-1">
                    {ch.value}
                  </p>
                  <p className="text-xs text-ds-text-subtle leading-relaxed">
                    {ch.description}
                  </p>
                </div>
                <a
                  href={ch.action.href}
                  target={
                    ch.action.href.startsWith("mailto") ? undefined : "_blank"
                  }
                  rel={
                    ch.action.href.startsWith("mailto")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="mt-auto inline-block text-sm font-medium text-ds-brand-accent hover:underline underline-offset-2 transition-colors">
                  {ch.action.label} →
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Response note */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="rounded-ds-xl border border-ds-border-base bg-ds-surface-elevated/40 p-6 text-center">
          <h2 className="text-base font-semibold text-ds-text-primary mb-2">
            {CONTACT_PAGE_CONTENT.note.heading}
          </h2>
          <p className="text-sm text-ds-text-subtle leading-relaxed">
            {CONTACT_PAGE_CONTENT.note.body}
          </p>
        </div>
      </section>
    </div>
  );
}
