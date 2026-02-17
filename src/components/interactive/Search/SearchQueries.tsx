import CustomIcon from "@/components/CustomIcon";
import { useQueryDataContext } from "@/contexts/QueryDataContext";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import useSearch from "@/hooks/useSearch";
import { fadeInAndOut } from "@/styles/animations";
import { motion } from "framer-motion";
import NoDataMessage from "./SearchTabContent/NoDataMessage";

interface SearchTableProps {}

const SearchQueries = () => {
  const { showQueries, queryData } = useQueryDataContext();
  const { region } = useRegionSettings();
  const { submitSearch } = useSearch();

  if (!queryData) {
    return <></>;
  }

  const queryDataExists = queryData.tracks?.items && queryData.tracks?.items.length > 0;

  return (
    <motion.div
      data-testid="search-results"
      {...fadeInAndOut()}
      className="hide-scrollbars absolute z-50 h-60 w-full overflow-scroll rounded-b-lg border border-t-[1px] border-primary bg-background/30 text-sm backdrop-blur-md md:text-base"
    >
      {queryDataExists ? (
        <table className="w-full">
          <motion.tbody {...fadeInAndOut(0.5)} key={queryData.tracks?.href}>
            {queryData.tracks?.items.map((track) => {
              const primaryArtist = track.artists[0]?.name || "";
              const trackPopularity = Math.max(1, Math.min(5, Math.ceil(track.popularity / 20)));

              return (
                <motion.tr
                  whileHover={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    transition: { duration: 0.1 },
                  }}
                  className="cursor-pointer"
                  onClick={() => submitSearch(track.id, region, track.name, primaryArtist)}
                  key={track.id}
                >
                  <td className="py-2 pl-3 pr-6 md:py-3 md:pl-5 md:pr-6">
                    <div className="flex items-center gap-4">
                      <div className="avatar">
                        <div className="mask mask-squircle h-11 w-11">
                          <img src={track.album.images[0]?.url} />
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="overflow-hidden pr-2 align-middle md:pr-4">
                    <p>{primaryArtist}</p>
                    {track.artists[1] && (
                      <p className="overflow-ellipsis whitespace-nowrap text-muted-foreground">
                        {track.artists[1]?.name}
                      </p>
                    )}
                  </td>
                  <td className="pr-4 align-middle">
                    <span className="text-sm md:text-base">{track.name}</span>
                  </td>
                  <td className="pr-3 text-right align-middle text-xs opacity-50 md:pr-5 md:text-sm">
                    {new Date(track.duration_ms).toISOString().substr(14, 5)}
                  </td>
                  <td className="pr-7 align-middle">
                    {trackPopularity === 1 && <CustomIcon icon="ranking1" variant="primary" />}
                    {trackPopularity === 2 && <CustomIcon icon="ranking2" variant="primary" />}
                    {trackPopularity === 3 && <CustomIcon icon="ranking3" variant="primary" />}
                    {trackPopularity === 4 && <CustomIcon icon="ranking4" variant="primary" />}
                    {trackPopularity === 5 && <CustomIcon icon="ranking5" variant="primary" />}
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      ) : (
        <NoDataMessage message="No results." />
      )}
    </motion.div>
  );
};

export default SearchQueries;
