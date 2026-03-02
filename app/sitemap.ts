import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/config/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/how-it-works"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic: active public campaigns (if any are publicly listed)
  let campaignRoutes: MetadataRoute.Sitemap = [];
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
    });
    campaignRoutes = campaigns.map((c: { id: string; updatedAt: Date }) => ({
      url: absoluteUrl(`/campaigns/${c.id}`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable at build time — skip dynamic routes gracefully
  }

  return [...staticRoutes, ...campaignRoutes];
}
