import Image from "next/image";
import { SITE_CONFIG } from "@/config/seo";
import { cn } from "@/lib/utils/cn";

/** Size variants — container px dimension + next/image intrinsic size */
const SIZE_MAP = {
  xs: { container: "w-7 h-7", px: 28 },
  sm: { container: "w-8 h-8", px: 32 },
  md: { container: "w-10 h-10", px: 40 },
  lg: { container: "w-12 h-12", px: 48 },
} as const;

type BrandLogoSize = keyof typeof SIZE_MAP;

interface BrandLogoProps {
  size?: BrandLogoSize;
  /** Extra classes on the outer container div */
  className?: string;
  /** Disables the glow-border ring — useful for dense/small contexts */
  glow?: boolean;
}

/**
 * BrandLogo — renders the DMHicc logo from /public/logo.jpg inside the
 * DS-standard branded violet container used across nav, sidebar, and footer.
 *
 * Replaces the "D" letter placeholder universally.
 * Asset path driven by SITE_CONFIG.logoUrl — never hardcoded.
 */
export default function BrandLogo({
  size = "sm",
  className,
  glow = true,
}: BrandLogoProps) {
  const { container, px } = SIZE_MAP[size];

  return (
    <div
      className={cn(
        "rounded-ds-lg bg-ds-brand-accent flex items-center justify-center shrink-0 overflow-hidden",
        glow && "glow-border",
        container,
        className,
      )}>
      <Image
        src={SITE_CONFIG.logoUrl}
        alt="DMHicc logo"
        width={px}
        height={px}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  );
}
