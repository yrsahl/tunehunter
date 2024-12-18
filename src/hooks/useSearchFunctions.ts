import { useSearchDataContext } from "@/contexts/SearchDataContext";
import { debounce } from "lodash";
import { FormEvent, useCallback, useState } from "react";

const useSearchFunctions = () => {
  const [searchInput, setSearchInput] = useState("");
  const { requestSearchData, resetSearchData } = useSearchDataContext();

  // On enter -> set directly
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    requestSearchData(searchInput);
  };

  // On input -> debounce
  const debouncedRequestSearchData = useCallback(
    debounce((searchTerm: string) => {
      requestSearchData(searchTerm);
    }, 600),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Visual input
    const input = e.target.value;
    setSearchInput(input);

    // Debounced search (or cancel if empty)
    if (input) debouncedRequestSearchData(e.target.value);
    else {
      debouncedRequestSearchData.cancel();
    }
  };

  const resetSearch = () => {
    setSearchInput("");
    resetSearchData();
  };

  return {
    handleSearchSubmit,
    searchInput,
    handleInputChange,
    resetSearch,
  };
};

export default useSearchFunctions;
