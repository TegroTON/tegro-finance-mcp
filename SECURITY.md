# Security Policy

This MCP server is **read-only and non-custodial**: it reads the public Tegro
Finance DEX API via the `@tegroton/tegro-finance` SDK. It holds no keys, signs
nothing, and cannot move funds. There is no payout, swap-execution, or wallet
surface by design.

## Reporting

Please do not open public issues for security problems. Use GitHub Private
Vulnerability Reporting on this repository, or contact the TegroTON org.

## Out of scope

- The Tegro Finance backend / smart contracts — report through https://tegro.finance.
- A wallet's TON Connect implementation — report to the wallet vendor.
