# KGB Deployment Notes

This project is a React, tRPC, Express, Drizzle ORM, and Manus OAuth application. The production entrypoint is `dist/index.js`; build with `pnpm build` and run with `pnpm start`. The managed Manus runtime supplies `PORT`, so the server does not require a fixed production port.

## Required configuration

Configure secrets through the Manus project Settings rather than committing environment files. The built-in Manus values include `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `OAUTH_SERVER_URL`, and the built-in Forge variables. For live KeeperHub execution, add `KEEPERHUB_API_KEY` and, if needed, override `KEEPERHUB_API_URL`. `CHAIN_ID` defaults to Base mainnet `8453`.

When KeeperHub credentials are unavailable, the UI remains usable for authentication and configuration, while wallet reads return safe zero balances and workflow failures return actionable errors. No secret is exposed to client-side code.

## Critical routes

The frontend is served from `/`. tRPC is mounted at `/api/trpc`. Manus OAuth callback handling is mounted at `/api/oauth/callback`. The webhook is `POST /api/webhook` and accepts either `Authorization: kh_...` or `x-api-key: kh_...`; requests must include a valid numeric `userId` in the payload. The scheduled callback is `POST /api/scheduled/dcaTick` and accepts Manus Heartbeat cron authentication.

Example webhook request:

```sh
curl -X POST "$APP_URL/api/webhook" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: kh_REPLACE_WITH_KEEPERHUB_KEY' \
  -d '{"userId":1,"event":"workflow.executed","txHash":"0x..."}'
```

## Verification performed

The project has been typechecked, tested with Vitest, built for production, smoke-tested at the preview root, and checked through the public `auth.me` tRPC query and protected `dca.status` authorization path. The final source ZIP intentionally excludes `node_modules`, `dist`, `.git`, local logs, and secrets.

Publishing is a separate Manus Management UI action. After reviewing the checkpoint, use the Publish button to deploy the built project permanently.
