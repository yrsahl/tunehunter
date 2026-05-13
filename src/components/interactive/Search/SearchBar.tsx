import IconButton from "@/components/IconButton";
import { Input } from "@/components/ui/input";
import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { useSearchSettingsStore } from "@/hooks/stores/useSearchSettingsStore";
import useSearchStore from "@/hooks/stores/useSearchStore";
import useSearch from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { fadeInAndOut } from "@/styles/animations";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import {
  createRef,
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const SearchQueries = dynamic(() => import("./SearchQueries"), {
  ssr: false,
});
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

interface ISearchBarProps {}

const SearchBar: ForwardRefRenderFunction<HTMLDivElement, ISearchBarProps> = () => {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    "Search for a track to compare prices…",
  );
  const { handleSearchSubmit, handleInputChange, resetSearch } = useSearch();
  const { searchState } = useSearchStore();
  const { showQueries, setShowQueries, queryData, isQueryDataLoading, lastQuery, requestQueryData } =
    useQueryDataContext();
  const formRef = createRef<HTMLFormElement>();
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchSettingsIconRef = useRef<HTMLDivElement>(null);
  const searchSettingsWindowRef = useRef<HTMLDivElement>(null);

  // First-time visitors see the descriptive placeholder; returning visitors see a random song
  useIsomorphicLayoutEffect(() => {
    if (localStorage.getItem("th_visited")) {
      const rndPlaceholderIndex = Math.floor(Math.random() * placeholderValues.length);
      setCurrentPlaceholder(placeholderValues[rndPlaceholderIndex]!);
    } else {
      localStorage.setItem("th_visited", "1");
    }
  }, []);

  // Trigger form submit when settings change
  const searchSettings = useSearchSettingsStore();
  useEffect(() => {
    if (!queryData) return;
    formRef.current?.requestSubmit();
  }, [...Object.values(searchSettings)]);

  // When the dropdown re-opens, refresh queries if the input changed since the last query
  // (e.g. after a song was selected, the input becomes "Artist - Title" but queryData is stale)
  const refreshRef = useRef({ input: searchState.input, lastQuery, searchSettings, requestQueryData });
  refreshRef.current = { input: searchState.input, lastQuery, searchSettings, requestQueryData };
  useEffect(() => {
    const { input, lastQuery, searchSettings, requestQueryData } = refreshRef.current;
    if (showQueries && input && input !== lastQuery) {
      void requestQueryData(input, searchSettings);
    }
  }, [showQueries]);

  // Show queries depending on click inside or outside of search bar
  const handleClickSearchBar = (event: MouseEvent) => {
    if (!searchBarRef.current || !searchSettingsIconRef.current) return; // No refs

    // Do nothing if click is on options icon or on options window
    if (
      searchSettingsIconRef.current.contains(event.target as Node) ||
      searchSettingsWindowRef?.current?.contains(event.target as Node)
    ) {
      return;
    }

    // If click is placed within search bar, show results
    if (searchBarRef.current.contains(event.target as Node)) {
      setShowQueries(true);
    }
    if (!searchBarRef.current.contains(event.target as Node)) {
      setShowQueries(false);
    }
  };

  // Add and remove event listeners
  useEffect(() => {
    document.addEventListener("mousedown", handleClickSearchBar);
    return () => {
      document.removeEventListener("mousedown", handleClickSearchBar);
    };
  }, []);

  return (
    <div ref={searchBarRef} className="relative w-full max-w-[36rem]">
      <form
        className="relative mx-auto flex w-full flex-col items-center"
        onSubmit={handleSearchSubmit}
        ref={formRef}
      >
        <Input
          data-testid="search-input"
          type="text"
          placeholder={currentPlaceholder}
          sizeVariant="lg"
          className={cn(
            "overflow-ellipsis border-2 border-primary px-14 text-base ring-0 transition-all duration-300 placeholder:text-muted-foreground focus-visible:ring-0 sm:text-lg",
            showQueries && (queryData || isQueryDataLoading) && "rounded-b-none border-b-0",
          )}
          value={searchState.input}
          onChange={handleInputChange}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search />
        </span>
        <div
          className="absolute right-4 top-1/2 flex -translate-y-1/2 gap-2"
          ref={searchSettingsIconRef}
        >
          <AnimatePresence>
            {queryData && showQueries && (
              <motion.div
                {...fadeInAndOut()}
                whileHover={{ scale: 1.15 }}
                className="flex items-center justify-center"
              >
                <IconButton icon="x" size="icon" variant="default" onClick={resetSearch} type="button" />
              </motion.div>
            )}
          </AnimatePresence>
          <SearchSettings windowRef={searchSettingsWindowRef} />
        </div>
      </form>
      {showQueries && <SearchQueries />}
    </div>
  );
};

export default forwardRef(SearchBar);
