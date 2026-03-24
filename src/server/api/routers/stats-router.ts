import { redis } from "@/lib/redis";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { artists, songArtists, songListingRequests, songs, userActivities } from "@/server/db/schema";
import { and, count, desc, eq, gt, isNotNull, or, sql } from "drizzle-orm";
import { env } from "@/env.js";

async function fetchUpstashCommandsThisMonth(): Promise<number | null> {
  if (!env.UPSTASH_EMAIL || !env.UPSTASH_API_KEY) return null;

  const auth = Buffer.from(`${env.UPSTASH_EMAIL}:${env.UPSTASH_API_KEY}`).toString("base64");
  const headers = { Authorization: `Basic ${auth}` };

  // Get the database ID by listing all databases
  const dbsRes = await fetch("https://api.upstash.com/v2/redis/databases", { headers });
  if (!dbsRes.ok) return null;
  const dbs = (await dbsRes.json()) as Array<{ database_id: string; endpoint: string }>;

  // Match by endpoint host prefix (e.g. "rational-hippo-81373")
  const restHost = new URL(env.UPSTASH_REDIS_REST_URL).hostname;
  const db = dbs.find((d) => d.endpoint === restHost) ?? dbs[0];
  if (!db) return null;

  const statsRes = await fetch(`https://api.upstash.com/v2/redis/stats/${db.database_id}`, { headers });
  if (!statsRes.ok) return null;
  const stats = (await statsRes.json()) as { dailyrequests?: Array<{ x: string; y: number }> };

  if (!stats.dailyrequests) return null;

  // Sum commands for the current calendar month
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return stats.dailyrequests
    .filter((d) => d.x.startsWith(monthPrefix))
    .reduce((sum, d) => sum + (d.y ?? 0), 0);
}

async function fetchResendEmailsThisMonth(): Promise<number | null> {
  // Resend API key is the same credential used for SMTP auth
  const apiKey = env.EMAIL_SERVER_PASSWORD;
  if (!apiKey?.startsWith("re_")) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch up to 100 emails (newest first); enough for a low-volume transactional sender
  const res = await fetch("https://api.resend.com/emails?limit=100", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { data?: Array<{ created_at: string }> };
  if (!data.data) return null;

  return data.data.filter((e) => new Date(e.created_at) >= startOfMonth).length;
}

async function fetchVercelBandwidthGb(): Promise<number | null> {
  if (!env.VERCEL_API_TOKEN) return null;

  const res = await fetch("https://api.vercel.com/v2/usage", {
    headers: { Authorization: `Bearer ${env.VERCEL_API_TOKEN}` },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { bandwidth?: { used?: number } };
  const bytes = data.bandwidth?.used;
  if (bytes == null) return null;

  return Math.round((bytes / 1_073_741_824) * 100) / 100; // bytes → GB, 2 decimal places
}

export const statsRouter = createTRPCRouter({
  getStats: publicProcedure.query(async ({ ctx }) => {
    const [totalSearches, dbCacheHits, externalFetches, rateLimited, storeUnreachable, noMatch, trpcRateLimited, byVendor] = await Promise.all([
      // Total song searches
      ctx.db
        .select({ count: count() })
        .from(userActivities)
        .where(eq(userActivities.type, "search"))
        .then((r) => r[0]?.count ?? 0),

      // DB cache hits
      ctx.db
        .select({ count: count() })
        .from(songListingRequests)
        .where(eq(songListingRequests.source, "db_cache"))
        .then((r) => r[0]?.count ?? 0),

      // External API fetches
      ctx.db
        .select({ count: count() })
        .from(songListingRequests)
        .where(eq(songListingRequests.source, "external"))
        .then((r) => r[0]?.count ?? 0),

      // Rate limit rejections
      ctx.db
        .select({ count: count() })
        .from(songListingRequests)
        .where(eq(songListingRequests.source, "rate_limited"))
        .then((r) => r[0]?.count ?? 0),

      // Store unreachable errors
      ctx.db
        .select({ count: count() })
        .from(songListingRequests)
        .where(eq(songListingRequests.source, "store_unreachable"))
        .then((r) => r[0]?.count ?? 0),

      // Genuine no-match results (vendor found nothing)
      ctx.db
        .select({ count: count() })
        .from(songListingRequests)
        .where(eq(songListingRequests.source, "no_match"))
        .then((r) => r[0]?.count ?? 0),

      // tRPC-level rate limit rejections (stored in Redis)
      redis.get<number>("stats:trpc:rate_limited").then((v) => v ?? 0),

      // Breakdown by vendor and source
      ctx.db
        .select({ vendor: songListingRequests.vendor, source: songListingRequests.source, count: count() })
        .from(songListingRequests)
        .groupBy(songListingRequests.vendor, songListingRequests.source),
    ]);

    return { totalSearches, dbCacheHits, externalFetches, rateLimited, storeUnreachable, noMatch, trpcRateLimited, byVendor };
  }),

  getInsights: publicProcedure.query(async ({ ctx }) => {
    const [topArtists, topRegions, vendorLatency] = await Promise.all([
      // Top 10 most-searched artists
      ctx.db
        .select({ name: artists.name, searches: count() })
        .from(userActivities)
        .innerJoin(songs, eq(userActivities.songId, songs.id))
        .innerJoin(songArtists, eq(songs.id, songArtists.songId))
        .innerJoin(artists, eq(songArtists.artistId, artists.id))
        .where(eq(userActivities.type, "search"))
        .groupBy(artists.id, artists.name)
        .orderBy(desc(count()))
        .limit(10),

      // Top 10 regions by search count
      ctx.db
        .select({ region: userActivities.region, searches: count() })
        .from(userActivities)
        .where(eq(userActivities.type, "search"))
        .groupBy(userActivities.region)
        .orderBy(desc(count()))
        .limit(10),

      // Average fetch duration per vendor (external fetches only)
      ctx.db
        .select({
          vendor: songListingRequests.vendor,
          avgMs: sql<number>`round(avg(${songListingRequests.fetchDurationMs}))`,
        })
        .from(songListingRequests)
        .where(and(eq(songListingRequests.source, "external"), isNotNull(songListingRequests.fetchDurationMs)))
        .groupBy(songListingRequests.vendor),
    ]);

    return { topArtists, topRegions, vendorLatency };
  }),

  getScraperHealth: publicProcedure.query(async ({ ctx }) => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [unreachable24h, p95Latency, lastFailure, attempts24h] = await Promise.all([
      // Unreachable count per vendor in the last 24 hours
      ctx.db
        .select({ vendor: songListingRequests.vendor, count: count() })
        .from(songListingRequests)
        .where(and(eq(songListingRequests.source, "store_unreachable"), gt(songListingRequests.createdAt, yesterday)))
        .groupBy(songListingRequests.vendor),

      // P95 fetch duration per vendor (external fetches only)
      ctx.db
        .select({
          vendor: songListingRequests.vendor,
          p95Ms: sql<number | null>`round(percentile_cont(0.95) within group (order by ${songListingRequests.fetchDurationMs}))`,
        })
        .from(songListingRequests)
        .where(and(eq(songListingRequests.source, "external"), isNotNull(songListingRequests.fetchDurationMs)))
        .groupBy(songListingRequests.vendor),

      // Most recent store_unreachable event per vendor
      ctx.db
        .select({
          vendor: songListingRequests.vendor,
          lastAt: sql<Date | null>`max(${songListingRequests.createdAt})`,
        })
        .from(songListingRequests)
        .where(eq(songListingRequests.source, "store_unreachable"))
        .groupBy(songListingRequests.vendor),

      // No-match and successful external fetches in last 24h (proxy for bot detection / structure changes)
      ctx.db
        .select({ vendor: songListingRequests.vendor, source: songListingRequests.source, count: count() })
        .from(songListingRequests)
        .where(and(
          or(eq(songListingRequests.source, "no_match"), eq(songListingRequests.source, "external")),
          gt(songListingRequests.createdAt, yesterday),
        ))
        .groupBy(songListingRequests.vendor, songListingRequests.source),
    ]);

    return { unreachable24h, p95Latency, lastFailure, attempts24h };
  }),

  getServiceUsage: publicProcedure.query(async () => {
    const [upstashCommandsThisMonth, vercelBandwidthUsedGb, resendEmailsThisMonth] = await Promise.all([
      fetchUpstashCommandsThisMonth(),
      fetchVercelBandwidthGb(),
      fetchResendEmailsThisMonth(),
    ]);
    return { upstashCommandsThisMonth, vercelBandwidthUsedGb, resendEmailsThisMonth };
  }),
});
