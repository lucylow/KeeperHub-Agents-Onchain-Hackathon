/**
 * Shared TypeScript types for KGB DCA Platform
 * Used across frontend and backend for type safety
 */

export type ExecStatus = "success" | "failed" | "pending";
export type OnboardingStep = "funding" | "ready" | "firstTxLanded";
export type DCAPeriod = "hourly" | "daily" | "weekly";

export interface DCAExecution {
  id: string;
  userId: number;
  timestamp: string;
  status: ExecStatus;
  amount: number;
  tokenOut: string;
  executedPrice: number;
  gasUsed: number;
  txHash?: string;
  auditTrailRef?: string;
  error?: string;
}

export interface DCAConfig {
  id: string;
  userId: number;
  amount: number;
  tokenOut: string;
  frequency: DCAPeriod;
  slippageBps: number;
  maxGasGwei: number;
  paused: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  baseUSDC: number;
  baseETH: number;
  tempoUSDCe: number;
  gasSponsored: boolean;
}

export interface AuditRecord {
  id: string;
  userId: number;
  timestamp: string;
  action: string;
  status: string;
  details: Record<string, unknown>;
  txHash?: string;
  gasUsed?: number;
  trigger?: string;
  simulationResult?: string;
  outcome?: string;
}

export interface WorkflowResponse {
  success: boolean;
  status?: "running" | "success" | "failed";
  result?: Record<string, unknown>;
  logs?: string[];
  error?: string;
  txHash?: string;
}

export interface OnboardingStatus {
  step: OnboardingStep;
  isWalletConnected: boolean;
  hasUsdc: boolean;
  hasEth: boolean;
  firstTxLanded: boolean;
  fundingUrl?: string;
}

export interface AgentStatus {
  status: "active" | "paused";
  lastRun: string | null;
  nextRun: string;
  agentId: string;
  version: string;
  isRunning: boolean;
}
