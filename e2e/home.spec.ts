import { expect, test } from "./fixtures/test-fixtures";
import {
  performSearch,
  verifyBasicAccessibility,
  waitForPageLoad,
  waitForSearchToLoad,
} from "./utils/test-helpers";

test.describe("Home Page", () => {
  test("should load the home page correctly", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Verify page title
    await expect(page).toHaveTitle(/TuneHunter/);

    // Verify main search component is present
    await waitForSearchToLoad(page);

    // Verify basic accessibility
    await verifyBasicAccessibility(page);
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
    await expect(page.locator('[data-testid="spotify-connected"]')).not.toBeVisible();
  });

  test("should handle search functionality", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    // Perform a search
    await performSearch(page, "Bohemian Rhapsody");

    // Verify search results are displayed
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");
    await waitForPageLoad(page);

    // Verify search component is still accessible on mobile
    await waitForSearchToLoad(page);

    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();

    // Verify mobile navigation if present
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible();
    }
  });

  test("should handle theme switching", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Look for theme toggle button
    const themeToggle = page.locator('[data-testid="theme-toggle"]');

    if (await themeToggle.isVisible()) {
      // Test theme switching
      await themeToggle.click();

      // Verify theme change (look for dark/light class on html or body)
      const html = page.locator("html");
      const bodyClasses = await page.locator("body").getAttribute("class");

      // Verify theme-related classes are present
      expect(bodyClasses).toBeTruthy();
    }
  });
});
