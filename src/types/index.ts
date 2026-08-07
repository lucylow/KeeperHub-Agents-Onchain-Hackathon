export type ExecStatus = "success" | "failed" | "pending";

export interface DCAExecution {
  id: string;
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
  amount: number;
  tokenOut: string;
  frequency: "hourly" | "daily" | "weekly";
  slippageBps: number;
  maxGasGwei: number;
  paused: boolean;
  startDate?: string;
  endDate?: string;
}

export interface WalletBalance {
  baseUSDC: number;
  baseETH: number;
  tempoUSDCe: number;
  gasSponsored: boolean;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  action: string;
  status: string;
  details: any;
  txHash?: string;
}

export interface WorkflowResponse {
  success: boolean;
  result?: any;
  logs?: string[];
  error?: string;
  txHash?: string;
}

export interface OnboardingStatus {
  step: 'setup' | 'funding' | 'ready';
  isWalletConnected: boolean;
  hasUsdc: boolean;
  hasEth: boolean;
  firstTxLanded: boolean;
  fundingUrl?: string;
}
