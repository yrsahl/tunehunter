import { createTRPCRouter, publicProcedure, rateLimitedProcedure } from "@/server/api/trpc";
import {
  artistGenres,
  artists,
  genres,
  songArtists,
  songListingMisses,
  songListingRequests,
  songListings,
  songs,
  trendingViewLast30Days,
  trendingViewLast7Days,
  trendingViewToday,
  userActivities,
} from "@/server/db/schema";
import { fetchItunesTrack } from "@/services/itunes/api";
import { fetchSpotifyArtistData, fetchSpotifyTrack } from "@/services/spotify";
import { TrendingTrack, TrendingTracks } from "@/types/song-types";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { z } from "zod";
import { StoreSongSchema } from "../schemas/song-schemas";


export const songRouter = createTRPCRouter({
  // ********* Queries *********
  getSongById: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
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

  // Enriches an iTunes-sourced song with Spotify data: spotifyId, previewUrl, artist followers/genres
  enrichItunesTrackFromSpotify: rateLimitedProcedure
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
      const needsPreviewUrl = !song.previewUrl;
      const artistsToEnrich = artistsDb.filter(
        (a) => a.popularity == null || a.followers == null || a.genres.every((g) => g === null),
      );

      // Fetch Spotify track if we need the song's spotifyId, previewUrl, or artist Spotify IDs for enrichment
      let spotifyArtistIdByName: Map<string, string> | null = null;
      if (needsSpotifyId || needsPreviewUrl || artistsToEnrich.length > 0) {
        const query = `${song.title} ${artistsDb[0]?.name ?? ""}`;
        const spotifyTrack = await fetchSpotifyTrack(input.accessToken, query, song.duration);
        if (spotifyTrack) {
          const updates: Partial<typeof songs.$inferInsert> = {};
          if (needsSpotifyId) updates.spotifyId = spotifyTrack.song.spotifyId;
          if (needsPreviewUrl && spotifyTrack.song.previewUrl)
            updates.previewUrl = spotifyTrack.song.previewUrl;
          if (Object.keys(updates).length > 0) {
            await ctx.db.update(songs).set(updates).where(eq(songs.id, song.id));
          }
          spotifyArtistIdByName = new Map(
            spotifyTrack.artists.map((a) => [a.name.toLowerCase(), a.id]),
          );
        }
      }

      let firstGenre: string | null = null;

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
            if (!firstGenre) firstGenre = spotifyArtist.genres[0] ?? null;

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

      if (!song.genre && firstGenre) {
        await ctx.db.update(songs).set({ genre: firstGenre }).where(eq(songs.id, input.songId));
      }
    }),

  // Merges a Spotify-sourced song (sp_ prefix) into its iTunes counterpart.
  // Finds the iTunes match, migrates all FK relations, then deletes the sp_ record.
  enrichSpotifySongFromItunes: rateLimitedProcedure
    .input(z.object({ songId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!input.songId.startsWith("sp_")) return;
      const spId = input.songId;

      const song = await ctx.db.query.songs.findFirst({
        where: (songs, { eq }) => eq(songs.id, spId),
      });
      if (!song) return;

      const artistRows = await ctx.db
        .select({ id: artists.id, name: artists.name })
        .from(songArtists)
        .innerJoin(artists, eq(songArtists.artistId, artists.id))
        .where(eq(songArtists.songId, spId));

      const primaryArtist = artistRows[0];
      if (!primaryArtist) return;

      const itunesTrack = await fetchItunesTrack(song.title, primaryArtist.name, song.duration);
      if (!itunesTrack) return;

      const itunesId = itunesTrack.song.id;
      const itunesArtist = itunesTrack.artists[0];

      await ctx.db.transaction(async (tx) => {
        // 1. Upsert iTunes song, carrying over spotifyId and isrc from the sp_ record
        await tx
          .insert(songs)
          .values({
            id: itunesId,
            title: itunesTrack.song.title,
            duration: itunesTrack.song.duration,
            album: itunesTrack.song.album,
            albumArtUrl: itunesTrack.song.albumArtUrl,
            year: itunesTrack.song.year,
            genre: itunesTrack.song.genre,
            spotifyId: song.spotifyId,
            previewUrl: itunesTrack.song.previewUrl,
            isrc: song.isrc,
          })
          .onConflictDoUpdate({
            target: songs.id,
            set: {
              genre: sql`COALESCE(${songs.genre}, EXCLUDED.genre)`,
              previewUrl: sql`COALESCE(${songs.previewUrl}, EXCLUDED.preview_url)`,
              spotifyId: sql`COALESCE(${songs.spotifyId}, EXCLUDED.spotify_id)`,
              isrc: sql`COALESCE(${songs.isrc}, EXCLUDED.isrc)`,
            },
          });

        // 2. Upsert iTunes artist and link to the iTunes song
        if (itunesArtist) {
          await tx
            .insert(artists)
            .values({ id: itunesArtist.id, name: itunesArtist.name, popularity: null, followers: null })
            .onConflictDoNothing();
          await tx
            .insert(songArtists)
            .values({ songId: itunesId, artistId: itunesArtist.id })
            .onConflictDoNothing();
        }

        // 3. Migrate userActivities (sp_ → iTunes ID)
        await tx.update(userActivities).set({ songId: itunesId }).where(eq(userActivities.songId, spId));

        // 4. Migrate songListings — composite PK requires insert+delete
        const spListings = await tx.select().from(songListings).where(eq(songListings.songId, spId));
        if (spListings.length > 0) {
          await tx
            .insert(songListings)
            .values(spListings.map((l) => ({ ...l, songId: itunesId })))
            .onConflictDoNothing();
          await tx.delete(songListings).where(eq(songListings.songId, spId));
        }

        // 5. Migrate songListingMisses — composite PK requires insert+delete
        const spMisses = await tx.select().from(songListingMisses).where(eq(songListingMisses.songId, spId));
        if (spMisses.length > 0) {
          await tx
            .insert(songListingMisses)
            .values(spMisses.map((m) => ({ ...m, songId: itunesId })))
            .onConflictDoNothing();
          await tx.delete(songListingMisses).where(eq(songListingMisses.songId, spId));
        }

        // 6. Migrate songListingRequests
        await tx
          .update(songListingRequests)
          .set({ songId: itunesId })
          .where(eq(songListingRequests.songId, spId));

        // 7. Collect sp_ artist IDs before deletion for orphan cleanup below
        const spArtistIds = artistRows.map((a) => a.id).filter((id) => id.startsWith("sp_"));

        // 8. Delete sp_ song — cascades any remaining songArtists not yet migrated
        await tx.delete(songs).where(eq(songs.id, spId));

        // 9. Delete orphaned sp_ artists (no longer referenced by any song)
        for (const artistId of spArtistIds) {
          const [ref] = await tx
            .select({ songId: songArtists.songId })
            .from(songArtists)
            .where(eq(songArtists.artistId, artistId))
            .limit(1);
          if (!ref) await tx.delete(artists).where(eq(artists.id, artistId));
        }
      });

      return { itunesId };
    }),

  getTrendingSongs: publicProcedure.query<TrendingTracks>(async ({ ctx }) => {

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
          previewUrl: songs.previewUrl,
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
          previewUrl: songs.previewUrl,
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
          previewUrl: songs.previewUrl,
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

  // Stores a Spotify-sourced song (sp_ prefix) along with artist genres in one shot.
  // Artist and song IDs are prefixed with sp_ to distinguish them from iTunes-sourced data.
  storeSpotifyTrack: rateLimitedProcedure
    .input(
      z.object({
        track: z.object({
          spotifyId: z.string(),
          title: z.string(),
          duration: z.number(),
          album: z.string().nullable(),
          albumArtUrl: z.string().nullable(),
          year: z.string(),
          previewUrl: z.string().nullable(),
          isrc: z.string().nullable(),
        }),
        artists: z.array(z.object({ spotifyId: z.string(), name: z.string() })),
        accessToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const songId = `sp_${input.track.spotifyId}`;

      // Fetch artist data in parallel (skipped if no access token)
      const artistDataResults = await Promise.all(
        input.artists.map(async (a) => {
          const data = input.accessToken
            ? await fetchSpotifyArtistData(input.accessToken, a.spotifyId)
            : null;
          return { spotifyId: a.spotifyId, name: a.name, data };
        }),
      );

      const firstGenre =
        artistDataResults.find((r) => r.data?.genres?.length)?.data?.genres[0] ?? null;

      // Store song
      await ctx.db
        .insert(songs)
        .values({
          id: songId,
          title: input.track.title,
          duration: input.track.duration,
          album: input.track.album,
          albumArtUrl: input.track.albumArtUrl,
          year: input.track.year,
          genre: firstGenre,
          spotifyId: input.track.spotifyId,
          previewUrl: input.track.previewUrl,
          isrc: input.track.isrc,
        })
        .onConflictDoNothing();

      // Store artists with sp_ prefix + their genres
      await Promise.all(
        artistDataResults.map(async ({ spotifyId, name, data }) => {
          const artistId = `sp_${spotifyId}`;

          await ctx.db
            .insert(artists)
            .values({
              id: artistId,
              name,
              popularity: data?.popularity ?? null,
              followers: data?.followers.total ?? null,
            })
            .onConflictDoNothing();

          if (data?.genres?.length) {
            const existingGenres = await ctx.db.query.genres.findMany({
              where: (genres, { inArray }) => inArray(genres.name, data.genres),
            });
            const existingNames = new Set(existingGenres.map((g) => g.name));
            const toInsert = data.genres
              .filter((g) => !existingNames.has(g))
              .map((name) => ({ name }));
            if (toInsert.length > 0) await ctx.db.insert(genres).values(toInsert);

            const allGenres = await ctx.db.query.genres.findMany({
              where: (genres, { inArray }) => inArray(genres.name, data.genres),
            });
            await ctx.db
              .insert(artistGenres)
              .values(allGenres.map((genre) => ({ artistId, genreId: genre.id })))
              .onConflictDoNothing();
          }
        }),
      );

      // Store song-artist junctions
      await ctx.db
        .insert(songArtists)
        .values(artistDataResults.map((r) => ({ songId, artistId: `sp_${r.spotifyId}` })))
        .onConflictDoNothing();
    }),

  savePreviewUrl: publicProcedure
    .input(z.object({ songId: z.string(), previewUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(songs)
        .set({ previewUrl: input.previewUrl })
        .where(eq(songs.id, input.songId));
    }),

  storeSong: publicProcedure
    .input(StoreSongSchema)
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
            previewUrl: song.previewUrl,
            isrc: song.isrc,
          })),
        )
        .onConflictDoUpdate({
          target: songs.id,
          set: {
            isrc: sql`COALESCE(${songs.isrc}, EXCLUDED.isrc)`,
            genre: sql`COALESCE(${songs.genre}, EXCLUDED.genre)`,
            previewUrl: sql`COALESCE(${songs.previewUrl}, EXCLUDED.preview_url)`,
          },
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

      // Enrich any matching sp_ songs (from playlist favorites) with iTunes genre/previewUrl
      const enrichable = uniqueInput.filter(({ song }) => song.genre ?? song.previewUrl);
      if (enrichable.length > 0) {
        await Promise.all(
          enrichable.map(({ song, artists: trackArtists }) => {
            const primaryArtistName = trackArtists[0]?.name ?? "";
            return ctx.db
              .update(songs)
              .set({
                genre: sql`COALESCE(${songs.genre}, ${song.genre})`,
                previewUrl: sql`COALESCE(${songs.previewUrl}, ${song.previewUrl})`,
              })
              .where(
                and(
                  like(songs.id, "sp_%"),
                  sql`LOWER(${songs.title}) = LOWER(${song.title})`,
                  sql`ABS(${songs.duration} - ${song.duration}) <= 3000`,
                  sql`EXISTS (
                    SELECT 1 FROM ${songArtists} sa
                    INNER JOIN ${artists} a ON a.id = sa.artist_id
                    WHERE sa.song_id = ${songs.id}
                    AND LOWER(a.name) LIKE '%' || LOWER(${primaryArtistName}) || '%'
                  )`,
                ),
              );
          }),
        );
      }
    }),
});
