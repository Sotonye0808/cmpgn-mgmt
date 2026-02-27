"use client";

import { useState } from "react";
import { useFlaggedUsers } from "@/modules/trust/hooks/useTrust";
import FlaggedUsersTable from "@/modules/trust/components/FlaggedUsersTable";
import TrustReviewModal from "@/modules/trust/components/TrustReviewModal";
import { TRUST_PAGE_CONTENT } from "@/config/content";
import { useAuth } from "@/hooks/useAuth";
import { Empty } from "antd";

export default function TrustReviewPage() {
  const { user, hasRole } = useAuth();
  const { flaggedUsers, loading, refresh } = useFlaggedUsers();
  const [reviewing, setReviewing] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  if (!user || !hasRole(["ADMIN", "SUPER_ADMIN"])) {
    return (
      <Empty
        description="You don't have permission to view this page."
        className="py-24"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ds-text-primary">
          {TRUST_PAGE_CONTENT.title}
        </h1>
        <p className="text-sm text-ds-text-subtle mt-1">
          {TRUST_PAGE_CONTENT.subtitle}
        </p>
      </div>

      <FlaggedUsersTable
        users={flaggedUsers}
        loading={loading}
        onReview={(userId) => {
          const u = flaggedUsers.find((f) => f.userId === userId);
          if (u)
            setReviewing({
              userId,
              name: `${u.firstName} ${u.lastName}`,
            });
        }}
      />

      {reviewing && (
        <TrustReviewModal
          open
          userId={reviewing.userId}
          userName={reviewing.name}
          onClose={() => setReviewing(null)}
          onResolved={() => {
            setReviewing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
