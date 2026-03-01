import { PRIVACY_PAGE_CONTENT } from "@/config/content";
import PublicPageHero from "@/components/ui/PublicPageHero";

export const metadata = {
  title: PRIVACY_PAGE_CONTENT.meta.title,
  description: PRIVACY_PAGE_CONTENT.meta.description,
};

type CookieRow = {
  key: string;
  name: string;
  purpose: string;
  type: string;
  duration: string;
};

type PrivacySection = {
  key: string;
  heading: string;
  anchor?: string;
  paragraphs: readonly string[];
  cookieTable?: readonly CookieRow[];
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <PublicPageHero
        eyebrow={PRIVACY_PAGE_CONTENT.hero.eyebrow}
        headline={PRIVACY_PAGE_CONTENT.hero.headline}
        subheadline={PRIVACY_PAGE_CONTENT.hero.effectiveDate}
        align="left"
      />
      <section className="max-w-3xl mx-auto px-6 pb-20">
        {/* Intro */}
        <p className="text-ds-text-secondary leading-relaxed mb-10 border-b border-ds-border-base pb-8">
          {PRIVACY_PAGE_CONTENT.intro}
        </p>

        {/* Sections */}
        <div className="space-y-10">
          {(PRIVACY_PAGE_CONTENT.sections as readonly PrivacySection[]).map(
            (section) => (
              <div key={section.key} id={section.anchor}>
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

                {/* Cookie table — only in the cookies section */}
                {section.cookieTable && (
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm border border-ds-border-base rounded-ds-lg overflow-hidden">
                      <thead>
                        <tr className="bg-ds-surface-elevated border-b border-ds-border-base">
                          <th className="px-4 py-3 text-left font-semibold text-ds-text-primary text-xs uppercase tracking-wide">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-ds-text-primary text-xs uppercase tracking-wide">
                            Purpose
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-ds-text-primary text-xs uppercase tracking-wide">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-ds-text-primary text-xs uppercase tracking-wide">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.cookieTable.map((row, i) => (
                          <tr
                            key={row.key}
                            className={
                              i % 2 === 0
                                ? "bg-ds-surface-base"
                                : "bg-ds-surface-elevated/30"
                            }>
                            <td className="px-4 py-3 font-mono text-xs text-ds-brand-accent whitespace-nowrap">
                              {row.name}
                            </td>
                            <td className="px-4 py-3 text-xs text-ds-text-secondary">
                              {row.purpose}
                            </td>
                            <td className="px-4 py-3 text-xs text-ds-text-subtle whitespace-nowrap">
                              {row.type}
                            </td>
                            <td className="px-4 py-3 text-xs text-ds-text-subtle whitespace-nowrap">
                              {row.duration}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
