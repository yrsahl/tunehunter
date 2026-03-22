import { db } from "@/server/db";
import { artists, songArtists, songs, userActivities, UserActivityType } from "@/server/db/schema";
import { UserHistory } from "@/types/song-types";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  AddUserActivitySchema,
  GetUserActivitySchema,
  RemoveUserActivitySchema,
} from "../schemas/user-activity-schemas";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userActivitiesRouter = createTRPCRouter({
  // ********* Queries *********
  getUserActivity: protectedProcedure.input(GetUserActivitySchema).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    return await getUserActivityByType(userId, input.type);
  }),

  getHistory: protectedProcedure.query<UserHistory>(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const [searchHistory, storeVisitHistory] = await Promise.all([
      getUserActivityByType(userId, "search"),
      getUserActivityByType(userId, "store_visit"),
    ]);

    return {
      userId,
      searchHistory,
      storeVisitHistory,
    };
  }),

  // ********* Mutations *********
  // Guests and registered users may add search activities
  addSearchActivity: publicProcedure
    .input(z.object({ songId: z.string(), region: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(userActivities).values({
        userId: ctx.session?.user.id || null,
        songId: input.songId,
        region: input.region,
        type: "search",
        createdAt: new Date(),
      });
    }),

  addUserActivity: publicProcedure
    .input(AddUserActivitySchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(userActivities).values({
        userId: ctx.session?.user.id ?? null,
        songId: input.songId,
        region: input.region,
        type: input.type,
        createdAt: new Date(),
      });
    }),

  removeUserActivityByType: protectedProcedure
    .input(RemoveUserActivitySchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userActivities)
        .where(
          and(
            eq(userActivities.userId, ctx.session.user.id),
            eq(userActivities.songId, input.songId),
            eq(userActivities.type, input.type),
          ),
        );
    }),
});

// Helpers
const getUserActivityByType = async (userId: string, type: UserActivityType) => {
  return await db
    .select({
      type: userActivities.type,
      createdAt: userActivities.createdAt,
      song: {
        id: songs.id,
        title: songs.title,
        duration: songs.duration,
        album: songs.album,
        albumArtUrl: songs.albumArtUrl,
        year: songs.year,
        genre: songs.genre,
        spotifyId: songs.spotifyId,
        isrc: songs.isrc,
      },
      artists: sql<{ id: string; name: string; popularity: number; followers: number }[]>`
        array_agg(json_build_object(
          'id', ${artists.id},
          'name', ${artists.name},
          'popularity', ${artists.popularity},
          'followers', ${artists.followers}
        ))`.as("artists"),
    })
    .from(userActivities)
    .where(and(eq(userActivities.userId, userId), eq(userActivities.type, type)))
    .innerJoin(songs, eq(songs.id, userActivities.songId))
    .innerJoin(songArtists, eq(songArtists.songId, songs.id))
    .innerJoin(artists, eq(songArtists.artistId, artists.id))
    .groupBy(
      userActivities.type,
      userActivities.createdAt,
      songs.id,
      songs.title,
      songs.duration,
      songs.album,
      songs.albumArtUrl,
      songs.year,
      songs.spotifyId,
      songs.isrc,
    )
    .orderBy(desc(userActivities.createdAt))
    .limit(30);
};
