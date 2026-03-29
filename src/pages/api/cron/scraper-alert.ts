import { db } from "@/server/db";
import { songListingRequests } from "@/server/db/schema";
import { env } from "@/env.js";
import { redis } from "@/lib/redis";
import { sendTelegram } from "@/lib/telegram";
import { and, count, eq, gt, or } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

// Scraper structure changes / bot detection show up as no-match spikes.
// Checked hourly; store_unreachable failures are handled inline in the router.
const NO_MATCH_RATE_THRESHOLD = 0.75;
const NO_MATCH_MIN_ATTEMPTS = 5;
// Suppress repeat no-match alerts for the same vendor for 4 hours
const SUPPRESS_SECONDS = 4 * 60 * 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.authorization !== `Bearer ${env.CRON_SECRET}`) {
    return res.status(401).end();
  }

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
    const noMatchRate = total > 0 ? noMatch / total : 0;

    if (total < NO_MATCH_MIN_ATTEMPTS || noMatchRate < NO_MATCH_RATE_THRESHOLD) continue;

    const suppressKey = `alert:scraper:nomatch:${vendor}:last_sent`;
    const alreadySent = await redis.get(suppressKey);
    if (alreadySent) continue;

    alerts.push(
      `<b>⚠️ ${vendor.toUpperCase()} no-match spike</b>\n` +
      `${Math.round(noMatchRate * 100)}% no-match rate in the last hour (${noMatch}/${total} attempts).\n` +
      `Scraper may be broken or getting blocked.`,
    );

    await redis.set(suppressKey, "1", { ex: SUPPRESS_SECONDS });
  }

  if (alerts.length > 0) {
    await sendTelegram(`<b>TuneHunter scraper alert</b>\n\n${alerts.join("\n\n")}`);
  }

  res.status(200).json({ checked: vendors.size, alerted: alerts.length, at: new Date().toISOString() });
}
