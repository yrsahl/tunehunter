import { SearchData } from "@/types/search-types";

export const fetchDbSearchData = async (query: string): Promise<SearchData | null> => {
  const params = new URLSearchParams({ q: query });
  try {
    const response = await fetch(`/api/songs/search?${params}`);
    if (!response.ok) return null;
    return response.json() as Promise<SearchData>;
  } catch {
    return null;
  }
};
