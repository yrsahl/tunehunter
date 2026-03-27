import { test as base, expect, Page } from "@playwright/test";

const testUsers = {
  validUser: {
    email: "test@example.com",
    name: "Test User",
  },
};

type TestFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.route("**/api/auth/session**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "test-user-id",
            email: testUsers.validUser.email,
            name: testUsers.validUser.name,
            image: null,
          },
          expires: "2999-01-01T00:00:00.000Z",
        }),
      });
    });

    await use(page);
  },
});

export { expect };
