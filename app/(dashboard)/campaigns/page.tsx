"use client";

import CampaignList from "@/modules/campaign/components/CampaignList";
import PageHeader from "@/components/ui/PageHeader";
import { CAMPAIGN_CONTENT } from "@/config/content";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title={CAMPAIGN_CONTENT.page.title}
        subtitle={CAMPAIGN_CONTENT.page.description}
      />
      <CampaignList showFilters showAdminActions defaultView="stories" />
    </div>
  );
}
