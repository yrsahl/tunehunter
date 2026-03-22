import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { songListingRequests, userActivities } from "@/server/db/schema";
import { count, eq } from "drizzle-orm";

export const statsRouter = createTRPCRouter({
  getStats: publicProcedure.query(async ({ ctx }) => {
    const [totalSearches, dbCacheHits, externalFetches, byVendor] = await Promise.all([
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

      // Breakdown by vendor
      ctx.db
        .select({ vendor: songListingRequests.vendor, source: songListingRequests.source, count: count() })
        .from(songListingRequests)
        .groupBy(songListingRequests.vendor, songListingRequests.source),
    ]);

    return { totalSearches, dbCacheHits, externalFetches, byVendor };
  }),
});
