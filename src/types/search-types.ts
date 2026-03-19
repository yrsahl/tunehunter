export type SearchTrack = {
  id: string;
  name: string;
  duration_ms: number;
  spotifyId?: string;
  isrc?: string;
  artists: { id: string; name: string }[];
  album: {
    name: string | null;
    images: { url: string }[];
    release_date: string;
  };
};

export type SearchData = {
  tracks: {
    href?: string;
    items: SearchTrack[];
  };
};
