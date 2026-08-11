import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * DCA Configuration table
 */
export const dcaConfigs = mysqlTable("dca_configs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  tokenOut: varchar("tokenOut", { length: 64 }).notNull(),
  frequency: mysqlEnum("frequency", ["hourly", "daily", "weekly"]).notNull(),
  slippageBps: int("slippageBps").notNull(),
  maxGasGwei: int("maxGasGwei").notNull(),
  paused: boolean("paused").default(false).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DCAConfig = typeof dcaConfigs.$inferSelect;
export type InsertDCAConfig = typeof dcaConfigs.$inferInsert;

/**
 * DCA Execution History table
 */
export const dcaExecutions = mysqlTable("dca_executions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: mysqlEnum("status", ["success", "failed", "pending"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  tokenOut: varchar("tokenOut", { length: 64 }).notNull(),
  executedPrice: decimal("executedPrice", { precision: 18, scale: 8 }).notNull(),
  gasUsed: int("gasUsed").notNull(),
  txHash: varchar("txHash", { length: 255 }),
  auditTrailRef: varchar("auditTrailRef", { length: 255 }),
  error: text("error"),
});

export type DCAExecution = typeof dcaExecutions.$inferSelect;
export type InsertDCAExecution = typeof dcaExecutions.$inferInsert;

/**
 * Audit Trail table (ERC-8004 compatible)
 */
export const auditTrails = mysqlTable("audit_trails", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  status: varchar("status", { length: 64 }).notNull(),
  details: text("details").notNull(), // JSON stringified
  txHash: varchar("txHash", { length: 255 }),
  gasUsed: int("gasUsed"),
  trigger: varchar("trigger", { length: 255 }),
  simulationResult: text("simulationResult"),
  outcome: varchar("outcome", { length: 255 }),
});

export type AuditTrail = typeof auditTrails.$inferSelect;
export type InsertAuditTrail = typeof auditTrails.$inferInsert;

/**
 * Onboarding Status table
 */
export const onboardingStatuses = mysqlTable("onboarding_statuses", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().unique(),
  step: mysqlEnum("step", ["funding", "ready", "firstTxLanded"]).notNull(),
  isWalletConnected: boolean("isWalletConnected").default(false).notNull(),
  hasUsdc: boolean("hasUsdc").default(false).notNull(),
  hasEth: boolean("hasEth").default(false).notNull(),
  firstTxLanded: boolean("firstTxLanded").default(false).notNull(),
  fundingUrl: varchar("fundingUrl", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingStatus = typeof onboardingStatuses.$inferSelect;
export type InsertOnboardingStatus = typeof onboardingStatuses.$inferInsert;

/**
 * Webhook Events table
 */
export const webhookEvents = mysqlTable("webhook_events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  eventType: varchar("eventType", { length: 255 }).notNull(),
  payload: text("payload").notNull(), // JSON stringified
  processed: boolean("processed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;
