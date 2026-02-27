"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { useDonations } from "@/modules/donation/hooks/useDonations";
import DonationForm from "@/modules/donation/components/DonationForm";
import DonationHistory from "@/modules/donation/components/DonationHistory";
import { DONATION_PAGE_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";

export default function DonationsPage() {
  const { user } = useAuth();
  const { donations, total, loading, page, setPage, refresh } = useDonations();

  const [campaigns, setCampaigns] = useState<{ id: string; title: string }[]>(
    [],
  );
  const [campsLoading, setCampsLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch(ROUTES.API.CAMPAIGNS.BASE);
      if (!res.ok) return;
      const json = await res.json();
      setCampaigns(
        (json.data ?? []).map((c: { id: string; title: string }) => ({
          id: c.id,
          title: c.title,
        })),
      );
    } finally {
      setCampsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ds-text-primary">
          {DONATION_PAGE_CONTENT.title}
        </h1>
        <p className="text-sm text-ds-text-subtle mt-1">
          {DONATION_PAGE_CONTENT.subtitle}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Donation Form */}
        <div className="lg:col-span-1">
          {campsLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <DonationForm campaigns={campaigns} onSuccess={refresh} />
          )}
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <DonationHistory
            donations={donations}
            total={total}
            page={page}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
