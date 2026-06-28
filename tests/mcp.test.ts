import { describe, it, expect, vi } from "vitest";
import { TegroFinanceClient, TegroFinanceStakingClient, TON_NATIVE_ADDRESS } from "@tegroton/tegro-finance";
import { USER_AGENT, withUserAgent } from "../src/http.js";
import { resolveDecimals } from "../src/index.js";

function mockFetch(handler: (url: string, init: RequestInit) => { status?: number; body: unknown }) {
  return vi.fn(async (url: URL | RequestInfo, init?: RequestInit) => {
    const { status = 200, body } = handler(String(url), init ?? {});
    return new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as unknown as typeof fetch;
}

describe("withUserAgent", () => {
  it("adds our User-Agent to every request", async () => {
    let seen: string | null = null;
    const base = mockFetch((_url, init) => {
      seen = new Headers(init.headers).get("User-Agent");
      return { body: { ok: true } };
    });
    await withUserAgent(base)("https://api.tegro.finance/x");
    expect(seen).toBe(USER_AGENT);
  });

  it("does not override a caller-supplied User-Agent", async () => {
    let seen: string | null = null;
    const base = mockFetch((_url, init) => {
      seen = new Headers(init.headers).get("User-Agent");
      return { body: {} };
    });
    await withUserAgent(base)("https://api.tegro.finance/x", { headers: { "User-Agent": "custom/1" } });
    expect(seen).toBe("custom/1");
  });

  it("preserves other headers and method", async () => {
    let method = "";
    let ct: string | null = null;
    const base = mockFetch((_url, init) => {
      method = (init.method as string) ?? "GET";
      ct = new Headers(init.headers).get("Content-Type");
      return { body: {} };
    });
    await withUserAgent(base)("https://api.tegro.finance/x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    expect(method).toBe("POST");
    expect(ct).toBe("application/json");
  });
});

describe("SDK clients carry the User-Agent (the calls the MCP makes)", () => {
  it("DEX getPools hits /api/v1/pools with our UA", async () => {
    let url = "";
    let ua: string | null = null;
    const fetchUA = withUserAgent(
      mockFetch((u, init) => {
        url = u;
        ua = new Headers(init.headers).get("User-Agent");
        return { body: [{ address: "EQpool", router_address: "EQrouter" }] };
      }),
    );
    const dex = new TegroFinanceClient({ fetch: fetchUA });
    const pools = await dex.getPools();
    expect(url).toBe("https://api.tegro.finance/api/v1/pools");
    expect(ua).toBe(USER_AGENT);
    expect(pools[0].address).toBe("EQpool");
  });

  it("staking getPools hits the liquid-staking endpoint with our UA", async () => {
    let url = "";
    let ua: string | null = null;
    const fetchUA = withUserAgent(
      mockFetch((u, init) => {
        url = u;
        ua = new Headers(init.headers).get("User-Agent");
        return { body: [{ address: "EQstg", apy: 16.97, is_active: true }] };
      }),
    );
    const staking = new TegroFinanceStakingClient({ fetch: fetchUA });
    await staking.getPools();
    expect(url).toBe("https://tegro.finance/api/v1/liquid-staking/pools");
    expect(ua).toBe(USER_AGENT);
  });
});

describe("resolveDecimals (swap-quote scaling — the footgun)", () => {
  const USDT = "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs";
  // Minimal client stub — only getAssets is used.
  const client = (assets: Record<string, { decimals: number }>) =>
    ({ getAssets: async () => assets }) as unknown as TegroFinanceClient;

  it("uses an explicit value without touching the registry", async () => {
    const c = { getAssets: vi.fn() } as unknown as TegroFinanceClient;
    expect(await resolveDecimals(c, USDT, 6)).toBe(6);
    expect((c.getAssets as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it("returns 9 for TON without a registry call", async () => {
    const c = { getAssets: vi.fn() } as unknown as TegroFinanceClient;
    expect(await resolveDecimals(c, TON_NATIVE_ADDRESS)).toBe(9);
    expect((c.getAssets as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it("resolves a non-TON jetton's decimals from the registry (6, not 9)", async () => {
    const c = client({ [USDT]: { decimals: 6 } });
    expect(await resolveDecimals(c, USDT)).toBe(6);
  });

  it("throws a clear error for an unknown token instead of guessing", async () => {
    const c = client({});
    await expect(resolveDecimals(c, USDT)).rejects.toThrow(/decimals/i);
  });
});
