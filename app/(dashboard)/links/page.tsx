"use client";

import { useState, useEffect } from "react";
import { Row, Col } from "antd";
import SmartLinkCard from "@/modules/links/components/SmartLinkCard";
import SmartLinkStats from "@/modules/links/components/SmartLinkStats";
import Empty from "@/components/ui/Empty";
import Spinner from "@/components/ui/Spinner";
import { SMART_LINK_CONTENT } from "@/config/content";

export default function LinksPage() {
  const [links, setLinks] = useState<SmartLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch("/api/smart-links");
        const json = await res.json();
        setLinks(json.data ?? []);
      } catch {
        // Silently handle — empty state renders below
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-ds-text-primary">
          {SMART_LINK_CONTENT.page.title}
        </h1>
        <p className="text-sm text-ds-text-secondary mt-1">
          {SMART_LINK_CONTENT.page.description}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : links.length === 0 ? (
        <Empty
          title={SMART_LINK_CONTENT.page.emptyTitle}
          description={SMART_LINK_CONTENT.page.emptyDescription}
        />
      ) : (
        <>
          {/* Stats summary */}
          <div className="glass-surface rounded-ds-xl p-5">
            <SmartLinkStats links={links} />
          </div>

          {/* Link cards */}
          <Row gutter={[16, 16]}>
            {links.map((link) => (
              <Col key={link.id} xs={24} md={12} xl={8}>
                <SmartLinkCard link={link} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
}
