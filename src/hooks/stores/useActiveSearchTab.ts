import { SearchTab } from "@/components/interactive/Search/SearchTabs/SearchTabBar";
import { create } from "zustand";

interface ActiveSearchTabState {
  activeSearchTab: SearchTab | "";
  setActiveSearchTab: (tab: SearchTab | "") => void;
  tabContentHeight: string;
  setTabContentHeight: (h: string) => void;
}

export const useActiveSearchTabStore = create<ActiveSearchTabState>((set) => ({
  activeSearchTab: "",
  setActiveSearchTab: (tab: SearchTab | "") =>
    set({ activeSearchTab: tab, ...(tab === "" ? { tabContentHeight: "" } : {}) }),
  tabContentHeight: "",
  setTabContentHeight: (h: string) => set({ tabContentHeight: h }),
}));
