import { fireEvent, render, screen } from "@/test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FavoritesStatusIcon from "../FavoritesStatusIcon";

const mockUseFavorites = vi.fn();

vi.mock("@/hooks/useFavorites", () => ({
  default: () => mockUseFavorites(),
}));

describe("FavoritesStatusIcon", () => {
  beforeEach(() => {
    mockUseFavorites.mockReset();
  });

  it("renders add button and calls addToFavorites when song is not on favorites", () => {
    const addToFavorites = vi.fn();
    const removeFromFavorites = vi.fn();

    mockUseFavorites.mockReturnValue({
      isOnFavorites: () => false,
      addToFavorites,
      removeFromFavorites,
    });

    render(<FavoritesStatusIcon songId="song-1" />);

    const addButton = screen.getByTestId("favorites-button");
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(addToFavorites).toHaveBeenCalledWith("song-1");
    expect(removeFromFavorites).not.toHaveBeenCalled();
  });

  it("renders remove button and calls removeFromFavorites when song is on favorites", () => {
    const addToFavorites = vi.fn();
    const removeFromFavorites = vi.fn();

    mockUseFavorites.mockReturnValue({
      isOnFavorites: () => true,
      addToFavorites,
      removeFromFavorites,
    });

    render(<FavoritesStatusIcon songId="song-2" />);

    const removeButton = screen.getByTestId("favorites-remove-button");
    expect(removeButton).toBeInTheDocument();

    fireEvent.click(removeButton);
    expect(removeFromFavorites).toHaveBeenCalledWith("song-2");
    expect(addToFavorites).not.toHaveBeenCalled();
  });
});
