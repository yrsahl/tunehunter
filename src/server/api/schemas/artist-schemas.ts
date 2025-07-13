import { z } from "zod";

// Schemas
export const AddSimpleArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const AddArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  popularity: z.number(),
  followers: z.number(),
  genres: z.array(z.string()),
});

// Interfaces
