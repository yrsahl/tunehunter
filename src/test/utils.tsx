import { TooltipProvider } from "@/components/ui/tooltip";
import { render, type RenderOptions } from "@testing-library/react";
export * from "@testing-library/react";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider>{children}</TooltipProvider>
);

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: Wrapper, ...options });

export { customRender as render };
