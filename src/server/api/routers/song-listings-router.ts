import { fetchVendorData } from "@/services/vendors";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { songListings } from "@/server/db/schema";
import { SongListingSchema } from "../schemas/song-listings-schemas";

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
      where: (data, { eq, and }) => and(eq(data.vendorId, vendorId), eq(data.songId, input.songId)),
      with: {
        songVendor: true,
        song: true,
      },
    });
    if (dbListing) {
      return { data: dbListing };
    }

    // 2. Hit vendor API, store and return results
    const vendorListing = await fetchVendorData({
      region,
      vendorData: { vendorId, store: vendor },
      songData: { songId, duration, title, artist },
    });
    if (vendorListing.data) {
      // Store listings in DB and return
      await ctx.db.insert(songListings).values(vendorListing.data);

      const dbListing = await ctx.db.query.songListings.findFirst({
        where: (data, { eq, and }) =>
          and(eq(data.vendorId, vendorId), eq(data.songId, input.songId)),
        with: {
          songVendor: true,
          song: true,
        },
      });
      if (dbListing) return { data: dbListing };
    }

    // Return error if no data from vendor API
    return {
      error: "NO_DATA_FOUND",
    };
  }),
});
