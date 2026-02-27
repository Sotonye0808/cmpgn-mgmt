import Link from "next/link";
import { ROUTES } from "@/config/routes";
import {
  LANDING_CONTENT,
  NAV_CONTENT,
  HOW_IT_WORKS_STEPS,
  FAQ_ITEMS,
} from "@/config/content";
import { ICONS } from "@/config/icons";

export default function LandingPage() {
  const StatItem = ({ label, value }: { label: string; value: string }) => (
    <div className="text-center">
      <div className="text-3xl font-extrabold text-ds-brand-accent font-ds-mono">
        {value}
      </div>
      <div className="text-sm text-ds-text-subtle mt-1">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-ds-full border border-ds-brand-accent/30 bg-ds-brand-accent-subtle text-ds-brand-accent text-sm font-medium mb-8">
          <ICONS.rocket className="text-base" />
          {NAV_CONTENT.brandTagline}
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-ds-text-primary leading-tight tracking-tight mb-6">
          {LANDING_CONTENT.hero.headline}
        </h1>
        <p className="text-xl text-ds-text-secondary max-w-2xl mx-auto mb-10">
          {LANDING_CONTENT.hero.subheadline}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href={ROUTES.REGISTER}
            className="px-8 py-4 bg-ds-brand-accent text-white rounded-ds-xl font-semibold text-lg hover:bg-ds-brand-accent-hover hover:glow-border transition-all">
            {LANDING_CONTENT.hero.cta}
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="px-8 py-4 border border-ds-border-base text-ds-text-primary rounded-ds-xl font-semibold text-lg hover:border-ds-brand-accent hover:text-ds-brand-accent transition-all">
            {LANDING_CONTENT.hero.ctaSecondary}
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-ds-border-base py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {LANDING_CONTENT.stats.map((stat) => (
            <StatItem key={stat.key} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-ds-text-primary text-center mb-4">
          Everything You Need to Mobilize at Scale
        </h2>
        <p className="text-ds-text-secondary text-center max-w-xl mx-auto mb-16">
          One platform for smart link distribution, referral tracking,
          gamification, and analytics.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LANDING_CONTENT.features.map((feature) => {
            const Icon = ICONS[feature.icon];
            return (
              <div
                key={feature.key}
                className="glass-surface rounded-ds-xl p-6 hover:glow-border transition-all duration-200 group">
                <div className="w-10 h-10 rounded-ds-lg bg-ds-brand-accent/10 flex items-center justify-center mb-4 group-hover:bg-ds-brand-accent/20 transition-colors">
                  <Icon className="text-ds-brand-accent text-xl" />
                </div>
                <h3 className="font-semibold text-ds-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-ds-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-ds-border-base py-24 bg-ds-surface-base/40">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-ds-text-primary text-center mb-4">
            How It Works
          </h2>
          <p className="text-ds-text-secondary text-center max-w-xl mx-auto mb-16">
            Get up and running in minutes. No technical setup required.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div key={step.key} className="text-center">
                <div className="w-12 h-12 rounded-full bg-ds-brand-accent text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-ds-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-ds-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-ds-text-primary text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.key}
              className="glass-surface rounded-ds-xl p-6 group cursor-pointer">
              <summary className="font-semibold text-ds-text-primary list-none flex items-center justify-between">
                {item.question}
                <ICONS.arrowDown className="text-ds-text-subtle group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-ds-text-secondary text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-ds-border-base py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-ds-text-primary mb-4">
            Ready to Mobilize?
          </h2>
          <p className="text-ds-text-secondary mb-8">
            Join thousands of mobilizers already using DMHicc to track, grow,
            and lead their digital campaigns.
          </p>
          <Link
            href={ROUTES.REGISTER}
            className="px-10 py-4 bg-ds-brand-accent text-white rounded-ds-xl font-semibold text-lg hover:bg-ds-brand-accent-hover hover:glow-border transition-all">
            {LANDING_CONTENT.hero.cta}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ds-border-base py-8 text-center">
        <p className="text-sm text-ds-text-subtle">
          {LANDING_CONTENT.footer.copyright}
        </p>
        <p className="text-xs text-ds-text-muted mt-1">
          {LANDING_CONTENT.footer.tagline}
        </p>
      </footer>
    </div>
  );
}
