import { api } from "@/utils/api";
import { render, RenderOptions } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import { ReactElement } from "react";

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const mockSession = {
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      language: "en",
      theme: "light",
      themeParticles: true,
      region: "us",
    },
    expires: "2099-01-01T00:00:00.000Z",
  };

  return <SessionProvider session={mockSession}>{children}</SessionProvider>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// For components that need tRPC, use this wrapper
const TRPCWrapper = ({ children }: { children: React.ReactNode }) => {
  const mockSession = {
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      language: "en",
      theme: "light",
      themeParticles: true,
      region: "us",
    },
    expires: "2099-01-01T00:00:00.000Z",
  };

  // Wrap with tRPC provider which includes React Query
  const TRPCComponent = () => <SessionProvider session={mockSession}>{children}</SessionProvider>;

  const WrappedComponent = api.withTRPC(TRPCComponent);
  return <WrappedComponent />;
};

const customRenderWithTRPC = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: TRPCWrapper, ...options });

export * from "@testing-library/react";
export { customRender as render, customRenderWithTRPC as renderWithTRPC };
