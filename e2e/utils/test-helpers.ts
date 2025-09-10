import { Page, expect } from "@playwright/test";

/**
 * Utility functions for E2E tests
 */

/**
 * Wait for the page to load completely
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("body");
}

/**
 * Wait for and verify the main search component is loaded
 */
export async function waitForSearchToLoad(page: Page) {
  await page.waitForSelector('[data-testid="search-input"]', { timeout: 10000 });
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
}

/**
 * Perform a search and wait for results
 */
export async function performSearch(page: Page, query: string) {
  const searchInput = page.locator('[data-testid="search-input"]');
  await searchInput.fill(query);
  await searchInput.press("Enter");

  // Wait for search results to appear
  await page.waitForSelector('[data-testid="search-results"]', { timeout: 15000 });
}

/**
 * Navigate to a specific tab in the search interface
 */
export async function navigateToSearchTab(
  page: Page,
  tabName: "spotify" | "amazon" | "itunes" | "bandcamp",
) {
  const tabSelector = `[data-testid="search-tab-${tabName}"]`;
  await page.locator(tabSelector).click();
  await page.waitForSelector(`[data-testid="${tabName}-content"]`, { timeout: 10000 });
}

/**
 * Wait for Spotify player to be ready
 */
export async function waitForSpotifyPlayer(page: Page) {
  // Mock Spotify Web Playback SDK
  await page.addInitScript(() => {
    (window as any).Spotify = {
      Player: class MockSpotifyPlayer {
        constructor() {}
        connect() {
          return Promise.resolve(true);
        }
        disconnect() {}
        addListener(event: string, callback: Function) {
          if (event === "ready") {
            setTimeout(() => callback({ device_id: "mock-device-id" }), 100);
          }
        }
        removeListener() {}
      },
    };

    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      // SDK ready callback
    };
  });
}

/**
 * Mock Spotify API responses for testing
 */
export async function mockSpotifyApi(page: Page) {
  // Mock Spotify search API
  await page.route("**/api/spotify/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        tracks: {
          items: [
            {
              id: "4u7EnebtmKWzUH433cf5Qv",
              name: "Bohemian Rhapsody",
              artists: [{ name: "Queen" }],
              album: { name: "A Night at the Opera" },
              duration_ms: 355000,
              preview_url: "https://example.com/preview.mp3",
            },
          ],
        },
      }),
    });
  });

  // Mock Spotify player API
  await page.route("**/api/spotify/player/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * Verify authentication state
 */
export async function verifyAuthenticationState(page: Page, shouldBeAuthenticated: boolean) {
  if (shouldBeAuthenticated) {
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="login-button"]')).not.toBeVisible();
  } else {
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  }
}

/**
 * Verify Spotify connection state
 */
export async function verifySpotifyConnectionState(page: Page, shouldBeConnected: boolean) {
  if (shouldBeConnected) {
    await expect(page.locator('[data-testid="spotify-connected"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="spotify-connect-button"]')).not.toBeVisible();
  } else {
    await expect(page.locator('[data-testid="spotify-connect-button"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('[data-testid="spotify-connected"]')).not.toBeVisible();
  }
}

/**
 * Simulate user interaction with delay for better test reliability
 */
export async function simulateUserInteraction(
  page: Page,
  action: () => Promise<void>,
  delay = 100,
) {
  await new Promise((resolve) => setTimeout(resolve, delay));
  await action();
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Take a screenshot for debugging purposes
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/debug-screenshots/${name}.png`, fullPage: true });
}

/**
 * Verify page accessibility basics
 */
export async function verifyBasicAccessibility(page: Page) {
  // Check for essential accessibility attributes
  const mainContent = page.locator('main, [role="main"]');
  await expect(mainContent).toBeVisible();

  // Check for heading structure - should have at most 1 h1
  const h1Count = await page.locator("h1").count();
  expect(h1Count).toBeLessThanOrEqual(1);
}

/**
 * Wait for API calls to complete
 */
export async function waitForApiCalls(page: Page, timeout = 5000) {
  // Wait for any pending network requests to complete
  await page.waitForLoadState("networkidle", { timeout });
}
