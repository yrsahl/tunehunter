import { AddSearchResultsSchema, AddSongSchema } from "@/schemas";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  artists,
  songArtists,
  songs,
  trendingViewLast30Days,
  trendingViewLast7Days,
  trendingViewToday,
} from "@/server/db/schema";
import { TrendingTrack, TrendingTracks } from "@/types/song";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

// Cache for trending songs, eventually replace this with Neon Cron Job
let cachedTrendingSongs: {
  today: TrendingTrack[];
  last7Days: TrendingTrack[];
  last30Days: TrendingTrack[];
} | null = null;
let lastRefreshTime: number | null = null;
const CACHE_DURATION = 15 * 60 * 1000;

export const songRouter = createTRPCRouter({
  // ********* Queries *********
  getSongById: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.db.query.songs.findFirst({
      where: (songs, { eq }) => eq(songs.id, input.id),
    });
  }),

  getTrendingSongs: publicProcedure.query<TrendingTracks>(async ({ ctx }) => {
    await ctx.db.refreshMaterializedView(trendingViewToday);

    // Check if cache is still valid
    const currentTime = Date.now();
    if (cachedTrendingSongs && lastRefreshTime && currentTime - lastRefreshTime < CACHE_DURATION) {
      return cachedTrendingSongs;
    }

    // Else refresh view and return new results
    console.log("awaiting all promises");
    await Promise.all([
      ctx.db.refreshMaterializedView(trendingViewToday),
      ctx.db.refreshMaterializedView(trendingViewLast7Days),
      ctx.db.refreshMaterializedView(trendingViewLast30Days),
    ]);

    const trendingSongsToday: TrendingTrack[] = await ctx.db
      .select({
        song: {
          id: songs.id,
          title: songs.title,
          duration: songs.duration,
          album: songs.album,
          albumArtUrl: songs.albumArtUrl,
          year: songs.year,
          genre: songs.genre,
          spotifyUrl: songs.spotifyUrl,
        },
        artists: sql<{ id: string; name: string; popularity: number; followers: number }[]>`
          array_agg(json_build_object(
            'id', ${artists.id},
            'name', ${artists.name},
            'popularity', ${artists.popularity},
            'followers', ${artists.followers}
          ))`.as("artists"),
        searchCount: trendingViewToday.searchCount,
      })
      .from(trendingViewToday)
      .innerJoin(songs, eq(trendingViewToday.songId, songs.id))
      .innerJoin(songArtists, eq(songArtists.songId, songs.id))
      .innerJoin(artists, eq(songArtists.artistId, artists.id))
      .groupBy(songs.id, trendingViewToday.searchCount)
      .orderBy(desc(trendingViewToday.searchCount))
      .limit(30);

    const trendingSongsLast7Days = await ctx.db
      .select({
        song: {
          id: songs.id,
          title: songs.title,
          duration: songs.duration,
          album: songs.album,
          albumArtUrl: songs.albumArtUrl,
          year: songs.year,
          genre: songs.genre,
          spotifyUrl: songs.spotifyUrl,
        },
        artists: sql<{ id: string; name: string; popularity: number; followers: number }[]>`
          array_agg(json_build_object(
            'id', ${artists.id},
            'name', ${artists.name},
            'popularity', ${artists.popularity},
            'followers', ${artists.followers}
          ))`.as("artists"),
        searchCount: trendingViewLast7Days.searchCount,
      })
      .from(trendingViewLast7Days)
      .innerJoin(songs, eq(trendingViewLast7Days.songId, songs.id))
      .innerJoin(songArtists, eq(songArtists.songId, songs.id))
      .innerJoin(artists, eq(songArtists.artistId, artists.id))
      .groupBy(songs.id, trendingViewLast7Days.searchCount)
      .orderBy(desc(trendingViewLast7Days.searchCount))
      .limit(30);

    const trendingSongsLast30Days = await ctx.db
      .select({
        song: {
          id: songs.id,
          title: songs.title,
          duration: songs.duration,
          album: songs.album,
          albumArtUrl: songs.albumArtUrl,
          year: songs.year,
          genre: songs.genre,
          spotifyUrl: songs.spotifyUrl,
        },
        artists: sql<{ id: string; name: string; popularity: number; followers: number }[]>`
          array_agg(json_build_object(
            'id', ${artists.id},
            'name', ${artists.name},
            'popularity', ${artists.popularity},
            'followers', ${artists.followers}
          ))`.as("artists"),
        searchCount: trendingViewLast30Days.searchCount,
      })
      .from(trendingViewLast30Days)
      .innerJoin(songs, eq(trendingViewLast30Days.songId, songs.id))
      .innerJoin(songArtists, eq(songArtists.songId, songs.id))
      .innerJoin(artists, eq(songArtists.artistId, artists.id))
      .groupBy(songs.id, trendingViewLast30Days.searchCount)
      .orderBy(desc(trendingViewLast30Days.searchCount))
      .limit(30);

    // Update cache
    const trendingSongs = {
      today: trendingSongsToday,
      last7Days: trendingSongsLast7Days,
      last30Days: trendingSongsLast30Days,
    };
    cachedTrendingSongs = trendingSongs;
    lastRefreshTime = currentTime;

    // Return
    return trendingSongs;
  }),

  // ********* Mutations *********
  addSong: publicProcedure.input(AddSongSchema).mutation(async ({ ctx, input }) => {
    const song = await ctx.db.query.songs.findFirst({
      where: (songs, { eq }) => eq(songs.id, input.id),
    });
    if (song) return { info: "SONG_ALREADY_EXISTS" };

    await ctx.db.insert(songs).values({
      id: input.id,
      title: input.title,
      duration: input.duration,
      album: input.album,
      albumArtUrl: input.albumArtUrl,
      year: input.year,
      genre: input.genre,
      spotifyUrl: input.spotifyUrl,
    });

    return {
      success: "SONG_ADDED",
    };
  }),

  storeSearchResults: publicProcedure
    .input(AddSearchResultsSchema)
    .mutation(async ({ ctx, input }) => {
      // Add songs
      await ctx.db
        .insert(songs)
        .values(
          input.map(({ song }) => ({
            id: song.id,
            title: song.title,
            duration: song.duration,
            album: song.album,
            albumArtUrl: song.albumArtUrl,
            year: song.year,
            genre: song.genre,
            spotifyUrl: song.spotifyUrl,
          })),
        )
        .onConflictDoNothing();

      // Add artists
      const artistValues = input.flatMap(({ artists }) =>
        artists.map((artist) => ({
          id: artist.id,
          name: artist.name,
          popularity: artist.popularity,
          followers: artist.followers,
        })),
      );
      await ctx.db.insert(artists).values(artistValues).onConflictDoNothing();

      // Add relations
      const relationValues = input.flatMap(({ song, artists }) =>
        artists.map((artist) => ({
          songId: song.id,
          artistId: artist.id,
        })),
      );
      await ctx.db.insert(songArtists).values(relationValues).onConflictDoNothing();
    }),
});
