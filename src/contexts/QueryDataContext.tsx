import SearchSettings from "@/components/interactive/Search/SearchSettings";
import { fetchSpotifySearchData } from "@/helpers/spotify/fetch-spotify-data";
import { SpotifySearchData, SpotifyTrack } from "@/types/spotify";
import { api } from "@/utils/api";
import { createContext, ReactNode, useContext, useState } from "react";

interface IQueryDataContext {
  queryData: SpotifySearchData | null;
  requestQueryData: (query: string, accessToken: string, searchSettings?: SearchSettings) => void;
  isQueryDataLoading: boolean;
  resetQueryData: () => void;
}

const QueryDataContext = createContext<IQueryDataContext>({
  queryData: null,
  requestQueryData: () => {},
  isQueryDataLoading: false,
  resetQueryData: () => {},
});

export const useQueryDataContext = () => useContext(QueryDataContext);

export const QueryDataProvider = ({ children }: { children: ReactNode }) => {
  const [queryData, setQueryData] = useState<SpotifySearchData | null>(null);
  const [isQueryDataLoading, setIsQueryDataLoading] = useState(false);
  const storeQueryResults = api.song.storeQueryResults.useMutation();

  const storeTracksInDb = (tracks: SpotifyTrack[]) => {
    const results = tracks.map((track) => {
      return {
        song: {
          id: track.id,
          title: track.name,
          duration: track.duration_ms,
          album: track.album.name || null,
          albumArtUrl: track.album.images[0]?.url || null,
          year: track.album.release_date,
          genre: track.album.album_type,
          spotifyUrl: track.external_urls.spotify,
        },
        artists: track.artists.map((artist) => {
          return {
            id: artist.id,
            name: artist.name,
            popularity: null,
            followers: null,
          };
        }),
      };
    });
    storeQueryResults.mutate(results);
  };

  // Search spotify catalog
  const requestQueryData = (
    accessToken: string,
    query: string,
    searchSettings?: SearchSettings,
  ) => {
    // No search query
    if (!query) {
      setQueryData(null);
      return;
    }

    // Query api
    setIsQueryDataLoading(true);
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
        setQueryData(searchData);
        setIsQueryDataLoading(false);
        storeTracksInDb(searchData.tracks.items);
      });
    } catch (error) {
      console.error(error);
      setIsQueryDataLoading(false);
    }
  };

  const resetQueryData = () => {
    setQueryData(null);
  };

  return (
    <QueryDataContext.Provider
      value={{
        queryData,
        isQueryDataLoading,
        requestQueryData,
        resetQueryData,
      }}
    >
      {children}
    </QueryDataContext.Provider>
  );
};
