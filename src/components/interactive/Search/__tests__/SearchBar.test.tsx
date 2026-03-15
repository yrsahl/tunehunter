import { fireEvent, render, screen } from "@/test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SearchBar from "../SearchBar";

let mockShowQueries = false;
let mockQueryData: unknown = null;
const mockSetShowQueries = vi.fn();
const mockHandleSearchSubmit = vi.fn((e?: Event) => e?.preventDefault?.());
const mockHandleInputChange = vi.fn();
const mockResetSearch = vi.fn();
let mockSearchState = { input: "" };
let mockSearchSettings = {
  searchForClubMixesOnly: false,
  minimumLengthOption: "none",
  minimumLengthSeconds: 0,
};

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

vi.mock("@/hooks/useSearch", () => ({
  default: () => ({
    handleSearchSubmit: mockHandleSearchSubmit,
    handleInputChange: mockHandleInputChange,
    resetSearch: mockResetSearch,
  }),
}));

vi.mock("@/hooks/stores/useSearchStore", () => ({
  default: () => ({ searchState: mockSearchState }),
}));

vi.mock("@/contexts/QueryDataContext", () => ({
  useQueryDataContext: () => ({
    showQueries: mockShowQueries,
    setShowQueries: mockSetShowQueries,
    queryData: mockQueryData,
    isQueryDataLoading: false,
  }),
}));

vi.mock("@/hooks/stores/useSearchSettingsStore", () => ({
  useSearchSettingsStore: () => mockSearchSettings,
}));

describe("SearchBar", () => {
  beforeEach(() => {
    mockShowQueries = false;
    mockQueryData = null;
    mockSearchState = { input: "" };
    mockSearchSettings = {
      searchForClubMixesOnly: false,
      minimumLengthOption: "none",
      minimumLengthSeconds: 0,
    };

    mockSetShowQueries.mockReset();
    mockHandleSearchSubmit.mockReset();
    mockHandleInputChange.mockReset();
    mockResetSearch.mockReset();
  });

  it("calls input and submit handlers", () => {
    render(<SearchBar />);

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "Daft Punk" } });
    expect(mockHandleInputChange).toHaveBeenCalled();

    const form = input.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    expect(mockHandleSearchSubmit).toHaveBeenCalled();
  });

  it("re-submits when search settings change and query data already exists", () => {
    const requestSubmitSpy = vi
      .spyOn(HTMLFormElement.prototype, "requestSubmit")
      .mockImplementation(() => undefined);

    mockQueryData = { tracks: { items: [] } };

    const { rerender } = render(<SearchBar />);

    expect(requestSubmitSpy).toHaveBeenCalledTimes(1);

    mockSearchSettings = {
      ...mockSearchSettings,
      minimumLengthSeconds: 180,
    };

    rerender(<SearchBar />);

    expect(requestSubmitSpy).toHaveBeenCalledTimes(2);
  });

  it("does not re-submit when query data is missing", () => {
    const requestSubmitSpy = vi
      .spyOn(HTMLFormElement.prototype, "requestSubmit")
      .mockImplementation(() => undefined);

    mockQueryData = null;

    const { rerender } = render(<SearchBar />);

    mockSearchSettings = {
      ...mockSearchSettings,
      searchForClubMixesOnly: true,
    };

    rerender(<SearchBar />);

    expect(requestSubmitSpy).not.toHaveBeenCalled();
  });
});
