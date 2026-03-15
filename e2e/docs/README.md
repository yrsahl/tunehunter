# E2E Testing with Playwright

This directory contains end-to-end tests for the TuneHunter application using Playwright.

## Test Structure

### Test Files

- **`home.spec.ts`** - Tests for the main home page functionality
- **`authentication.spec.ts`** - Tests for user authentication flows
- **`search.spec.ts`** - Tests for search functionality
- **`spotify-integration.spec.ts`** - Tests for Spotify integration features
- **`user-profile.spec.ts`** - Tests for user profile and settings
- **`wishlist.spec.ts`** - Tests for wishlist functionality

### Fixtures and Utilities

- **`fixtures/test-fixtures.ts`** - Custom test fixtures with authenticated users and mock data
- **`utils/test-helpers.ts`** - Utility functions for common test operations

## Running Tests

### Prerequisites

1. Install dependencies:

   ```bash
   bun install
   ```

2. Install Playwright browsers:
   ```bash
   bunx playwright install
   ```

### Running E2E Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run smoke test suite
bun run test:e2e:smoke

# Debug tests step by step
bunx playwright test --debug

# Show test results report
bunx playwright show-report
```

### Running Specific Tests

```bash
# Run tests for a specific file
bunx playwright test home.spec.ts

# Run tests matching a pattern
bunx playwright test --grep "authentication"

# Run tests for specific browser
bunx playwright test --project=chromium
```

## Test Configuration

The test configuration is defined in `playwright.config.ts` with the following features:

- **Cross-browser testing**: Tests run on Chromium, Firefox, and WebKit
- **Mobile testing**: Tests run on mobile viewports
- **Automatic server startup**: Dev server starts automatically before tests
- **Screenshots and videos**: Captured on test failures
- **Parallel execution**: Tests run in parallel for faster execution

## Writing Tests

### Test Fixtures

The test suite includes custom fixtures for different user states:

```typescript
import { test, expect } from "../fixtures/test-fixtures";

// Test with authenticated user
test("should work for authenticated users", async ({ authenticatedPage: page }) => {
  // Your test code here
});

// Test with Spotify-connected user
test("should work with Spotify", async ({ spotifyConnectedPage: page }) => {
  // Your test code here
});
```

### Test Helpers

Use the provided helper functions for common operations:

```typescript
import { waitForPageLoad, performSearch, verifyAuthenticationState } from "../utils/test-helpers";

test("example test", async ({ page }) => {
  await page.goto("/");
  await waitForPageLoad(page);
  await performSearch(page, "Bohemian Rhapsody");
  await verifyAuthenticationState(page, true);
});
```

### Data Test IDs

Tests rely on `data-testid` attributes in the application. Ensure these are added to key UI elements:

```tsx
// Example component with test IDs
<input data-testid="search-input" />
<button data-testid="login-button">Login</button>
<div data-testid="search-results">Results</div>
```

### Mock APIs

Tests mock external API calls to ensure reliability:

```typescript
// Mock Spotify API
await page.route("**/api/spotify/**", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data: "mock response" }),
  });
});
```

## Test Coverage

The E2E tests cover the following user flows:

### 🏠 **Home Page**

- Page loading and basic UI
- Search input functionality
- Responsive design
- Theme switching

### 🔐 **Authentication**

- Login/logout flows
- Session persistence
- Authentication callbacks
- Error handling

### 🔍 **Search**

- Basic search functionality
- Empty results handling
- API error handling
- Loading states
- Special characters
- Search suggestions

### 🎵 **Spotify Integration**

- Connection/disconnection flows
- Recently played tracks
- Top tracks
- Current queue
- Player controls
- API error handling

### 👤 **User Profile**

- Profile information display
- Theme settings
- Region settings
- Avatar changes
- Email changes
- Account deletion
- Preference persistence

### ❤️ **Wishlist**

- Adding/removing songs
- Unauthenticated user behavior
- Wishlist display
- Filtering and sorting
- API error handling

## Best Practices

### 1. Use Page Object Pattern

For complex pages, consider creating page objects:

```typescript
class SearchPage {
  constructor(private page: Page) {}

  async search(query: string) {
    await this.page.fill('[data-testid="search-input"]', query);
    await this.page.press('[data-testid="search-input"]', "Enter");
  }

  async getResults() {
    return this.page.locator('[data-testid="search-results"]');
  }
}
```

### 2. Wait for Elements Properly

```typescript
// Good - wait for element to be visible
await expect(page.locator('[data-testid="results"]')).toBeVisible();

// Avoid - hard timeouts
await page.waitForTimeout(5000);
```

### 3. Mock External Dependencies

Always mock external APIs and services to ensure test reliability:

```typescript
await page.route("**/api/external-service/**", async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify(mockData),
  });
});
```

### 4. Test Error States

Don't just test happy paths - test error conditions:

```typescript
// Mock API error
await page.route("**/api/**", async (route) => {
  await route.fulfill({ status: 500 });
});

// Verify error handling
await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
```

### 5. Keep Tests Independent

Each test should be able to run independently:

```typescript
test.beforeEach(async ({ page }) => {
  // Set up clean state for each test
  await page.goto("/");
});
```

## Debugging Tests

### 1. Run in Debug Mode

```bash
bunx playwright test --debug
```

This opens the Playwright Inspector for step-by-step debugging.

### 2. Screenshots and Videos

Failed tests automatically capture screenshots and videos. Find them in:

- `test-results/` directory
- HTML report accessible via `bunx playwright show-report`

### 3. Console Logs

Add console.log in tests or check browser console:

```typescript
// In test
console.log("Current URL:", page.url());

// Check browser console
page.on("console", (msg) => console.log(msg.text()));
```

### 4. Slow Motion

Run tests in slow motion to see what's happening:

```typescript
// In playwright.config.ts
use: {
  launchOptions: {
    slowMo: 1000, // 1 second delay between actions
  },
},
```

## CI/CD Integration

The tests are configured to run in CI environments:

```yaml
# Example GitHub Actions workflow
- name: Run E2E tests
  run: bun run test:e2e
  env:
    CI: true
```

In CI mode:

- Tests run with retries (2 retries on failure)
- Runs in single worker mode for stability
- Fails build if any tests fail

## Adding New Tests

When adding new features to the application:

1. **Add data-testid attributes** to new UI elements
2. **Create corresponding E2E tests** in the appropriate spec file
3. **Mock any new API endpoints** used by the feature
4. **Update test fixtures** if new user states are needed
5. **Add helper functions** for reusable operations

## Troubleshooting

### Common Issues

1. **Tests timeout**: Increase timeout or wait for proper loading states
2. **Flaky tests**: Add proper waits and avoid hard timeouts
3. **Missing elements**: Ensure data-testid attributes are present
4. **API errors**: Check that all external APIs are properly mocked

### Getting Help

- Check Playwright documentation: https://playwright.dev/
- Review test output and screenshots in `test-results/`
- Use debug mode to step through failing tests
- Check browser console for JavaScript errors
