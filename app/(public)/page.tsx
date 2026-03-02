import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/config/routes";
import { LANDING_CONTENT, NAV_CONTENT } from "@/config/content";
import { ICONS } from "@/config/icons";
import { mockDb } from "@/lib/data/mockDb";
import { RANK_LEVELS } from "@/config/ranks";
import PublicCtaSection from "@/components/ui/PublicCtaSection";
import PublicActiveCampaigns from "@/components/ui/PublicActiveCampaigns";

function getRankForScore(score: number): (typeof RANK_LEVELS)[number] {
  let current = RANK_LEVELS[0];
  for (const rank of RANK_LEVELS) {
    if (score >= rank.minScore) current = rank;
  }
  return current;
}

export default function LandingPage() {
  // Featured mega campaign (or highest-participant active campaign)
  const allCampaigns = mockDb.campaigns.findMany({
    where: { status: "ACTIVE" as unknown as CampaignStatus },
  });
  const megaCampaign = allCampaigns.find((c) => c.isMegaCampaign);
  const featuredCampaign =
    megaCampaign ??
    allCampaigns.sort(
      (a, b) => (b.participantCount ?? 0) - (a.participantCount ?? 0),
    )[0];

  // Top 5 mobilizers from leaderboard
  const allPoints = mockDb.pointsLedger.findMany();
  const userScores: Record<string, number> = {};
  for (const entry of allPoints) {
    userScores[entry.userId] = (userScores[entry.userId] ?? 0) + entry.value;
  }
  const topUserIds = Object.entries(userScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topMobilizers = topUserIds.map(([userId, score], idx) => {
    const user = mockDb.users.findUnique({ where: { id: userId } });
    const rank = getRankForScore(score);
    return {
      position: idx + 1,
      firstName: user?.firstName ?? "Unknown",
      lastName: user?.lastName ?? "",
      profilePicture: user?.profilePicture,
      score,
      rank,
    };
  });

  // Sub-campaign count for mega
  const subCampaignCount = featuredCampaign?.isMegaCampaign
    ? allCampaigns.filter((c) => c.parentCampaignId === featuredCampaign.id)
        .length
    : 0;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-10 text-center">
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
            href={ROUTES.HOW_IT_WORKS}
            className="px-8 py-4 border border-ds-border-base text-ds-text-primary rounded-ds-xl font-semibold text-lg hover:border-ds-brand-accent hover:text-ds-brand-accent transition-all">
            {LANDING_CONTENT.hero.ctaSecondary}
          </Link>
        </div>
      </section>

      {/* Featured Mission + Top 5 Soldiers — side-by-side on large screens */}
      {(featuredCampaign || topMobilizers.length > 0) && (
        <section className="border-t border-ds-border-base py-14">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-10">
              {/* Featured Campaign — 7/12 columns */}
              {featuredCampaign && (
                <div className="lg:col-span-7">
                  <h2 className="text-2xl font-bold text-ds-text-primary mb-2">
                    Featured Mission
                  </h2>
                  <p className="text-ds-text-secondary mb-6 text-sm">
                    The flagship operation currently mobilizing the army.
                  </p>
                  <div className="glass-surface rounded-ds-xl p-6 hover:glow-border transition-all">
                    <div className="flex flex-col gap-6">
                      {featuredCampaign.thumbnailUrl && (
                        <Image
                          src={featuredCampaign.thumbnailUrl}
                          alt={featuredCampaign.title}
                          className="w-full h-40 object-cover rounded-ds-lg"
                          width={500}
                          height={160}
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          {featuredCampaign.isMegaCampaign && (
                            <span className="px-3 py-1 bg-ds-brand-accent text-white text-xs font-bold rounded-ds-full uppercase tracking-wider">
                              MEGA
                            </span>
                          )}
                          <span className="px-3 py-1 border border-ds-brand-accent/30 text-ds-brand-accent text-xs font-semibold rounded-ds-full">
                            Active
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-ds-text-primary mb-2">
                          {featuredCampaign.title}
                        </h3>
                        <p className="text-ds-text-secondary text-sm mb-4 line-clamp-2">
                          {featuredCampaign.description}
                        </p>
                        <div className="flex flex-wrap gap-6 text-sm">
                          <div>
                            <span className="text-ds-text-subtle">
                              Soldiers:{" "}
                            </span>
                            <span className="font-semibold text-ds-text-primary">
                              {(
                                featuredCampaign.participantCount ?? 0
                              ).toLocaleString()}
                            </span>
                          </div>
                          {featuredCampaign.goalTarget && (
                            <div>
                              <span className="text-ds-text-subtle">
                                Goal:{" "}
                              </span>
                              <span className="font-semibold text-ds-text-primary">
                                {featuredCampaign.goalTarget.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {subCampaignCount > 0 && (
                            <div>
                              <span className="text-ds-text-subtle">
                                Sub-Missions:{" "}
                              </span>
                              <span className="font-semibold text-ds-text-primary">
                                {subCampaignCount}
                              </span>
                            </div>
                          )}
                        </div>
                        {featuredCampaign.goalTarget &&
                          featuredCampaign.goalCurrent != null && (
                            <div className="mt-4">
                              <div className="w-full bg-ds-surface-elevated rounded-full h-2">
                                <div
                                  className="bg-ds-brand-accent h-2 rounded-full transition-all bar-dynamic"
                                  style={{
                                    '--_bar-w': `${Math.min(
                                      100,
                                      Math.round(
                                        (featuredCampaign.goalCurrent /
                                          featuredCampaign.goalTarget) *
                                          100,
                                      ),
                                    )}%`,
                                  } as React.CSSProperties}
                                />
                              </div>
                              <p className="text-xs text-ds-text-subtle mt-1">
                                {Math.round(
                                  (featuredCampaign.goalCurrent /
                                    featuredCampaign.goalTarget) *
                                    100,
                                )}
                                % progress
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top 5 Mobilizers — 5/12 columns */}
              {topMobilizers.length > 0 && (
                <div className="lg:col-span-5">
                  <h2 className="text-2xl font-bold text-ds-text-primary mb-2">
                    Top 5 Digital Soldiers
                  </h2>
                  <p className="text-ds-text-secondary mb-6 text-sm">
                    The highest-ranking soldiers across all missions.
                  </p>
                  <div className="space-y-3">
                    {topMobilizers.map((soldier) => (
                      <div
                        key={soldier.position}
                        className="glass-surface rounded-ds-xl p-4 flex items-center gap-4 hover:glow-border transition-all">
                        <div className="w-9 h-9 rounded-full bg-ds-brand-accent/10 flex items-center justify-center font-extrabold text-ds-brand-accent text-sm shrink-0">
                          #{soldier.position}
                        </div>
                        {soldier.profilePicture ? (
                          <Image
                            src={soldier.profilePicture}
                            alt={soldier.firstName}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                            width={36}
                            height={36}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-ds-surface-elevated flex items-center justify-center shrink-0">
                            <ICONS.user className="text-ds-text-subtle" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-ds-text-primary truncate text-sm">
                            {soldier.firstName} {soldier.lastName}
                          </p>
                          <p className="text-xs text-ds-text-subtle">
                            {soldier.rank.badge} {soldier.rank.name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-ds-text-primary font-ds-mono text-sm">
                            {soldier.score.toLocaleString()}
                          </p>
                          <p className="text-xs text-ds-text-subtle">pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <PublicActiveCampaigns
        campaigns={allCampaigns.slice(0, 6).map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          thumbnailUrl: c.thumbnailUrl,
          mediaUrl: c.mediaUrl,
          participantCount: c.participantCount,
          goalTarget: c.goalTarget,
          goalCurrent: c.goalCurrent,
          isMegaCampaign: c.isMegaCampaign,
        }))}
      />

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="text-3xl font-bold text-ds-text-primary text-center mb-4">
          Everything You Need to Deploy at Scale
        </h2>
        <p className="text-ds-text-secondary text-center max-w-xl mx-auto mb-12">
          One command center for ammunition distribution, recruitment tracking,
          military rank progression, and war room analytics.
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

      <PublicCtaSection
        heading="Ready to Enlist?"
        body="Join thousands of digital soldiers already using DMHicc to deploy, recruit, and lead their missions."
        buttons={[
          { label: LANDING_CONTENT.hero.cta, href: ROUTES.REGISTER },
          {
            label: LANDING_CONTENT.hero.ctaSecondary,
            href: ROUTES.HOW_IT_WORKS,
            variant: "outline",
          },
        ]}
      />
    </div>
  );
}
