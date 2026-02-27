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
    | "notifications";

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

function createTable<T extends { id: string }>(initial: T[] = []): MockTable<T> & { _data: T[] } {
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
            return record;
        },
        update({ where, data: input }) {
            const idx = data.findIndex((item) => item.id === where.id);
            if (idx === -1) return null;
            data[idx] = { ...data[idx], ...input };
            return data[idx];
        },
        delete({ where }) {
            const idx = data.findIndex((item) => item.id === where.id);
            if (idx === -1) return null;
            const [removed] = data.splice(idx, 1);
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

    constructor() {
        super();
        this.setMaxListeners(50);
        this._seed();
    }

    private _seed() {
        const seed = seedMockDb();
        this.users = createTable<User>(seed.users);
        this.campaigns = createTable<Campaign>(seed.campaigns);
        this.participations = createTable<CampaignParticipation>(seed.participations);
        this.smartLinks = createTable<SmartLink>(seed.smartLinks);
        this.linkEvents = createTable<LinkEvent>(seed.linkEvents);
        this.referrals = createTable<Referral>(seed.referrals);
        this.donations = createTable<Donation>(seed.donations);
        this.pointsLedger = createTable<PointsLedgerEntry>(seed.pointsLedger);
        this.leaderboardSnapshots = createTable<LeaderboardSnapshot>(seed.leaderboardSnapshots);
        this.trustScores = createTable<TrustScore>(seed.trustScores);
        this.notifications = createTable<AppNotification>(seed.notifications ?? []);
    }

    emit(event: TableName | `${TableName}:changed` | string, ...args: unknown[]): boolean {
        return super.emit(event, ...args);
    }

    async transaction<T>(callback: (tx: this) => Promise<T>): Promise<T> {
        // In dev: runs sequentially; Phase 14 swaps to prisma.$transaction()
        return callback(this);
    }

    reset() {
        this._seed();
    }
}

// Global singleton
const globalForMockDb = global as unknown as { mockDb: MockDb };
export const mockDb = globalForMockDb.mockDb ?? new MockDb();
if (process.env.NODE_ENV !== "production") globalForMockDb.mockDb = mockDb;
