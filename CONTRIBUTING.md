# Contributing

Thanks for helping improve the Tegro Finance DEX MCP server.

## Development

```bash
npm install
npm run build      # tsc → dist/
npm test           # vitest
npm run typecheck
node dist/index.js # run the stdio server
```

Try it against a real MCP client by pointing it at `node /abs/path/dist/index.js`.

## Ground rules

- **Read-only & non-custodial.** This server reads public DEX data only. Do not
  add tools that build, sign, send, withdraw, or otherwise move funds — those
  belong in the SDK + a user's wallet, never in this server.
- **No secrets.** Nothing here needs an API key. Never commit `.env`, tokens, or
  credentials.
- **Verify against the live API.** New or changed tools should be checked against
  `https://api.tegro.finance` and covered by a test (mock `fetch`).
- **Keep it typed and tested.** `npm run typecheck` and `npm test` must pass; CI
  runs them on Node 18/20/22.
- **Money math:** amounts are integer smallest-units (`amount × 10^decimals`).
  Never guess a token's decimals — resolve them.

## Pull requests

1. Branch from `main`.
2. `npm test` + `npm run build` green.
3. Update `README.md` / `CHANGELOG.md` for any user-facing change.
4. Fill in the PR checklist.

## Security

Found a vulnerability? Please **don't** open a public issue — use
[private vulnerability reporting](https://github.com/TegroTON/tegro-finance-mcp/security/advisories/new)
(see [SECURITY.md](SECURITY.md)).
