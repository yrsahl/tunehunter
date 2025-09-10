export const mockSpotifyTrack = {
  id: "test-track-id",
  name: "Test Song",
  artists: [
    {
      id: "test-artist-id",
      name: "Test Artist",
    },
  ],
  album: {
    id: "test-album-id",
    name: "Test Album",
    images: [
      {
        url: "https://example.com/album-cover.jpg",
        height: 640,
        width: 640,
      },
    ],
  },
  duration_ms: 180000,
  preview_url: "https://example.com/preview.mp3",
  external_urls: {
    spotify: "https://open.spotify.com/track/test-track-id",
  },
};

export const mockSpotifySearchResponse = {
  tracks: {
    items: [mockSpotifyTrack],
    total: 1,
    limit: 20,
    offset: 0,
  },
};

export const mockItunesTrack = {
  trackId: 123456,
  trackName: "Test Song",
  artistName: "Test Artist",
  collectionName: "Test Album",
  trackTimeMillis: 180000,
  previewUrl: "https://example.com/preview.mp3",
  artworkUrl100: "https://example.com/artwork.jpg",
  trackViewUrl: "https://music.apple.com/album/test-song/123456",
};

export const mockItunesSearchResponse = {
  resultCount: 1,
  results: [mockItunesTrack],
};
