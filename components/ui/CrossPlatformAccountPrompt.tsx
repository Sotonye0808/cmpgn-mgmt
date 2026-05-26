import Link from "next/link";
import { ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { formatPlatformName } from "@/lib/services/cisCheck";

export type CrossPlatformAccountInfo = {
  platforms: string[];
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export default function CrossPlatformAccountPrompt({
  account,
  onContinue,
}: {
  account: CrossPlatformAccountInfo;
  onContinue: () => void;
}) {
  const displayName = [account.firstName, account.lastName].filter(Boolean).join(" ") || account.email;

  const platformList = account.platforms.map(formatPlatformName);
  const primary = platformList[0];
  const others = platformList.slice(1);

  let message: string;
  if (platformList.length === 1) {
    message = `An account with this email already exists on ${primary}. Sign in to link your accounts.`;
  } else if (platformList.length === 2) {
    message = `An account with this email already exists on ${primary} and ${others[0]}. Sign in to link your accounts.`;
  } else {
    const rest = others.slice(0, -1).join(", ");
    message = `An account with this email already exists on ${primary}, ${rest}, and ${others[others.length - 1]}. Sign in to link your accounts.`;
  }

  return (
    <div className="border border-ds-brand-primary/20 bg-ds-brand-primary/5 rounded-ds-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-ds-brand-primary text-lg font-bold">!</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ds-text-primary">{displayName}</p>
          <p className="mt-1 text-sm text-ds-text-secondary">{message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={ROUTES.LOGIN}>
              <Button variant="primary" size="large">
                Sign In Instead
              </Button>
            </Link>
            <Button variant="secondary" size="large" onClick={onContinue}>
              Continue with Signup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
