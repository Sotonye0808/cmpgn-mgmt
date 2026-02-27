import { TERMS_PAGE_CONTENT } from "@/config/content";

export const metadata = {
  title: TERMS_PAGE_CONTENT.meta.title,
  description: TERMS_PAGE_CONTENT.meta.description,
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-10">
        <p className="text-sm font-semibold text-ds-brand-accent uppercase tracking-wider mb-3">
          {TERMS_PAGE_CONTENT.hero.eyebrow}
        </p>
        <h1 className="text-4xl font-extrabold text-ds-text-primary tracking-tight mb-3">
          {TERMS_PAGE_CONTENT.hero.headline}
        </h1>
        <p className="text-sm text-ds-text-subtle">
          {TERMS_PAGE_CONTENT.hero.effectiveDate}
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        {/* Intro */}
        <p className="text-ds-text-secondary leading-relaxed mb-10 border-b border-ds-border-base pb-8">
          {TERMS_PAGE_CONTENT.intro}
        </p>

        {/* Sections */}
        <div className="space-y-10">
          {TERMS_PAGE_CONTENT.sections.map((section) => (
            <div key={section.key}>
              <h2 className="text-lg font-bold text-ds-text-primary mb-3">
                {section.heading}
              </h2>
              <div className="space-y-3">
                {section.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-sm text-ds-text-secondary leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
