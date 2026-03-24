import { createTRPCRouter, publicProcedure, rateLimitedProcedure } from "@/server/api/trpc";
import {
  artistGenres,
  artists,
  genres,
  songArtists,
  songs,
  trendingViewLast30Days,
  trendingViewLast7Days,
  trendingViewToday,
} from "@/server/db/schema";
import { fetchSpotifyArtistData, fetchSpotifyTrack } from "@/services/spotify";
import { TrendingTrack, TrendingTracks } from "@/types/song-types";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { AddSearchQueriesSchema, AddSongSchema } from "../schemas/song-schemas";


export const songRouter = createTRPCRouter({
  // ********* Queries *********
  getSongById: rateLimitedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.db.query.songs.findFirst({
      where: (songs, { eq }) => eq(songs.id, input.id),
    });
  }),

  getTrack: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const song = await ctx.db.query.songs.findFirst({
      where: (songs, { eq }) => eq(songs.id, input.id),
    });
    if (!song) return null;

    const artistsDb = await ctx.db
      .select({
        id: artists.id,
        name: artists.name,
        popularity: artists.popularity,
        followers: artists.followers,
        genres: sql<string[]>`array_agg(${genres.name})`.as("genres"),
      })
      .from(songArtists)
      .innerJoin(artists, eq(songArtists.artistId, artists.id))
      .leftJoin(artistGenres, eq(artistGenres.artistId, artists.id))
      .leftJoin(genres, eq(artistGenres.genreId, genres.id))
      .where(eq(songArtists.songId, song.id))
      .groupBy(artists.id);

    return { song, artists: artistsDb };
  }),

  enrichArtists: rateLimitedProcedure
    .input(z.object({ songId: z.string(), accessToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const song = await ctx.db.query.songs.findFirst({
        where: (songs, { eq }) => eq(songs.id, input.songId),
      });
      if (!song) return;

      const artistsDb = await ctx.db
        .select({
          id: artists.id,
          name: artists.name,
          popularity: artists.popularity,
          followers: artists.followers,
          genres: sql<string[]>`array_agg(${genres.name})`.as("genres"),
        })
        .from(songArtists)
        .innerJoin(artists, eq(songArtists.artistId, artists.id))
        .leftJoin(artistGenres, eq(artistGenres.artistId, artists.id))
        .leftJoin(genres, eq(artistGenres.genreId, genres.id))
        .where(eq(songArtists.songId, input.songId))
        .groupBy(artists.id);

      const needsSpotifyId = !song.spotifyId;
      const artistsToEnrich = artistsDb.filter(
        (a) => a.popularity == null || a.followers == null || a.genres.every((g) => g === null),
      );

      // Fetch Spotify track if we need the song's spotifyId or artist Spotify IDs for enrichment
      let spotifyArtistIdByName: Map<string, string> | null = null;
      if (needsSpotifyId || artistsToEnrich.length > 0) {
        const query = `${song.title} ${artistsDb[0]?.name ?? ""}`;
        const spotifyTrack = await fetchSpotifyTrack(input.accessToken, query, song.duration);
        if (spotifyTrack) {
          if (needsSpotifyId) {
            await ctx.db
              .update(songs)
              .set({ spotifyId: spotifyTrack.song.spotifyId })
              .where(eq(songs.id, song.id));
          }
          spotifyArtistIdByName = new Map(
            spotifyTrack.artists.map((a) => [a.name.toLowerCase(), a.id]),
          );
        }
      }

      await Promise.all(
        artistsToEnrich.map(async (artist) => {
          const spotifyArtistId = spotifyArtistIdByName?.get(artist.name.toLowerCase());
          if (!spotifyArtistId) return;
          const spotifyArtist = await fetchSpotifyArtistData(input.accessToken, spotifyArtistId);

          if (!spotifyArtist) return;

          // Only update popularity/followers if missing
          if (artist.popularity == null || artist.followers == null) {
            await ctx.db
              .update(artists)
              .set({
                popularity: spotifyArtist.popularity,
                followers: spotifyArtist.followers.total,
              })
              .where(eq(artists.id, artist.id));
          }

          // Only update genres if missing
          if (artist.genres.every((g) => g === null) && spotifyArtist.genres?.length) {
            const existingGenres = await ctx.db.query.genres.findMany({
              where: (genres, { inArray }) => inArray(genres.name, spotifyArtist.genres),
            });
            const existingNames = new Set(existingGenres.map((g) => g.name));
            const toInsert = spotifyArtist.genres
              .filter((g) => !existingNames.has(g))
              .map((name) => ({ name }));
            if (toInsert.length > 0) await ctx.db.insert(genres).values(toInsert);

            const allGenres = await ctx.db.query.genres.findMany({
              where: (genres, { inArray }) => inArray(genres.name, spotifyArtist.genres),
            });
            await ctx.db
              .insert(artistGenres)
              .values(allGenres.map((genre) => ({ artistId: artist.id, genreId: genre.id })))
              .onConflictDoNothing();
          }
        }),
      );
    }),

  getTrendingSongs: rateLimitedProcedure.query<TrendingTracks>(async ({ ctx }) => {

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
        searchCount: trendingViewLast30Days.searchCount,
      })
      .from(trendingViewLast30Days)
      .innerJoin(songs, eq(trendingViewLast30Days.songId, songs.id))
      .innerJoin(songArtists, eq(songArtists.songId, songs.id))
      .innerJoin(artists, eq(songArtists.artistId, artists.id))
      .groupBy(songs.id, trendingViewLast30Days.searchCount)
      .orderBy(desc(trendingViewLast30Days.searchCount))
      .limit(30);

    return {
      today: trendingSongsToday,
      last7Days: trendingSongsLast7Days,
      last30Days: trendingSongsLast30Days,
    };
  }),

  // ********* Mutations *********
  addSong: rateLimitedProcedure.input(AddSongSchema).mutation(async ({ ctx, input }) => {
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
      spotifyId: input.spotifyId,
      isrc: input.isrc,
    });

    return {
      success: "SONG_ADDED",
    };
  }),

  // Store search queries in the database
  storeQueryResults: publicProcedure
    .input(AddSearchQueriesSchema)
    .mutation(async ({ ctx, input }) => {
      // Deduplicate by song id (same title+artist hash can appear multiple times in results)
      const uniqueInput = input.filter(
        ({ song }, index, self) => self.findIndex((s) => s.song.id === song.id) === index,
      );

      // Add songs
      await ctx.db
        .insert(songs)
        .values(
          uniqueInput.map(({ song }) => ({
            id: song.id,
            title: song.title,
            duration: song.duration,
            album: song.album,
            albumArtUrl: song.albumArtUrl,
            year: song.year,
            genre: song.genre,
            spotifyId: song.spotifyId,
            isrc: song.isrc,
          })),
        )
        .onConflictDoUpdate({
          target: songs.id,
          set: { isrc: sql`COALESCE(${songs.isrc}, EXCLUDED.isrc)` },
        });

      // Add artists
      const simpleArtistValues = uniqueInput.flatMap(({ artists }) =>
        artists.map((artist) => ({
          id: artist.id,
          name: artist.name,
        })),
      );
      await ctx.db.insert(artists).values(simpleArtistValues).onConflictDoNothing();

      // Add relations
      const relationValues = uniqueInput.flatMap(({ song, artists }) =>
        artists.map((artist) => ({
          songId: song.id,
          artistId: artist.id,
        })),
      );
      await ctx.db.insert(songArtists).values(relationValues).onConflictDoNothing();
    }),
});
