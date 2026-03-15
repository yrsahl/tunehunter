import { CountryCode } from "@/lib/validators";
import { create } from "zustand";

interface SearchState {
  input: string;
  id: string | null;
  region: CountryCode | null;
  songTitle: string | null;
  songArtist: string | null;
}

// Separate from SearchProvider to give access to components outside of SearchProvider's scope
interface SearchStoreState {
  searchState: SearchState;
  pendingSearch: string | null;
  setSearchInput: (input: string) => void;
  setSearchId: (id: string | null) => void;
  setSearchRegion: (region: CountryCode | null) => void;
  setSearchSongTitle: (title: string | null) => void;
  setSearchSongArtist: (artist: string | null) => void;
  setPendingSearch: (value: string | null) => void;
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
  setSearchId: (id) => set((state) => ({ searchState: { ...state.searchState, id } })),
  setSearchRegion: (region) => set((state) => ({ searchState: { ...state.searchState, region } })),
  setSearchSongTitle: (title) =>
    set((state) => ({ searchState: { ...state.searchState, songTitle: title } })),
  setSearchSongArtist: (artist) =>
    set((state) => ({ searchState: { ...state.searchState, songArtist: artist } })),
  setPendingSearch: (value) => set({ pendingSearch: value }),
}));

export default useSearchStore;
