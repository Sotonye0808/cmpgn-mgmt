import { ABOUT_PAGE_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import Link from "next/link";

export const metadata = {
  title: ABOUT_PAGE_CONTENT.meta.title,
  description: ABOUT_PAGE_CONTENT.meta.description,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-sm font-semibold text-ds-brand-accent uppercase tracking-wider mb-4">
          {ABOUT_PAGE_CONTENT.hero.eyebrow}
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-ds-text-primary leading-tight tracking-tight mb-6">
          {ABOUT_PAGE_CONTENT.hero.headline}
        </h1>
        <p className="text-lg text-ds-text-secondary max-w-2xl mx-auto">
          {ABOUT_PAGE_CONTENT.hero.subheadline}
        </p>
      </section>

      {/* Stats row */}
      <section className="border-y border-ds-border-base py-10 bg-ds-surface-elevated/40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {ABOUT_PAGE_CONTENT.stats.map((stat) => (
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

      {/* Body sections */}
      <section className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        {ABOUT_PAGE_CONTENT.sections.map((section) => (
          <div key={section.key}>
            <h2 className="text-xl font-bold text-ds-text-primary mb-3">
              {section.heading}
            </h2>
            <p className="text-ds-text-secondary leading-relaxed">
              {section.body}
            </p>
          </div>
        ))}

        {/* Team / purpose callout */}
        <div className="rounded-ds-xl border border-ds-border-base bg-ds-surface-elevated p-6">
          <h2 className="text-lg font-bold text-ds-text-primary mb-2">
            {ABOUT_PAGE_CONTENT.teamSection.heading}
          </h2>
          <p className="text-ds-text-secondary leading-relaxed text-sm">
            {ABOUT_PAGE_CONTENT.teamSection.body}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <Link
          href={ROUTES.REGISTER}
          className="inline-block px-8 py-4 bg-ds-brand-accent text-white rounded-ds-xl font-semibold hover:bg-ds-brand-accent-hover transition-colors">
          Get Started
        </Link>
      </section>
    </div>
  );
}
