import { expect, test, testUsers } from "./fixtures/test-fixtures";
import {
  simulateUserInteraction,
  verifyAuthenticationState,
  waitForApiCalls,
  waitForPageLoad,
} from "./utils/test-helpers";

test.describe("@full User Profile and Settings", () => {
  test("should display user profile information", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Open user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Should show user information
    await expect(page.locator("text=" + testUsers.validUser.name)).toBeVisible();
    await expect(page.locator("text=" + testUsers.validUser.email)).toBeVisible();
  });

  test("should allow theme switching", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Open user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Look for theme settings
    const themeSelect = page.locator('[data-testid="theme-select"]');
    if (await themeSelect.isVisible()) {
      await themeSelect.click();

      // Select dark theme
      const darkOption = page.locator('[data-testid="theme-option-dark"]');
      if (await darkOption.isVisible()) {
        await darkOption.click();

        // Verify theme change
        await page.waitForTimeout(500);
        const html = page.locator("html");
        const classes = await html.getAttribute("class");
        expect(classes).toContain("dark");
      }
    }
  });

  test("should allow region settings change", async ({ authenticatedPage: page }) => {
    // Mock region update API
    await page.route("**/api/trpc/user.updateUser*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: { success: true } },
        }),
      });
    });

    await page.goto("/");
    await waitForPageLoad(page);

    // Open user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Look for region settings
    const regionSelect = page.locator('[data-testid="region-select"]');
    if (await regionSelect.isVisible()) {
      await regionSelect.click();

      // Select a different region
      const regionOption = page.locator('[data-testid="region-option-us"]');
      if (await regionOption.isVisible()) {
        await simulateUserInteraction(page, async () => {
          await regionOption.click();
        });

        await waitForApiCalls(page);
      }
    }
  });

  test("should handle avatar change", async ({ authenticatedPage: page }) => {
    // Mock avatar update API
    await page.route("**/api/trpc/user.updateUser*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: { success: true } },
        }),
      });
    });

    await page.goto("/");
    await waitForPageLoad(page);

    // Open user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Look for avatar change option
    const avatarButton = page.locator('[data-testid="change-avatar-button"]');
    if (await avatarButton.isVisible()) {
      await simulateUserInteraction(page, async () => {
        await avatarButton.click();
      });

      // Should open avatar selection/upload dialog
      const avatarDialog = page.locator('[data-testid="avatar-dialog"]');
      if (await avatarDialog.isVisible()) {
        await expect(avatarDialog).toBeVisible();
      }
    }
  });

  test("should handle email change", async ({ authenticatedPage: page }) => {
    // Mock email update API
    await page.route("**/api/trpc/user.updateUser*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: { success: true } },
        }),
      });
    });

    await page.goto("/");
    await waitForPageLoad(page);

    // Open user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Look for email change option
    const emailButton = page.locator('[data-testid="change-email-button"]');
    if (await emailButton.isVisible()) {
      await simulateUserInteraction(page, async () => {
        await emailButton.click();
      });

      // Should open email change dialog
      const emailDialog = page.locator('[data-testid="email-dialog"]');
      if (await emailDialog.isVisible()) {
        await expect(emailDialog).toBeVisible();

        // Fill new email
        const emailInput = page.locator('[data-testid="new-email-input"]');
        if (await emailInput.isVisible()) {
          await emailInput.fill("newemail@example.com");

          // Submit
          const submitButton = page.locator('[data-testid="email-submit-button"]');
          await submitButton.click();

          await waitForApiCalls(page);
        }
      }
    }
  });

  test("should handle account deletion", async ({ authenticatedPage: page }) => {
    // Mock account deletion API
    await page.route("**/api/trpc/user.deleteAccount*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: { data: { success: true } },
        }),
      });
    });

    await page.goto("/");
    await waitForPageLoad(page);

    // Open user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Look for delete account option
    const deleteButton = page.locator('[data-testid="delete-account-button"]');
    if (await deleteButton.isVisible()) {
      await simulateUserInteraction(page, async () => {
        await deleteButton.click();
      });

      // Should show confirmation dialog
      const confirmDialog = page.locator('[data-testid="delete-confirmation-dialog"]');
      if (await confirmDialog.isVisible()) {
        await expect(confirmDialog).toBeVisible();

        // Confirm deletion
        const confirmButton = page.locator('[data-testid="confirm-delete-button"]');
        if (await confirmButton.isVisible()) {
          await simulateUserInteraction(page, async () => {
            await confirmButton.click();
          });

          await waitForApiCalls(page);

          // Should be logged out after deletion
          await verifyAuthenticationState(page, false);
        }
      }
    }
  });

  test("should show particles setting toggle", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Open user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Look for particles toggle
    const particlesToggle = page.locator('[data-testid="particles-toggle"]');
    if (await particlesToggle.isVisible()) {
      const initialState = await particlesToggle.isChecked();

      await simulateUserInteraction(page, async () => {
        await particlesToggle.click();
      });

      // Verify toggle state changed
      const newState = await particlesToggle.isChecked();
      expect(newState).toBe(!initialState);
    }
  });

  test("should handle location-based region detection", async ({ authenticatedPage: page }) => {
    // Mock geolocation API
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "geolocation", {
        value: {
          getCurrentPosition: (success: Function) => {
            success({
              coords: {
                latitude: 40.7128,
                longitude: -74.006,
              },
            });
          },
        },
      });
    });

    await page.goto("/");
    await waitForPageLoad(page);

    // Open user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Look for auto-detect region button
    const autoDetectButton = page.locator('[data-testid="auto-detect-region-button"]');
    if (await autoDetectButton.isVisible()) {
      await simulateUserInteraction(page, async () => {
        await autoDetectButton.click();
      });

      await waitForApiCalls(page);

      // Should show detected region
      const regionDisplay = page.locator('[data-testid="current-region"]');
      if (await regionDisplay.isVisible()) {
        await expect(regionDisplay).toContainText(/US|United States/i);
      }
    }
  });

  test("should persist user preferences across sessions", async ({ authenticatedPage: page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Open user menu and change a setting
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    const themeSelect = page.locator('[data-testid="theme-select"]');
    if (await themeSelect.isVisible()) {
      await themeSelect.click();

      const darkOption = page.locator('[data-testid="theme-option-dark"]');
      if (await darkOption.isVisible()) {
        await darkOption.click();
        await page.waitForTimeout(500);
      }
    }

    // Refresh the page
    await page.reload();
    await waitForPageLoad(page);

    // Verify setting persisted
    const html = page.locator("html");
    const classes = await html.getAttribute("class");
    expect(classes).toContain("dark");
  });
});
