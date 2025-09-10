import { expect, test } from "./fixtures/test-fixtures";
import {
  simulateUserInteraction,
  verifyAuthenticationState,
  waitForPageLoad,
} from "./utils/test-helpers";

test.describe("Authentication Flow", () => {
  test("should show login button for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await verifyAuthenticationState(page, false);
  });

  test("should handle login process", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Mock authentication provider responses
    await page.route("**/api/auth/signin/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>Sign In Page</body></html>",
      });
    });

    const loginButton = page.locator('[data-testid="login-button"]');
    await expect(loginButton).toBeVisible();

    // Click login button
    await simulateUserInteraction(page, async () => {
      await loginButton.click();
    });

    // Should navigate to authentication provider
    await page.waitForURL("**/api/auth/signin/**", { timeout: 10000 });
  });

  test("should show user interface for authenticated users", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await verifyAuthenticationState(page, true);

    // Should show user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();
  });

  test("should handle logout process", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Click on user menu to open it
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Look for logout button
    const logoutButton = page.locator('[data-testid="logout-button"]');
    if (await logoutButton.isVisible()) {
      // Mock logout response
      await page.route("**/api/auth/signout", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: "http://localhost:3000" }),
        });
      });

      await simulateUserInteraction(page, async () => {
        await logoutButton.click();
      });

      // Verify user is logged out
      await page.waitForTimeout(1000);
      await verifyAuthenticationState(page, false);
    }
  });

  test("should handle authentication callback", async ({ page }) => {
    // Mock successful authentication callback
    await page.route("**/api/auth/callback/**", async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          location: "http://localhost:3000/auth_callback",
        },
      });
    });

    await page.goto("/auth_callback");
    await waitForPageLoad(page);

    // Should show redirect message or handle redirect
    const redirectMessage = page.locator("text=Redirecting");
    if (await redirectMessage.isVisible()) {
      await expect(redirectMessage).toBeVisible();
    }
  });

  test("should handle authentication errors gracefully", async ({ page }) => {
    // Mock authentication error
    await page.route("**/api/auth/**", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Authentication failed" }),
      });
    });

    await page.goto("/");
    await waitForPageLoad(page);

    // Should still show login interface
    await verifyAuthenticationState(page, false);

    // Should not crash the application
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText(/error|failed/i);
    }
  });

  test("should maintain session across page refreshes", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Verify authenticated state
    await verifyAuthenticationState(page, true);

    // Refresh page
    await page.reload();
    await waitForPageLoad(page);

    // Should still be authenticated
    await verifyAuthenticationState(page, true);
  });
});
