import { useActiveSearchTabStore } from "@/hooks/stores/useActiveSearchTab";
import dynamic from "next/dynamic";
import SearchBar from "./SearchBar";
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
    <div className="flex w-full flex-col items-center gap-5">
      <SearchBar />
      <SearchTabBar activeSearchTab={activeSearchTab} setActiveSearchTab={setActiveSearchTab} />
    </div>
  );
};

export default Search;
