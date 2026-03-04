import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            { protocol: "https", hostname: "res.cloudinary.com" },
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "picsum.photos" },
            { protocol: "https", hostname: "api.dicebear.com" },
        ],
    },
};

export default nextConfig;
