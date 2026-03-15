import { expect, test } from "./fixtures/test-fixtures";
import { waitForPageLoad } from "./utils/test-helpers";

test.describe("@full User Profile and Settings", () => {
  test("should show user menu when authenticated", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toHaveCount(0);
  });

  test("should open profile modal with key settings controls", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    await expect(page.locator('[data-testid="change-avatar-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="change-email-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="region-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="auto-detect-region-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="theme-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="particles-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });
});
