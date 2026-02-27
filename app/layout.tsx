import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AntdProvider } from "@/providers/AntdProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { LANDING_CONTENT } from "@/config/content";

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
  title: LANDING_CONTENT.meta.title,
  description: LANDING_CONTENT.meta.description,
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
            <AuthProvider>{children}</AuthProvider>
          </AntdProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
