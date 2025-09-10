import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock Spotify API
  http.get("https://api.spotify.com/v1/search", () => {
    return HttpResponse.json({
      tracks: {
        items: [
          {
            id: "test-track-id",
            name: "Test Song",
            artists: [{ name: "Test Artist" }],
            album: { name: "Test Album" },
            duration_ms: 180000,
            preview_url: "https://example.com/preview.mp3",
          },
        ],
        total: 1,
      },
    });
  }),

  // Mock iTunes API
  http.get("https://itunes.apple.com/search", () => {
    return HttpResponse.json({
      resultCount: 1,
      results: [
        {
          trackId: 123456,
          trackName: "Test Song",
          artistName: "Test Artist",
          collectionName: "Test Album",
          trackTimeMillis: 180000,
          previewUrl: "https://example.com/preview.mp3",
        },
      ],
    });
  }),

  // Mock NextAuth endpoints
  http.get("/api/auth/session", () => {
    return HttpResponse.json({
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
      },
      expires: "2099-01-01T00:00:00.000Z",
    });
  }),
];
