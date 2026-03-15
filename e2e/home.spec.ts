import { expect, test } from "./fixtures/test-fixtures";
import { waitForPageLoad, waitForSearchToLoad } from "./utils/test-helpers";

test.describe("@full Home Page", () => {
  test("should load the home page correctly", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Verify page title
    await expect(page).toHaveTitle(/TuneHunter/);

    // Verify main search component is present
    await waitForSearchToLoad(page);
  });

  test("should display search input and be interactive", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const searchInput = page.locator('[data-testid="search-input"]');

    // Verify search input is present and editable
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEditable();

    // Test search input functionality
    await searchInput.fill("test search");
    await expect(searchInput).toHaveValue("test search");

    // Clear search
    await searchInput.clear();
    await expect(searchInput).toHaveValue("");
  });

  test("should show appropriate UI for unauthenticated user", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Should show login button
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

    // Should not show user menu
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();

    // Should not show Spotify connected status
    await expect(page.locator('[data-testid="user-menu"]')).toHaveCount(0);
  });

  test("should render tab permissions for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const trendingTab = page.getByRole("button", { name: /trending/i });
    const spotifyTab = page.getByRole("button", { name: /spotify/i });
    const historyTab = page.getByRole("button", { name: /history/i });
    const wishlistTab = page.getByRole("button", { name: /wishlist/i });

    await expect(trendingTab).toBeEnabled();
    await expect(spotifyTab).toBeDisabled();
    await expect(historyTab).toBeDisabled();
    await expect(wishlistTab).toBeDisabled();
  });
});
