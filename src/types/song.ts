import { artists, songs } from "@/server/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Track = {
  song: InferSelectModel<typeof songs>;
  artists: InferSelectModel<typeof artists>[];
};

export type TrendingTrack = {
  searchCount: number;
} & Track;

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
