import { db } from "@/server/db";
import { songListingRequests } from "@/server/db/schema";
import { env } from "@/env.js";
import { redis } from "@/lib/redis";
import { sendTelegram } from "@/lib/telegram";
import { and, count, eq, gt, or } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

// ── Thresholds ────────────────────────────────────────────────────────────────
const NO_MATCH_RATE_THRESHOLD = 0.75;
const NO_MATCH_MIN_ATTEMPTS = 5;
const TRPC_RL_SPIKE_THRESHOLD = 50;       // blocked requests in a 1h window
const UPSTASH_DAILY_WARN_THRESHOLD = 8000; // 80% of 10k/day free limit
const TRENDING_STALE_MS = 30 * 60 * 1000; // 30 minutes

// ── Suppress durations ────────────────────────────────────────────────────────
const SUPPRESS_NO_MATCH_S = 4 * 60 * 60;  // 4 hours
const SUPPRESS_TRPC_RL_S  = 4 * 60 * 60;  // 4 hours
const SUPPRESS_UPSTASH_S  = 20 * 60 * 60; // 20 hours (once per day is enough)
const SUPPRESS_TRENDING_S = 4 * 60 * 60;  // 4 hours

// ── Checks ────────────────────────────────────────────────────────────────────

async function checkNoMatchSpike(): Promise<string[]> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const attempts = await db
    .select({ vendor: songListingRequests.vendor, source: songListingRequests.source, count: count() })
    .from(songListingRequests)
    .where(and(
      or(eq(songListingRequests.source, "no_match"), eq(songListingRequests.source, "external")),
      gt(songListingRequests.createdAt, oneHourAgo),
    ))
    .groupBy(songListingRequests.vendor, songListingRequests.source);

  const vendors = new Set(attempts.map((r) => r.vendor));
  const alerts: string[] = [];

  for (const vendor of vendors) {
    const noMatch = attempts.find((r) => r.vendor === vendor && r.source === "no_match")?.count ?? 0;
    const success = attempts.find((r) => r.vendor === vendor && r.source === "external")?.count ?? 0;
    const total = noMatch + success;
    const rate = total > 0 ? noMatch / total : 0;

    if (total < NO_MATCH_MIN_ATTEMPTS || rate < NO_MATCH_RATE_THRESHOLD) continue;

    const suppressKey = `alert:scraper:nomatch:${vendor}:last_sent`;
    if (await redis.get(suppressKey)) continue;

    alerts.push(
      `<b>⚠️ ${vendor.toUpperCase()} no-match spike</b>\n` +
      `${Math.round(rate * 100)}% no-match rate in the last hour (${noMatch}/${total}).\n` +
      `Scraper may be broken or getting blocked.`,
    );
    await redis.set(suppressKey, "1", { ex: SUPPRESS_NO_MATCH_S });
  }

  return alerts;
}

async function checkTrpcRateLimitSpike(): Promise<string | null> {
  const count = await redis.get<number>("stats:trpc:rl:window");
  if (!count || count < TRPC_RL_SPIKE_THRESHOLD) return null;

  const suppressKey = "alert:trpc:rl:last_sent";
  if (await redis.get(suppressKey)) return null;

  await redis.set(suppressKey, "1", { ex: SUPPRESS_TRPC_RL_S });
  return (
    `<b>⚠️ tRPC rate limit spike</b>\n` +
    `${count} requests blocked in the last hour.\n` +
    `Possible abuse or a client-side request loop.`
  );
}

async function checkTrendingStaleness(): Promise<string | null> {
  const raw = await redis.get<string>("trending:last_refreshed");
  const lastRefreshed = raw ? parseInt(raw, 10) : null;

  if (lastRefreshed && Date.now() - lastRefreshed < TRENDING_STALE_MS) return null;

  const suppressKey = "alert:trending:stale:last_sent";
  if (await redis.get(suppressKey)) return null;

  const age = lastRefreshed
    ? `${Math.round((Date.now() - lastRefreshed) / 60_000)} minutes ago`
    : "never (or Redis key missing)";

  await redis.set(suppressKey, "1", { ex: SUPPRESS_TRENDING_S });
  return (
    `<b>⚠️ Trending views stale</b>\n` +
    `Last refresh: ${age}.\n` +
    `The refresh-trending cron may have stopped running.`
  );
}

async function checkUpstashQuota(): Promise<string | null> {
  if (!env.UPSTASH_EMAIL || !env.UPSTASH_API_KEY) return null;

  const auth = Buffer.from(`${env.UPSTASH_EMAIL}:${env.UPSTASH_API_KEY}`).toString("base64");
  const headers = { Authorization: `Basic ${auth}` };

  const dbsRes = await fetch("https://api.upstash.com/v2/redis/databases", { headers });
  if (!dbsRes.ok) return null;
  const dbs = (await dbsRes.json()) as Array<{ database_id: string; endpoint: string }>;

  const restHost = new URL(env.UPSTASH_REDIS_REST_URL).hostname;
  const upstashDb = dbs.find((d) => d.endpoint === restHost) ?? dbs[0];
  if (!upstashDb) return null;

  const statsRes = await fetch(`https://api.upstash.com/v2/redis/stats/${upstashDb.database_id}`, { headers });
  if (!statsRes.ok) return null;
  const stats = (await statsRes.json()) as { dailyrequests?: Array<{ x: string; y: number }> };

  // Use second-to-last entry — last entry may be today (partial)
  const yesterday = stats.dailyrequests?.slice(-2, -1)[0];
  if (!yesterday || yesterday.y < UPSTASH_DAILY_WARN_THRESHOLD) return null;

  const suppressKey = "alert:upstash:quota:last_sent";
  if (await redis.get(suppressKey)) return null;

  await redis.set(suppressKey, "1", { ex: SUPPRESS_UPSTASH_S });
  return (
    `<b>⚠️ Upstash quota warning</b>\n` +
    `${yesterday.y.toLocaleString()} commands used on ${yesterday.x} (free limit: 10,000/day).\n` +
    `Consider upgrading to avoid hitting the ceiling.`
  );
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.authorization !== `Bearer ${env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const [noMatchAlerts, trpcAlert, trendingAlert, upstashAlert] = await Promise.all([
    checkNoMatchSpike(),
    checkTrpcRateLimitSpike(),
    checkTrendingStaleness(),
    checkUpstashQuota(),
  ]);

  const alerts = [
    ...noMatchAlerts,
    trpcAlert,
    trendingAlert,
    upstashAlert,
  ].filter((a): a is string => a !== null);

  if (alerts.length > 0) {
    await sendTelegram(`<b>TuneHunter alert</b>\n\n${alerts.join("\n\n")}`);
  }

  res.status(200).json({ alerted: alerts.length, at: new Date().toISOString() });
}
