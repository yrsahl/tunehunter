import { z } from "zod";
import { AddSimpleArtistSchema } from "./artist-schemas";

// Schemas
export const AddSongSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(),
  album: z.union([z.string(), z.null()]),
  albumArtUrl: z.union([z.string(), z.null()]),
  year: z.string(),
  genre: z.union([z.string(), z.null()]),
  spotifyId: z.union([z.string(), z.null()]),
  isrc: z.union([z.string(), z.null()]),
});

export const AddSearchQueriesSchema = z.array(
  z.object({
    song: AddSongSchema,
    artists: z.array(AddSimpleArtistSchema),
  }),
);

// Interfaces
