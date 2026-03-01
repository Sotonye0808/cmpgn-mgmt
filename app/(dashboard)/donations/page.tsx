"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton, Tabs, Typography } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { useDonations } from "@/modules/donation/hooks/useDonations";
import DonationForm from "@/modules/donation/components/DonationForm";
import DonationHistory from "@/modules/donation/components/DonationHistory";
import DonationVerificationPanel from "@/modules/donation/components/DonationVerificationPanel";
import { DONATION_PAGE_CONTENT } from "@/config/content";
import PageHeader from "@/components/ui/PageHeader";
import { ROUTES } from "@/config/routes";
import { ICONS } from "@/config/icons";

const { Title } = Typography;

export default function DonationsPage() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(["ADMIN", "SUPER_ADMIN"]);
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

  const donateAndHistory = (
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
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={DONATION_PAGE_CONTENT.title}
        subtitle={DONATION_PAGE_CONTENT.subtitle}
      />

      {isAdmin ? (
        <Tabs
          defaultActiveKey="donate"
          items={[
            {
              key: "donate",
              label: (
                <span className="flex items-center gap-2">
                  <ICONS.dollar />
                  My Donations
                </span>
              ),
              children: donateAndHistory,
            },
            {
              key: "verify",
              label: (
                <span className="flex items-center gap-2">
                  <ICONS.check />
                  Verification Queue
                </span>
              ),
              children: (
                <div className="space-y-4">
                  <Title level={5} className="text-ds-text-primary">
                    Donation Verification
                  </Title>
                  <DonationVerificationPanel />
                </div>
              ),
            },
          ]}
        />
      ) : (
        donateAndHistory
      )}
    </div>
  );
}
