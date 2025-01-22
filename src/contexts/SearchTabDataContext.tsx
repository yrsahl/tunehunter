import { createContext, ReactNode, useContext } from "react";

interface ISearchTabDataContext {
  trendingData: {
    data: null;
    isLoading: boolean;
  };
  spotifyData: {
    data: null;
    isLoading: boolean;
  };
  historyData: {
    data: null;
    isLoading: boolean;
  };
  wishlistData: {
    data: null;
    isLoading: boolean;
  };
}

const SearchDataContext = createContext<ISearchTabDataContext>({
  trendingData: {
    data: null,
    isLoading: false,
  },
  spotifyData: {
    data: null,
    isLoading: false,
  },
  historyData: {
    data: null,
    isLoading: false,
  },
  wishlistData: {
    data: null,
    isLoading: false,
  },
});

export const useSearchTabData = () => useContext(SearchDataContext);

export const SearchTabDataProvider = ({ children }: { children: ReactNode }) => {
  return {};
};
