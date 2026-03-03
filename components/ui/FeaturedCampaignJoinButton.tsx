"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { ICONS } from "@/config/icons";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

interface Props {
  campaignId: string;
  campaignTitle: string;
}

/**
 * Join button for the featured campaign on the public landing page.
 * Auth'd users → campaign detail page.
 * Guests → login page with ?redirect= back to the campaign.
 */
export default function FeaturedCampaignJoinButton({
  campaignId,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    const destination = ROUTES.CAMPAIGN_DETAIL(campaignId);
    if (user) {
      router.push(destination);
    } else {
      router.push(
        `${ROUTES.LOGIN}?redirect=${encodeURIComponent(destination)}`,
      );
    }
  };

  return (
    <Button
      variant="primary"
      icon={<ICONS.rocket />}
      onClick={handleClick}
      className="mt-5 w-full sm:w-auto">
      {user ? "View Mission" : "Enlist in Mission"}
    </Button>
  );
}
