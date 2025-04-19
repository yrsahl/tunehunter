import { createContext, useContext } from "react";

interface ISearchDataContext {}

const SearchDataContext = createContext<ISearchDataContext>({});

export const useSearchDataContext = () => useContext(SearchDataContext);

export const SearchDataContextProvider = ({ children }: { children: React.ReactNode }) => {
  return <SearchDataContext.Provider value={{}}>{children}</SearchDataContext.Provider>;
};
