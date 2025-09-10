import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock environment variables
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.NEXTAUTH_URL = "http://localhost:3000";
