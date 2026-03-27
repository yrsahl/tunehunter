import { expect, test } from "./fixtures/test-fixtures";
import { waitForSearchToLoad } from "./utils/test-helpers";

test.describe("@full Search Functionality", () => {
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

    const historyTab = page.getByRole("button", { name: /history/i });
    const wishlistTab = page.getByRole("button", { name: /wishlist/i });

    await expect(historyTab).toBeDisabled();
    await expect(wishlistTab).toBeDisabled();
  });

  test("playlist tab is accessible to unauthenticated users and shows URL input", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const playlistTab = page.getByRole("button", { name: /playlist/i });
    await expect(playlistTab).toBeEnabled();

    await playlistTab.click();
    await expect(page).toHaveURL(/search=playlist/);

    await expect(page.locator('[data-testid="playlist-url-input"]')).toBeVisible();
    await expect(
      page.getByText("Paste a public Spotify playlist link above to browse its tracks."),
    ).toBeVisible();
  });

  test("playlist tab can be toggled off", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const playlistTab = page.getByRole("button", { name: /playlist/i });
    await playlistTab.click();
    await expect(page).toHaveURL(/search=playlist/);

    await playlistTab.click();
    await expect(page).not.toHaveURL(/search=playlist/);
  });

  test("history tab is enabled and navigates when authenticated", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const historyTab = page.getByRole("button", { name: /history/i });
    await expect(historyTab).toBeEnabled();

    await historyTab.click();
    await expect(page).toHaveURL(/search=history/);
  });
});
