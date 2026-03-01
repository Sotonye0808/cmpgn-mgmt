"use client";

import { useState, useEffect, useCallback } from "react";
import { Row, Col, Modal, Select, message } from "antd";
import SmartLinkCard from "@/modules/links/components/SmartLinkCard";
import SmartLinkStats from "@/modules/links/components/SmartLinkStats";
import Empty from "@/components/ui/Empty";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { SMART_LINK_CONTENT } from "@/config/content";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { ICONS } from "@/config/icons";

export default function LinksPage() {
  const [links, setLinks] = useState<
    (SmartLink & { campaignTitle?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<{ id: string; title: string }[]>(
    [],
  );
  const [selectedCampaign, setSelectedCampaign] = useState<
    string | undefined
  >();
  const [generating, setGenerating] = useState(false);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/smart-links");
      const json = await res.json();
      setLinks(json.data ?? []);
    } catch {
      // Silently handle — empty state renders below
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const openModal = async () => {
    setSelectedCampaign(undefined);
    setModalOpen(true);
    try {
      const res = await fetch("/api/campaigns?status=ACTIVE&pageSize=50");
      const json = await res.json();
      setCampaigns(
        (json.data ?? []).map((c: { id: string; title: string }) => ({
          id: c.id,
          title: c.title,
        })),
      );
    } catch {
      /* silent */
    }
  };

  const handleGenerate = async () => {
    if (!selectedCampaign) {
      message.warning("Please select a campaign first.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/smart-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: selectedCampaign }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to generate link");
      message.success("Smart link generated!");
      setModalOpen(false);
      await fetchLinks();
    } catch (e: unknown) {
      message.error(
        e instanceof Error ? e.message : "Could not generate link.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={SMART_LINK_CONTENT.page.title}
        subtitle={SMART_LINK_CONTENT.page.description}
        actions={
          <Button variant="primary" icon={<ICONS.add />} onClick={openModal}>
            Generate New Link
          </Button>
        }
      />

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
          <GlassCard padding="md">
            <SmartLinkStats links={links} />
          </GlassCard>

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

      {/* Generate Link Modal */}
      <Modal
        open={modalOpen}
        title="Generate Smart Link"
        onCancel={() => setModalOpen(false)}
        onOk={handleGenerate}
        okText="Generate"
        okButtonProps={{ loading: generating }}
        destroyOnHidden>
        <div className="py-4 space-y-4">
          <p className="text-sm text-ds-text-secondary">
            Select a campaign to generate your unique smart link. If you already
            have a link for a campaign, the existing one will be returned.
          </p>
          <Select
            placeholder="Select a campaign…"
            value={selectedCampaign}
            onChange={setSelectedCampaign}
            className="w-full"
            options={campaigns.map((c) => ({ value: c.id, label: c.title }))}
          />
        </div>
      </Modal>
    </div>
  );
}
