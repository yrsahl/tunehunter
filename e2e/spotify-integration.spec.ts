import { expect, test } from "./fixtures/test-fixtures";
import { waitForSearchToLoad } from "./utils/test-helpers";

test.describe("@full Spotify Access", () => {
  test("should keep spotify tab disabled when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const spotifyTab = page.getByRole("button", { name: /spotify/i });
    await expect(spotifyTab).toBeDisabled();

    await spotifyTab.click({ force: true });
    await expect(page).not.toHaveURL(/search=spotify/);
  });

  test("should keep spotify tab disabled for authenticated users without linked spotify", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/");
    await waitForSearchToLoad(page);

    const spotifyTab = page.getByRole("button", { name: /spotify/i });
    await expect(spotifyTab).toBeDisabled();

    await spotifyTab.click({ force: true });
    await expect(page).not.toHaveURL(/search=spotify/);
  });
});
