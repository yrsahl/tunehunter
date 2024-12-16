// << Spotify >>
export type SpotifyRefreshData = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
};

export type SpotifyUserData = {
  profileData: SpotifyProfileData | null;
  currentlyPlaying: SpotifyCurrentlyPlaying | null;
  queue: SpotifyQueue | null;
  recentlyPlayed: SpotifyRecentlyPlayed | null;
  topArtists: SpotifyArtists | null;
  topTracks: SpotifyTracks | null;
};

export type SpotifySearchData = {
  tracks: SpotifyTracks | null;
  // artists: SpotifyArtists | null;
  // albums: SpotifyAlbums | null;
  // playlists: SpotifyPlaylists | null;
  // shows: SpotifyShows | null;
  // episodes: SpotifyEpisodes | null;
  // audiobooks: SpotifyAudiobooks | null;
};

// Meta
export type SpotifyProfileData = {
  display_name: string;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  type: string;
  uri: string;
  followers: SpotifyFollowers;
  country: string;
  product: string;
  explicit_content: SpotifyExplicitContent;
  email: string;
};
export type SpotifyCurrentlyPlaying = {
  timestamp: number;
  context: SpotifyContext | null;
  progress_ms: number;
  item: SpotifyTrack;
  currently_playing_type: string;
  actions: SpotifyActions;
  is_playing: boolean;
};
export type SpotifyQueue = {
  currently_playing: SpotifyTrack;
  queue: SpotifyTrack[];
};

export type SpotifyRecentlyPlayed = {
  items: SpotifyRecentlyPlayedTrack[];
  next: string;
  cursors: SpotifyCursors;
  limit: number;
  href: string;
};

// Plurals
export type SpotifyArtists = {
  items: SpotifyArtist[];
} & SpotifyPagination;

export type SpotifyAlbums = {
  items: SpotifyAlbum[];
} & SpotifyPagination;

export type SpotifySimplifiedArtists = {
  items: SpotifySimplifiedArtist[];
} & SpotifyPagination;

export type SpotifyTracks = {
  items: SpotifyTrack[];
} & SpotifyPagination;

export type SpotifyPlaylists = {
  items: SpotifyPlaylist[];
} & SpotifyPagination;

export type SpotifyShows = {
  items: SpotifyShow[];
} & SpotifyPagination;

export type SpotifyEpisodes = {
  items: SpotifyEpisode[];
} & SpotifyPagination;

export type SpotifyAudiobooks = {
  items: SpotifyAudiobook[];
} & SpotifyPagination;

// Combined
export type SpotifyRecentlyPlayedTrack = {
  track: SpotifyTrack;
  played_at: string;
  context: SpotifyContext | null;
};

export type SpotifyTrack = {
  album: SpotifyAlbum;
  artists: SpotifySimplifiedArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: SpotifyExternalIds;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
};

export type SpotifyAlbum = {
  album_type: string;
  artists: SpotifySimplifiedArtist[];
  available_markets: string[];
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
};

export type SpotifySimplifiedArtist = {
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
};

export type SpotifyArtist = {
  external_urls: SpotifyExternalUrls;
  followers: SpotifyFollowers;
  genres: string[];
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
};

export type SpotifyPlaylist = {
  collaborative: boolean;
  description: string;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  owner: SpotifyPlaylistOwner;
  public: boolean;
  snapshot_id: string;
  tracks: SpotifyPlaylistTracks;
  type: string;
  uri: string;
};

export type SpotifyShow = {
  available_markets: string[];
  copyrights: SpotifyCopyright[];
  description: string;
  html_description: string;
  explicit: boolean;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  is_externally_hosted: boolean;
  languages: string[];
  media_type: string;
  name: string;
  publisher: string;
  type: string;
  uri: string;
  total_episodes: number;
};

export type SpotifyEpisode = {
  audio_preview_url: string;
  description: string;
  html_description: string;
  duration_ms: number;
  explicit: boolean;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  is_externally_hosted: boolean;
  is_playable: boolean;
  language: string;
  languages: string[];
  name: string;
  release_date: string;
  release_date_precision: string;
  resume_point: SpotifyEpisodeResumePoint;
  type: string;
  uri: string;
  restrictions: SpotifyRestrictions;
};

export type SpotifyAudiobook = {
  authors: SpotifyAudiobookAuthor[];
  available_markets: string[];
  copyrights: SpotifyCopyright[];
  description: string;
  html_description: string;
  edition: string;
  explicit: boolean;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  languages: string[];
  media_type: string;
  name: string;
  narrators: SpotifyAudiobookNarrator[];
  publisher: string;
  type: string;
  uri: string;
  total_chapters: number;
};

export type SpotifyContext = {
  external_urls: SpotifyExternalUrls;
  href: string;
  type: string;
  uri: string;
};

export type SpotifyActions = {
  disallows: SpotifyDisallows;
};

export interface SpotifyPlaylistOwner {
  external_urls: SpotifyExternalUrls;
  followers: SpotifyFollowers;
  href: string;
  id: string;
  type: string;
  uri: string;
  display_name: string;
}

// Singles
export type SpotifyPlaylistTracks = {
  href: string;
  total: number;
};

export type SpotifyEpisodeResumePoint = {
  fully_played: boolean;
  resume_position_ms: number;
};

export type SpotifyRestrictions = {
  reason: string;
};

export type SpotifyAudiobookAuthor = {
  name: string;
};

export type SpotifyAudiobookNarrator = {
  name: string;
};

export type SpotifyCopyright = {
  text: string;
  type: string;
};

export type SpotifyCursors = {
  after: string;
  before: string;
};

export type SpotifyImage = {
  height: number;
  url: string;
  width: number;
};
export type SpotifyExternalIds = {
  isrc: string;
};
export type SpotifyDisallows = {
  resuming: boolean;
};
export type SpotifyExternalUrls = {
  spotify: string;
};

export type SpotifyFollowers = {
  href: any;
  total: number;
};

export type SpotifyExplicitContent = {
  filter_enabled: boolean;
  filter_locked: boolean;
};

// Pagination
type SpotifyPagination = {
  total: number;
  limit: number;
  offset: number;
  href: string;
  previous: string | null;
  next: string;
};
