import { SearchTab } from "@/components/interactive/Search/SearchTabs/SearchTabBar";
import { create } from "zustand";

interface ActiveSearchTabState {
  activeSearchTab: SearchTab | "";
  setActiveSearchTab: (tab: SearchTab | "") => void;
}

export const useActiveSearchTabStore = create<ActiveSearchTabState>((set) => ({
  activeSearchTab: "",
  setActiveSearchTab: (tab: SearchTab | "") => set({ activeSearchTab: tab }),
}));
