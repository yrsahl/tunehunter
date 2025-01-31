import { fadeInAndOut } from "@/helpers/animations";
import { SpotifySearchData, SpotifyTrack } from "@/types/spotify";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

interface SearchTableProps {
  searchData: SpotifySearchData;
}

const SearchResults = ({ searchData }: SearchTableProps) => {
  const router = useRouter();
  const addSearchActivity = api.userActivities.addSearchActivity.useMutation();

  const startSearch = async (track: SpotifyTrack) => {
    // Store activity
    addSearchActivity.mutateAsync({ songId: track.id });

    // Push to router -> trigger results query
    const trackSearchHref = {
      pathname: router.pathname,
      query: { ...router.query, id: track.id },
    };
    router.push(trackSearchHref);
  };

  return (
    <motion.div
      {...fadeInAndOut()}
      className="absolute z-50 h-60 w-full overflow-scroll rounded-b-lg border border-t-[1px] border-primary bg-background/30 text-base backdrop-blur-md"
    >
      <div className="px-3 py-3 sm:px-5 md:px-7">
        {/* <p className="text-center text-foreground/50">
          {searchData.tracks?.total} results found for 'love'.
        </p> */}
        <table>
          <motion.tbody {...fadeInAndOut(0.5)} key={searchData.tracks?.href}>
            {searchData.tracks?.items.map((track) => (
              <motion.tr
                whileHover={{ scale: 1.03 }}
                className="cursor-pointer"
                onClick={() => startSearch(track)}
                key={track.id}
              >
                <td className="py-3 pr-8">
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="mask mask-squircle h-11 w-11">
                        <img src={track.album.images[0]?.url} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="overflow-hidden pr-4 align-middle">
                  <p>{track.artists[0]?.name}</p>
                  {track.artists[1] && (
                    <p className="overflow-ellipsis whitespace-nowrap text-muted-foreground">
                      {track.artists[1]?.name}
                    </p>
                  )}
                </td>
                <td className=" pr-4 align-middle">
                  <span>{track.name}</span>
                </td>
                <td className="text-right align-middle text-base opacity-50">
                  {new Date(track.duration_ms).toISOString().substr(14, 5)}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SearchResults;
