import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { vendorRateLimiters } from "@/lib/rate-limiter";
import { redis } from "@/lib/redis";
import { sendTelegram } from "@/lib/telegram";
import { songListingMisses, songListingRequests, songListings } from "@/server/db/schema";
import { fetchVendorData } from "@/services/vendors";
import { SongListingSchema } from "../schemas/song-listings-schemas";

const LISTING_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 *
 * Quality
 * - iTunes usually 256kbps AAC, sometimes 320kbps
 * - Beatport
 * - Amazon Music usually 256kbps MP3, sometimes 320kbps
 * - Bandcamp usually FLAC or MP3, quality varies
 *
 */

export const songListingsRouter = createTRPCRouter({
  getSongListing: publicProcedure.input(SongListingSchema).query(async ({ ctx, input }) => {
    // Validate input
    const validatedFields = SongListingSchema.safeParse(input);
    if (!validatedFields.success) return { error: "INVALID_FIELDS" };
    const { vendor, songId, region, duration, title, artist } = input;

    // Round 1: vendor lookup + song fetch in parallel (both only need input fields)
    const [vendorMetaData, songRecord] = await Promise.all([
      ctx.db.query.songVendors.findFirst({ where: (data, { eq }) => eq(data.name, vendor) }),
      ctx.db.query.songs.findFirst({ where: (data, { eq }) => eq(data.id, songId) }),
    ]);
    if (!vendorMetaData?.id) return { error: "VENDOR_NOT_FOUND" };
    const vendorId = vendorMetaData.id;

    // Round 2: listing cache + miss cache in parallel (both need vendorId)
    const [dbListing, dbMiss] = await Promise.all([
      ctx.db.query.songListings.findFirst({
        where: (data, { eq, and }) =>
          and(eq(data.vendorId, vendorId), eq(data.songId, songId), eq(data.region, region)),
        with: { songVendor: true, song: true },
      }),
      ctx.db.query.songListingMisses.findFirst({
        where: (data, { eq, and }) =>
          and(eq(data.vendorId, vendorId), eq(data.songId, songId), eq(data.region, region)),
      }),
    ]);

    // Helper: fire-and-forget request log — the song may be deleted by the sp_→iTunes
    // enrichment while this query is in-flight, causing a FK violation. Safe to ignore.
    const logRequest = (values: typeof songListingRequests.$inferInsert) => {
      void ctx.db.insert(songListingRequests).values(values).catch(() => undefined);
    };

    // 1. Try DB first
    const isStale = dbListing && Date.now() - dbListing.updatedAt.getTime() > LISTING_TTL_MS;
    if (dbListing && !isStale) {
      logRequest({ songId, vendor, source: "db_cache" });
      return { data: dbListing };
    }

    // Check cached "not found" result
    const isMissStale = dbMiss && Date.now() - dbMiss.checkedAt.getTime() > MISS_TTL_MS;
    if (dbMiss && !isMissStale) {
      logRequest({ songId, vendor, source: "db_cache" });
      return { error: "NO_DATA_FOUND" };
    }

    // 2. Rate limit per user (or IP for unauthenticated requests)
    const identifier = ctx.session?.user?.id ?? ctx.ip;
    const { success } = await vendorRateLimiters[vendor]!.limit(identifier);
    if (!success) {
      logRequest({ songId, vendor, source: "rate_limited" });
      return { error: "RATE_LIMITED" as const };
    }

    // 3. Hit vendor API, store or refresh results
    let vendorListing;
    const fetchStart = Date.now();
    try {
      vendorListing = await fetchVendorData({
        region,
        vendorData: { vendorId, store: vendor },
        songData: { songId, duration, title, artist },
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      logRequest({ songId, vendor, source: "store_unreachable" });

      // Circuit breaker: alert after 3 failures within a 10-minute window
      const circuitKey = `scraper:circuit:${vendor}`;
      const suppressKey = `scraper:circuit:sent:${vendor}`;
      const failures = await redis.incr(circuitKey);
      if (failures === 1) void redis.expire(circuitKey, 600);
      if (failures >= 3) {
        const alreadySent = await redis.get(suppressKey);
        if (!alreadySent) {
          void Promise.all([
            sendTelegram(
              `<b>⚠️ ${vendor.toUpperCase()} scraper down</b>\n` +
              `${failures} unreachable errors in the last 10 minutes.`,
            ),
            redis.set(suppressKey, "1", { ex: 3600 }),
          ]);
        }
      }

      return { error: "STORE_UNREACHABLE" };
    }
    const fetchDurationMs = Date.now() - fetchStart;
    logRequest({ songId, vendor, source: "external", fetchDurationMs });
    if (vendorListing.data) {
      try {
        const [upserted] = await ctx.db
          .insert(songListings)
          .values(vendorListing.data)
          .onConflictDoUpdate({
            target: [songListings.songId, songListings.vendorId, songListings.region],
            set: {
              url: vendorListing.data.url,
              price: vendorListing.data.price,
              currency: vendorListing.data.currency,
              duration: vendorListing.data.duration,
              updatedAt: new Date(),
            },
          })
          .returning();
        // Construct the response from already-fetched relations — no extra round-trip needed
        if (upserted && songRecord) {
          return { data: { ...upserted, songVendor: vendorMetaData, song: songRecord } };
        }
      } catch {
        // Song was deleted by enrichment mid-flight — cache write is lost, client re-fetches
      }
    }

    // Log the genuine no-match and cache it so we don't re-hit the vendor within the TTL
    await Promise.all([
      ctx.db.insert(songListingRequests).values({ songId, vendor, source: "no_match" }).catch(() => undefined),
      ctx.db
        .insert(songListingMisses)
        .values({ songId, vendorId, region })
        .onConflictDoUpdate({
          target: [songListingMisses.songId, songListingMisses.vendorId, songListingMisses.region],
          set: { checkedAt: new Date() },
        })
        .catch(() => undefined),
    ]);

    return { error: "NO_DATA_FOUND" };
  }),
});
