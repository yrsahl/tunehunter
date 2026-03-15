import { expect, test } from "./fixtures/test-fixtures";
import { waitForSearchToLoad } from "./utils/test-helpers";

test.describe("@full Wishlist Access", () => {
  test("should keep wishlist tab disabled when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const wishlistTab = page.getByRole("button", { name: /wishlist/i });
    await expect(wishlistTab).toBeDisabled();

    await wishlistTab.click({ force: true });
    await expect(page).not.toHaveURL(/search=wishlist/);
  });

  test("should enable wishlist tab when authenticated", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const wishlistTab = page.getByRole("button", { name: /wishlist/i });
    await expect(wishlistTab).toBeEnabled();

    await wishlistTab.click();
    await expect(page).toHaveURL(/search=wishlist/);

    await wishlistTab.click();
    await expect(page).not.toHaveURL(/search=wishlist/);
  });
});
