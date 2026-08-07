# KGB Troubleshooting Guide

## Common Friction Points & Solutions

### 1. "INSUFFICIENT_FUNDS" Error
**Problem:** Your agent fails to execute a swap.
**Solution:** The KeeperHub-managed wallet needs both **USDC** (for the swap) and **ETH** (for gas).
- **Minimum Recommendation:** $10 USDC + $3 ETH.
- **Mainnet Funding:** Use [Coinbase Onramp](https://coinbase.com/onramp).
- **Testnet Funding:** Use the [Base Sepolia Faucet](https://faucet.quicknode.com/base/sepolia).

### 2. "network must be a string" or "chain not found"
**Problem:** API calls fail due to parameter naming.
**Solution:** The KGB backend now normalizes `network` and `chain`. 
- Always use the stringified Chain ID (e.g., `"8453"` for Base, `"84532"` for Base Sepolia).
- The backend will automatically map these to the correct format for KeeperHub actions.

### 3. Webhook Authentication Failures
**Problem:** Your webhook endpoint returns `401 Unauthorized`.
**Solution:** Ensure you are sending the correct headers.
- **Header:** `Authorization: kh_your_api_key` or `x-api-key: kh_your_api_key`.
- **Note:** The `Bearer` prefix is also supported.

### 4. Workflow Response Envelope
**Problem:** Confusion over the return value of a workflow execution.
**Solution:** The KGB backend wraps all KeeperHub responses in a consistent envelope:
```json
{
  "success": true,
  "result": { ... },
  "logs": [ ... ],
  "txHash": "0x..."
}
```
This allows your agent to easily parse success/failure and access logs for debugging.

### 5. SDK vs Raw API
**Problem:** Deciding between using the KeeperHub SDK or raw REST calls.
**Solution:** 
- Use the **KGB Backend** (REST) for agent builds where you want least-glue execution.
- Use the **KeeperHub SDK** directly only if you need complex quote-aggregation logic.
