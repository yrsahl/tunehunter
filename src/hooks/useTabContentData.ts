import { Tab } from "@/components/interactive/Search/SearchTabBar";
import { useState } from "react";

const useTabContentData = (tab: Tab) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return {
    data,
    isLoading,
  };
};

export default useTabContentData;
