import { create } from "zustand";

interface DisabledTabStore {
  disabledTabButtonHovered: boolean;
  setDisabledTabButtonHovered: (value: boolean) => void;
}

export const useDisabledTabStore = create<DisabledTabStore>((set) => ({
  disabledTabButtonHovered: false,
  setDisabledTabButtonHovered: (value: boolean) => set({ disabledTabButtonHovered: value }),
}));
