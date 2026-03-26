import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SearchSettings = {
  searchForClubMixesOnly: boolean;
  minimumLengthOption: boolean;
  minimumLengthSeconds: number;
};

type SearchSettingsStore = SearchSettings & {
  setSearchForClubMixesOnly: (value: boolean) => void;
  setMinimumLengthOption: (value: boolean) => void;
  setMinimumLengthSeconds: (value: number) => void;
};

export const useSearchSettingsStore = create<SearchSettingsStore>()(
  persist(
    (set) => ({
      searchForClubMixesOnly: false,
      minimumLengthOption: false,
      minimumLengthSeconds: 120,
      setSearchForClubMixesOnly: (value: boolean) => set({ searchForClubMixesOnly: value }),
      setMinimumLengthOption: (value: boolean) => set({ minimumLengthOption: value }),
      setMinimumLengthSeconds: (value: number) => set({ minimumLengthSeconds: value }),
    }),
    {
      name: "search-settings",
    },
  ),
);
