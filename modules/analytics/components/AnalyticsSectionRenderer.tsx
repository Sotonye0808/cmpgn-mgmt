"use client";

import { ANALYTICS_SECTIONS } from "@/modules/analytics/config";

type RoleValue = "USER" | "TEAM_LEAD" | "ADMIN" | "SUPER_ADMIN";

interface Props {
  userRole: RoleValue;
  renderSection: (sectionKey: string) => React.ReactNode;
}

export default function AnalyticsSectionRenderer({
  userRole,
  renderSection,
}: Props) {
  const permitted = ANALYTICS_SECTIONS.filter((s) =>
    s.allowedRoles.includes(userRole),
  );

  return (
    <div className="space-y-8">
      {permitted.map((section) => (
        <section key={section.key}>{renderSection(section.key)}</section>
      ))}
    </div>
  );
}
