import { create } from "zustand";
import { persist } from "zustand/middleware";

type SearchSettingsStore = {
  searchForClubMixesOnly: boolean;
  minimumLengthOption: boolean;
  minimumLengthSeconds: number;
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
      name: "search-settings", // name of the item in the storage (must be unique)
    },
  ),
);
