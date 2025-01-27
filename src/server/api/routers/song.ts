import { AddSongSchema } from "@/schemas";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { songCountView, songs } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const songRouter = createTRPCRouter({
  // ********* Queries *********
  getSongById: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.db.query.songs.findFirst({
      where: (songs, { eq }) => eq(songs.id, input.id),
    });
  }),

  getTrendingSongs: publicProcedure.query(({ ctx }) => {
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
});
