import { DCAExecution, ExecStatus, DCAConfig, OnboardingStatus } from '../types';
import { keeperHub } from './keeperhub';
import logger from '../utils/logger';
import { TOKENS } from '../utils/constants';

export class DCAEngine {
  private executions: DCAExecution[] = [];
  private config: DCAConfig;
  private onboardingStatus: OnboardingStatus;

  constructor() {
    this.config = {
      amount: 25,
      tokenOut: "WETH",
      frequency: "daily",
      slippageBps: 50,
      maxGasGwei: 12,
      paused: false,
    };
    
    this.onboardingStatus = {
      step: 'funding',
      isWalletConnected: true,
      hasUsdc: false,
      hasEth: true,
      firstTxLanded: false,
      fundingUrl: 'https://coinbase.com/onramp'
    };

    this.generateMockHistory();
  }

  private generateMockHistory() {
    const base = Date.now();
    this.executions = Array.from({ length: 15 }, (_, i) => {
      const failed = i === 3;
      return {
        id: `exec_${1000 + i}`,
        timestamp: new Date(base - i * 24 * 3600000).toISOString(),
        status: (failed ? "failed" : "success") as ExecStatus,
        amount: 25,
        tokenOut: TOKENS[i % 3],
        executedPrice: 3100 + (i * 10),
        gasUsed: failed ? 0 : 120000 + (i * 1000),
        txHash: failed ? undefined : `0x${Math.random().toString(16).slice(2)}`,
        auditTrailRef: failed ? undefined : `0x${Math.random().toString(16).slice(2)}`,
        error: failed ? "Slippage tolerance exceeded" : undefined,
      };
    });
  }

  getHistory() {
    return this.executions;
  }

  getConfig() {
    return this.config;
  }

  getOnboardingStatus() {
    return this.onboardingStatus;
  }

  updateConfig(newConfig: Partial<DCAConfig>) {
    this.config = { ...this.config, ...newConfig };
    logger.info('Config updated', { config: this.config });
    return this.config;
  }

  async triggerManualExecution() {
    if (this.config.paused) {
      throw new Error('Agent is paused');
    }

    logger.info('Manual execution triggered');
    
    // Call KeeperHub with normalized parameters
    const response = await keeperHub.executeWorkflow('dca-swap', {
      amount: this.config.amount,
      tokenOut: this.config.tokenOut,
      slippageBps: this.config.slippageBps
    });

    const newExec: DCAExecution = {
      id: `exec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: response.success ? "success" : "failed",
      amount: this.config.amount,
      tokenOut: this.config.tokenOut,
      executedPrice: response.result?.price || 3200,
      gasUsed: response.result?.gasUsed || 125000,
      txHash: response.txHash,
      auditTrailRef: response.result?.auditId,
      error: response.error
    };

    this.executions.unshift(newExec);
    
    if (response.success) {
      this.onboardingStatus.firstTxLanded = true;
      this.onboardingStatus.step = 'ready';
    }

    return {
      execution: newExec,
      response // Include full response for debugging (Friction Point 5)
    };
  }

  async checkFunding() {
    const balance = await keeperHub.getWalletBalance();
    this.onboardingStatus.hasUsdc = balance.baseUSDC > 0;
    this.onboardingStatus.hasEth = balance.baseETH > 0;
    
    if (this.onboardingStatus.hasUsdc && this.onboardingStatus.hasEth) {
      if (!this.onboardingStatus.firstTxLanded) {
        this.onboardingStatus.step = 'ready';
      }
    } else {
      this.onboardingStatus.step = 'funding';
    }
    
    return this.onboardingStatus;
  }

  resetOnboarding() {
    this.onboardingStatus = {
      step: 'funding',
      isWalletConnected: true,
      hasUsdc: false,
      hasEth: true,
      firstTxLanded: false,
      fundingUrl: 'https://coinbase.com/onramp'
    };
    logger.info('Onboarding status reset');
  }
}

export const dcaEngine = new DCAEngine();
