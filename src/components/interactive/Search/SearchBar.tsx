import IconButton from "@/components/IconButton";
import { LoadingIndicator } from "@/components/Indicators";
import { Input } from "@/components/ui/input";
import { fadeInAndOut } from "@/helpers/animations";
import { cn } from "@/lib/utils";
import { SpotifySearchData } from "@/types/spotify";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import {
  FormEvent,
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  useEffect,
  useState,
} from "react";
const SearchSettings = dynamic(() => import("@/components/interactive/Search/SearchSettings"), {
  ssr: false,
});

const placeholderValues = [
  "Celine Dion - My Heart Will Go On",
  "Michael Jackson - Thriller",
  "Queen - Bohemian Rhapsody",
  "The Beatles - Hey Jude",
  "Elton John - Your Song",
  "Adele - Someone Like You",
  "Ed Sheeran - Shape of You",
  "Taylor Swift - Love Story",
  "Lady Gaga - Bad Romance",
  "Ariana Grande - 7 Rings",
];

interface ISearchBarProps {
  searchInput: string;
  searchData: SpotifySearchData | null;
  isSearchDataLoading: boolean;
  handleSearchSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetSearch: () => void;
  showResults: boolean;
  children?: ReactNode;
}

const SearchBar: ForwardRefRenderFunction<HTMLDivElement, ISearchBarProps> = (
  {
    searchInput,
    searchData,
    isSearchDataLoading,
    handleSearchSubmit,
    handleInputChange,
    resetSearch,
    showResults,
    children,
  }: ISearchBarProps,
  ref,
) => {
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");

  // Puts a random placeholder song value into the search bar
  useEffect(() => {
    const rndPlaceholderIndex = Math.floor(Math.random() * placeholderValues.length);
    const rndPlaceholder = placeholderValues[rndPlaceholderIndex];
    setCurrentPlaceholder(rndPlaceholder!);
  }, []);

  return (
    <div ref={ref} className="relative w-[36rem]">
      <form
        className="relative mx-auto flex w-full flex-col items-center"
        onSubmit={handleSearchSubmit}
      >
        <Input
          type="text"
          placeholder={currentPlaceholder}
          sizeVariant="lg"
          className={cn(
            "overflow-ellipsis border-2 border-primary px-14 text-lg ring-0 transition-all duration-300 placeholder:text-muted-foreground focus-visible:ring-0",
            searchData && showResults && "rounded-b-none border-b-0",
          )}
          value={searchInput}
          onChange={handleInputChange}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2">
          <AnimatePresence>
            {isSearchDataLoading && (
              <motion.div
                className="flex h-8 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingIndicator size={20} />
              </motion.div>
            )}
            {!isSearchDataLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Search />
              </motion.div>
            )}
          </AnimatePresence>
        </span>
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 gap-2">
          <AnimatePresence>
            {searchData && showResults && (
              <motion.div {...fadeInAndOut()}>
                <IconButton icon="x" size="icon" variant="ghostDestructive" onClick={resetSearch} />
              </motion.div>
            )}
          </AnimatePresence>
          <SearchSettings />
        </div>
      </form>
      {children}
    </div>
  );
};

export default forwardRef(SearchBar);
