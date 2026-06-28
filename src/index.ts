#!/usr/bin/env node
// Tegro Finance DEX MCP server (stdio). Gives an AI assistant a READ-ONLY view
// of the Tegro Finance decentralized exchange on TON: pools, token market data,
// swap quotes, and liquid-staking (stgTON) rates.
//
// Fully public and non-custodial: no API keys, no wallet, no signing, nothing
// that moves funds. It only reads the public Tegro Finance API (via the
// @tegroton/tegro-finance SDK). Nothing to configure — just run it.

import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  TegroFinanceClient,
  TegroFinanceStakingClient,
  toUnits,
  TON_NATIVE_ADDRESS,
} from "@tegroton/tegro-finance";
import { withUserAgent } from "./http.js";

/** Marks every tool read-only for MCP clients that surface tool safety. */
const READONLY = { readOnlyHint: true, openWorldHint: true } as const;

// Identify every API call (Cloudflare-friendly — see http.ts).
const fetchUA = withUserAgent();
const dex = new TegroFinanceClient({ fetch: fetchUA });
const staking = new TegroFinanceStakingClient({ fetch: fetchUA });

const server = new McpServer({ name: "tegro-finance", version: "0.1.0" });

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

async function run(fn: () => unknown | Promise<unknown>): Promise<ToolResult> {
  try {
    const out = await fn();
    return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
}

/**
 * Decimals for the offer token — explicit wins; TON is 9; otherwise resolved
 * from the on-chain registry. A wrong default here silently mis-scales quotes
 * (e.g. a 6-decimal USDT), so we never guess for non-TON jettons. Exported and
 * client-injected for testability.
 */
export async function resolveDecimals(
  client: Pick<TegroFinanceClient, "getAssets">,
  offer: string,
  provided?: number,
): Promise<number> {
  if (provided !== undefined) return provided;
  if (offer === TON_NATIVE_ADDRESS) return 9;
  const assets = await client.getAssets();
  const dec = assets[offer]?.decimals;
  if (typeof dec === "number") return dec;
  throw new Error(
    `Unknown decimals for ${offer} — pass "decimals" explicitly (find it with tegro_dex_assets).`,
  );
}

server.registerTool(
  "tegro_dex_pools",
  {
    title: "List Tegro Finance DEX pools",
    description:
      "All liquidity pools with reserves, fees, LP supply, USD TVL and APYs. The TON sentinel address is " +
      TON_NATIVE_ADDRESS +
      ".",
    annotations: READONLY,
    inputSchema: {},
  },
  async () => run(() => dex.getPools()),
);

server.registerTool(
  "tegro_dex_pools_for_token",
  {
    title: "Pools for a token",
    description: "Liquidity pools that contain the given token (by jetton master address).",
    annotations: READONLY,
    inputSchema: { tokenAddress: z.string().describe("Jetton master address (EQ…/UQ…)") },
  },
  async (a) => run(() => dex.getPoolsForToken(a.tokenAddress)),
);

server.registerTool(
  "tegro_dex_assets",
  {
    title: "Tegro Finance token registry",
    description: "The list of tradable tokens (symbol, decimals, contract address, flags).",
    annotations: READONLY,
    inputSchema: {},
  },
  async () => run(() => dex.getAssetList()),
);

server.registerTool(
  "tegro_dex_token",
  {
    title: "Token market data",
    description: "Price, holders, liquidity, market cap and trust score for one token.",
    annotations: READONLY,
    inputSchema: { address: z.string().describe("Jetton master address") },
  },
  async (a) => run(() => dex.getTokenData(a.address)),
);

server.registerTool(
  "tegro_dex_quote_swap",
  {
    title: "Quote a swap (read-only)",
    description:
      "Simulate an exact-in swap: how much of the ask token you'd receive for a given amount of the offer token. No transaction is built or signed.",
    annotations: READONLY,
    inputSchema: {
      offerAddress: z.string().describe(`Token you give (use ${TON_NATIVE_ADDRESS} for TON)`),
      askAddress: z.string().describe("Token you want"),
      amount: z.union([z.number(), z.string()]).describe("Human amount of the offer token, e.g. 1.5"),
      decimals: z
        .number()
        .int()
        .min(0)
        .max(30)
        .optional()
        .describe("Offer token decimals — auto-resolved (TON=9, else from the registry) if omitted"),
      slippage: z.number().min(0).max(0.5).optional().describe("Slippage tolerance, e.g. 0.01 = 1% (default 0.01)"),
    },
  },
  async (a) =>
    run(async () => {
      const decimals = await resolveDecimals(dex, a.offerAddress, a.decimals);
      const slippage = a.slippage ?? 0.01;
      const units = toUnits(a.amount, decimals);
      if (units <= 0n) throw new Error("amount must be greater than 0");
      const sim = await dex.simulateSwap({
        offerAddress: a.offerAddress,
        askAddress: a.askAddress,
        units,
        slippageTolerance: slippage,
      });
      // `sim.min_ask_units` is the backend's slippage floor — return it as-is
      // (no client-side recompute, no precision loss).
      return { ...sim, offer_decimals_used: decimals };
    }),
);

server.registerTool(
  "tegro_staking_pools",
  {
    title: "Liquid staking pools",
    description: "Tegro liquid-staking pools (stgTON and others): APY, min stake, active flag.",
    annotations: READONLY,
    inputSchema: {},
  },
  async () => run(() => staking.getPools()),
);

server.registerTool(
  "tegro_staking_rate",
  {
    title: "Liquid staking rate",
    description:
      "Live rate for a staking pool — `price` is the stgTON→TON rate (1e9 fixed point) and only appreciates.",
    annotations: READONLY,
    inputSchema: {
      masterAddress: z
        .string()
        .describe("Staking master, e.g. stgTON EQC-DUl20SfQFVH34cky8N76la1K0Uu5UWjel5IEn7mjIrfc"),
    },
  },
  async (a) => run(() => staking.getPoolData(a.masterAddress)),
);

// Connect stdio only when run as the binary — importing this module (tests)
// must not start a server.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("tegro-finance DEX MCP server running (stdio)");
}
