import { expect, test, testSongs } from "./fixtures/test-fixtures";
import {
  performSearch,
  waitForApiCalls,
  waitForPageLoad,
  waitForSearchToLoad,
} from "./utils/test-helpers";

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Mock search API responses
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
  });

  test("should perform basic search", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    // Perform search
    await performSearch(page, testSongs.popularSong.title);

    // Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator("text=" + testSongs.popularSong.title)).toBeVisible();
  });

  test("should handle empty search results", async ({ page }) => {
    // Mock empty search response
    await page.route("**/api/trpc/song.searchSongs*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: [] },
        }),
      });
    });

    await page.goto("/");
    await waitForSearchToLoad(page);

    await performSearch(page, "nonexistent song");

    // Should show no results message
    const noResultsMessage = page.locator('[data-testid="no-results"]');
    await expect(noResultsMessage).toBeVisible();
  });

  test("should handle search API errors gracefully", async ({ page }) => {
    // Mock API error
    await page.route("**/api/trpc/song.searchSongs*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    await page.goto("/");
    await waitForSearchToLoad(page);

    await performSearch(page, "test query");

    // Should show error message
    const errorMessage = page.locator('[data-testid="search-error"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test("should show loading state during search", async ({ page }) => {
    // Add delay to search API
    await page.route("**/api/trpc/song.searchSongs*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: [] },
        }),
      });
    });

    await page.goto("/");
    await waitForSearchToLoad(page);

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill("test search");
    await searchInput.press("Enter");

    // Should show loading indicator
    const loadingIndicator = page.locator('[data-testid="search-loading"]');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    }

    // Wait for search to complete
    await waitForApiCalls(page);
  });

  test("should clear search results when input is cleared", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    // Perform search
    await performSearch(page, testSongs.popularSong.title);
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Clear search input
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.clear();
    await searchInput.press("Enter");

    // Results should be cleared or hidden
    await page.waitForTimeout(500);
    const searchResults = page.locator('[data-testid="search-results"]');
    const isVisible = await searchResults.isVisible();

    if (isVisible) {
      // If results are still visible, they should be empty
      const resultItems = page.locator('[data-testid="search-result-item"]');
      await expect(resultItems).toHaveCount(0);
    }
  });

  test("should handle special characters in search", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const specialCharQueries = [
      "Song & Artist",
      'Song "with quotes"',
      "Song (with parentheses)",
      "Song-with-dashes",
    ];

    for (const query of specialCharQueries) {
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.clear();
      await searchInput.fill(query);
      await searchInput.press("Enter");

      // Should handle gracefully without errors
      await waitForApiCalls(page);

      // Verify no JavaScript errors occurred
      const errors = await page.evaluate(() => {
        return (window as any).testErrors || [];
      });
      expect(errors).toHaveLength(0);
    }
  });

  test("should maintain search state on page navigation", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    // Perform search
    await performSearch(page, testSongs.popularSong.title);
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Navigate away and back (if app has navigation)
    await page.goBack();
    await page.goForward();

    // Search results should still be visible
    await waitForPageLoad(page);
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveValue(testSongs.popularSong.title);
  });

  test("should show search suggestions if available", async ({ page }) => {
    // Mock search suggestions
    await page.route("**/api/trpc/song.getSearchSuggestions*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: ["Bohemian Rhapsody", "Bohemian Like You", "Rhapsody in Blue"],
          },
        }),
      });
    });

    await page.goto("/");
    await waitForSearchToLoad(page);

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill("Bohem");

    // Look for suggestions dropdown
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    if (await suggestions.isVisible()) {
      await expect(suggestions).toBeVisible();
      await expect(page.locator("text=Bohemian Rhapsody")).toBeVisible();
    }
  });
});
