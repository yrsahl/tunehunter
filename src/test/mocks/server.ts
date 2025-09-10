import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Setup mock server with our request handlers
export const server = setupServer(...handlers);
