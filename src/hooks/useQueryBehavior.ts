import { useEffect, useRef, useState } from "react";
import useRouterWithHelpers from "./useRouterWithHelpers";

const useQueryBehavior = () => {
  const [showQueries, setShowQueries] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchSettingsRef = useRef<HTMLDivElement>(null);
  const searchQueriesRef = useRef<HTMLTableElement>(null);
  const { getParams } = useRouterWithHelpers();
  const id = getParams("id");

  // Show queries depending on click inside or outside of search bar
  const handleClickSearchBar = (event: MouseEvent) => {
    if (!searchBarRef.current || !searchSettingsRef.current) return; // No refs

    // Do nothing if options are clicked
    if (searchSettingsRef.current.contains(event.target as Node)) {
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

  // Hide results on new id (new search)
  useEffect(() => {
    setShowQueries(false);
  }, [id]);

  return {
    showQueries,
    searchBarRef,
    searchSettingsRef,
    searchQueriesRef,
  };
};

export default useQueryBehavior;
