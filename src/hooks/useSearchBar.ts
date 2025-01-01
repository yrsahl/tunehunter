import { useEffect, useRef, useState } from "react";

const useSearchBar = () => {
  const [showResults, setShowResults] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchSettingsRef = useRef<HTMLDivElement>(null);

  const handleClickSearchBar = (event: MouseEvent) => {
    if (!searchBarRef.current || !searchSettingsRef.current) return; // No refs

    // Do nothing if options are clicked
    if (searchSettingsRef.current.contains(event.target as Node)) {
      return;
    }

    // If click is placed within search bar, show results
    if (searchBarRef.current.contains(event.target as Node)) setShowResults(true);
    if (!searchBarRef.current.contains(event.target as Node)) setShowResults(false);
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickSearchBar);
    return () => {
      document.removeEventListener("mousedown", handleClickSearchBar);
    };
  }, []);

  return {
    showResults,
    searchBarRef,
    searchSettingsRef,
  };
};

export default useSearchBar;
