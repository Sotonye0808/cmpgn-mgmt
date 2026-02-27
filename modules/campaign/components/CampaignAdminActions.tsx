"use client";

import Button from "@/components/ui/Button";
import { ICONS } from "@/config/icons";
import { useAuth } from "@/hooks/useAuth";

interface CampaignAdminActionsProps {
  onCreateNew?: () => void;
  onRefresh?: () => void;
}

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

export default function CampaignAdminActions({
  onCreateNew,
  onRefresh,
}: CampaignAdminActionsProps) {
  const { hasRole } = useAuth();

  if (!hasRole(ALLOWED_ROLES as unknown as string[])) return null;

  return (
    <div className="flex items-center gap-2">
      {onRefresh && (
        <Button
          variant="ghost"
          size="small"
          icon={<ICONS.refresh />}
          onClick={onRefresh}>
          Refresh
        </Button>
      )}
      <Button
        variant="primary"
        size="small"
        icon={<ICONS.add />}
        onClick={onCreateNew}>
        New Campaign
      </Button>
    </div>
  );
}
