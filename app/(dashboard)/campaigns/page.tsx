"use client";

import CampaignList from "@/modules/campaign/components/CampaignList";
import { CAMPAIGN_CONTENT } from "@/config/content";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ds-text-primary">
          {CAMPAIGN_CONTENT.page.title}
        </h1>
        <p className="text-ds-text-secondary text-sm mt-1">
          {CAMPAIGN_CONTENT.page.description}
        </p>
      </div>
      <CampaignList showFilters showAdminActions defaultView="stories" />
    </div>
  );
}
