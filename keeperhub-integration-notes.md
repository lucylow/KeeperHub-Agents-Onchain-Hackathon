# KeeperHub integration notes

The official KeeperHub MCP documentation is available at https://docs.keeperhub.com/agent/mcp-server. It confirms the remote MCP endpoint is https://app.keeperhub.com/mcp. Remote clients use OAuth 2.1 through a browser; headless or CI clients may pass an organisation API key with the kh_ prefix as `Authorization: Bearer kh_...`. The aggregate MCP server exposes workflow CRUD, execution, analytics, wallet/integration, protocol, and notification tools.

The authorized session connector was created for the KeeperHub endpoint and verified with a read-only `list_projects` call; the organization currently returned an empty project list. The KeeperHub MCP tool schema for `execute_workflow` requires `workflowId` and accepts optional `input` and `idempotency_key`. The MCP tool execution response only acknowledges that a workflow was triggered; `get_execution` is required to determine the final result and on-chain receipt status.

The KGB server should use the official MCP endpoint with the server-side `KEEPERHUB_API_KEY` secret. It must not use the unavailable legacy `https://api.keeperhub.com` host, must not fabricate successful transaction hashes when the service is unavailable, and must keep protected execution behind authenticated tRPC procedures.

References:
[1]: https://docs.keeperhub.com/agent/mcp-server
