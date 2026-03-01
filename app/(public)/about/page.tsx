import { ABOUT_PAGE_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import Link from "next/link";
import PublicPageHero from "@/components/ui/PublicPageHero";
import PublicStatsBar from "@/components/ui/PublicStatsBar";

export const metadata = {
  title: ABOUT_PAGE_CONTENT.meta.title,
  description: ABOUT_PAGE_CONTENT.meta.description,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PublicPageHero
        eyebrow={ABOUT_PAGE_CONTENT.hero.eyebrow}
        headline={ABOUT_PAGE_CONTENT.hero.headline}
        subheadline={ABOUT_PAGE_CONTENT.hero.subheadline}
      />

      <PublicStatsBar stats={ABOUT_PAGE_CONTENT.stats} cols={3} />

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
