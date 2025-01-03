import {
  historySubTabs,
  spotifySubTabs,
  trendingSubTabs,
  wishlistSubTabs,
} from "@/components/interactive/Search/SearchTabContent";
import { useState } from "react";

type TabContentDataProps =
  | {
      tab: "trending";
      subTab: (typeof trendingSubTabs)[number];
    }
  | {
      tab: "spotify";
      subTab: (typeof spotifySubTabs)[number];
    }
  | {
      tab: "history";
      subTab: (typeof historySubTabs)[number];
    }
  | {
      tab: "wishlist";
      subTab: (typeof wishlistSubTabs)[number];
    };

const useTabContentData = ({ tab, subTab }: TabContentDataProps) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return {
    data,
    isLoading,
  };
};

export default useTabContentData;
