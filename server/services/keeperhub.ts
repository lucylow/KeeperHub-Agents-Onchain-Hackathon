import { WorkflowResponse, WalletBalance } from "../../shared/types";

/**
 * KeeperHub service integration over the official remote MCP transport.
 * The website runtime uses the server-side KEEPERHUB_API_KEY; it never relies
 * on the user's browser OAuth session or fabricates successful transactions.
 */
export class KeeperHubService {
  private readonly apiKey: string;
  private readonly mcpEndpoint: string;
  private readonly chainId: string;
  private readonly walletAddress: string;

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
      chainId: this.chainId,
    };
  }

  private normalizeParams(params: Record<string, unknown>): Record<string, unknown> {
    const normalized = { ...params };
    const chain = params.network || params.chain || this.chainId;
    normalized.network = String(chain);
    normalized.chain = String(chain);
    return normalized;
  }

  private async estimateGasWithBackoff(retries = 3): Promise<string> {
    let delay = 250;
    let lastError: unknown;
    for (let attempt = 0; attempt < retries; attempt += 1) {
      try {
        // KeeperHub owns final gas policy. This is only a conservative request hint.
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

  private async parseMcpResponse(response: Response): Promise<unknown> {
    const raw = await response.text();
    const dataLine = raw
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .pop();
    const jsonText = dataLine ? dataLine.slice(5).trim() : raw.trim();
    let payload: any;
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
      const text = Array.isArray(result.content)
        ? result.content.map((item: any) => item?.text).filter(Boolean).join(" ")
        : "KeeperHub MCP tool failed";
      throw new Error(text || "KeeperHub MCP tool failed");
    }
    if (result?.structuredContent !== undefined) return result.structuredContent;
    if (Array.isArray(result?.content)) {
      const text = result.content.find((item: any) => item?.type === "text")?.text;
      if (text) {
        try {
          return JSON.parse(text);
        } catch {
          return { text };
        }
      }
    }
    return result;
  }

  private async callMcpTool(name: string, args: Record<string, unknown>): Promise<any> {
    if (!this.apiKey) {
      throw new Error("KeeperHub is not configured: KEEPERHUB_API_KEY is missing");
    }

    const commonHeaders = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
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
          clientInfo: { name: "kgb-fullstack", version: "1.0.0" },
        },
      }),
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
        params: { name, arguments: args },
      }),
    });
    if (!call.ok) {
      const body = await call.text();
      throw new Error(`KeeperHub MCP ${name} failed with HTTP ${call.status}: ${body.slice(0, 300)}`);
    }
    return this.parseMcpResponse(call);
  }

  async executeWorkflow(workflowId: string, params: Record<string, unknown>): Promise<WorkflowResponse> {
    try {
      const gasPrice = await this.estimateGasWithBackoff();
      const input = {
        ...this.normalizeParams(params),
        gasPrice,
        mevProtection: true,
        paymentProtocol: "auto",
        wallet: this.walletAddress,
      };
      const result = await this.callMcpTool("execute_workflow", {
        workflowId,
        input,
        idempotency_key: `kgb-${workflowId}-${Date.now()}`,
      });
      const data = (result && typeof result === "object" ? result : {}) as Record<string, any>;
      const status = data.status === "running" ? "running" : data.status;
      return {
        success: true,
        status,
        result: data,
        logs: Array.isArray(data.logs) ? data.logs.map(String) : [],
        txHash: typeof data.txHash === "string" ? data.txHash : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: this.getActionableErrorMessage(message),
        logs: [],
      };
    }
  }

  private getActionableErrorMessage(error: string): string {
    if (/INSUFFICIENT_FUNDS/i.test(error)) return "Insufficient wallet funds: add the configured token and native gas asset before running the workflow.";
    if (/402|payment/i.test(error)) return "KeeperHub requires payment for this workflow. Configure the approved x402/MPP payment path and retry.";
    if (/network|chain/i.test(error)) return "Network parameter error: verify the configured chain ID and workflow-supported network.";
    if (/slippage/i.test(error)) return "Slippage exceeded: reduce order size or increase the configured slippage tolerance.";
    if (/gas/i.test(error)) return "Gas estimation failed: KeeperHub could not obtain a safe execution quote; retry after network conditions improve.";
    return error;
  }

  validateWebhookAuth(headers: Record<string, string | string[] | undefined>): boolean {
    const value = headers.authorization || headers["x-api-key"];
    const authHeader = Array.isArray(value) ? value[0] : value;
    if (!authHeader || !this.apiKey) return false;
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    return token === this.apiKey;
  }

  async getWalletBalance(): Promise<WalletBalance> {
    // The aggregate MCP server does not expose a generic wallet-balance tool.
    // Keep the UI honest until a supported balance source is configured.
    return {
      baseUSDC: 0,
      baseETH: 0,
      tempoUSDCe: 0,
      gasSponsored: false,
    };
  }
}

export const keeperHub = new KeeperHubService();
