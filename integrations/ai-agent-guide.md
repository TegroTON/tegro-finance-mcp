# Tegro Finance DEX — AI agent guide

Drop this file into any AI assistant (Claude, ChatGPT, Cursor, Hermes…) to give
it the **read-only** surface of the Tegro Finance DEX on TON: pools, token
prices, swap quotes, and liquid-staking rates. No keys, no signing, no funds.

- **Base URL:** `https://api.tegro.finance`
- **Auth:** none for any endpoint below.
- **OpenAPI (read-only):** [`openapi.read-only.json`](./openapi.read-only.json) · full spec at `https://api.tegro.finance/openapi.json`.
- **Native coin:** GRAM (ticker GRAM; renamed from Toncoin/TON 2026-06-15, 1:1). Network is still TON. The TON sentinel address used in place of a jetton master is `EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c`.

## Read endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/api/v1/pools` | all pools — reserves, `lp_fee`/`protocol_fee` (hundredths of a %), `lp_total_supply_usd` (TVL), `apy_1d/7d/30d` |
| GET | `/api/v1/pools/{token_address}` | pools containing a token |
| GET | `/api/v1/pools-pairs` | thin token0/token1 routing pairs |
| GET | `/api/v1/assets` | token registry (symbol, decimals, contract address) |
| GET | `/api/v1/tokens/{address}/data` | price_usd, holders, liquidity_usd, mcap, trust_score |
| POST | `/api/v1/swap/simulate` | exact-in swap quote |
| POST | `/api/v1/reverse_swap/simulate` | exact-out swap quote |
| GET | `/api/v1/liquid-staking/pools` | liquid-staking pools — `apy` (percent), `min_offer_amount`, `is_active` |
| GET | `/api/v1/liquid-staking/pool/{address}/data` | live `price` (stgTON→TON rate, 1e9 fixed-point) |
| GET | `/api/v1/staking/info` | TGR staking summary |

## Examples

Top pools by TVL:
```bash
curl -s https://api.tegro.finance/api/v1/pools | jq 'sort_by(-.lp_total_supply_usd)[:5] | .[] | {pool: .address, tvl: .lp_total_supply_usd, apy: .apy_7d}'
```

Quote 100 TON → a token (amounts are smallest units; TON has 9 decimals → 100 TON = 100000000000):
```bash
curl -s -X POST https://api.tegro.finance/api/v1/swap/simulate \
  -H 'Content-Type: application/json' \
  -d '{"offer_address":"EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c","ask_address":"<jetton>","units":100000000000,"slippage_tolerance":0.01}'
```

Live stgTON staking rate:
```bash
curl -s https://api.tegro.finance/api/v1/liquid-staking/pool/EQC-DUl20SfQFVH34cky8N76la1K0Uu5UWjel5IEn7mjIrfc/data
# { "price": 1001005223, ... }  → price/1e9 TON per stgTON, only appreciates
```

## Conventions

- **Units** are integers in the token's smallest denomination (`amount × 10^decimals`).
- **Fees** (`lp_fee`, `protocol_fee`, `ref_fee`) are hundredths of a percent — `20` = 0.20%.
- **Liquid-staking `apy`** is a percent number (`16.97` = 16.97%), not a fraction.
- **`price`** from a liquid-staking pool is the stgTON→TON rate in 1e9 fixed point.

## Building transactions (out of scope here)

Swaps, liquidity and staking are non-custodial — the user's wallet signs. Use the
[`@tegroton/tegro-finance`](https://www.npmjs.com/package/@tegroton/tegro-finance)
SDK's build methods + TON Connect, or the full API. Reading/quoting needs no wallet.

## Easiest integration

- **Claude / Cursor / ChatGPT (MCP):** [`@tegroton/tegro-finance-mcp`](https://github.com/TegroTON/tegro-finance-mcp)
- **Code:** [`@tegroton/tegro-finance`](https://github.com/TegroTON/tegro-finance-sdk) SDK
- **ChatGPT custom GPT:** see [`chatgpt-gpt.md`](./chatgpt-gpt.md)
- **Hermes / function-calling agents:** see [`hermes-tools.json`](./hermes-tools.json)
