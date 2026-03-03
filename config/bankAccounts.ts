/**
 * Bank Account Configuration
 *
 * Centralised bank account data for donation flows.
 * Each campaign can reference a subset of these via `campaign.bankAccountIds`.
 * Donors select a bank account when recording an offline donation, then upload proof of payment.
 *
 * In production this will move to a DB table manageable via admin UI.
 * For the MVP mock phase it lives as a config constant.
 */

export const BANK_ACCOUNTS: BankAccount[] = [
    {
        id: "bank-1",
        accountName: "Harvesters International Christian Centre",
        accountNumber: "0012345678",
        bankName: "Guaranty Trust Bank (GTBank)",
        currency: "NGN",
        isActive: true,
        sortOrder: 1,
    },
    {
        id: "bank-2",
        accountName: "Harvesters Missions & Outreach",
        accountNumber: "0098765432",
        bankName: "First Bank of Nigeria",
        currency: "NGN",
        isActive: true,
        sortOrder: 2,
    },
    {
        id: "bank-3",
        accountName: "Harvesters International (USD)",
        accountNumber: "1234567890",
        bankName: "Zenith Bank",
        currency: "USD",
        isActive: true,
        sortOrder: 3,
    },
    {
        id: "bank-4",
        accountName: "Harvesters UK Giving",
        accountNumber: "87654321",
        bankName: "Barclays Bank",
        currency: "GBP",
        isActive: true,
        sortOrder: 4,
    },
] satisfies BankAccount[];

/** Active accounts sorted by `sortOrder` */
export const ACTIVE_BANK_ACCOUNTS = BANK_ACCOUNTS.filter((a) => a.isActive).sort(
    (a, b) => a.sortOrder - b.sortOrder
);

/** Lookup by ID */
export function getBankAccountById(id: string): BankAccount | undefined {
    return BANK_ACCOUNTS.find((a) => a.id === id);
}

/** Filter accounts by currency */
export function getBankAccountsByCurrency(currency: string): BankAccount[] {
    return ACTIVE_BANK_ACCOUNTS.filter((a) => a.currency === currency);
}

/** Bank account display label */
export function formatBankAccountLabel(account: BankAccount): string {
    return `${account.bankName} — ${account.accountNumber} (${account.currency})`;
}

/** Donation currency options (derived from active accounts) */
export const DONATION_CURRENCIES = [
    ...new Set(ACTIVE_BANK_ACCOUNTS.map((a) => a.currency)),
] as const;

/** Status labels for donation verification flow */
export const DONATION_STATUS_CONFIG: Record<
    string,
    { label: string; color: string; description: string }
> = {
    PENDING: {
        label: "Pending",
        color: "orange",
        description: "Awaiting proof of payment upload",
    },
    RECEIVED: {
        label: "Received",
        color: "blue",
        description: "Proof uploaded — awaiting admin verification",
    },
    VERIFIED: {
        label: "Verified",
        color: "green",
        description: "Payment confirmed by admin",
    },
    REJECTED: {
        label: "Rejected",
        color: "red",
        description: "Payment proof did not match — follow up required",
    },
    COMPLETED: {
        label: "Completed",
        color: "green",
        description: "Online payment completed automatically",
    },
    FAILED: {
        label: "Failed",
        color: "red",
        description: "Payment processing failed",
    },
    REFUNDED: {
        label: "Refunded",
        color: "purple",
        description: "Payment has been refunded",
    },
};
