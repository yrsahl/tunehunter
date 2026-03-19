import { CountryCode } from "@/lib/validators";
import { create } from "zustand";

interface SearchState {
  input: string;
  id: string | null;
  region: CountryCode | null;
  songTitle: string | null;
  songArtist: string | null;
}

interface RouteSearchParams {
  id: string;
  region: CountryCode;
  artist: string;
  title: string;
}

export interface SelectedSearchParams {
  id: string;
  region: CountryCode;
  artist: string;
  title: string;
}

export const SEARCH_SUBMITTED = "searchSubmitted";

// Separate from SearchProvider to give access to components outside of SearchProvider's scope
interface SearchStoreState {
  searchState: SearchState;
  pendingSearch: string | null;
  setSearchInput: (input: string) => void;
  setPendingSearch: (value: string | null) => void;
  setSelectedSearch: (params: SelectedSearchParams) => void;
  syncRouteSearch: (params: RouteSearchParams) => boolean;
  clearRouteBackedSearch: () => boolean;
}

const useSearchStore = create<SearchStoreState>((set) => ({
  searchState: {
    input: "",
    id: null,
    region: null,
    songTitle: null,
    songArtist: null,
  },
  pendingSearch: null,
  setSearchInput: (input) => set((state) => ({ searchState: { ...state.searchState, input } })),
  setPendingSearch: (value) => set({ pendingSearch: value }),
  setSelectedSearch: ({ id, region, artist, title }) =>
    set((state) => ({
      searchState: {
        ...state.searchState,
        id,
        region,
        songArtist: artist,
        songTitle: title,
        input: `${artist} - ${title}`,
      },
    })),
  syncRouteSearch: ({ id, region, artist, title }) => {
    const routeInput = `${artist} - ${title}`;
    let hasChanged = false;

    set((state) => {
      const { searchState } = state;
      hasChanged =
        searchState.id !== id ||
        searchState.region !== region ||
        searchState.songArtist !== artist ||
        searchState.songTitle !== title;

      if (!hasChanged) {
        return state;
      }

      return {
        ...state,
        searchState: {
          ...searchState,
          id,
          region,
          songArtist: artist,
          songTitle: title,
          input: routeInput,
        },
        pendingSearch: routeInput,
      };
    });

    return hasChanged;
  },
  clearRouteBackedSearch: () => {
    let hasRouteBackedSearch = false;

    set((state) => {
      const { searchState } = state;
      hasRouteBackedSearch =
        !!searchState.id ||
        !!searchState.region ||
        !!searchState.songArtist ||
        !!searchState.songTitle;

      if (!hasRouteBackedSearch) {
        return state;
      }

      return {
        ...state,
        searchState: {
          ...searchState,
          id: null,
          region: null,
          songArtist: null,
          songTitle: null,
          input: "",
        },
        pendingSearch: null,
      };
    });

    return hasRouteBackedSearch;
  },
}));

export default useSearchStore;
