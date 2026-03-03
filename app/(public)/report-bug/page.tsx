import type { Metadata } from "next";
import { BUG_REPORT_CONTENT } from "@/config/content";
import { SITE_CONFIG, absoluteUrl, ogImages } from "@/config/seo";
import PublicPageHero from "@/components/ui/PublicPageHero";
import BugReportForm from "./BugReportForm";

export const metadata: Metadata = {
  title: BUG_REPORT_CONTENT.meta.title,
  description: BUG_REPORT_CONTENT.meta.description,
  alternates: { canonical: absoluteUrl("/report-bug") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/report-bug"),
    title: `${BUG_REPORT_CONTENT.meta.title} | ${SITE_CONFIG.name}`,
    description: BUG_REPORT_CONTENT.meta.description,
    siteName: SITE_CONFIG.name,
    images: ogImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUG_REPORT_CONTENT.meta.title} | ${SITE_CONFIG.name}`,
    description: BUG_REPORT_CONTENT.meta.description,
    images: [SITE_CONFIG.ogImage],
  },
};

export default function ReportBugPage() {
  return (
    <div className="min-h-screen">
      <PublicPageHero
        eyebrow={BUG_REPORT_CONTENT.hero.eyebrow}
        headline={BUG_REPORT_CONTENT.hero.headline}
        subheadline={BUG_REPORT_CONTENT.hero.subheadline}
      />
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <BugReportForm />
      </section>
    </div>
  );
}
