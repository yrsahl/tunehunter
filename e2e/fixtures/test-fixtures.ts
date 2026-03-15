import { test as base, expect, Page } from "@playwright/test";

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

type TestFixtures = {
  authenticatedPage: Page;
  spotifyConnectedPage: Page;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.route("**/api/auth/session**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "test-user-id",
            email: testUsers.validUser.email,
            name: testUsers.validUser.name,
            image: null,
          },
          expires: "2999-01-01T00:00:00.000Z",
        }),
      });
    });

    await use(page);
  },
  spotifyConnectedPage: async ({ page }, use) => {
    await page.route("**/api/auth/session**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "test-spotify-user-id",
            email: testUsers.spotifyUser.email,
            name: testUsers.spotifyUser.name,
            image: null,
          },
          expires: "2999-01-01T00:00:00.000Z",
        }),
      });
    });

    await use(page);
  },
});

export { expect };
