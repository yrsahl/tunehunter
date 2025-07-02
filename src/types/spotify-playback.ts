// What I need
export interface SpotifyPlaybackStateShort {
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
}

// Spotify Return Types
export interface SpotifyPlaybackState {
  device: Device;
  repeat_state: string;
  shuffle_state: boolean;
  context: Context;
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: Item;
  currently_playing_type: string;
  actions: Actions;
  smart_shuffle: boolean;
}

export interface Device {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
  supports_volume: boolean;
}

export interface Context {
  type: string;
  href: string;
  external_urls: ExternalUrls;
  uri: string;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Item {
  album: Album;
  artists: Artist2[];
  available_markets: any[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: ExternalIds;
  external_urls: ExternalUrls5;
  href: string;
  id: string;
  name: string;
  popularity: number;
  preview_url: any;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

export interface Album {
  album_type: string;
  total_tracks: number;
  available_markets: any[];
  external_urls: ExternalUrls2;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  type: string;
  uri: string;
  artists: Artist[];
}

export interface ExternalUrls2 {
  spotify: string;
}

export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface Artist {
  external_urls: ExternalUrls3;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface ExternalUrls3 {
  spotify: string;
}

export interface Artist2 {
  external_urls: ExternalUrls4;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface ExternalUrls4 {
  spotify: string;
}

export interface ExternalIds {
  isrc: string;
}

export interface ExternalUrls5 {
  spotify: string;
}

export interface Actions {
  disallows: Disallows;
}

export interface Disallows {
  resuming: boolean;
}
