// server/_core/index.ts
import express2 from "express";
import { createServer } from "http";
import path3 from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/routers.ts
import { z as z2 } from "zod";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/services/dca.ts
import { nanoid as nanoid2 } from "nanoid";

// server/db.ts
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var dcaConfigs = mysqlTable("dca_configs", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var dcaExecutions = mysqlTable("dca_executions", {
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
  error: text("error")
});
var auditTrails = mysqlTable("audit_trails", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  status: varchar("status", { length: 64 }).notNull(),
  details: text("details").notNull(),
  // JSON stringified
  txHash: varchar("txHash", { length: 255 }),
  gasUsed: int("gasUsed"),
  trigger: varchar("trigger", { length: 255 }),
  simulationResult: text("simulationResult"),
  outcome: varchar("outcome", { length: 255 })
});
var onboardingStatuses = mysqlTable("onboarding_statuses", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().unique(),
  step: mysqlEnum("step", ["funding", "ready", "firstTxLanded"]).notNull(),
  isWalletConnected: boolean("isWalletConnected").default(false).notNull(),
  hasUsdc: boolean("hasUsdc").default(false).notNull(),
  hasEth: boolean("hasEth").default(false).notNull(),
  firstTxLanded: boolean("firstTxLanded").default(false).notNull(),
  fundingUrl: varchar("fundingUrl", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var webhookEvents = mysqlTable("webhook_events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  eventType: varchar("eventType", { length: 255 }).notNull(),
  payload: text("payload").notNull(),
  // JSON stringified
  processed: boolean("processed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// server/db.ts
import { nanoid } from "nanoid";
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values = { openId: user.openId };
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod"];
  for (const field of textFields) {
    if (user[field] !== void 0) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  } else {
    values.lastSignedIn = /* @__PURE__ */ new Date();
    updateSet.lastSignedIn = values.lastSignedIn;
  }
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function getDCAConfig(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.select().from(dcaConfigs).where(eq(dcaConfigs.userId, userId)).limit(1);
  return result[0] ?? null;
}
async function updateDCAConfig(userId, patch) {
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
      endDate: patch.endDate ?? null
    };
    await db.insert(dcaConfigs).values(created);
    return getDCAConfig(userId);
  }
  await db.update(dcaConfigs).set({ ...patch, updatedAt: /* @__PURE__ */ new Date() }).where(eq(dcaConfigs.userId, userId));
  return getDCAConfig(userId);
}
async function getExecutionHistory(userId, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(dcaExecutions).where(eq(dcaExecutions.userId, userId)).orderBy(desc(dcaExecutions.timestamp)).limit(Math.min(Math.max(limit, 1), 200));
}
async function createExecution(execution) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(dcaExecutions).values(execution);
  return execution;
}
async function getAuditTrail(userId, limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(auditTrails).where(eq(auditTrails.userId, userId)).orderBy(desc(auditTrails.timestamp)).limit(Math.min(Math.max(limit, 1), 200));
}
async function createAuditRecord(record) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(auditTrails).values(record);
  return record;
}
async function getOnboardingStatus(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.select().from(onboardingStatuses).where(eq(onboardingStatuses.userId, userId)).limit(1);
  return result[0] ?? null;
}
async function updateOnboardingStatus(userId, patch) {
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
      fundingUrl: patch.fundingUrl ?? "https://coinbase.com/onramp"
    };
    await db.insert(onboardingStatuses).values(created);
    return getOnboardingStatus(userId);
  }
  await db.update(onboardingStatuses).set({ ...patch, updatedAt: /* @__PURE__ */ new Date() }).where(eq(onboardingStatuses.userId, userId));
  return getOnboardingStatus(userId);
}
async function createWebhookEvent(event) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(webhookEvents).values(event);
  return event;
}
function serializeJson(value) {
  return JSON.stringify(value, (_key, current) => typeof current === "bigint" ? current.toString() : current);
}
function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
function toIso(value) {
  return value ? value.toISOString() : void 0;
}
function toNumber(value) {
  const numberValue = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

// server/services/keeperhub.ts
var KeeperHubService = class {
  apiKey;
  mcpEndpoint;
  chainId;
  walletAddress;
  constructor() {
    this.apiKey = process.env.KEEPERHUB_API_KEY || "";
    this.mcpEndpoint = process.env.KEEPERHUB_MCP_ENDPOINT || "https://app.keeperhub.com/mcp";
    this.chainId = process.env.CHAIN_ID || "8453";
    this.walletAddress = process.env.KEEPERHUB_WALLET_ADDRESS || "0x3e73523a8D89c89AcdBeD1b7E14E0F310800e6Fc";
  }
  getConnectionInfo() {
    return {
      connected: Boolean(this.apiKey),
      endpoint: this.mcpEndpoint,
      walletAddress: this.walletAddress,
      chainId: this.chainId
    };
  }
  normalizeParams(params) {
    const normalized = { ...params };
    const chain = params.network || params.chain || this.chainId;
    normalized.network = String(chain);
    normalized.chain = String(chain);
    return normalized;
  }
  async estimateGasWithBackoff(retries = 3) {
    let delay = 250;
    let lastError;
    for (let attempt = 0; attempt < retries; attempt += 1) {
      try {
        return "20000000000";
      } catch (error) {
        lastError = error;
        if (attempt === retries - 1) break;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    throw new Error(`Gas hint unavailable: ${String(lastError)}`);
  }
  async parseMcpResponse(response) {
    const raw = await response.text();
    const dataLine = raw.split(/\r?\n/).filter((line) => line.startsWith("data:")).pop();
    const jsonText = dataLine ? dataLine.slice(5).trim() : raw.trim();
    let payload;
    try {
      payload = JSON.parse(jsonText);
    } catch {
      throw new Error(`KeeperHub returned a non-JSON MCP response: ${raw.slice(0, 400)}`);
    }
    if (payload?.error) {
      throw new Error(payload.error.message || JSON.stringify(payload.error));
    }
    const result = payload?.result;
    if (result?.isError) {
      const text2 = Array.isArray(result.content) ? result.content.map((item) => item?.text).filter(Boolean).join(" ") : "KeeperHub MCP tool failed";
      throw new Error(text2 || "KeeperHub MCP tool failed");
    }
    if (result?.structuredContent !== void 0) return result.structuredContent;
    if (Array.isArray(result?.content)) {
      const text2 = result.content.find((item) => item?.type === "text")?.text;
      if (text2) {
        try {
          return JSON.parse(text2);
        } catch {
          return { text: text2 };
        }
      }
    }
    return result;
  }
  async callMcpTool(name, args) {
    if (!this.apiKey) {
      throw new Error("KeeperHub is not configured: KEEPERHUB_API_KEY is missing");
    }
    const commonHeaders = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream"
    };
    const initialize = await fetch(this.mcpEndpoint, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `init-${Date.now()}`,
        method: "initialize",
        params: {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: { name: "kgb-fullstack", version: "1.0.0" }
        }
      })
    });
    if (!initialize.ok) {
      throw new Error(`KeeperHub MCP initialization failed with HTTP ${initialize.status}`);
    }
    const sessionId = initialize.headers.get("mcp-session-id");
    const callHeaders = sessionId ? { ...commonHeaders, "Mcp-Session-Id": sessionId } : commonHeaders;
    const call = await fetch(this.mcpEndpoint, {
      method: "POST",
      headers: callHeaders,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `call-${Date.now()}`,
        method: "tools/call",
        params: { name, arguments: args }
      })
    });
    if (!call.ok) {
      const body = await call.text();
      throw new Error(`KeeperHub MCP ${name} failed with HTTP ${call.status}: ${body.slice(0, 300)}`);
    }
    return this.parseMcpResponse(call);
  }
  async executeWorkflow(workflowId, params) {
    try {
      const gasPrice = await this.estimateGasWithBackoff();
      const input = {
        ...this.normalizeParams(params),
        gasPrice,
        mevProtection: true,
        paymentProtocol: "auto",
        wallet: this.walletAddress
      };
      const result = await this.callMcpTool("execute_workflow", {
        workflowId,
        input,
        idempotency_key: `kgb-${workflowId}-${Date.now()}`
      });
      const data = result && typeof result === "object" ? result : {};
      const status = data.status === "running" ? "running" : data.status;
      return {
        success: true,
        status,
        result: data,
        logs: Array.isArray(data.logs) ? data.logs.map(String) : [],
        txHash: typeof data.txHash === "string" ? data.txHash : void 0
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: this.getActionableErrorMessage(message),
        logs: []
      };
    }
  }
  getActionableErrorMessage(error) {
    if (/INSUFFICIENT_FUNDS/i.test(error)) return "Insufficient wallet funds: add the configured token and native gas asset before running the workflow.";
    if (/402|payment/i.test(error)) return "KeeperHub requires payment for this workflow. Configure the approved x402/MPP payment path and retry.";
    if (/network|chain/i.test(error)) return "Network parameter error: verify the configured chain ID and workflow-supported network.";
    if (/slippage/i.test(error)) return "Slippage exceeded: reduce order size or increase the configured slippage tolerance.";
    if (/gas/i.test(error)) return "Gas estimation failed: KeeperHub could not obtain a safe execution quote; retry after network conditions improve.";
    return error;
  }
  validateWebhookAuth(headers) {
    const value = headers.authorization || headers["x-api-key"];
    const authHeader = Array.isArray(value) ? value[0] : value;
    if (!authHeader || !this.apiKey) return false;
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    return token === this.apiKey;
  }
  async getWalletBalance() {
    return {
      baseUSDC: 0,
      baseETH: 0,
      tempoUSDCe: 0,
      gasSponsored: false
    };
  }
};
var keeperHub = new KeeperHubService();

// server/services/dca.ts
function toApiConfig(row) {
  return {
    id: row.id,
    userId: row.userId,
    amount: toNumber(row.amount),
    tokenOut: row.tokenOut,
    frequency: row.frequency,
    slippageBps: row.slippageBps,
    maxGasGwei: row.maxGasGwei,
    paused: row.paused,
    startDate: toIso(row.startDate),
    endDate: toIso(row.endDate),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}
function toApiExecution(row) {
  return {
    id: row.id,
    userId: row.userId,
    timestamp: row.timestamp.toISOString(),
    status: row.status,
    amount: toNumber(row.amount),
    tokenOut: row.tokenOut,
    executedPrice: toNumber(row.executedPrice),
    gasUsed: row.gasUsed,
    txHash: row.txHash ?? void 0,
    auditTrailRef: row.auditTrailRef ?? void 0,
    error: row.error ?? void 0
  };
}
function toApiOnboarding(row) {
  return {
    step: row.step,
    isWalletConnected: row.isWalletConnected,
    hasUsdc: row.hasUsdc,
    hasEth: row.hasEth,
    firstTxLanded: row.firstTxLanded,
    fundingUrl: row.fundingUrl ?? void 0
  };
}
function toDbConfigPatch(input) {
  return {
    amount: input.amount === void 0 ? void 0 : String(input.amount),
    tokenOut: input.tokenOut,
    frequency: input.frequency,
    slippageBps: input.slippageBps,
    maxGasGwei: input.maxGasGwei,
    paused: input.paused,
    startDate: input.startDate ? new Date(input.startDate) : void 0,
    endDate: input.endDate ? new Date(input.endDate) : void 0
  };
}
var DCAService = class {
  async getConfig(userId) {
    const row = await getDCAConfig(userId);
    return row ? toApiConfig(row) : null;
  }
  async ensureConfig(userId) {
    const current = await this.getConfig(userId);
    if (current) return current;
    const row = await updateDCAConfig(userId, {});
    if (!row) throw new Error("Unable to initialize DCA configuration");
    return toApiConfig(row);
  }
  async updateConfig(userId, input) {
    const previous = await getDCAConfig(userId);
    const row = await updateDCAConfig(userId, toDbConfigPatch(input));
    if (!row) throw new Error("Unable to update DCA configuration");
    await createAuditRecord({
      id: nanoid2(),
      userId,
      timestamp: /* @__PURE__ */ new Date(),
      action: "CONFIG_UPDATE",
      status: "success",
      details: serializeJson({ previousConfig: previous, newConfig: input }),
      trigger: "USER",
      outcome: "UPDATED"
    });
    return toApiConfig(row);
  }
  async getHistory(userId, limit = 50) {
    const rows = await getExecutionHistory(userId, limit);
    return rows.map(toApiExecution);
  }
  async triggerManualExecution(userId) {
    const config = await this.ensureConfig(userId);
    if (config.paused) throw new Error("DCA agent is paused");
    const workflowId = process.env.KEEPERHUB_WORKFLOW_ID;
    const response = workflowId ? await keeperHub.executeWorkflow(workflowId, {
      amount: config.amount,
      tokenOut: config.tokenOut,
      slippageBps: config.slippageBps,
      chain: process.env.CHAIN_ID || "8453"
    }) : {
      success: false,
      error: "KeeperHub is connected, but KEEPERHUB_WORKFLOW_ID is not configured. Create or select a DCA workflow in KeeperHub, then add its ID to the deployment secrets.",
      logs: []
    };
    const result = response.result ?? {};
    const isRunning = response.status === "running" || result.status === "running";
    const executionStatus = isRunning ? "pending" : response.success ? "success" : "failed";
    const executionRecord = {
      id: nanoid2(),
      userId,
      timestamp: /* @__PURE__ */ new Date(),
      status: executionStatus,
      amount: String(config.amount),
      tokenOut: config.tokenOut,
      executedPrice: String(toNumber(result.price)),
      gasUsed: Math.round(toNumber(result.gasUsed)),
      txHash: response.txHash ?? null,
      auditTrailRef: typeof result.auditId === "string" ? result.auditId : null,
      error: response.error ?? null
    };
    await createExecution(executionRecord);
    const onboarding = await getOnboardingStatus(userId);
    if (response.success && !isRunning && (!onboarding || !onboarding.firstTxLanded)) {
      await updateOnboardingStatus(userId, { firstTxLanded: true, step: "firstTxLanded" });
    }
    await createAuditRecord({
      id: nanoid2(),
      userId,
      timestamp: /* @__PURE__ */ new Date(),
      action: "DCA_EXECUTION",
      status: isRunning ? "pending" : response.success ? "success" : "failed",
      details: serializeJson({
        amount: config.amount,
        tokenOut: config.tokenOut,
        executedPrice: result.price ?? null,
        response
      }),
      txHash: response.txHash ?? null,
      gasUsed: executionRecord.gasUsed,
      trigger: "MANUAL",
      simulationResult: serializeJson(result.simulation ?? null),
      outcome: isRunning ? "TRIGGERED" : response.success ? "COMPLETED" : "FAILED"
    });
    return {
      execution: {
        id: executionRecord.id,
        userId,
        timestamp: executionRecord.timestamp.toISOString(),
        status: executionRecord.status,
        amount: config.amount,
        tokenOut: config.tokenOut,
        executedPrice: toNumber(result.price),
        gasUsed: executionRecord.gasUsed,
        txHash: response.txHash,
        auditTrailRef: executionRecord.auditTrailRef ?? void 0,
        error: response.error
      },
      response
    };
  }
  async checkFunding(userId) {
    const balance = await keeperHub.getWalletBalance();
    const hasUsdc = balance.baseUSDC > 0;
    const hasEth = balance.baseETH > 0;
    const current = await getOnboardingStatus(userId);
    let row = current;
    if (!row) {
      row = await updateOnboardingStatus(userId, {
        step: hasUsdc && hasEth ? "ready" : "funding",
        isWalletConnected: true,
        hasUsdc,
        hasEth
      });
    } else if (!row.firstTxLanded) {
      row = await updateOnboardingStatus(userId, {
        step: hasUsdc && hasEth ? "ready" : "funding",
        hasUsdc,
        hasEth
      });
    }
    if (!row) throw new Error("Unable to read onboarding status");
    return toApiOnboarding(row);
  }
  async getOnboarding(userId) {
    const row = await getOnboardingStatus(userId);
    return row ? toApiOnboarding(row) : null;
  }
  async resetOnboarding(userId) {
    const row = await updateOnboardingStatus(userId, {
      step: "funding",
      isWalletConnected: true,
      hasUsdc: false,
      hasEth: false,
      firstTxLanded: false
    });
    if (!row) throw new Error("Unable to reset onboarding status");
    return toApiOnboarding(row);
  }
};
var dcaService = new DCAService();

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  dca: router({
    status: protectedProcedure.query(async ({ ctx }) => {
      const config = await dcaService.getConfig(ctx.user.id);
      const history = await dcaService.getHistory(ctx.user.id, 1);
      const paused = config?.paused ?? false;
      return {
        status: paused ? "paused" : "active",
        lastRun: history[0]?.timestamp || null,
        nextRun: new Date(Date.now() + 36e5).toISOString(),
        agentId: "KGB-001",
        version: "2.0.0",
        isRunning: !paused,
        keeperHubConnected: keeperHub.getConnectionInfo().connected,
        mcpEndpoint: keeperHub.getConnectionInfo().endpoint,
        walletAddress: keeperHub.getConnectionInfo().walletAddress
      };
    }),
    config: router({
      get: protectedProcedure.query(async ({ ctx }) => {
        return dcaService.ensureConfig(ctx.user.id);
      }),
      update: protectedProcedure.input(
        z2.object({
          amount: z2.number().positive().optional(),
          tokenOut: z2.string().min(1).optional(),
          frequency: z2.enum(["hourly", "daily", "weekly"]).optional(),
          slippageBps: z2.number().min(1).max(1e3).optional(),
          maxGasGwei: z2.number().positive().optional(),
          paused: z2.boolean().optional(),
          startDate: z2.string().optional(),
          endDate: z2.string().optional()
        })
      ).mutation(async ({ ctx, input }) => {
        return dcaService.updateConfig(ctx.user.id, input);
      })
    }),
    history: protectedProcedure.input(z2.object({ limit: z2.number().min(1).max(200).default(50) }).optional()).query(async ({ ctx, input }) => {
      return dcaService.getHistory(ctx.user.id, input?.limit ?? 50);
    }),
    execute: protectedProcedure.mutation(async ({ ctx }) => {
      return dcaService.triggerManualExecution(ctx.user.id);
    }),
    wallet: protectedProcedure.query(async () => {
      return keeperHub.getWalletBalance();
    }),
    auditTrail: protectedProcedure.input(z2.object({ limit: z2.number().min(1).max(200).default(100) }).optional()).query(async ({ ctx, input }) => {
      const rows = await getAuditTrail(ctx.user.id, input?.limit ?? 100);
      return rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        timestamp: r.timestamp.toISOString(),
        action: r.action,
        status: r.status,
        details: parseJson(r.details, {}),
        txHash: r.txHash ?? void 0,
        gasUsed: r.gasUsed ?? void 0,
        trigger: r.trigger ?? void 0,
        simulationResult: r.simulationResult ?? void 0,
        outcome: r.outcome ?? void 0
      }));
    }),
    onboarding: router({
      status: protectedProcedure.query(async ({ ctx }) => {
        return dcaService.checkFunding(ctx.user.id);
      }),
      reset: protectedProcedure.mutation(async ({ ctx }) => {
        return dcaService.resetOnboarding(ctx.user.id);
      })
    })
  })
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid as nanoid3 } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid3()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/_core/index.ts
import { nanoid as nanoid4 } from "nanoid";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "1mb" }));
  app.use(express2.urlencoded({ extended: true, limit: "1mb" }));
  registerOAuthRoutes(app);
  registerStorageProxy(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  app.post("/api/webhook", async (req, res) => {
    try {
      if (!keeperHub.validateWebhookAuth(req.headers)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: 'Use "Authorization: kh_..." or "x-api-key: kh_..."'
        });
      }
      const userId = Number(req.body?.userId);
      if (!Number.isSafeInteger(userId) || userId <= 0) {
        return res.status(400).json({ success: false, error: "A valid numeric userId is required" });
      }
      const eventType = String(req.body?.event || req.body?.type || "workflow.executed").slice(0, 120);
      await createWebhookEvent({
        id: nanoid4(),
        userId,
        eventType,
        payload: serializeJson(req.body),
        processed: true
      });
      await createAuditRecord({
        id: nanoid4(),
        userId,
        timestamp: /* @__PURE__ */ new Date(),
        action: "WEBHOOK_RECEIVED",
        status: "success",
        details: serializeJson({ eventType }),
        trigger: "WEBHOOK",
        outcome: "PROCESSED"
      });
      return res.json({ success: true, received: true });
    } catch (error) {
      console.error("[Webhook] Error processing webhook:", error);
      return res.status(500).json({ success: false, error: error?.message || "Webhook processing failed" });
    }
  });
  app.post("/api/scheduled/dcaTick", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: "Cron authentication required" });
      }
      return res.json({ success: true, taskUid: user.taskUid, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    } catch (error) {
      console.error("[Scheduler] Error in dcaTick handler:", error);
      return res.status(500).json({
        error: error?.message || "Scheduled execution failed",
        stack: error?.stack,
        context: { url: req.url },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch((error) => {
  console.error("[Server] Fatal startup error", error);
  process.exitCode = 1;
});
