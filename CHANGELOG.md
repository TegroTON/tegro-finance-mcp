# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-06-28

First release.

### Added

- Read-only MCP server for the Tegro Finance DEX on TON, built on the
  `@tegroton/tegro-finance` SDK. Tools: `tegro_dex_pools`,
  `tegro_dex_pools_for_token`, `tegro_dex_assets`, `tegro_dex_token`,
  `tegro_dex_quote_swap`, `tegro_staking_pools`, `tegro_staking_rate`.
- Every tool is annotated `readOnlyHint` and the server holds no keys, signs
  nothing, and exposes no payout/withdraw/write surface.
- Swap quotes resolve the offer token's decimals (explicit → TON=9 → on-chain
  registry → clear error), reject non-positive amounts, and return the backend's
  own `min_ask_units` slippage floor.
- Requests carry a clear `User-Agent` for identifiability and Cloudflare
  resilience.
- AI integrations under [`integrations/`](integrations/): `llms.txt` (served at
  https://tegro.finance/llms.txt), an agent guide, a curated read-only OpenAPI,
  a ChatGPT custom-GPT recipe, and Hermes/function-calling tools.
- Tests (vitest), CI on Node 18/20/22, and publish-on-tag with npm provenance.

[0.1.0]: https://github.com/TegroTON/tegro-finance-mcp/releases/tag/v0.1.0
