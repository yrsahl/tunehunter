import SearchSettings from "@/components/interactive/Search/SearchSettings";
import { fetchSpotifySearchData } from "@/helpers/spotify/fetch-spotify-data";
import { SpotifySearchData, SpotifyTrack } from "@/types/spotify";
import { api } from "@/utils/api";
import { createContext, ReactNode, useContext, useState } from "react";

interface ISearchDataContext {
  searchData: SpotifySearchData | null;
  requestSearchData: (query: string, accessToken: string, searchSettings?: SearchSettings) => void;
  isSearchDataLoading: boolean;
  resetSearchData: () => void;
}

const SearchDataContext = createContext<ISearchDataContext>({
  searchData: null,
  requestSearchData: () => {},
  isSearchDataLoading: false,
  resetSearchData: () => {},
});

export const useSearchDataContext = () => useContext(SearchDataContext);

export const SearchDataProvider = ({ children }: { children: ReactNode }) => {
  const [searchData, setSearchData] = useState<SpotifySearchData | null>(null);
  const [isSearchDataLoading, setIsSearchDataLoading] = useState(false);
  const storeSearchResults = api.song.storeSearchResults.useMutation();

  const storeTracksInDb = (tracks: SpotifyTrack[]) => {
    const results = tracks.map((track) => {
      return {
        song: {
          id: track.id,
          title: track.name,
          duration: track.duration_ms,
          album: track.album.name,
          albumArtUrl: track.album.images[0]?.url,
          year: track.album.release_date,
          genre: track.album.album_type,
          spotifyUrl: track.external_urls.spotify,
        },
        artists: track.artists.map((artist) => {
          return {
            id: artist.id,
            name: artist.name,
            spotifyUrl: artist.external_urls.spotify,
          };
        }),
      };
    });
    storeSearchResults.mutate(results);
  };

  // Search spotify catalog
  const requestSearchData = (
    accessToken: string,
    query: string,
    searchSettings?: SearchSettings,
  ) => {
    // No search query
    if (!query) {
      setSearchData(null);
      return;
    }

    // Query api
    setIsSearchDataLoading(true);
    try {
      fetchSpotifySearchData(accessToken, query).then((searchData) => {
        if (!searchData || !searchData.tracks) return;

        // If club mixes only is set, filter out everything else
        if (searchSettings?.searchForClubMixesOnly) {
          searchData.tracks.items = searchData?.tracks?.items.filter((track) => {
            return (
              track.name.toLowerCase().includes("club") ||
              track.name.toLowerCase().includes("extended")
            );
          });
        }

        // If minimum length is set, filter out everything shorter
        if (searchSettings?.minimumLengthOption && searchSettings?.minimumLengthSeconds) {
          searchData.tracks.items = searchData?.tracks?.items.filter((track) => {
            return track.duration_ms >= searchSettings.minimumLengthSeconds * 1000;
          });
        }

        // Query data until we have limit of songs
        setSearchData(searchData);
        setIsSearchDataLoading(false);
        storeTracksInDb(searchData.tracks.items);
      });
    } catch (error) {
      console.error(error);
      setIsSearchDataLoading(false);
    }
  };

  const resetSearchData = () => {
    setSearchData(null);
  };

  return (
    <SearchDataContext.Provider
      value={{
        searchData,
        isSearchDataLoading,
        requestSearchData,
        resetSearchData,
      }}
    >
      {children}
    </SearchDataContext.Provider>
  );
};
