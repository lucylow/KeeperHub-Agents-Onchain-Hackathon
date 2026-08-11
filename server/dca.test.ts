import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(userId = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: "test-user-openid",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "oauth",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("DCA tRPC Router & Validation", () => {
  it("allows fetching status and config for authenticated users", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const status = await caller.dca.status();
    expect(status).toBeDefined();
    expect(status.agentId).toBe("KGB-001");

    const config = await caller.dca.config.get();
    expect(config).toBeDefined();
    expect(config.amount).toBeDefined();
  });

  it("validates config update input bounds", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.dca.config.update({
        amount: -10, // Invalid negative amount
      })
    ).rejects.toThrow();
  });
});
