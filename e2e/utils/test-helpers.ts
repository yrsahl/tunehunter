import { Page, expect } from "@playwright/test";

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle");
}

export async function waitForSearchToLoad(page: Page) {
  await page.waitForSelector('[data-testid="search-input"]', { timeout: 15000 });
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
}
