"use client";

import CampaignList from "@/modules/campaign/components/CampaignList";
import MyCampaignsPanel from "@/modules/campaign/components/MyCampaignsPanel";
import PageHeader from "@/components/ui/PageHeader";
import { CAMPAIGN_CONTENT } from "@/config/content";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title={CAMPAIGN_CONTENT.page.title}
        subtitle={CAMPAIGN_CONTENT.page.description}
      />
      <div className="grid grid-cols-1 gap-6 items-start">
        <CampaignList showFilters showAdminActions defaultView="stories" />
        <MyCampaignsPanel />
      </div>
    </div>
  );
}
