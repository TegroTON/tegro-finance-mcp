// A fetch that identifies itself. The Tegro Finance API sits behind Cloudflare;
// a clear User-Agent keeps the MCP recognizable in our own logs, lets us
// allowlist/rate-limit it distinctly, and survives a future bot-fight rule
// (Cloudflare error 1010) that would otherwise block a signature-less client.
//
// Node (undici) allows setting User-Agent — unlike browsers, where it's a
// forbidden header — so this is safe in the MCP's runtime.

export const USER_AGENT =
  "@tegroton/tegro-finance-mcp/0.1.0 (+https://github.com/TegroTON/tegro-finance-mcp)";

/** Wrap a fetch so every request carries our User-Agent (caller headers win). */
export function withUserAgent(base: typeof fetch = fetch): typeof fetch {
  return ((input: Parameters<typeof fetch>[0], init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    if (!headers.has("User-Agent")) headers.set("User-Agent", USER_AGENT);
    return base(input, { ...init, headers });
  }) as typeof fetch;
}
