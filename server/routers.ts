import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { dcaService } from "./services/dca";
import { keeperHub } from "./services/keeperhub";
import { getAuditTrail, parseJson } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  dca: router({
    status: protectedProcedure.query(async ({ ctx }) => {
      const config = await dcaService.getConfig(ctx.user.id);
      const history = await dcaService.getHistory(ctx.user.id, 1);
      const paused = config?.paused ?? false;
      return {
        status: paused ? ("paused" as const) : ("active" as const),
        lastRun: history[0]?.timestamp || null,
        nextRun: new Date(Date.now() + 3600000).toISOString(),
        agentId: "KGB-001",
        version: "2.0.0",
        isRunning: !paused,
        keeperHubConnected: keeperHub.getConnectionInfo().connected,
        mcpEndpoint: keeperHub.getConnectionInfo().endpoint,
        walletAddress: keeperHub.getConnectionInfo().walletAddress,
      };
    }),

    config: router({
      get: protectedProcedure.query(async ({ ctx }) => {
        return dcaService.ensureConfig(ctx.user.id);
      }),
      update: protectedProcedure
        .input(
          z.object({
            amount: z.number().positive().optional(),
            tokenOut: z.string().min(1).optional(),
            frequency: z.enum(["hourly", "daily", "weekly"]).optional(),
            slippageBps: z.number().min(1).max(1000).optional(),
            maxGasGwei: z.number().positive().optional(),
            paused: z.boolean().optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          return dcaService.updateConfig(ctx.user.id, input);
        }),
    }),

    history: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        return dcaService.getHistory(ctx.user.id, input?.limit ?? 50);
      }),

    execute: protectedProcedure.mutation(async ({ ctx }) => {
      return dcaService.triggerManualExecution(ctx.user.id);
    }),

    wallet: protectedProcedure.query(async () => {
      return keeperHub.getWalletBalance();
    }),

    auditTrail: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(200).default(100) }).optional())
      .query(async ({ ctx, input }) => {
        const rows = await getAuditTrail(ctx.user.id, input?.limit ?? 100);
        return rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          timestamp: r.timestamp.toISOString(),
          action: r.action,
          status: r.status,
          details: parseJson(r.details, {}),
          txHash: r.txHash ?? undefined,
          gasUsed: r.gasUsed ?? undefined,
          trigger: r.trigger ?? undefined,
          simulationResult: r.simulationResult ?? undefined,
          outcome: r.outcome ?? undefined,
        }));
      }),

    onboarding: router({
      status: protectedProcedure.query(async ({ ctx }) => {
        return dcaService.checkFunding(ctx.user.id);
      }),
      reset: protectedProcedure.mutation(async ({ ctx }) => {
        return dcaService.resetOnboarding(ctx.user.id);
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
