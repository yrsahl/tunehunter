import { test as base, expect, Page } from "@playwright/test";

// Test data fixtures
export const testUsers = {
  validUser: {
    email: "test@example.com",
    name: "Test User",
  },
  spotifyUser: {
    email: "spotify@example.com",
    name: "Spotify Test User",
    spotifyId: "test_spotify_user",
  },
};

export const testSongs = {
  popularSong: {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
  },
  spotifySong: {
    id: "4u7EnebtmKWzUH433cf5Qv",
    title: "Bohemian Rhapsody",
    artist: "Queen",
  },
};

// Extended test with custom fixtures
type TestFixtures = {
  authenticatedPage: Page;
  spotifyConnectedPage: Page;
};

export const test = base.extend<TestFixtures>({
  // Fixture for authenticated user session
  authenticatedPage: async ({ page, context }, use) => {
    // Mock authentication session
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: "mock-session-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
      },
    ]);

    // Mock session API response
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "test-user-id",
            name: testUsers.validUser.name,
            email: testUsers.validUser.email,
            image: null,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });

    await use(page);
  },

  // Fixture for user with Spotify connected
  spotifyConnectedPage: async ({ page, context }, use) => {
    // Mock authentication session
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: "mock-spotify-session-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
      },
    ]);

    // Mock session API response
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "spotify-user-id",
            name: testUsers.spotifyUser.name,
            email: testUsers.spotifyUser.email,
            image: null,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });

    // Mock Spotify account data
    await page.route("**/api/trpc/account.getSpotifyAccountById*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: {
              data: {
                access_token: "mock-spotify-access-token",
                refresh_token: "mock-spotify-refresh-token",
                providerAccountId: testUsers.spotifyUser.spotifyId,
              },
            },
          },
        }),
      });
    });

    // Mock Spotify user data
    await page.route("**/api/spotify/**", async (route) => {
      const url = route.request().url();

      if (url.includes("/me")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: testUsers.spotifyUser.spotifyId,
            display_name: testUsers.spotifyUser.name,
            email: testUsers.spotifyUser.email,
            images: [],
          }),
        });
      } else if (url.includes("/recently-played")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            items: [
              {
                track: {
                  id: testSongs.spotifySong.id,
                  name: testSongs.spotifySong.title,
                  artists: [{ name: testSongs.spotifySong.artist }],
                  album: { name: "Test Album" },
                  duration_ms: 355000,
                },
                played_at: new Date().toISOString(),
              },
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });

    await use(page);
  },
});

export { expect };
