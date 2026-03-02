import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AntdProvider } from "@/providers/AntdProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import FloatingActions from "@/components/ui/FloatingActions";
import { SITE_CONFIG, SITE_URL, ogImages } from "@/config/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--ds-font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--ds-font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_CONFIG.fullName,
    template: SITE_CONFIG.titleTemplate,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "digital mobilization",
    "campaign management",
    "smart links",
    "referral tracking",
    "church outreach",
    "Harvesters",
    "DMHicc",
  ],
  authors: [{ name: "DMHicc", url: SITE_URL }],
  creator: "DMHicc",
  publisher: "Harvesters",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.fullName,
    description: SITE_CONFIG.description,
    images: ogImages(),
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
    title: SITE_CONFIG.fullName,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <AntdProvider>
            <AuthProvider>
              {children}
              <FloatingActions />
            </AuthProvider>
          </AntdProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
