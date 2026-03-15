import { fireEvent, render, screen } from "@/test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WishlistStatusIcon from "../WishlistStatusIcon";

const mockUseWishlist = vi.fn();

vi.mock("@/hooks/useWishlist", () => ({
  default: () => mockUseWishlist(),
}));

describe("WishlistStatusIcon", () => {
  beforeEach(() => {
    mockUseWishlist.mockReset();
  });

  it("renders add button and calls addToWishlist when song is not on wishlist", () => {
    const addToWishlist = vi.fn();
    const removeFromWishlist = vi.fn();

    mockUseWishlist.mockReturnValue({
      isOnWishlist: () => false,
      addToWishlist,
      removeFromWishlist,
    });

    render(<WishlistStatusIcon songId="song-1" />);

    const addButton = screen.getByTestId("wishlist-button");
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(addToWishlist).toHaveBeenCalledWith("song-1");
    expect(removeFromWishlist).not.toHaveBeenCalled();
  });

  it("renders remove button and calls removeFromWishlist when song is on wishlist", () => {
    const addToWishlist = vi.fn();
    const removeFromWishlist = vi.fn();

    mockUseWishlist.mockReturnValue({
      isOnWishlist: () => true,
      addToWishlist,
      removeFromWishlist,
    });

    render(<WishlistStatusIcon songId="song-2" />);

    const removeButton = screen.getByTestId("wishlist-remove-button");
    expect(removeButton).toBeInTheDocument();

    fireEvent.click(removeButton);
    expect(removeFromWishlist).toHaveBeenCalledWith("song-2");
    expect(addToWishlist).not.toHaveBeenCalled();
  });
});
