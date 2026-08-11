import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  dcaConfigs,
  dcaExecutions,
  auditTrails,
  onboardingStatuses,
  webhookEvents,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  } else {
    values.lastSignedIn = new Date();
    updateSet.lastSignedIn = values.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getDCAConfig(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.select().from(dcaConfigs).where(eq(dcaConfigs.userId, userId)).limit(1);
  return result[0] ?? null;
}

export type DCAConfigPatch = Partial<Pick<
  typeof dcaConfigs.$inferInsert,
  "amount" | "tokenOut" | "frequency" | "slippageBps" | "maxGasGwei" | "paused" | "startDate" | "endDate"
>>;

export async function updateDCAConfig(userId: number, patch: DCAConfigPatch) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = await getDCAConfig(userId);

  if (!existing) {
    const created = {
      id: nanoid(),
      userId,
      amount: patch.amount ?? "25",
      tokenOut: patch.tokenOut ?? "WETH",
      frequency: patch.frequency ?? "daily",
      slippageBps: patch.slippageBps ?? 50,
      maxGasGwei: patch.maxGasGwei ?? 20,
      paused: patch.paused ?? false,
      startDate: patch.startDate ?? null,
      endDate: patch.endDate ?? null,
    } as const;
    await db.insert(dcaConfigs).values(created);
    return getDCAConfig(userId);
  }

  await db.update(dcaConfigs)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(dcaConfigs.userId, userId));
  return getDCAConfig(userId);
}

export async function getExecutionHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(dcaExecutions)
    .where(eq(dcaExecutions.userId, userId))
    .orderBy(desc(dcaExecutions.timestamp))
    .limit(Math.min(Math.max(limit, 1), 200));
}

export async function createExecution(execution: typeof dcaExecutions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(dcaExecutions).values(execution);
  return execution;
}

export async function getAuditTrail(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(auditTrails)
    .where(eq(auditTrails.userId, userId))
    .orderBy(desc(auditTrails.timestamp))
    .limit(Math.min(Math.max(limit, 1), 200));
}

export async function createAuditRecord(record: typeof auditTrails.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(auditTrails).values(record);
  return record;
}

export async function getOnboardingStatus(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.select().from(onboardingStatuses).where(eq(onboardingStatuses.userId, userId)).limit(1);
  return result[0] ?? null;
}

export type OnboardingPatch = Partial<Pick<
  typeof onboardingStatuses.$inferInsert,
  "step" | "isWalletConnected" | "hasUsdc" | "hasEth" | "firstTxLanded" | "fundingUrl"
>>;

export async function updateOnboardingStatus(userId: number, patch: OnboardingPatch) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = await getOnboardingStatus(userId);

  if (!existing) {
    const created = {
      id: nanoid(),
      userId,
      step: patch.step ?? "funding",
      isWalletConnected: patch.isWalletConnected ?? false,
      hasUsdc: patch.hasUsdc ?? false,
      hasEth: patch.hasEth ?? false,
      firstTxLanded: patch.firstTxLanded ?? false,
      fundingUrl: patch.fundingUrl ?? "https://coinbase.com/onramp",
    } as const;
    await db.insert(onboardingStatuses).values(created);
    return getOnboardingStatus(userId);
  }

  await db.update(onboardingStatuses)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(onboardingStatuses.userId, userId));
  return getOnboardingStatus(userId);
}

export async function createWebhookEvent(event: typeof webhookEvents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(webhookEvents).values(event);
  return event;
}

export async function getUnprocessedWebhookEvents(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(webhookEvents)
    .where(and(eq(webhookEvents.userId, userId), eq(webhookEvents.processed, false)))
    .orderBy(webhookEvents.createdAt);
}

export async function markWebhookEventProcessed(eventId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(webhookEvents).set({ processed: true }).where(eq(webhookEvents.id, eventId));
}

export type DCAConfigRow = NonNullable<Awaited<ReturnType<typeof getDCAConfig>>>;
export type DCAExecutionRow = Awaited<ReturnType<typeof getExecutionHistory>>[number];
export type AuditTrailRow = Awaited<ReturnType<typeof getAuditTrail>>[number];
export type OnboardingRow = NonNullable<Awaited<ReturnType<typeof getOnboardingStatus>>>;

export function serializeJson(value: unknown): string {
  return JSON.stringify(value, (_key, current) => typeof current === "bigint" ? current.toString() : current);
}

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toIso(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString() : undefined;
}

export function toNumber(value: string | number | null | undefined): number {
  const numberValue = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}
