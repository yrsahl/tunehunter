import { artists, songs } from "@/server/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Song = InferSelectModel<typeof songs>;
export type Artist = InferSelectModel<typeof artists>;

export type Track = {
  song: Song;
  artists: Artist[];
};

export type TrendingTrack = {
  searchCount: number;
} & Track;

export type SpotifyTrack = Omit<Track, "song"> & {
  song: Omit<Track["song"], "id">;
};

export type UserActivityTrack = {
  type: "search" | "store_visit" | "wishlist";
  createdAt: Date;
} & Track;

export type TrendingTracks = {
  today: TrendingTrack[];
  last7Days: TrendingTrack[];
  last30Days: TrendingTrack[];
};

export type UserHistory = {
  userId: string;
  searchHistory: UserActivityTrack[];
  storeVisitHistory: UserActivityTrack[];
};
