import { EventEmitter } from "events";
import { seedMockDb } from "./seed";

// Each table exposes the same surface as Prisma model delegates
// for a mechanical Phase 14 swap.

type TableName =
    | "users"
    | "campaigns"
    | "participations"
    | "smartLinks"
    | "linkEvents"
    | "referrals"
    | "donations"
    | "pointsLedger"
    | "leaderboardSnapshots"
    | "trustScores"
    | "notifications"
    | "viewProofs"
    | "groups"
    | "teams"
    | "teamInviteLinks"
    | "campaignAuditEvents";

// ─── File Persistence (server-only, lazy-loaded) ─────────────────────────────
// fs/path are loaded via require() inside functions so webpack never bundles them
// into client code.  On the client side the helpers gracefully no-op.

function isServer(): boolean {
    return typeof window === "undefined";
}

function getPersistPaths(): { dir: string; file: string } {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const p = require("path") as typeof import("path");
        const dir = p.resolve(process.cwd(), ".data");
        return { dir, file: p.join(dir, "db-persist.json") };
    } catch {
        return { dir: "", file: "" };
    }
}

function readPersistedData(): Record<string, unknown[]> | null {
    if (!isServer()) return null;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const f = require("fs") as typeof import("fs");
        const { file } = getPersistPaths();
        if (file && f.existsSync(file)) {
            const raw = f.readFileSync(file, "utf-8");
            return JSON.parse(raw) as Record<string, unknown[]>;
        }
    } catch {
        // Corrupted file — ignore and re-seed
    }
    return null;
}

function writePersistedData(data: Record<string, unknown[]>): void {
    if (!isServer()) return;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const f = require("fs") as typeof import("fs");
        const { dir, file } = getPersistPaths();
        if (!file) return;
        if (!f.existsSync(dir)) {
            f.mkdirSync(dir, { recursive: true });
        }
        f.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
    } catch {
        // Swallow write errors in dev — in-memory still works
    }
}

interface MockTable<T extends { id: string }> {
    findUnique: (args: { where: { id?: string;[key: string]: unknown } }) => T | null;
    findMany: (args?: {
        where?: Partial<T>;
        orderBy?: { [K in keyof T]?: "asc" | "desc" };
        take?: number;
        skip?: number;
    }) => T[];
    create: (args: { data: Omit<T, "id"> & { id?: string } }) => T;
    update: (args: { where: { id: string }; data: Partial<T> }) => T | null;
    delete: (args: { where: { id: string } }) => T | null;
    count: (args?: { where?: Partial<T> }) => number;
}

function createTable<T extends { id: string }>(
    initial: T[] = [],
    onMutate?: () => void
): MockTable<T> & { _data: T[] } {
    const data: T[] = [...initial];

    return {
        _data: data,
        findUnique({ where }) {
            return (
                data.find((item) =>
                    Object.entries(where).every(([k, v]) => (item as Record<string, unknown>)[k] === v)
                ) ?? null
            );
        },
        findMany({ where, orderBy, take, skip } = {}) {
            let result = data.filter((item) => {
                if (!where) return true;
                return Object.entries(where).every(
                    ([k, v]) => (item as Record<string, unknown>)[k] === v
                );
            });
            if (orderBy) {
                const [field, dir] = Object.entries(orderBy)[0] as [keyof T, "asc" | "desc"];
                result = [...result].sort((a, b) => {
                    const av = a[field];
                    const bv = b[field];
                    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
                    return dir === "asc" ? cmp : -cmp;
                });
            }
            if (skip) result = result.slice(skip);
            if (take) result = result.slice(0, take);
            return result;
        },
        create({ data: input }) {
            const id = input.id ?? crypto.randomUUID();
            const record = { ...input, id } as unknown as T;
            data.push(record);
            onMutate?.();
            return record;
        },
        update({ where, data: input }) {
            const idx = data.findIndex((item) => item.id === where.id);
            if (idx === -1) return null;
            data[idx] = { ...data[idx], ...input };
            onMutate?.();
            return data[idx];
        },
        delete({ where }) {
            const idx = data.findIndex((item) => item.id === where.id);
            if (idx === -1) return null;
            const [removed] = data.splice(idx, 1);
            onMutate?.();
            return removed;
        },
        count({ where } = {}) {
            if (!where) return data.length;
            return data.filter((item) =>
                Object.entries(where).every(([k, v]) => (item as Record<string, unknown>)[k] === v)
            ).length;
        },
    };
}

class MockDb extends EventEmitter {
    users!: MockTable<User> & { _data: User[] };
    campaigns!: MockTable<Campaign> & { _data: Campaign[] };
    participations!: MockTable<CampaignParticipation> & { _data: CampaignParticipation[] };
    smartLinks!: MockTable<SmartLink> & { _data: SmartLink[] };
    linkEvents!: MockTable<LinkEvent> & { _data: LinkEvent[] };
    referrals!: MockTable<Referral> & { _data: Referral[] };
    donations!: MockTable<Donation> & { _data: Donation[] };
    pointsLedger!: MockTable<PointsLedgerEntry> & { _data: PointsLedgerEntry[] };
    leaderboardSnapshots!: MockTable<LeaderboardSnapshot> & { _data: LeaderboardSnapshot[] };
    trustScores!: MockTable<TrustScore> & { _data: TrustScore[] };
    notifications!: MockTable<AppNotification> & { _data: AppNotification[] };
    viewProofs!: MockTable<ViewProof> & { _data: ViewProof[] };
    groups!: MockTable<Group> & { _data: Group[] };
    teams!: MockTable<Team> & { _data: Team[] };
    teamInviteLinks!: MockTable<TeamInviteLink> & { _data: TeamInviteLink[] };
    campaignAuditEvents!: MockTable<CampaignAuditEvent> & { _data: CampaignAuditEvent[] };

    constructor() {
        super();
        this.setMaxListeners(50);
        this._seed();
    }

    /** Persist all current table data to disk */
    private _persist(): void {
        writePersistedData({
            users: this.users._data,
            campaigns: this.campaigns._data,
            participations: this.participations._data,
            smartLinks: this.smartLinks._data,
            linkEvents: this.linkEvents._data,
            referrals: this.referrals._data,
            donations: this.donations._data,
            pointsLedger: this.pointsLedger._data,
            leaderboardSnapshots: this.leaderboardSnapshots._data,
            trustScores: this.trustScores._data,
            notifications: this.notifications._data,
            viewProofs: this.viewProofs._data,
            groups: this.groups._data,
            teams: this.teams._data,
            teamInviteLinks: this.teamInviteLinks._data,
            campaignAuditEvents: this.campaignAuditEvents._data,
        });
    }

    private _seed() {
        const persisted = readPersistedData();
        const seed = seedMockDb();
        const onMutate = () => this._persist();

        if (persisted) {
            // Merge: persisted data takes priority, but ensure seed fixture users always exist
            const persistedUsers = (persisted.users ?? []) as User[];
            const seedUserIds = new Set(seed.users.map((u) => u.id));
            // Keep seed users (always fresh passwords/fields) + any runtime-registered users
            const runtimeUsers = persistedUsers.filter((u) => !seedUserIds.has(u.id));
            const mergedUsers = [...seed.users, ...runtimeUsers];

            this.users = createTable<User>(mergedUsers, onMutate);
            this.campaigns = createTable<Campaign>((persisted.campaigns ?? seed.campaigns) as Campaign[], onMutate);
            this.participations = createTable<CampaignParticipation>((persisted.participations ?? seed.participations) as CampaignParticipation[], onMutate);
            this.smartLinks = createTable<SmartLink>((persisted.smartLinks ?? seed.smartLinks) as SmartLink[], onMutate);
            this.linkEvents = createTable<LinkEvent>((persisted.linkEvents ?? seed.linkEvents) as LinkEvent[], onMutate);
            this.referrals = createTable<Referral>((persisted.referrals ?? seed.referrals) as Referral[], onMutate);
            this.donations = createTable<Donation>((persisted.donations ?? seed.donations) as Donation[], onMutate);
            this.pointsLedger = createTable<PointsLedgerEntry>((persisted.pointsLedger ?? seed.pointsLedger) as PointsLedgerEntry[], onMutate);
            this.leaderboardSnapshots = createTable<LeaderboardSnapshot>((persisted.leaderboardSnapshots ?? seed.leaderboardSnapshots) as LeaderboardSnapshot[], onMutate);
            this.trustScores = createTable<TrustScore>((persisted.trustScores ?? seed.trustScores) as TrustScore[], onMutate);
            this.notifications = createTable<AppNotification>((persisted.notifications ?? seed.notifications ?? []) as AppNotification[], onMutate);
            this.viewProofs = createTable<ViewProof>((persisted.viewProofs ?? seed.viewProofs ?? []) as ViewProof[], onMutate);
            this.groups = createTable<Group>((persisted.groups ?? seed.groups ?? []) as Group[], onMutate);
            this.teams = createTable<Team>((persisted.teams ?? seed.teams ?? []) as Team[], onMutate);
            this.teamInviteLinks = createTable<TeamInviteLink>((persisted.teamInviteLinks ?? seed.teamInviteLinks ?? []) as TeamInviteLink[], onMutate);
            this.campaignAuditEvents = createTable<CampaignAuditEvent>((persisted.campaignAuditEvents ?? seed.campaignAuditEvents ?? []) as CampaignAuditEvent[], onMutate);
        } else {
            this.users = createTable<User>(seed.users, onMutate);
            this.campaigns = createTable<Campaign>(seed.campaigns, onMutate);
            this.participations = createTable<CampaignParticipation>(seed.participations, onMutate);
            this.smartLinks = createTable<SmartLink>(seed.smartLinks, onMutate);
            this.linkEvents = createTable<LinkEvent>(seed.linkEvents, onMutate);
            this.referrals = createTable<Referral>(seed.referrals, onMutate);
            this.donations = createTable<Donation>(seed.donations, onMutate);
            this.pointsLedger = createTable<PointsLedgerEntry>(seed.pointsLedger, onMutate);
            this.leaderboardSnapshots = createTable<LeaderboardSnapshot>(seed.leaderboardSnapshots, onMutate);
            this.trustScores = createTable<TrustScore>(seed.trustScores, onMutate);
            this.notifications = createTable<AppNotification>(seed.notifications ?? [], onMutate);
            this.viewProofs = createTable<ViewProof>(seed.viewProofs ?? [], onMutate);
            this.groups = createTable<Group>(seed.groups ?? [], onMutate);
            this.teams = createTable<Team>(seed.teams ?? [], onMutate);
            this.teamInviteLinks = createTable<TeamInviteLink>(seed.teamInviteLinks ?? [], onMutate);
            this.campaignAuditEvents = createTable<CampaignAuditEvent>(seed.campaignAuditEvents ?? [], onMutate);
            // Initial persist to disk
            this._persist();
        }
    }

    emit(event: TableName | `${TableName}:changed` | string, ...args: unknown[]): boolean {
        return super.emit(event, ...args);
    }

    async transaction<T>(callback: (tx: this) => Promise<T>): Promise<T> {
        // In dev: runs sequentially; Phase 14 swaps to prisma.$transaction()
        return callback(this);
    }

    reset() {
        // Delete persisted file to get a clean seed
        if (isServer()) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const f = require("fs") as typeof import("fs");
                const { file } = getPersistPaths();
                if (f.existsSync(file)) f.unlinkSync(file);
            } catch { /* ignore */ }
        }
        this._seed();
    }
}

// Global singleton
const globalForMockDb = global as unknown as { mockDb: MockDb };
export const mockDb = globalForMockDb.mockDb ?? new MockDb();
if (process.env.NODE_ENV !== "production") globalForMockDb.mockDb = mockDb;
