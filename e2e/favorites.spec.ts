import { expect, test } from "./fixtures/test-fixtures";
import { waitForSearchToLoad } from "./utils/test-helpers";

test.describe("@full Favorites Access", () => {
  test("should keep favorites tab disabled when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const favoritesTab = page.getByRole("button", { name: /favorites/i });
    await expect(favoritesTab).toBeDisabled();

    await favoritesTab.click({ force: true });
    await expect(page).not.toHaveURL(/search=favorites/);
  });

  test("should enable favorites tab when authenticated", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const favoritesTab = page.getByRole("button", { name: /favorites/i });
    await expect(favoritesTab).toBeEnabled();

    await favoritesTab.click();
    await expect(page).toHaveURL(/search=favorites/);

    await favoritesTab.click();
    await expect(page).not.toHaveURL(/search=favorites/);
  });
});
