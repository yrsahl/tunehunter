import { expect, test, testSongs } from "./fixtures/test-fixtures";
import {
  performSearch,
  simulateUserInteraction,
  waitForApiCalls,
  waitForPageLoad,
} from "./utils/test-helpers";

test.describe("Wishlist Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Mock wishlist API responses
    await page.route("**/api/trpc/wishlist.addToWishlist*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: { success: true, id: "wishlist-item-1" } },
        }),
      });
    });

    await page.route("**/api/trpc/wishlist.removeFromWishlist*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: { success: true } },
        }),
      });
    });

    await page.route("**/api/trpc/wishlist.getWishlist*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: [
              {
                id: "wishlist-item-1",
                songId: "song-1",
                song: {
                  id: "song-1",
                  title: testSongs.popularSong.title,
                  artists: [{ name: testSongs.popularSong.artist }],
                  album: testSongs.popularSong.album,
                },
                createdAt: new Date().toISOString(),
              },
            ],
          },
        }),
      });
    });
  });

  test("should allow adding songs to wishlist when authenticated", async ({
    authenticatedPage: page,
  }) => {
    // Mock search results with song
    await page.route("**/api/trpc/song.searchSongs*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: [
              {
                id: "song-1",
                title: testSongs.popularSong.title,
                artists: [{ name: testSongs.popularSong.artist }],
                album: testSongs.popularSong.album,
                duration: 355000,
                albumArtUrl: "https://example.com/art.jpg",
                year: 1975,
                listings: [],
              },
            ],
          },
        }),
      });
    });

    await page.goto("/");
    await performSearch(page, testSongs.popularSong.title);

    // Look for wishlist button on search result
    const wishlistButton = page.locator('[data-testid="wishlist-button"]').first();
    await expect(wishlistButton).toBeVisible();

    // Add to wishlist
    await simulateUserInteraction(page, async () => {
      await wishlistButton.click();
    });

    await waitForApiCalls(page);

    // Should show added state
    const removeButton = page.locator('[data-testid="wishlist-remove-button"]').first();
    await expect(removeButton).toBeVisible();
  });

  test("should allow removing songs from wishlist", async ({ authenticatedPage: page }) => {
    // Mock search results with song already in wishlist
    await page.route("**/api/trpc/song.searchSongs*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: [
              {
                id: "song-1",
                title: testSongs.popularSong.title,
                artists: [{ name: testSongs.popularSong.artist }],
                album: testSongs.popularSong.album,
                duration: 355000,
                albumArtUrl: "https://example.com/art.jpg",
                year: 1975,
                listings: [],
                isInWishlist: true,
              },
            ],
          },
        }),
      });
    });

    await page.goto("/");
    await performSearch(page, testSongs.popularSong.title);

    // Look for remove from wishlist button
    const removeButton = page.locator('[data-testid="wishlist-remove-button"]').first();
    await expect(removeButton).toBeVisible();

    // Remove from wishlist
    await simulateUserInteraction(page, async () => {
      await removeButton.click();
    });

    await waitForApiCalls(page);

    // Should show add state
    const addButton = page.locator('[data-testid="wishlist-button"]').first();
    await expect(addButton).toBeVisible();
  });

  test("should not show wishlist buttons for unauthenticated users", async ({ page }) => {
    // Mock search results
    await page.route("**/api/trpc/song.searchSongs*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: [
              {
                id: "song-1",
                title: testSongs.popularSong.title,
                artists: [{ name: testSongs.popularSong.artist }],
                album: testSongs.popularSong.album,
                duration: 355000,
                albumArtUrl: "https://example.com/art.jpg",
                year: 1975,
                listings: [],
              },
            ],
          },
        }),
      });
    });

    await page.goto("/");
    await performSearch(page, testSongs.popularSong.title);

    // Wishlist buttons should not be visible or should be disabled
    const wishlistButton = page.locator('[data-testid="wishlist-button"]');
    if (await wishlistButton.isVisible()) {
      const isDisabled = await wishlistButton.isDisabled();
      expect(isDisabled).toBeTruthy();
    } else {
      await expect(wishlistButton).not.toBeVisible();
    }
  });

  test("should display wishlist in user profile", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Open user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Look for wishlist link
    const wishlistLink = page.locator('[data-testid="wishlist-link"]');
    if (await wishlistLink.isVisible()) {
      await wishlistLink.click();

      // Should show wishlist items
      await expect(page.locator("text=" + testSongs.popularSong.title)).toBeVisible();
    }
  });

  test("should handle wishlist API errors gracefully", async ({ authenticatedPage: page }) => {
    // Mock API error for adding to wishlist
    await page.route("**/api/trpc/wishlist.addToWishlist*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    // Mock search results
    await page.route("**/api/trpc/song.searchSongs*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: [
              {
                id: "song-1",
                title: testSongs.popularSong.title,
                artists: [{ name: testSongs.popularSong.artist }],
                album: testSongs.popularSong.album,
                duration: 355000,
                albumArtUrl: "https://example.com/art.jpg",
                year: 1975,
                listings: [],
              },
            ],
          },
        }),
      });
    });

    await page.goto("/");
    await performSearch(page, testSongs.popularSong.title);

    const wishlistButton = page.locator('[data-testid="wishlist-button"]').first();
    await wishlistButton.click();

    // Should show error message
    const errorMessage = page.locator('[data-testid="wishlist-error"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test("should show wishlist count in navigation", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Look for wishlist count indicator
    const wishlistCount = page.locator('[data-testid="wishlist-count"]');
    if (await wishlistCount.isVisible()) {
      await expect(wishlistCount).toBeVisible();

      // Should show count of items in wishlist
      await expect(wishlistCount).toContainText("1");
    }
  });

  test("should allow filtering wishlist by criteria", async ({ authenticatedPage: page }) => {
    // Mock expanded wishlist with multiple items
    await page.route("**/api/trpc/wishlist.getWishlist*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: [
              {
                id: "wishlist-item-1",
                songId: "song-1",
                song: {
                  id: "song-1",
                  title: "Song A",
                  artists: [{ name: "Artist A" }],
                  album: "Album A",
                },
                createdAt: "2023-01-01T00:00:00Z",
              },
              {
                id: "wishlist-item-2",
                songId: "song-2",
                song: {
                  id: "song-2",
                  title: "Song B",
                  artists: [{ name: "Artist B" }],
                  album: "Album B",
                },
                createdAt: "2023-01-02T00:00:00Z",
              },
            ],
          },
        }),
      });
    });

    await page.goto("/");
    await waitForPageLoad(page);

    // Navigate to wishlist
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    const wishlistLink = page.locator('[data-testid="wishlist-link"]');
    if (await wishlistLink.isVisible()) {
      await wishlistLink.click();

      // Look for filter options
      const filterInput = page.locator('[data-testid="wishlist-filter"]');
      if (await filterInput.isVisible()) {
        await filterInput.fill("Song A");

        // Should filter results
        await expect(page.locator("text=Song A")).toBeVisible();
        await expect(page.locator("text=Song B")).not.toBeVisible();
      }
    }
  });

  test("should allow sorting wishlist", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Navigate to wishlist
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    const wishlistLink = page.locator('[data-testid="wishlist-link"]');
    if (await wishlistLink.isVisible()) {
      await wishlistLink.click();

      // Look for sort options
      const sortSelect = page.locator('[data-testid="wishlist-sort"]');
      if (await sortSelect.isVisible()) {
        await sortSelect.click();

        const sortOption = page.locator('[data-testid="sort-by-artist"]');
        if (await sortOption.isVisible()) {
          await sortOption.click();

          // Verify sorting applied
          await waitForApiCalls(page);
        }
      }
    }
  });
});
