"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NOT_FOUND_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { ICONS } from "@/config/icons";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-ds-surface-base flex items-center justify-center p-6">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-ds-brand-accent opacity-[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* 404 code */}
        <div className="mb-6">
          <span className="text-[120px] font-bold font-ds-mono leading-none text-ds-brand-accent opacity-20 select-none">
            {NOT_FOUND_CONTENT.code}
          </span>
        </div>

        {/* Glass card */}
        <div className="glass-surface rounded-ds-2xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-ds-xl bg-ds-brand-accent-subtle flex items-center justify-center mx-auto">
            <ICONS.warning className="text-3xl text-ds-brand-accent" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-ds-text-primary">
              {NOT_FOUND_CONTENT.title}
            </h1>
            <p className="text-ds-text-secondary text-sm mt-2">
              {NOT_FOUND_CONTENT.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => router.back()}>
              <ICONS.left className="text-base mr-1" />
              {NOT_FOUND_CONTENT.backButton}
            </Button>
            <Link href={ROUTES.DASHBOARD} className="flex-1">
              <Button variant="secondary" className="w-full">
                {NOT_FOUND_CONTENT.homeButton}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
