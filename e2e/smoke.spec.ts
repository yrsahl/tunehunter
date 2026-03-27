import { expect, test } from "./fixtures/test-fixtures";
import { waitForPageLoad, waitForSearchToLoad } from "./utils/test-helpers";

test.describe("@smoke Smoke", () => {
  test("home page loads and search input is visible", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);
    await waitForSearchToLoad(page);

    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
  });

  test("search input accepts typing", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const input = page.locator('[data-testid="search-input"]');
    await input.fill("Daft Punk - One More Time");

    await expect(input).toHaveValue("Daft Punk - One More Time");
  });

  test("unauthenticated state shows login button", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test("search settings popover opens and shows all filters", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    await page.locator(".lucide-cog").click();

    await expect(page.getByText("Search Filters")).toBeVisible();
    await expect(page.getByText("Version")).toBeVisible();
    await expect(page.getByText("Track length")).toBeVisible();
    await expect(page.getByText("Release year")).toBeVisible();
  });
});
