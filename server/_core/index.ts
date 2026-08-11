import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { setupVite, serveStatic } from "./vite";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { sdk } from "./sdk";
import { keeperHub } from "../services/keeperhub";
import { createWebhookEvent, createAuditRecord, serializeJson } from "../db";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  registerOAuthRoutes(app);
  registerStorageProxy(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  app.post("/api/webhook", async (req, res) => {
    try {
      if (!keeperHub.validateWebhookAuth(req.headers)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: 'Use "Authorization: kh_..." or "x-api-key: kh_..."',
        });
      }

      const userId = Number(req.body?.userId);
      if (!Number.isSafeInteger(userId) || userId <= 0) {
        return res.status(400).json({ success: false, error: "A valid numeric userId is required" });
      }

      const eventType = String(req.body?.event || req.body?.type || "workflow.executed").slice(0, 120);
      await createWebhookEvent({
        id: nanoid(),
        userId,
        eventType,
        payload: serializeJson(req.body),
        processed: true,
      });
      await createAuditRecord({
        id: nanoid(),
        userId,
        timestamp: new Date(),
        action: "WEBHOOK_RECEIVED",
        status: "success",
        details: serializeJson({ eventType }),
        trigger: "WEBHOOK",
        outcome: "PROCESSED",
      });
      return res.json({ success: true, received: true });
    } catch (error: any) {
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
      return res.json({ success: true, taskUid: user.taskUid, timestamp: new Date().toISOString() });
    } catch (error: any) {
      console.error("[Scheduler] Error in dcaTick handler:", error);
      return res.status(500).json({
        error: error?.message || "Scheduled execution failed",
        stack: error?.stack,
        context: { url: req.url },
        timestamp: new Date().toISOString(),
      });
    }
  });

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((error) => {
  console.error("[Server] Fatal startup error", error);
  process.exitCode = 1;
});
