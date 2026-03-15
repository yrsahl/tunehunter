import { useActiveSearchTabStore } from "@/hooks/stores/useActiveSearchTab";
import dynamic from "next/dynamic";
import SearchBar from "./SearchBar";
import SearchProvider from "./SearchProvider";
const SearchTabBar = dynamic(
  () => import("@/components/interactive/Search/SearchTabs/SearchTabBar"),
  {
    ssr: false,
  },
);

interface SearchProps {}

const Search = ({}: SearchProps) => {
  const { activeSearchTab, setActiveSearchTab } = useActiveSearchTabStore();

  return (
    <SearchProvider>
      <div className="flex w-full flex-col items-center gap-5">
        <SearchBar />
        <SearchTabBar activeSearchTab={activeSearchTab} setActiveSearchTab={setActiveSearchTab} />
      </div>
    </SearchProvider>
  );
};

export default Search;
