import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { songCountView } from "@/server/db/schema";

export const songRouter = createTRPCRouter({
  getTrending: publicProcedure.query(({ ctx }) => {
    return ctx.db.select().from(songCountView).orderBy(songCountView.queryCount);
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
