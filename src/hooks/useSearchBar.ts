import { useEffect, useRef, useState } from "react";

const useSearchBar = () => {
  const [showResults, setShowResults] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const handleClickSearchBar = (event: MouseEvent) => {
    if (!searchBarRef.current) return; // No ref

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
  };
};

export default useSearchBar;
