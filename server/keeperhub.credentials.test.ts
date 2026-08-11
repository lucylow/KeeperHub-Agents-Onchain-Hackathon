import { describe, expect, it } from "vitest";

describe("KeeperHub credentials", () => {
  it("authenticates against the official MCP endpoint", async () => {
    const apiKey = process.env.KEEPERHUB_API_KEY;
    expect(apiKey, "KEEPERHUB_API_KEY must be configured").toMatch(/^kh_/);

    const endpoint = process.env.KEEPERHUB_MCP_ENDPOINT || "https://app.keeperhub.com/mcp";
    expect(endpoint).toBe("https://app.keeperhub.com/mcp");
    expect(process.env.KEEPERHUB_WALLET_INTEGRATION_ID).toMatch(/^[a-z0-9]+$/);
    expect(process.env.KEEPERHUB_WALLET_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "kgb-credential-test",
        method: "initialize",
        params: {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: { name: "kgb-credential-test", version: "1.0.0" },
        },
      }),
    });

    expect([401, 403], `KeeperHub rejected the configured secret with HTTP ${response.status}`).not.toContain(response.status);
    expect(response.status).toBeLessThan(500);
  }, 20_000);
});
