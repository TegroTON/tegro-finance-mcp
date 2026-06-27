# MCP registry submissions (discovery channel)

Do these **after** `@tegroton/tegro-finance-mcp` is live on npm (so `npx` works).
The public repo + npm package + MCP topics are the prerequisites — most
registries index from there.

Ready-to-paste entry:

> **Tegro Finance** — read-only MCP for the Tegro Finance DEX on TON: pools,
> token prices, swap quotes and stgTON liquid-staking. No keys, non-custodial.
> `npx -y @tegroton/tegro-finance-mcp` · https://github.com/TegroTON/tegro-finance-mcp

## Registries

| Registry | How |
|---|---|
| **mcp.so** | Submit at https://mcp.so/submit with the repo URL (auto-pulls README). |
| **Smithery** | https://smithery.ai → "Add server" → connect the GitHub repo (stdio, command `npx -y @tegroton/tegro-finance-mcp`, no config). |
| **PulseMCP** | https://www.pulsemcp.com/submit — repo URL + the entry above. |
| **Glama** | https://glama.ai/mcp/servers — sign in with GitHub, it indexes public MCP repos automatically; claim/submit the repo. |
| **awesome-mcp-servers** | PR to https://github.com/punkpeye/awesome-mcp-servers — add under **Finance / Fintech**:<br>`- [TegroTON/tegro-finance-mcp](https://github.com/TegroTON/tegro-finance-mcp) 📇 ☁️ - Read-only access to the Tegro Finance DEX on TON: pools, prices, swap quotes & stgTON staking.` |
| **MCP Hub / others** | reuse the entry above. |

## Also list

- The **ChatGPT custom GPT** (after publishing) in the GPT Store and link it from the repo README.
- `llms.txt` is already served at https://tegro.finance/llms.txt for agent discovery.
