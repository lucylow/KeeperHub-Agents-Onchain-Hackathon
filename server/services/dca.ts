import { nanoid } from "nanoid";
import {
  DCAConfig,
  DCAExecution,
  OnboardingStatus,
  WorkflowResponse,
} from "../../shared/types";
import {
  createAuditRecord,
  createExecution,
  DCAConfigPatch,
  getDCAConfig,
  getExecutionHistory,
  getOnboardingStatus,
  OnboardingPatch,
  serializeJson,
  toIso,
  toNumber,
  updateDCAConfig,
  updateOnboardingStatus,
} from "../db";
import { keeperHub } from "./keeperhub";

type DCAConfigInput = Partial<Pick<
  DCAConfig,
  "amount" | "tokenOut" | "frequency" | "slippageBps" | "maxGasGwei" | "paused" | "startDate" | "endDate"
>>;

function toApiConfig(row: NonNullable<Awaited<ReturnType<typeof getDCAConfig>>>): DCAConfig {
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
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toApiExecution(row: Awaited<ReturnType<typeof getExecutionHistory>>[number]): DCAExecution {
  return {
    id: row.id,
    userId: row.userId,
    timestamp: row.timestamp.toISOString(),
    status: row.status,
    amount: toNumber(row.amount),
    tokenOut: row.tokenOut,
    executedPrice: toNumber(row.executedPrice),
    gasUsed: row.gasUsed,
    txHash: row.txHash ?? undefined,
    auditTrailRef: row.auditTrailRef ?? undefined,
    error: row.error ?? undefined,
  };
}

function toApiOnboarding(row: NonNullable<Awaited<ReturnType<typeof getOnboardingStatus>>>): OnboardingStatus {
  return {
    step: row.step,
    isWalletConnected: row.isWalletConnected,
    hasUsdc: row.hasUsdc,
    hasEth: row.hasEth,
    firstTxLanded: row.firstTxLanded,
    fundingUrl: row.fundingUrl ?? undefined,
  };
}

function toDbConfigPatch(input: DCAConfigInput): DCAConfigPatch {
  return {
    amount: input.amount === undefined ? undefined : String(input.amount),
    tokenOut: input.tokenOut,
    frequency: input.frequency,
    slippageBps: input.slippageBps,
    maxGasGwei: input.maxGasGwei,
    paused: input.paused,
    startDate: input.startDate ? new Date(input.startDate) : undefined,
    endDate: input.endDate ? new Date(input.endDate) : undefined,
  };
}

export class DCAService {
  async getConfig(userId: number): Promise<DCAConfig | null> {
    const row = await getDCAConfig(userId);
    return row ? toApiConfig(row) : null;
  }

  async ensureConfig(userId: number): Promise<DCAConfig> {
    const current = await this.getConfig(userId);
    if (current) return current;
    const row = await updateDCAConfig(userId, {});
    if (!row) throw new Error("Unable to initialize DCA configuration");
    return toApiConfig(row);
  }

  async updateConfig(userId: number, input: DCAConfigInput): Promise<DCAConfig> {
    const previous = await getDCAConfig(userId);
    const row = await updateDCAConfig(userId, toDbConfigPatch(input));
    if (!row) throw new Error("Unable to update DCA configuration");

    await createAuditRecord({
      id: nanoid(),
      userId,
      timestamp: new Date(),
      action: "CONFIG_UPDATE",
      status: "success",
      details: serializeJson({ previousConfig: previous, newConfig: input }),
      trigger: "USER",
      outcome: "UPDATED",
    });
    return toApiConfig(row);
  }

  async getHistory(userId: number, limit = 50): Promise<DCAExecution[]> {
    const rows = await getExecutionHistory(userId, limit);
    return rows.map(toApiExecution);
  }

  async triggerManualExecution(userId: number): Promise<{ execution: DCAExecution; response: WorkflowResponse }> {
    const config = await this.ensureConfig(userId);
    if (config.paused) throw new Error("DCA agent is paused");

    const workflowId = process.env.KEEPERHUB_WORKFLOW_ID;
    const response = workflowId
      ? await keeperHub.executeWorkflow(workflowId, {
          amount: config.amount,
          tokenOut: config.tokenOut,
          slippageBps: config.slippageBps,
          chain: process.env.CHAIN_ID || "8453",
        })
      : {
          success: false,
          error: "KeeperHub is connected, but KEEPERHUB_WORKFLOW_ID is not configured. Create or select a DCA workflow in KeeperHub, then add its ID to the deployment secrets.",
          logs: [],
        };

    const result = response.result ?? {};
    const isRunning = response.status === "running" || result.status === "running";
    const executionStatus = isRunning ? "pending" as const : response.success ? "success" as const : "failed" as const;
    const executionRecord = {
      id: nanoid(),
      userId,
      timestamp: new Date(),
      status: executionStatus,
      amount: String(config.amount),
      tokenOut: config.tokenOut,
      executedPrice: String(toNumber(result.price as string | number | undefined)),
      gasUsed: Math.round(toNumber(result.gasUsed as string | number | undefined)),
      txHash: response.txHash ?? null,
      auditTrailRef: typeof result.auditId === "string" ? result.auditId : null,
      error: response.error ?? null,
    };
    await createExecution(executionRecord);

    const onboarding = await getOnboardingStatus(userId);
    if (response.success && !isRunning && (!onboarding || !onboarding.firstTxLanded)) {
      await updateOnboardingStatus(userId, { firstTxLanded: true, step: "firstTxLanded" });
    }

    await createAuditRecord({
      id: nanoid(),
      userId,
      timestamp: new Date(),
      action: "DCA_EXECUTION",
      status: isRunning ? "pending" : response.success ? "success" : "failed",
      details: serializeJson({
        amount: config.amount,
        tokenOut: config.tokenOut,
        executedPrice: result.price ?? null,
        response,
      }),
      txHash: response.txHash ?? null,
      gasUsed: executionRecord.gasUsed,
      trigger: "MANUAL",
      simulationResult: serializeJson(result.simulation ?? null),
      outcome: isRunning ? "TRIGGERED" : response.success ? "COMPLETED" : "FAILED",
    });

    return {
      execution: {
        id: executionRecord.id,
        userId,
        timestamp: executionRecord.timestamp.toISOString(),
        status: executionRecord.status,
        amount: config.amount,
        tokenOut: config.tokenOut,
        executedPrice: toNumber(result.price as string | number | undefined),
        gasUsed: executionRecord.gasUsed,
        txHash: response.txHash,
        auditTrailRef: executionRecord.auditTrailRef ?? undefined,
        error: response.error,
      },
      response,
    };
  }

  async checkFunding(userId: number): Promise<OnboardingStatus> {
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
        hasEth,
      });
    } else if (!row.firstTxLanded) {
      row = await updateOnboardingStatus(userId, {
        step: hasUsdc && hasEth ? "ready" : "funding",
        hasUsdc,
        hasEth,
      });
    }
    if (!row) throw new Error("Unable to read onboarding status");
    return toApiOnboarding(row);
  }

  async getOnboarding(userId: number): Promise<OnboardingStatus | null> {
    const row = await getOnboardingStatus(userId);
    return row ? toApiOnboarding(row) : null;
  }

  async resetOnboarding(userId: number): Promise<OnboardingStatus> {
    const row = await updateOnboardingStatus(userId, {
      step: "funding",
      isWalletConnected: true,
      hasUsdc: false,
      hasEth: false,
      firstTxLanded: false,
    } satisfies OnboardingPatch);
    if (!row) throw new Error("Unable to reset onboarding status");
    return toApiOnboarding(row);
  }
}

export const dcaService = new DCAService();
