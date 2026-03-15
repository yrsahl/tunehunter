import { Page, expect } from "@playwright/test";

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle");
}

export async function waitForSearchToLoad(page: Page) {
  await page.waitForSelector('[data-testid="search-input"]', { timeout: 15000 });
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
}

export async function performSearch(page: Page, query: string) {
  const searchInput = page.locator('[data-testid="search-input"]');
  await searchInput.fill(query);
  await searchInput.press("Enter");
  await page.waitForTimeout(400);
}

export async function navigateToSearchTab(
  page: Page,
  tabName: "spotify" | "amazon" | "itunes" | "bandcamp",
) {
  const tabSelector = `[data-testid="search-tab-${tabName}"]`;
  await page.locator(tabSelector).click();
  await page.waitForTimeout(300);
}

export async function waitForSpotifyPlayer(page: Page) {
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
      return;
    };
  });
}

export async function mockSpotifyApi(page: Page) {
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

  await page.route("**/api/spotify/player/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
}

export async function verifyAuthenticationState(page: Page, shouldBeAuthenticated: boolean) {
  if (shouldBeAuthenticated) {
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="login-button"]')).not.toBeVisible();
  } else {
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  }
}

export async function verifySpotifyConnectionState(page: Page, shouldBeConnected: boolean) {
  if (shouldBeConnected) {
    await expect(page.locator('[data-testid="spotify-connected"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="spotify-connect-button"]')).not.toBeVisible();
  } else {
    await expect(page.locator('[data-testid="spotify-connect-button"]')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator('[data-testid="spotify-connected"]')).not.toBeVisible();
  }
}

export async function simulateUserInteraction(
  page: Page,
  action: () => Promise<void>,
  delay = 100,
) {
  void page;
  await new Promise((resolve) => setTimeout(resolve, delay));
  await action();
  await new Promise((resolve) => setTimeout(resolve, delay));
}

export async function takeDebugScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/debug-screenshots/${name}.png`, fullPage: true });
}

export async function verifyBasicAccessibility(page: Page) {
  const mainContent = page.locator('main, [role="main"]');
  await expect(mainContent).toBeVisible();

  const h1Count = await page.locator("h1").count();
  expect(h1Count).toBeLessThanOrEqual(1);
}

export async function waitForApiCalls(page: Page, timeout = 5000) {
  await page.waitForLoadState("networkidle", { timeout });
}
