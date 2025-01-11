import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { songCountView, songs } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const songRouter = createTRPCRouter({
  getTrending: publicProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        id: songCountView.songId,
        name: songs.name,
        duration: songs.duration,
        albumArtUrl: songs.albumArtUrl,
        queryCount: songCountView.queryCount,
      })
      .from(songCountView)
      .innerJoin(songs, eq(songCountView.songId, songs.id))
      .orderBy(songCountView.queryCount);
  }),

  getHistory: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.queries.findMany({
      where: (queries, { eq }) => eq(queries.userId, ctx.session.user.id),
      with: { song: true },
      orderBy: (queries, { desc }) => [desc(queries.searchedAt)],
      limit: 30,
    });
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
