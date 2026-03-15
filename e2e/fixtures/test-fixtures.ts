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
    await use(page);
  },
  spotifyConnectedPage: async ({ page }, use) => {
    await use(page);
  },
});

export { expect };
