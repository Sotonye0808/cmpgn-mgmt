import {
  LANDING_CONTENT,
  HOW_IT_WORKS_STEPS,
  PROOF_PIPELINE_STAGES,
  FAQ_ITEMS,
} from "@/config/content";
import { ROUTES } from "@/config/routes";
import PublicPageHero from "@/components/ui/PublicPageHero";
import PublicStatsBar from "@/components/ui/PublicStatsBar";
import PublicFaqAccordion from "@/components/ui/PublicFaqAccordion";
import PublicCtaSection from "@/components/ui/PublicCtaSection";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <PublicPageHero
        headline="How It Works"
        subheadline="Everything you need to know about deploying with the Digital Mobilization Army."
      />

      <PublicStatsBar stats={LANDING_CONTENT.stats} />

      {/* How It Works Steps */}
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-ds-text-primary text-center mb-4">
            Get Deployed in 5 Steps
          </h2>
          <p className="text-ds-text-secondary text-center max-w-xl mx-auto mb-16">
            From enlistment to full deployment — no technical setup required.
          </p>
          <div className="grid md:grid-cols-5 gap-8">
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

      {/* Proof of Deployment Pipeline */}
      <section className="py-14 bg-ds-surface-alt">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-ds-text-primary text-center mb-4">
            Proof of Deployment Pipeline
          </h2>
          <p className="text-ds-text-secondary text-center max-w-2xl mx-auto mb-12">
            After deploying your ammunition, you submit a screenshot as
            evidence. Every proof follows this pipeline — from submission to
            commander review to Reliability Points credit.
          </p>

          {/* Pipeline visual */}
          <div className="grid md:grid-cols-4 gap-6">
            {PROOF_PIPELINE_STAGES.map((stage, idx) => (
              <div
                key={stage.key}
                className="relative flex flex-col items-center text-center">
                {/* Connector line (not on last items) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+24px)] w-[calc(100%-48px)] h-px bg-ds-border" />
                )}
                {/* Status circle */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3 shrink-0"
                  style={{ backgroundColor: stage.color }}>
                  {stage.step}
                </div>
                {/* Status badge */}
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
                  style={{
                    color: stage.color,
                    backgroundColor: `${stage.color}1A`,
                  }}>
                  {stage.statusLabel}
                </span>
                <h3 className="font-semibold text-ds-text-primary mb-1">
                  {stage.label}
                </h3>
                <p className="text-xs text-ds-text-secondary leading-relaxed">
                  {stage.description}
                </p>
              </div>
            ))}
          </div>

          {/* Note */}
          <p className="text-center text-xs text-ds-text-muted mt-10">
            Reliability Points are credited automatically on approval — no
            manual claim needed.
          </p>
        </div>
      </section>

      <PublicFaqAccordion items={FAQ_ITEMS} />

      <PublicCtaSection
        heading="Ready to Enlist?"
        body="Join the Digital Mobilization Army and start making an impact today."
        buttons={[{ label: LANDING_CONTENT.hero.cta, href: ROUTES.REGISTER }]}
      />
    </div>
  );
}
