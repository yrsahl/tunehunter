import { expect, test } from "./fixtures/test-fixtures";
import { waitForSearchToLoad } from "./utils/test-helpers";

test.describe("@full Search Functionality", () => {
  test("should accept typing and allow clearing", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill("Bohemian Rhapsody");
    await expect(searchInput).toHaveValue("Bohemian Rhapsody");

    await searchInput.clear();
    await expect(searchInput).toHaveValue("");
  });

  test("should set and clear search tab query param when clicking trending", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const trendingTab = page.getByRole("button", { name: /trending/i });
    await expect(trendingTab).toBeEnabled();

    await trendingTab.click();
    await expect(page).toHaveURL(/search=trending/);

    await trendingTab.click();
    await expect(page).not.toHaveURL(/search=trending/);
  });

  test("should keep restricted tabs disabled for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const spotifyTab = page.getByRole("button", { name: /spotify/i });
    const historyTab = page.getByRole("button", { name: /history/i });
    const wishlistTab = page.getByRole("button", { name: /wishlist/i });

    await expect(spotifyTab).toBeDisabled();
    await expect(historyTab).toBeDisabled();
    await expect(wishlistTab).toBeDisabled();

    await spotifyTab.click({ force: true });
    await expect(page).not.toHaveURL(/search=spotify/);
  });
});
