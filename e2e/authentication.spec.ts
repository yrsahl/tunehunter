import { expect, test } from "./fixtures/test-fixtures";
import { waitForPageLoad } from "./utils/test-helpers";

test.describe("@full Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/auth/providers**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          spotify: {
            id: "spotify",
            name: "Spotify",
            type: "oauth",
            signinUrl: "/api/auth/signin/spotify",
            callbackUrl: "/api/auth/callback/spotify",
          },
          email: {
            id: "email",
            name: "Email",
            type: "email",
            signinUrl: "/api/auth/signin/email",
            callbackUrl: "/api/auth/callback/email",
          },
        }),
      });
    });
  });

  test("should show login button for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toHaveCount(0);
  });

  test("should open auth modal and display sign in form", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    const loginButton = page.locator('[data-testid="login-button"]');
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    await expect(page.locator('[data-testid="auth-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="signin-email-button"]')).toBeDisabled();

    await page.locator('[data-testid="auth-email-input"]').fill("test@example.com");
    await expect(page.locator('[data-testid="signin-email-button"]')).toBeEnabled();
  });
});
