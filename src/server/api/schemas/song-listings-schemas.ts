import { songListings, songs, songVendors } from "@/server/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";

// Schemas
export const SongListingSchema = z.union([
  z.object({
    vendor: z.enum(["itunes", "bandcamp", "beatport", "amazon"]),
    region: z.string(),
    songId: z.string(),
    artist: z.string(),
    title: z.string(),
    duration: z.number(),
    album: z.union([z.string(), z.null()]), // Allow album to be a string or null
  }),
  z.undefined(), // Allow the entire object to be undefined
]);

// Interfaces
export type SongListing = InferSelectModel<typeof songListings>;
export type SongListingError = "INVALID_FIELDS" | "VENDOR_NOT_FOUND" | "NO_DATA_FOUND";
export type SongListingResponse = SongListingSuccessResponse | SongListingErrorResponse;
interface SongListingSuccessResponse {
  data: SongListing;
  error?: undefined;
}
interface SongListingErrorResponse {
  error: SongListingError;
  data?: undefined;
}

export type SongListingWithRelations = {
  data: InferSelectModel<typeof songListings>;
  song: InferSelectModel<typeof songs>;
  songVendor: InferSelectModel<typeof songVendors>;
};
