import { create } from "zustand";
import { persist } from "zustand/middleware";

const CURRENT_YEAR = new Date().getFullYear();

export const LENGTH_MIN = 1;
export const LENGTH_MAX = 900;
export const LENGTH_RANGE_DEFAULT: [number, number] = [120, 600];

export const YEAR_MIN = 1950;
export const YEAR_MAX = CURRENT_YEAR;
export const YEAR_RANGE_DEFAULT: [number, number] = [2000, CURRENT_YEAR];

export type VersionFilter = "all" | "originals" | "remixes" | "extended";

export type SearchSettings = {
  versionFilter: VersionFilter;
  lengthFilter: boolean;
  lengthRange: [number, number];
  yearFilter: boolean;
  yearRange: [number, number];
};

type SearchSettingsStore = SearchSettings & {
  setVersionFilter: (value: VersionFilter) => void;
  setLengthFilter: (value: boolean) => void;
  setLengthRange: (value: [number, number]) => void;
  setYearFilter: (value: boolean) => void;
  setYearRange: (value: [number, number]) => void;
};

export const useSearchSettingsStore = create<SearchSettingsStore>()(
  persist(
    (set) => ({
      versionFilter: "all",
      lengthFilter: false,
      lengthRange: LENGTH_RANGE_DEFAULT,
      yearFilter: false,
      yearRange: YEAR_RANGE_DEFAULT,
      setVersionFilter: (value) => set({ versionFilter: value }),
      setLengthFilter: (value) => set({ lengthFilter: value }),
      setLengthRange: (value) => set({ lengthRange: value }),
      setYearFilter: (value) => set({ yearFilter: value }),
      setYearRange: (value) => set({ yearRange: value }),
    }),
    {
      name: "search-settings",
    },
  ),
);
