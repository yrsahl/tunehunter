import { AddUserActivitySchema, GetUserActivitySchema } from "@/schemas";
import { userActivities } from "@/server/db/schema";
import { and } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userActivitiesRouter = createTRPCRouter({
  // ********* Queries *********
  getAllUserActivities: protectedProcedure.query(async ({ ctx }) => {
    const activities = await ctx.db.query.userActivities.findMany({
      where: (activities, { eq }) => eq(activities.userId, ctx.session.user.id),
      with: { song: true },
      orderBy: (activities, { desc }) => [desc(activities.createdAt)],
    });

    const searchActivities = activities.filter((activity) => activity.type === "search");
    const purchaseActivities = activities.filter((activity) => activity.type === "purchase");
    const wishlistActivities = activities.filter((activity) => activity.type === "wishlist");

    return {
      search: searchActivities,
      purchase: purchaseActivities,
      wishlist: wishlistActivities,
    };
  }),

  getUserActivity: protectedProcedure.input(GetUserActivitySchema).query(async ({ ctx, input }) => {
    return await ctx.db.query.userActivities.findMany({
      where: (activities, { eq }) =>
        and(eq(activities.userId, ctx.session.user.id), eq(activities.type, input.type)),
      with: { song: true },
      orderBy: (activities, { desc }) => [desc(activities.createdAt)],
      limit: 30,
    });
  }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const purchaseHistory = await ctx.db.query.userActivities.findMany({
      where: (activities, { eq }) =>
        and(eq(activities.userId, ctx.session.user.id), eq(activities.type, "purchase")),
      with: { song: true },
      orderBy: (purchases, { desc }) => [desc(purchases.createdAt)],
      limit: 30,
    });

    const searchHistory = await ctx.db.query.userActivities.findMany({
      where: (activities, { eq }) =>
        and(eq(activities.userId, ctx.session.user.id), eq(activities.type, "search")),
      with: { song: true },
      orderBy: (queries, { desc }) => [desc(queries.createdAt)],
      limit: 30,
    });

    return {
      purchaseHistory,
      searchHistory,
    };
  }),

  // ********* Mutations *********
  // Guests and registered users may add search activities
  addSearchActivity: publicProcedure
    .input(z.object({ songId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(userActivities).values({
        userId: ctx.session?.user.id || null,
        songId: input.songId,
        type: "search",
        createdAt: new Date(),
      });
    }),

  // For users only
  addUserActivity: protectedProcedure
    .input(AddUserActivitySchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(userActivities).values({
        userId: ctx.session.user.id,
        songId: input.songId,
        type: input.type,
        createdAt: new Date(),
      });
    }),
});
