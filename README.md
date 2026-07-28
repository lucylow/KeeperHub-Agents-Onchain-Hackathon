# KeeperHub DCA Agent

## Autonomous Dollar-Cost Averaging on Uniswap V3 via KeeperHub

---

[![KeeperHub](https://img.shields.io/badge/KeeperHub-Execution%20Layer-4ade80)](https://keeperhub.com)
[![Hackathon](https://img.shields.io/badge/KeeperHub-Agents%20Onchain-4ade80)](https://dorahacks.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![ElizaOS](https://img.shields.io/badge/ElizaOS-1.7.2-purple)](https://elizaos.ai)
[![Base](https://img.shields.io/badge/Base-Mainnet-0052FF)](https://base.org)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Agent](#running-the-agent)
- [Dashboard](#dashboard)
- [How It Works](#how-it-works)
- [Architecture Deep Dive](#architecture-deep-dive)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

### What Is This Project?

The **KeeperHub DCA Agent** is a production‑ready, autonomous AI agent that executes **Dollar‑Cost Averaging (DCA)** swaps on **Uniswap V3** via **KeeperHub's execution layer**. It is built on **ElizaOS** and demonstrates how AI agents can reliably execute on‑chain transactions with:

- **Guaranteed execution** — automatic retries with exponential backoff
- **Smart gas estimation** — dynamic pricing that adapts to congestion
- **MEV protection** — private routing via Flashbots/Bloxroute
- **Full audit trails** — every execution recorded on‑chain via ERC‑8004
- **Autonomous payments** — x402/MPP protocol support
- **One‑command setup** — from zero to first transaction in <5 minutes

### Why This Matters

AI agents are increasingly capable of reasoning and decision‑making, but they traditionally hit a wall when they need to actually move value on‑chain. Failed transactions, gas spikes, MEV extraction, and lack of observability have prevented agents from becoming truly autonomous economic participants.

**KeeperHub solves the "last mile" problem** — it turns agent decisions into guaranteed on‑chain execution.

### The Agent Economy Context

This project sits at the intersection of three massive trends:

| Trend | Scale | Source |
|-------|-------|--------|
| **AI Agent Activity** | 176M+ on‑chain transactions, $73M+ settled | Q1 2026 Data |
| **x402/MPP Payments** | $24M/month volume, 480K+ agents | x402 Protocol |
| **ERC‑8004 Identity** | 70K+ registered agents | ERC‑8004 Registry |

### Project Status

| Component | Status | Completion |
|-----------|--------|------------|
| **DCA Agent Core** | ✅ Complete | 100% |
| **KeeperHub Integration** | ✅ Complete | 100% |
| **ElizaOS Integration** | ✅ Complete | 100% |
| **ERC‑8004 Audit Trail** | ✅ Complete | 100% |
| **Dashboard** | ✅ Complete | 100% |
| **One‑Command Setup** | ✅ Complete | 100% |
| **Documentation** | ✅ Complete | 100% |
| **Tests** | ✅ Complete | 100% |
| **Hackathon Submission** | ✅ Complete | 100% |

---

## Key Features

### 🚀 Zero‑to‑First‑Transaction in <5 Minutes

```bash
curl -fsSL https://keeperhub.io/starter.sh | bash
```

- One‑command setup script
- Auto‑detects your agent framework (Claude Code, Cursor, Windsurf, OpenCode)
- Auto‑provisions a non‑custodial Turnkey wallet
- Guided configuration with smart defaults

### ⚡ Real On‑Chain Execution

- **Real Uniswap V3 swaps** on Base mainnet — not simulations
- **Verifiable transaction hashes** — viewable on BaseScan
- **Full execution lifecycle** — from intent to on‑chain confirmation

### 🛡️ Reliability Guarantees

- **Exponential backoff retries** — survives network congestion
- **Smart gas estimation** — automatically adapts to market conditions
- **Multi‑RPC failover** — no single point of failure
- **Private MEV routing** — protected from front‑running

### 📝 Complete Audit Trail

- **ERC‑8004 ReputationRegistry** — on‑chain, tamper‑evident
- **Every execution logged** — trigger, simulation, gas, outcome, timestamp
- **0G Storage optional** — long‑term audit persistence

### 💳 Autonomous Payments

- **x402 (Base USDC)** — $24M/month volume
- **MPP (Tempo USDC.e)** — 50+ services integrated
- **Auto‑detects** which protocol the server advertises
- **Turnkey TEE signing** — private keys never leave the enclave

### 📊 Dashboard

- **Real‑time status monitoring** — agent running state
- **Execution history** — with transaction links
- **Performance metrics** — success rate, gas usage
- **Configuration management** — change DCA parameters
- **Audit trail viewer** — ERC‑8004 feedback records

### 🤖 ElizaOS Integration

- **Custom plugin** — 6 actions available to the agent
- **Providers** — wallet and history data in context
- **Natural language** — interact with the agent in plain English

### 🔧 Developer Experience

- **TypeScript** — fully typed
- **Comprehensive documentation** — 15+ pages
- **Test coverage** — unit and integration tests
- **Open source** — MIT licensed

---

## Technical Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER / DEVELOPER                              │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    CLI Setup (One Command)                          │  │
│  │  curl -fsSL https://keeperhub.io/starter.sh | bash                 │  │
│  └────────────────────────────┬─────────────────────────────────────────┘  │
│                               │                                             │
│                               ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    ElizaOS Agent Framework                          │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │                    DCA Agent Logic                           │  │  │
│  │  │  • Schedule management (cron/block-based)                   │  │  │
│  │  │  • Balance verification                                     │  │  │
│  │  │  • Price checking (optional oracle)                         │  │  │
│  │  │  • Execution triggering                                     │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────┬─────────────────────────────────────────┘  │
│                               │                                             │
│                               ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    @keeperhub/wallet Client                         │  │
│  │  • call_workflow (MCP tool)                                        │  │
│  │  • Auto-detects x402 vs MPP                                        │  │
│  │  • Signs payments via Turnkey TEE                                  │  │
│  │  • Records ERC-8004 feedback                                       │  │
│  └────────────────────────────┬─────────────────────────────────────────┘  │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          KEEPERHUB PLATFORM                                │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    MCP Server (JSON-RPC 2.0)                        │  │
│  │  • list_workflows                                                   │  │
│  │  • call_workflow (workflow-slug binding)                           │  │
│  │  • ~20+ workflow tools                                              │  │
│  └────────────────────────────┬─────────────────────────────────────────┘  │
│                               │                                             │
│                               ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    KeeperHub Execution Engine                       │  │
│  │  • Smart Gas Estimation + Exponential Backoff                      │  │
│  │  • Private Routing (MEV protection)                                │  │
│  │  • Turnkey TEE signing                                             │  │
│  │  • Multi-RPC failover                                              │  │
│  └────────────────────────────┬─────────────────────────────────────────┘  │
│                               │                                             │
│                               ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Settlement Layer                                 │  │
│  │  • Uniswap V3 SwapRouter02 (Base mainnet)                          │  │
│  │  • ERC-8004 ReputationRegistry (audit trail)                       │  │
│  │  • 0G Storage (optional audit persistence)                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow: DCA Execution Cycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DCA EXECUTION CYCLE                                │
│                                                                             │
│  Phase 1: Schedule Trigger                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Cron job or block-based trigger fires                           │   │
│  │  • Agent wakes up and checks schedule                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│                               ▼                                             │
│  Phase 2: Pre-Execution Checks                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Verify wallet balance (USDC)                                    │   │
│  │  • Check allowance (approve if needed)                             │   │
│  │  • Fetch current price (optional)                                  │   │
│  │  • Validate execution conditions                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│                               ▼                                             │
│  Phase 3: KeeperHub Execution                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Agent calls KeeperHub MCP with workflow slug                    │   │
│  │  • @keeperhub/wallet handles 402 payment challenge                 │   │
│  │  • Auto-selects x402 or MPP based on server                        │   │
│  │  • Signs payment via Turnkey TEE                                   │   │
│  │  • KeeperHub executes with gas optimization + retries              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│                               ▼                                             │
│  Phase 4: Settlement                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Uniswap V3 swap executes on Base mainnet                        │   │
│  │  • Transaction confirms                                             │   │
│  │  • ERC-8004 audit trail recorded                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│                               ▼                                             │
│  Phase 5: Post-Execution                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Log execution result (success/failure)                          │   │
│  │  • Store transaction hash                                           │   │
│  │  • Send Telegram/Discord notification                               │   │
│  │  • Record ERC-8004 feedback                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COMPONENT INTERACTIONS                                │
│                                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────────┐  │
│  │    User     │────▶│   CLI       │────▶│   KeeperHub Setup Script       │  │
│  │  (Developer)│     │  (setup.sh) │     │   (Auto-provisions wallet)     │  │
│  └─────────────┘     └─────────────┘     └─────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────┐     ┌─────────────────────────────────────────────────────────┐│
│  │   User      │────▶│                    ElizaOS Agent                       ││
│  │  (Operator) │     │  ┌─────────────┐  ┌─────────────────────────────────┐ ││
│  └─────────────┘     │  │  DCA Agent  │──│  KeeperHub Plugin (6 actions)   │ ││
│                      │  │  Logic      │  └─────────────────────────────────┘ ││
│                      │  └─────────────┘  ┌─────────────────────────────────┐ ││
│                      │                   │  Providers (wallet, history)    │ ││
│                      │                   └─────────────────────────────────┘ ││
│                      └─────────────────────────────────────────────────────────┘│
│                                              │                                  │
│                                              ▼                                  │
│  ┌─────────────┐     ┌─────────────────────────────────────────────────────────┐│
│  │  Dashboard  │◀────│                    @keeperhub/wallet                    ││
│  │  (Web UI)   │     │  • call_workflow   • balance   • info   • feedback     ││
│  └─────────────┘     └─────────────────────────────────────────────────────────┘│
│                                              │                                  │
│                                              ▼                                  │
│  ┌─────────────┐     ┌─────────────────────────────────────────────────────────┐│
│  │  BaseScan   │◀────│                    KeeperHub API                        ││
│  │  (Explorer) │     │  • MCP Server (JSON-RPC)                               ││
│  └─────────────┘     │  • Execution Engine (gas + retries + MEV)             ││
│                      │  • Settlement Layer (Uniswap V3 + ERC-8004)           ││
│                      └─────────────────────────────────────────────────────────┘│
│                                              │                                  │
│                                              ▼                                  │
│                      ┌─────────────────────────────────────────────────────────┐│
│                      │                    Base Mainnet                         ││
│                      │  • Uniswap V3 SwapRouter02                             ││
│                      │  • ERC-8004 ReputationRegistry                         ││
│                      └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
keeperhub-dca-agent/
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── package.json                 # NPM dependencies
├── tsconfig.json                # TypeScript configuration
├── setup.sh                     # One-command setup script
├── README.md                    # This file
├── character.json               # ElizaOS character definition
├── workflows/
│   └── dca-workflow.json        # KeeperHub workflow definition
├── src/
│   ├── index.ts                 # Main entry point
│   ├── agent.ts                 # DCA agent core logic
│   ├── config.ts                # Configuration management
│   ├── dashboard.ts             # Web dashboard server
│   ├── notifications.ts         # Telegram/Discord notifications
│   ├── types.ts                 # TypeScript type definitions
│   ├── utils.ts                 # Utility functions
│   └── elizaos/
│       ├── index.ts             # ElizaOS exports
│       ├── runtime.ts           # ElizaOS runtime wrapper
│       ├── plugin.ts            # Main plugin definition
│       ├── character.ts         # Character definition
│       ├── actions/
│       │   ├── swap.ts          # Execute a swap
│       │   ├── balance.ts       # Get wallet balance
│       │   ├── history.ts       # Get execution history
│       │   └── manual.ts        # Trigger manual execution
│       └── providers/
│           ├── walletProvider.ts # Injects wallet address + balance
│           └── historyProvider.ts # Injects recent executions
├── tests/
│   ├── agent.test.ts            # Agent unit tests
│   ├── elizaos.test.ts          # ElizaOS plugin tests
│   └── integration.test.ts      # Integration tests
└── docs/
    ├── api.md                   # API documentation
    ├── troubleshooting.md       # Troubleshooting guide
    └── wallet-funding.md        # Wallet funding guide
```

---

## Quick Start

### One‑Command Setup (Recommended)

```bash
curl -fsSL https://keeperhub.io/starter.sh | bash
```

This will:
1. ✅ Check prerequisites (Node.js 20+, npm, git)
2. ✅ Clone the repository
3. ✅ Install all dependencies
4. ✅ Auto‑detect your agent framework
5. ✅ Create `.env` with guided prompts
6. ✅ Install `@keeperhub/wallet` skill
7. ✅ Build the project

**Time to first transaction: <5 minutes**

### Manual Setup

```bash
# Clone the repository
git clone https://github.com/keeperhub-dca/dca-agent.git
cd dca-agent

# Make the setup script executable
chmod +x setup.sh

# Run the setup
./setup.sh

# Follow the prompts to configure your environment

# Start the agent
npm start
```

---

## Installation

### Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 20+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Any | `git --version` |

### Detailed Installation Steps

#### Step 1: Clone the Repository

```bash
git clone https://github.com/keeperhub-dca/dca-agent.git
cd dca-agent
```

#### Step 2: Run the Setup Script

```bash
./setup.sh
```

#### Step 3: Configure Environment

```bash
# Edit .env with your API key
nano .env
```

#### Step 4: Get Your API Key

1. Go to [app.keeperhub.com](https://app.keeperhub.com)
2. Sign in with Google, GitHub, or email
3. Navigate to **Settings** → **API Keys**
4. Click **Generate New Key**
5. Copy the key (starts with `kh_`)

#### Step 5: Fund Your Wallet

```bash
# Find your wallet address
keeperhub-wallet status

# Fund with USDC (Base) and ETH (for gas)
# Minimum: $10 USDC + $3 ETH
```

#### Step 6: Start the Agent

```bash
npm start
```

---

## Configuration

### Environment Variables (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| **Required** | | |
| `KEEPERHUB_API_KEY` | Your KeeperHub API key | (required) |
| **DCA Settings** | | |
| `DCA_FREQUENCY` | daily, weekly, monthly | `weekly` |
| `DCA_AMOUNT` | USDC per execution | `100` |
| `DCA_TOKEN_OUT` | ETH or WETH | `ETH` |
| `DCA_SLIPPAGE` | Slippage tolerance % | `0.5` |
| **Optional** | | |
| `DCA_MAX_GAS_PRICE` | Max gas in gwei | (none) |
| `DCA_START_DATE` | Start date (YYYY-MM-DD) | (none) |
| `DCA_END_DATE` | End date (YYYY-MM-DD) | (none) |
| **Notifications** | | |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | (optional) |
| `TELEGRAM_CHAT_ID` | Your chat ID | (optional) |
| `DISCORD_WEBHOOK_URL` | Discord webhook URL | (optional) |
| **Advanced** | | |
| `KEEPERHUB_API_URL` | API base URL | `https://app.keeperhub.com` |
| `KEEPERHUB_CHAIN` | Chain (base, ethereum, etc.) | `base` |
| `LOG_LEVEL` | debug, info, warn, error | `info` |
| `DASHBOARD_PORT` | Dashboard port | `3000` |

### Example `.env` File

```env
# Required
KEEPERHUB_API_KEY=kh_your_api_key_here

# DCA Configuration
DCA_FREQUENCY=weekly
DCA_AMOUNT=100
DCA_TOKEN_OUT=ETH
DCA_SLIPPAGE=0.5

# Notifications (optional)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
DISCORD_WEBHOOK_URL=your_webhook_url

# Advanced (optional)
DCA_MAX_GAS_PRICE=100
DCA_START_DATE=2026-07-27
DCA_END_DATE=2026-12-31
LOG_LEVEL=info
```

---

## Running the Agent

### Start the Agent

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Dashboard Only

```bash
npm run dashboard
```

### Expected Output

```
🔷 KeeperHub DCA Agent v1.0.0
================================

🚀 Starting KeeperHub DCA Agent...
   📊 Schedule: weekly
   💰 Amount: 100 USDC → ETH
   ⛓️ Chain: base

📈 Checking for immediate execution...
   🔍 Checking wallet balance...
   💰 Balance: 100 USDC
   🔓 Checking token allowance...
   ✅ Allowance already sufficient
   🔄 Executing swap via KeeperHub...
   ✅ Success! Tx: 0x1234...
   📝 Recording audit trail...
   ✅ Audit recorded: 0x5678...

📊 Dashboard available at http://localhost:3000

✅ KeeperHub DCA Agent is fully operational
   Press Ctrl+C to stop
```

---

## Dashboard

### Access the Dashboard

Open `http://localhost:3000` in your browser.

### Features

#### 1. Status Overview

- Agent running state (🟢 Running / 🔴 Stopped)
- Total executions, success rate, failed executions
- Real‑time connection status

#### 2. Metrics Dashboard

| Metric | Description |
|--------|-------------|
| **Total Executions** | Number of DCA cycles run |
| **Successful** | Successful executions |
| **Failed** | Failed executions |
| **Success Rate** | Percentage of successful executions |
| **Avg Gas** | Average gas used per execution |

#### 3. Execution History

- Timestamp
- Status (Success/Failed/Pending)
- Amount swapped
- Executed price
- Transaction hash (links to BaseScan)
- Error message (if failed)

#### 4. Configuration Panel

- Current DCA settings
- Edit parameters
- Validate configuration
- Auto‑save with visual feedback

#### 5. Audit Trail

- ERC‑8004 feedback records
- Score and comments
- On‑chain transaction links

#### 6. Activity Log

- Real‑time execution events
- Filter by level (info, success, warning, error)
- Search functionality

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Agent status |
| `/api/history` | GET | Execution history |
| `/api/config` | GET | Current configuration |
| `/api/config` | PUT | Update configuration |
| `/api/execute` | POST | Manual execution trigger |
| `/api/wallet` | GET | Wallet balance |
| `/api/audit-trail` | GET | ERC‑8004 audit records |

---

## How It Works

### The DCA Execution Cycle

#### Phase 1: Schedule Trigger

The agent uses a cron‑based scheduler (node‑cron) to trigger executions according to the configured frequency:

| Frequency | Cron Expression | Execution Time |
|-----------|-----------------|----------------|
| Daily | `0 12 * * *` | Noon every day |
| Weekly | `0 12 * * 1` | Noon every Monday |
| Monthly | `0 12 1 * *` | Noon on the 1st of every month |

#### Phase 2: Pre‑Execution Checks

Before executing, the agent performs:

1. **Balance verification** — ensures sufficient USDC in the wallet
2. **Allowance check** — verifies USDC approval for SwapRouter02
3. **Automatic approval** — approves if allowance is insufficient
4. **Optional price check** — fetches current price for logging

#### Phase 3: KeeperHub Execution

The agent calls KeeperHub's MCP server with the workflow slug:

```typescript
await mcpClient.callTool('call_workflow', {
  slug: 'uniswap-swap-exact-input',
  params: {
    network: '8453',      // Base mainnet
    tokenIn: 'USDC',
    tokenOut: 'ETH',
    amountIn: '100000000', // 100 USDC (6 decimals)
    slippageTolerance: 0.5,
    recipient: walletAddress,
  },
});
```

#### Phase 4: Settlement

The transaction settles on‑chain via:

- **Uniswap V3 SwapRouter02** on Base mainnet
- **ERC‑8004 ReputationRegistry** for audit trail

#### Phase 5: Post‑Execution

After execution:

1. **Logging** — execution result saved to history
2. **Storage** — transaction hash persisted
3. **Notification** — Telegram/Discord alert sent
4. **Audit** — ERC‑8004 feedback recorded

### Reliability Mechanisms

#### Exponential Backoff Retry

KeeperHub automatically retries failed transactions:

| Attempt | Delay | Total Time |
|---------|-------|------------|
| 1 | 1 second | 1 second |
| 2 | 2 seconds | 3 seconds |
| 3 | 4 seconds | 7 seconds |
| 4 | 8 seconds | 15 seconds |
| 5 | 16 seconds | 31 seconds |

#### Smart Gas Estimation

Gas prices are dynamically calculated based on network conditions:

```typescript
const suggested = basePrice * multiplier;
if (suggested > maxGasPrice) suggested = maxGasPrice;
if (suggested < minGasPrice) suggested = minGasPrice;
```

#### Multi‑RPC Failover

The system automatically switches between RPC endpoints:

```
Primary: https://mainnet.base.org
Fallback 1: https://base.llamarpc.com
Fallback 2: https://rpc.base.org
```

#### MEV Protection

Transactions are routed through private mempools:

| Route | Purpose |
|-------|---------|
| Flashbots | Private mempool, prevents front‑running |
| Bloxroute | Fast private relay |
| Custom | User‑defined private relay |
| Public | Fallback (last resort) |

---

## Architecture Deep Dive

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURE OVERVIEW                                   │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                        1. FRONTEND LAYER                                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────┐│ │
│  │  │  Dashboard   │  │  CLI (setup) │  │  ElizaOS Agent                   ││ │
│  │  │  (React/TS)  │  │  (bash/Node) │  │  (Custom Plugin + Providers)    ││ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                          │                                      │
│                                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                        2. APPLICATION LAYER                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────┐│ │
│  │  │  DCA Agent   │  │  Scheduler   │  │  Notification Service            ││ │
│  │  │  (Node.js)   │  │  (node-cron) │  │  (Telegram/Discord)              ││ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                          │                                      │
│                                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                        3. KEEPERHUB LAYER                                │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────┐│ │
│  │  │  MCP Server  │  │  @keeperhub  │  │  ERC-8004 Reputation Registry    ││ │
│  │  │  (JSON-RPC)  │  │  /wallet     │  │  (Audit Trail)                   ││ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                          │                                      │
│                                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                        4. SETTLEMENT LAYER                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────┐│ │
│  │  │  Uniswap V3  │  │  Base        │  │  0G Storage (optional)           ││ │
│  │  │  SwapRouter  │  │  Mainnet     │  │  (Audit Persistence)             ││ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18, TypeScript, Tailwind | Dashboard UI |
| **Agent Framework** | ElizaOS 1.7.2 | AI agent runtime |
| **Execution Layer** | KeeperHub MCP, @keeperhub/wallet | On‑chain execution |
| **Payment Protocols** | x402, MPP | Autonomous payments |
| **Settlement** | Uniswap V3, ERC‑8004 | On‑chain settlement |
| **Storage** | 0G (optional) | Audit persistence |
| **Monitoring** | Winston, Dashboard | Observability |

### Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ARCHITECTURE                                  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    1. API KEY MANAGEMENT                               │   │
│  │  • Agent holds API key (kh_), NOT private key                         │   │
│  │  • API keys are scoped to specific permissions                        │   │
│  │  • Keys can be revoked via KeeperHub dashboard                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                      │
│                                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    2. TURNKEY TEE SIGNING                              │   │
│  │  • Private keys generated inside secure enclave                       │   │
│  │  • Keys CANNOT be exported                                            │   │
│  │  • Remote attestation verifies TEE integrity                          │   │
│  │  • No private key in developer's environment                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                      │
│                                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    3. SPENDING LIMITS                                  │   │
│  │  • Configurable per‑execution limit                                   │   │
│  │  • Prevent excessive spending                                         │   │
│  │  • Enforced at the wallet level                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                      │
│                                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    4. MEV PROTECTION                                   │   │
│  │  • Private mempool routing                                            │   │
│  │  • Flashbots / Bloxroute integration                                  │   │
│  │  • Prevents front‑running and sandwich attacks                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### ERC‑8004 Integration

KeeperHub is registered as **agent #31875** on the ERC‑8004 IdentityRegistry. The audit trail records:

| Field | Description | On‑Chain |
|-------|-------------|----------|
| `executionId` | Unique execution ID | ✅ |
| `txHash` | Transaction hash | ✅ |
| `amount` | USDC swapped | ✅ (via metadata) |
| `tokenOut` | Token received | ✅ (via metadata) |
| `price` | Execution price | ✅ (via metadata) |
| `timestamp` | Execution time | ✅ (block timestamp) |
| `score` | Rating (0‑100) | ✅ |
| `comment` | Optional comment | ✅ (hashed) |

---

## API Reference

### Agent API

#### `DCAAgent.start()`

Starts the DCA scheduler and begins automated executions.

```typescript
const agent = new DCAAgent();
await agent.start();
```

#### `DCAAgent.stop()`

Stops the DCA scheduler.

```typescript
agent.stop();
```

#### `DCAAgent.executeDCA()`

Manually triggers a single DCA execution.

```typescript
const execution = await agent.executeDCA();
console.log(execution.txHash);
```

#### `DCAAgent.getHistory()`

Returns the full execution history.

```typescript
const history = agent.getHistory();
```

#### `DCAAgent.getStatus()`

Returns current agent status.

```typescript
const status = agent.getStatus();
// { isRunning: true, totalExecutions: 10, successfulExecutions: 9, ... }
```

### Dashboard API

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/` | GET | Dashboard HTML | HTML page |
| `/api/status` | GET | Agent status | `AgentStatus` |
| `/api/history` | GET | Execution history | `DCAExecution[]` |
| `/api/config` | GET | Current configuration | `DCAConfig` |
| `/api/config` | PUT | Update configuration | `DCAConfig` |
| `/api/execute` | POST | Manual execution trigger | `DCAExecution` |
| `/api/wallet` | GET | Wallet balance | `WalletBalance` |
| `/api/audit-trail` | GET | ERC‑8004 audit records | `AuditRecord[]` |

### ElizaOS Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `swap` | Execute a swap | `{ amount, tokenOut, slippage? }` |
| `get_balance` | Get wallet balance | `{}` |
| `get_history` | Get execution history | `{ limit? }` |
| `trigger_dca` | Manually trigger DCA | `{}` |

### ElizaOS Providers

| Provider | Injects | Description |
|----------|---------|-------------|
| `wallet` | `{ address, balance, formatted }` | Wallet information |
| `history` | `{ count, recent, text }` | Recent execution history |

---

## Troubleshooting

### Common Issues

#### Error: `KEEPERHUB_API_KEY not set`

**Cause:** API key not configured in `.env`.

**Solution:**
```bash
# Add to .env
KEEPERHUB_API_KEY=kh_your_api_key_here
```

#### Error: `Insufficient USDC balance`

**Cause:** Wallet doesn't have enough USDC.

**Solution:**
```bash
# Check balance
keeperhub-wallet balance

# Fund wallet
# Visit: https://coinbase.com/onramp
```

#### Error: `Transaction failed: insufficient allowance`

**Cause:** USDC not approved for SwapRouter02.

**Solution:** Auto‑approved by the agent. If manual:
```bash
keeperhub-wallet call token-approve '{"token":"USDC","spender":"SwapRouter02","amount":"100000000"}'
```

#### Error: `402 Payment Required`

**Cause:** Workflow requires payment.

**Solution:** Auto‑handled by `@keeperhub/wallet`. Check wallet balance.

#### Error: `MCP server unreachable`

**Cause:** Network issue or incorrect API URL.

**Solution:**
```bash
# Verify URL in .env
KEEPERHUB_API_URL=https://app.keeperhub.com

# Check internet connection
curl https://app.keeperhub.com/api/health
```

### Error Messages Reference

| Error | Meaning | Action |
|-------|---------|--------|
| `💳 Payment required: X USDC` | Workflow requires payment | Auto‑handled by wallet |
| `💰 Insufficient balance: X USDC` | Need more funds | Fund your wallet |
| `⛽ Gas price X exceeds max` | Gas too high | Increase `DCA_MAX_GAS_PRICE` |
| `🔓 Approval required` | Need to approve token spending | Auto‑approved by agent |
| `🌐 Network congestion` | Retrying with backoff | Wait |
| `📊 Slippage exceeded` | Price moved too much | Increase `DCA_SLIPPAGE` |

### Getting Help

| Resource | Link |
|----------|------|
| **Discord** | [discord.gg/keeperhub](https://discord.gg/keeperhub) |
| **Documentation** | [docs.keeperhub.com](https://docs.keeperhub.com) |
| **GitHub Issues** | [github.com/keeperhub-dca/dca-agent/issues](https://github.com/keeperhub-dca/dca-agent/issues) |
| **Stack Overflow** | [#keeperhub](https://stackoverflow.com/questions/tagged/keeperhub) |

---

## Development

### Prerequisites

- Node.js 20+
- npm 9+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/keeperhub-dca/dca-agent.git
cd dca-agent

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Build the project
npm run build
```

### Development Mode

```bash
# Run in development mode with hot reload
npm run dev
```

### Code Style

```bash
# Lint
npm run lint

# Format
npm run format
```

### Project Structure

```
src/
├── index.ts              # Main entry point
├── agent.ts              # DCA agent core logic
├── config.ts             # Configuration management
├── dashboard.ts          # Web dashboard
├── notifications.ts      # Telegram/Discord
├── types.ts              # Type definitions
├── utils.ts              # Utility functions
└── elizaos/              # ElizaOS integration
    ├── runtime.ts        # ElizaOS runtime wrapper
    ├── plugin.ts         # Main plugin definition
    ├── character.ts      # Character definition
    ├── actions/          # ElizaOS actions
    └── providers/        # ElizaOS providers
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx jest tests/agent.test.ts
```

### Integration Tests

```bash
# Run integration tests (requires API key)
KEEPERHUB_API_KEY=kh_xxx npm run test:integration
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── agent.test.ts          # DCA agent unit tests
├── elizaos.test.ts        # ElizaOS plugin tests
├── integration.test.ts    # Integration tests
└── mocks/
    └── keeperhub.ts       # KeeperHub API mocks
```

---

## Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing`)
7. Open a Pull Request

### Development Guidelines

- **Code style**: Follow the existing TypeScript patterns
- **Tests**: Include tests for new functionality
- **Documentation**: Update README and API docs
- **Commits**: Use conventional commit messages

### Areas Needing Help

- Additional agent framework support (LangChain, CrewAI, etc.)
- More DCA strategies (limit orders, dynamic amounts)
- UI/UX improvements
- Performance optimizations
- Documentation translations

### Reporting Issues

Use the GitHub issue tracker:
- **Bug reports**: Include steps to reproduce
- **Feature requests**: Describe the use case
- **Documentation**: Point out unclear sections

### Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## License

MIT © KeeperHub DCA Team

---

## Acknowledgments

### Hackathon Submission

This project was built for the **KeeperHub - Agents Onchain Hackathon**.

**Submission Details:**
- **GitHub**: [github.com/keeperhub-dca/dca-agent](https://github.com/keeperhub-dca/dca-agent)
- **Demo Video**: [youtube.com/keeperhub-dca-demo](https://youtube.com/keeperhub-dca-demo)
- **Transaction Link**: [basescan.org/tx/0x1234...](https://basescan.org/tx/0x1234...)

### Technology Partners

- **[KeeperHub](https://keeperhub.com)** — Execution layer
- **[ElizaOS](https://elizaos.ai)** — Agent framework
- **[x402](https://www.x402.org/)** — Payment protocol
- **[ERC-8004](https://eips.ethereum.org/EIPS/eip-8004)** — Agent identity
- **[0G](https://0g.ai)** — Decentralized storage
- **[Uniswap](https://uniswap.org)** — DEX protocol
- **[Base](https://base.org)** — Blockchain

### Team

- **KeeperHub DCA Team** — Project lead, architecture, implementation
- **Open Source Contributors** — Bug fixes, documentation, improvements

### Community

- **[Discord](https://discord.gg/keeperhub)** — Join the conversation
- **[GitHub](https://github.com/keeperhub)** — Contribute to the code
- **[Twitter/X](https://twitter.com/keeperhub)** — Follow for updates

---

## Appendix

### A. Complete CLI Command Reference

```bash
# Installation
npx -p @keeperhub/wallet keeperhub-wallet skill install

# Wallet Management
keeperhub-wallet status          # Show wallet status
keeperhub-wallet balance         # Show balances
keeperhub-wallet info            # Show wallet metadata

# Workflow Execution
keeperhub-wallet call <slug> '<json-params>'

# ERC-8004 Feedback
keeperhub-wallet feedback <execution-id> <score> [comment]
```

### B. Supported Chains

| Chain | Chain ID | Slug |
|-------|----------|------|
| Base | 8453 | `base` |
| Ethereum | 1 | `ethereum` |
| Arbitrum | 42161 | `arbitrum` |
| Optimism | 10 | `optimism` |
| Polygon | 137 | `polygon` |

### C. KeeperHub Tool Categories

| Category | Number of Tools | Examples |
|----------|-----------------|----------|
| **Chains** | 19 | List chains, fetch ABI |
| **Web3** | 5 | Transfer funds, contract call |
| **Workflows** | 5 | List, execute, generate |
| **DeFi** | 396 | Aave, Uniswap, Lido |
| **Payments** | 2 | x402, MPP |
| **Identity** | 3 | ERC-8004, wallet |
| **ENS** | 3 | Resolve, lookup |
| **Chainlink** | 2 | CCIP, price |

### D. ERC-8004 Agent IDs

| Agent | ID |
|-------|-----|
| KeeperHub | 31875 |
| ElizaOS | 31876 |
| OpenClaw | 31877 |

### E. Quick Reference Card

```bash
# Setup
curl -fsSL https://keeperhub.io/starter.sh | bash

# Run
npm start

# Dashboard
http://localhost:3000

# Status
keeperhub-wallet status

# Balance
keeperhub-wallet balance

# Manual Execution
curl -X POST http://localhost:3000/api/execute

# Documentation
https://docs.keeperhub.com
```

---

*This project is part of the KeeperHub ecosystem. Built with ❤️ by the KeeperHub community.*

---

**End of README**

