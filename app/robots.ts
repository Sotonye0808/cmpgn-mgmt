import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/config/seo";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/how-it-works", "/about", "/contact", "/terms", "/privacy"],
                disallow: [
                    "/dashboard/",
                    "/api/",
                    "/c/",         // smart link redirects — no crawl value
                    "/invite/",    // invite tokens expire — no indexing
                    "/(auth)/",
                ],
            },
        ],
        sitemap: absoluteUrl("/sitemap.xml"),
        host: SITE_URL,
    };
}
