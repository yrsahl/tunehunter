import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
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

    // Get vendor id
    const vendorMetaData = await ctx.db.query.songVendors.findFirst({
      where: (data, { eq }) => eq(data.name, vendor),
    });
    const vendorId = vendorMetaData?.id;
    if (!vendorId) return { error: "VENDOR_NOT_FOUND" };

    // 1. Try DB first
    const dbListing = await ctx.db.query.songListings.findFirst({
      where: (data, { eq, and }) =>
        and(eq(data.vendorId, vendorId), eq(data.songId, input.songId), eq(data.region, region)),
      with: {
        songVendor: true,
        song: true,
      },
    });
    const isStale = dbListing && Date.now() - dbListing.updatedAt.getTime() > LISTING_TTL_MS;
    if (dbListing && !isStale) {
      await ctx.db.insert(songListingRequests).values({ songId, vendor, source: "db_cache" });
      return { data: dbListing };
    }

    // Check cached "not found" result
    const dbMiss = await ctx.db.query.songListingMisses.findFirst({
      where: (data, { eq, and }) =>
        and(eq(data.vendorId, vendorId), eq(data.songId, songId), eq(data.region, region)),
    });
    const isMissStale = dbMiss && Date.now() - dbMiss.checkedAt.getTime() > MISS_TTL_MS;
    if (dbMiss && !isMissStale) {
      await ctx.db.insert(songListingRequests).values({ songId, vendor, source: "db_cache" });
      return { error: "NO_DATA_FOUND" };
    }

    // 2. Hit vendor API, store or refresh results
    let vendorListing;
    try {
      vendorListing = await fetchVendorData({
        region,
        vendorData: { vendorId, store: vendor },
        songData: { songId, duration, title, artist },
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      return { error: "STORE_UNREACHABLE" };
    }
    await ctx.db.insert(songListingRequests).values({ songId, vendor, source: "external" });
    if (vendorListing.data) {
      await ctx.db
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
        });

      const dbListing = await ctx.db.query.songListings.findFirst({
        where: (data, { eq, and }) =>
          and(eq(data.vendorId, vendorId), eq(data.songId, input.songId), eq(data.region, region)),
        with: {
          songVendor: true,
          song: true,
        },
      });
      if (dbListing) return { data: dbListing };
    }

    // Cache the "not found" result so we don't re-hit the vendor within the TTL
    await ctx.db
      .insert(songListingMisses)
      .values({ songId, vendorId, region })
      .onConflictDoUpdate({
        target: [songListingMisses.songId, songListingMisses.vendorId, songListingMisses.region],
        set: { checkedAt: new Date() },
      });

    return { error: "NO_DATA_FOUND" };
  }),
});
