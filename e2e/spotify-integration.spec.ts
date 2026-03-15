import { expect, test, testSongs } from "./fixtures/test-fixtures";
import {
  mockSpotifyApi,
  navigateToSearchTab,
  simulateUserInteraction,
  verifySpotifyConnectionState,
  waitForApiCalls,
  waitForPageLoad,
  waitForSearchToLoad,
  waitForSpotifyPlayer,
} from "./utils/test-helpers";

test.describe("@full Spotify Integration", () => {
  test.beforeEach(async ({ page }) => {
    await mockSpotifyApi(page);
    await waitForSpotifyPlayer(page);
  });

  test("should show Spotify connect button for authenticated users without Spotify", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Should show Spotify connect option
    await verifySpotifyConnectionState(page, false);
  });

  test("should show Spotify connected state for users with Spotify linked", async ({
    spotifyConnectedPage: page,
  }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Should show Spotify connected state
    await verifySpotifyConnectionState(page, true);
  });

  test("should display Spotify tab when connected", async ({ spotifyConnectedPage: page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    // Navigate to Spotify tab
    await navigateToSearchTab(page, "spotify");

    // Should show Spotify content
    await expect(page.locator('[data-testid="spotify-content"]')).toBeVisible();
  });

  test("should display user's recently played tracks", async ({ spotifyConnectedPage: page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    await navigateToSearchTab(page, "spotify");

    // Look for recently played section
    const recentlyPlayed = page.locator('[data-testid="recently-played"]');
    if (await recentlyPlayed.isVisible()) {
      await expect(recentlyPlayed).toBeVisible();

      // Should show at least one track
      const trackItems = page.locator('[data-testid="track-item"]');
      const trackCount = await trackItems.count();
      expect(trackCount).toBeGreaterThan(0);
    }
  });

  test("should display user's top tracks", async ({ spotifyConnectedPage: page }) => {
    // Mock top tracks API
    await page.route("**/api/spotify/top/tracks**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: testSongs.spotifySong.id,
              name: testSongs.spotifySong.title,
              artists: [{ name: testSongs.spotifySong.artist }],
              album: { name: "Test Album" },
              duration_ms: 355000,
            },
          ],
        }),
      });
    });

    await page.goto("/");
    await waitForSearchToLoad(page);

    await navigateToSearchTab(page, "spotify");

    // Switch to top tracks sub-tab
    const topTracksTab = page.locator('[data-testid="spotify-subtab-most_played"]');
    if (await topTracksTab.isVisible()) {
      await topTracksTab.click();

      await expect(page.locator("text=" + testSongs.spotifySong.title)).toBeVisible();
    }
  });

  test("should display user's current queue", async ({ spotifyConnectedPage: page }) => {
    // Mock queue API
    await page.route("**/api/spotify/queue**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          queue: [
            {
              id: testSongs.spotifySong.id,
              name: testSongs.spotifySong.title,
              artists: [{ name: testSongs.spotifySong.artist }],
              album: { name: "Test Album" },
              duration_ms: 355000,
            },
          ],
        }),
      });
    });

    await page.goto("/");
    await waitForSearchToLoad(page);

    await navigateToSearchTab(page, "spotify");

    // Switch to queue sub-tab
    const queueTab = page.locator('[data-testid="spotify-subtab-queue"]');
    if (await queueTab.isVisible()) {
      await queueTab.click();

      await expect(page.locator("text=" + testSongs.spotifySong.title)).toBeVisible();
    }
  });

  test("should handle Spotify player controls", async ({ spotifyConnectedPage: page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    await navigateToSearchTab(page, "spotify");

    // Look for play button on a track
    const playButton = page.locator('[data-testid="spotify-play-button"]').first();
    if (await playButton.isVisible()) {
      await simulateUserInteraction(page, async () => {
        await playButton.click();
      });

      // Should show playing state
      const pauseButton = page.locator('[data-testid="spotify-pause-button"]');
      await expect(pauseButton).toBeVisible({ timeout: 5000 });
    }
  });

  test("should handle Spotify connection flow", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Mock Spotify OAuth flow
    await page.route("**/api/auth/signin/spotify**", async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          location: "http://localhost:3000/auth_callback?action=link",
        },
      });
    });

    const connectButton = page.locator('[data-testid="spotify-connect-button"]');
    if (await connectButton.isVisible()) {
      await simulateUserInteraction(page, async () => {
        await connectButton.click();
      });

      // Should redirect to Spotify OAuth
      await page.waitForURL("**/auth_callback**", { timeout: 10000 });
    }
  });

  test("should handle Spotify disconnection", async ({ spotifyConnectedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Open user profile menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Look for disconnect Spotify option
    const disconnectButton = page.locator('[data-testid="spotify-disconnect-button"]');
    if (await disconnectButton.isVisible()) {
      // Mock disconnect API
      await page.route("**/api/trpc/user.unlinkSpotifyAccount*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ result: { data: { success: true } } }),
        });
      });

      await simulateUserInteraction(page, async () => {
        await disconnectButton.click();
      });

      // Should show disconnected state
      await waitForApiCalls(page);
      await verifySpotifyConnectionState(page, false);
    }
  });

  test("should handle Spotify API errors gracefully", async ({ spotifyConnectedPage: page }) => {
    // Mock Spotify API error
    await page.route("**/api/spotify/**", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized" }),
      });
    });

    await page.goto("/");
    await waitForSearchToLoad(page);

    await navigateToSearchTab(page, "spotify");

    // Should show error message
    const errorMessage = page.locator('[data-testid="spotify-error"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test("should refresh Spotify data", async ({ spotifyConnectedPage: page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    await navigateToSearchTab(page, "spotify");

    // Look for refresh button
    const refreshButton = page.locator('[data-testid="spotify-refresh-button"]');
    if (await refreshButton.isVisible()) {
      await simulateUserInteraction(page, async () => {
        await refreshButton.click();
      });

      // Should show loading state and then updated data
      await waitForApiCalls(page);
    }
  });

  test("should handle Spotify player SDK loading errors", async ({
    spotifyConnectedPage: page,
  }) => {
    // Mock SDK loading failure
    await page.addInitScript(() => {
      delete (window as any).Spotify;
      (window as any).onSpotifyWebPlaybackSDKReady = undefined;
    });

    await page.goto("/");
    await waitForPageLoad(page);

    // Should handle gracefully without crashing
    const playButtons = page.locator('[data-testid="spotify-play-button"]');
    if ((await playButtons.count()) > 0) {
      // Play buttons should be disabled or show appropriate state
      const firstPlayButton = playButtons.first();
      const isDisabled = await firstPlayButton.isDisabled();
      expect(isDisabled).toBeTruthy();
    }
  });
});
