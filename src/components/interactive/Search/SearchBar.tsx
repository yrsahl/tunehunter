import IconButton from "@/components/IconButton";
import { LoadingIndicator } from "@/components/Indicators";
import { Input } from "@/components/ui/input";
import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import { useSearchSettingsStore } from "@/hooks/stores/useSearchSettingsStore";
import useSearchStore from "@/hooks/stores/useSearchStore";
import useSearch from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import React, {
  createRef,
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
  searchSettingsRef: React.RefObject<HTMLDivElement>;
  showResults: boolean;
  children?: ReactNode;
}

const SearchBar: ForwardRefRenderFunction<HTMLDivElement, ISearchBarProps> = (
  { searchSettingsRef, showResults, children }: ISearchBarProps,
  ref,
) => {
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const { handleSearchSubmit, handleInputChange, resetSearch } = useSearch();
  const { searchState } = useSearchStore();
  const { queryData, isQueryDataLoading } = useQueryDataContext();
  const formRef = createRef<HTMLFormElement>();

  // Puts a random placeholder song value into the search bar
  useEffect(() => {
    if (searchState.input) return;
    const rndPlaceholderIndex = Math.floor(Math.random() * placeholderValues.length);
    const rndPlaceholder = placeholderValues[rndPlaceholderIndex];
    setCurrentPlaceholder(rndPlaceholder!);
  }, []);

  // Trigger form submit when settings change
  const searchSettings = useSearchSettingsStore();
  useEffect(() => {
    if (!queryData) return;
    formRef.current?.requestSubmit();
  }, [...Object.values(searchSettings)]);

  return (
    <div ref={ref} className="relative w-full max-w-[36rem]">
      <form
        className="relative mx-auto flex w-full flex-col items-center"
        onSubmit={handleSearchSubmit}
        ref={formRef}
      >
        <Input
          type="text"
          placeholder={currentPlaceholder}
          sizeVariant="lg"
          className={cn(
            "overflow-ellipsis border-2 border-primary px-14 text-lg ring-0 transition-all duration-300 placeholder:text-muted-foreground focus-visible:ring-0",
            queryData && showResults && "rounded-b-none border-b-0",
          )}
          value={searchState.input}
          onChange={handleInputChange}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2">
          <AnimatePresence>
            {isQueryDataLoading && (
              <motion.div
                className="flex h-8 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingIndicator size={20} />
              </motion.div>
            )}
            {!isQueryDataLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Search />
              </motion.div>
            )}
          </AnimatePresence>
        </span>
        <div
          className="absolute right-4 top-1/2 flex -translate-y-1/2 gap-2"
          ref={searchSettingsRef}
        >
          <AnimatePresence>
            {queryData && showResults && (
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
