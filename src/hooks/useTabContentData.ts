import { SearchTabType } from "@/components/interactive/Search/SearchTabBar";
import { useState } from "react";

const useTabContentData = (activeTab: SearchTabType, activeSubTab: string) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return {
    data,
    isLoading,
  };
};

export default useTabContentData;
