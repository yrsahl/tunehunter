import { expect, test } from "./fixtures/test-fixtures";
import { waitForPageLoad, waitForSearchToLoad } from "./utils/test-helpers";

const ITUNES_TWO_TRACKS = {
  resultCount: 2,
  results: [
    {
      wrapperType: "track",
      kind: "song",
      trackId: 123456789,
      artistId: 987654,
      collectionId: 111222333,
      trackName: "One More Time",
      artistName: "Daft Punk",
      collectionName: "Discovery",
      artworkUrl100: "",
      trackTimeMillis: 320860,
      releaseDate: "2001-03-12T00:00:00Z",
      primaryGenreName: "Electronic",
      trackViewUrl: "",
      previewUrl: null,
    },
    {
      wrapperType: "track",
      kind: "song",
      trackId: 234567890,
      artistId: 987654,
      collectionId: 111222333,
      trackName: "Harder, Better, Faster, Stronger",
      artistName: "Daft Punk",
      collectionName: "Discovery",
      artworkUrl100: "",
      trackTimeMillis: 224160,
      releaseDate: "2001-03-12T00:00:00Z",
      primaryGenreName: "Electronic",
      trackViewUrl: "",
      previewUrl: null,
    },
  ],
};

test.describe("@full Search Autocomplete", () => {
  test("shows result suggestions when typing a query", async ({ page }) => {
    await page.route("**itunes.apple.com**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ITUNES_TWO_TRACKS),
      });
    });

    await page.goto("/");
    await waitForSearchToLoad(page);

    const input = page.locator('[data-testid="search-input"]');
    await input.click();
    await input.fill("Daft Punk");

    const results = page.locator('[data-testid="search-results"]');
    await expect(results).toBeVisible({ timeout: 5000 });
    await expect(results.getByText("One More Time")).toBeVisible();
    await expect(results.getByText("Harder, Better, Faster, Stronger")).toBeVisible();
  });

  test("shows no results message when API returns empty", async ({ page }) => {
    await page.route("**itunes.apple.com**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ resultCount: 0, results: [] }),
      });
    });

    await page.goto("/");
    await waitForSearchToLoad(page);

    const input = page.locator('[data-testid="search-input"]');
    await input.click();
    await input.fill("xyznonexistentsong123");

    const results = page.locator('[data-testid="search-results"]');
    await expect(results).toBeVisible({ timeout: 5000 });
    await expect(results.getByText("No results.")).toBeVisible();
  });

  test("hides autocomplete when input is cleared", async ({ page }) => {
    await page.route("**itunes.apple.com**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ITUNES_TWO_TRACKS),
      });
    });

    await page.goto("/");
    await waitForSearchToLoad(page);

    const input = page.locator('[data-testid="search-input"]');
    await input.click();
    await input.fill("Daft Punk");

    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 5000 });

    await input.fill("");
    await expect(page.locator('[data-testid="search-results"]')).not.toBeVisible();
  });

  test("song listings render when navigating directly to a song URL", async ({ page }) => {
    await page.goto("/?id=123456789&region=us&artist=Daft+Punk&title=One+More+Time");
    await waitForPageLoad(page);

    await expect(page.locator('[data-testid="song-listings"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Quality")).toBeVisible();
    await expect(page.getByText("Price")).toBeVisible();
  });
});
