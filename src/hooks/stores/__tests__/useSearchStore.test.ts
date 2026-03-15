import useSearchStore from "@/hooks/stores/useSearchStore";
import { beforeEach, describe, expect, it } from "vitest";

const resetSearchStore = () => {
  useSearchStore.setState({
    searchState: {
      input: "",
      id: null,
      region: null,
      songTitle: null,
      songArtist: null,
    },
    pendingSearch: null,
  });
};

describe("useSearchStore", () => {
  beforeEach(() => {
    resetSearchStore();
  });

  it("starts with the expected initial state", () => {
    const state = useSearchStore.getState();

    expect(state.searchState).toEqual({
      input: "",
      id: null,
      region: null,
      songTitle: null,
      songArtist: null,
    });
    expect(state.pendingSearch).toBeNull();
  });

  it("updates only the input when setSearchInput is called", () => {
    const { setSelectedSearch, setSearchInput } = useSearchStore.getState();

    setSelectedSearch({
      id: "song-1",
      region: "US",
      artist: "Queen",
      title: "Bohemian Rhapsody",
    });
    setSearchInput("Adele - Hello");

    const state = useSearchStore.getState();
    expect(state.searchState.input).toBe("Adele - Hello");
    expect(state.searchState.id).toBe("song-1");
    expect(state.searchState.region).toBe("US");
    expect(state.searchState.songArtist).toBe("Queen");
    expect(state.searchState.songTitle).toBe("Bohemian Rhapsody");
  });

  it("sets selected search fields atomically", () => {
    const { setSelectedSearch } = useSearchStore.getState();

    setSelectedSearch({
      id: "song-42",
      region: "DE",
      artist: "Daft Punk",
      title: "One More Time",
    });

    const state = useSearchStore.getState();
    expect(state.searchState).toEqual({
      input: "Daft Punk - One More Time",
      id: "song-42",
      region: "DE",
      songArtist: "Daft Punk",
      songTitle: "One More Time",
    });
  });

  it("syncRouteSearch updates state and sets pendingSearch when route search changed", () => {
    const { syncRouteSearch } = useSearchStore.getState();

    const hasChanged = syncRouteSearch({
      id: "song-100",
      region: "GB",
      artist: "Coldplay",
      title: "Yellow",
    });

    const state = useSearchStore.getState();
    expect(hasChanged).toBe(true);
    expect(state.searchState.input).toBe("Coldplay - Yellow");
    expect(state.searchState.id).toBe("song-100");
    expect(state.searchState.region).toBe("GB");
    expect(state.searchState.songArtist).toBe("Coldplay");
    expect(state.searchState.songTitle).toBe("Yellow");
    expect(state.pendingSearch).toBe("Coldplay - Yellow");
  });

  it("syncRouteSearch returns false and clearRouteBackedSearch works as expected", () => {
    const { syncRouteSearch, clearRouteBackedSearch } = useSearchStore.getState();

    syncRouteSearch({
      id: "song-500",
      region: "US",
      artist: "Eminem",
      title: "Lose Yourself",
    });

    const noChange = syncRouteSearch({
      id: "song-500",
      region: "US",
      artist: "Eminem",
      title: "Lose Yourself",
    });
    expect(noChange).toBe(false);

    const cleared = clearRouteBackedSearch();
    expect(cleared).toBe(true);

    const afterClear = useSearchStore.getState();
    expect(afterClear.searchState).toEqual({
      input: "",
      id: null,
      region: null,
      songTitle: null,
      songArtist: null,
    });
    expect(afterClear.pendingSearch).toBeNull();

    const clearAgain = useSearchStore.getState().clearRouteBackedSearch();
    expect(clearAgain).toBe(false);
  });
});
