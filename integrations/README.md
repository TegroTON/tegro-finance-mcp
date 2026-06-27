# Tegro Finance — AI integrations

One read-only API (`https://api.tegro.finance`), every AI surface:

| File | For |
|---|---|
| [`llms.txt`](./llms.txt) | the `llms.txt` convention — point any AI/agent at it |
| [`ai-agent-guide.md`](./ai-agent-guide.md) | agent-ready spec: endpoints, fields, examples |
| [`openapi.read-only.json`](./openapi.read-only.json) | curated read-only OpenAPI (pools/tokens/quotes/staking) |
| [`chatgpt-gpt.md`](./chatgpt-gpt.md) | build a ChatGPT custom GPT (GPT Store) in 5 min |
| [`hermes-tools.json`](./hermes-tools.json) | OpenAI function-calling tools for Hermes & similar agents |

For **Claude / Cursor / MCP** clients, use the MCP server in this repo
(`@tegroton/tegro-finance-mcp`) — it covers the same surface.

All of it is **read-only**: pools, prices, swap quotes, staking rates. No keys,
no signing, no funds.
