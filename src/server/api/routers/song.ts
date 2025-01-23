import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { songCountView, songs } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export const songRouter = createTRPCRouter({
  getTrending: publicProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        id: songCountView.songId,
        title: songs.title,
        duration: songs.duration,
        albumArtUrl: songs.albumArtUrl,
        queryCount: songCountView.queryCount,
      })
      .from(songCountView)
      .innerJoin(songs, eq(songCountView.songId, songs.id))
      .orderBy(songCountView.queryCount);
  }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const searchHistoryData = await ctx.db.query.queries.findMany({
      where: (queries, { eq }) =>
        and(eq(queries.userId, ctx.session.user.id), eq(queries.type, "search")),
      with: { song: true },
      orderBy: (queries, { desc }) => [desc(queries.createdAt)],
      limit: 30,
    });
    const purchaseHistoryData = await ctx.db.query.queries.findMany({
      where: (purchases, { eq }) =>
        and(eq(purchases.userId, ctx.session.user.id), eq(purchases.type, "purchase")),
      with: { song: true },
      orderBy: (purchases, { desc }) => [desc(purchases.createdAt)],
      limit: 30,
    });

    return {
      search: searchHistoryData,
      purchase: purchaseHistoryData,
    };
  }),

  getWishlist: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.wishlists.findMany({
      where: (wishlist, { eq }) => eq(wishlist.userId, ctx.session.user.id),
      with: { song: true },
      orderBy: (wishlist, { desc }) => [desc(wishlist.addedAt)],
      limit: 30,
    });
  }),
});
