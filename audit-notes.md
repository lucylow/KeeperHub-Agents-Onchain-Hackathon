# Deployment Audit Notes

The initial production audit passed: `pnpm check`, `pnpm test`, and `pnpm build` all completed successfully. The preview root returned HTTP 200, but the first tRPC smoke tests returned the Vite fallback HTML because the Express entrypoint was missing the `/api/trpc` middleware mount. That deployment-blocking issue has now been repaired by mounting `createExpressMiddleware` with `appRouter` and `createContext` before the static/Vite fallback.

The frontend preview originally used a generic light SaaS login. The reference hostname was not reachable from the sandbox due to an SSL protocol error, so visual alignment was based on the available KeeperHub context and an independent style review: deep graphite/navy background, subtle technical grid, electric cyan action color, concise infrastructure copy, and dark dashboard defaults. The app now uses the dark theme by default and has updated cyan/graphite tokens.

OAuth was also checked. The scaffold provides a side-effectful `startLogin` helper in `client/src/const.ts`; Home now uses that helper rather than a hardcoded route. The final source archive must exclude node_modules, dist, logs, git metadata, and secrets.
