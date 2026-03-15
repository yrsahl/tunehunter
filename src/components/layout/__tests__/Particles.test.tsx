import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Particles from "../Particles";

vi.mock("@/hooks/useMousePosition", () => ({
  useMousePosition: () => ({ x: 0, y: 0 }),
}));

describe("Particles", () => {
  let rafIdCounter = 0;
  let lastRafId = 0;

  beforeEach(() => {
    rafIdCounter = 0;
    lastRafId = 0;

    // jsdom doesn't implement canvas — stub getContext so guards don't throw
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      lastRafId = ++rafIdCounter;
      // Don't actually invoke cb — we don't want a real loop in tests
      return lastRafId;
    });

    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("cancels the animation frame on unmount", () => {
    const { unmount } = render(<Particles />);

    // At this point requestAnimationFrame was called once during mount
    expect(window.requestAnimationFrame).toHaveBeenCalled();
    const idThatWasScheduled = lastRafId;

    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(idThatWasScheduled);
  });

  it("renders a canvas element", () => {
    const { container } = render(<Particles />);
    expect(container.querySelector("canvas")).not.toBeNull();
  });
});
