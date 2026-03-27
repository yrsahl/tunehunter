import { expect, test } from "./fixtures/test-fixtures";
import { waitForSearchToLoad } from "./utils/test-helpers";

test.describe("@smoke Search Settings", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any persisted search settings from previous runs
    await page.addInitScript(() => {
      localStorage.removeItem("search-settings");
    });

    await page.goto("/");
    await waitForSearchToLoad(page);
    await page.locator(".lucide-cog").click();
    await expect(page.getByText("Search Filters")).toBeVisible();
  });

  test("version filter buttons change the active selection", async ({ page }) => {
    await page.getByRole("button", { name: "Remixes" }).click();

    // Settings indicator dot appears when a non-default filter is active
    await expect(page.locator(".rounded-full.bg-accent")).toBeVisible();

    // Reset button appears and clears the selection
    const resetBtn = page.getByRole("button", { name: /reset/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    await expect(page.locator(".rounded-full.bg-accent")).not.toBeVisible();
  });

  test("track length filter toggle shows and hides the range slider", async ({ page }) => {
    const lengthSwitch = page.locator("#lengthfilter");

    // Slider values not visible initially
    await expect(page.getByText("02:00")).not.toBeVisible();

    await lengthSwitch.click();

    // Default range: 120s = 02:00, 600s = 10:00
    await expect(page.getByText("02:00")).toBeVisible();
    await expect(page.getByText("10:00")).toBeVisible();

    // Toggle off hides the slider
    await lengthSwitch.click();
    await expect(page.getByText("02:00")).not.toBeVisible();
  });

  test("release year filter toggle shows and hides the range slider", async ({ page }) => {
    const yearSwitch = page.locator("#yearfilter");

    await expect(page.getByText("2000", { exact: true })).not.toBeVisible();

    await yearSwitch.click();

    // Default range starts at 2000
    await expect(page.getByText("2000", { exact: true })).toBeVisible();

    // Toggle off hides the slider
    await yearSwitch.click();
    await expect(page.getByText("2000", { exact: true })).not.toBeVisible();
  });

  test("reset button clears all active filters at once", async ({ page }) => {
    // Activate two filters
    await page.getByRole("button", { name: "Originals" }).click();
    await page.locator("#lengthfilter").click();

    await expect(page.locator(".rounded-full.bg-accent")).toBeVisible();
    await expect(page.getByText("02:00")).toBeVisible();

    await page.getByRole("button", { name: /reset/i }).click();

    await expect(page.locator(".rounded-full.bg-accent")).not.toBeVisible();
    await expect(page.getByText("02:00")).not.toBeVisible();
  });
});
