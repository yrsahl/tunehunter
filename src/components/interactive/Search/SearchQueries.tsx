import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import useSearch from "@/hooks/useSearch";
import { motion } from "framer-motion";

interface SearchTableProps {}

const SearchQueries = () => {
  const { showQueries, queryData } = useQueryDataContext();
  const { region } = useRegionSettings();
  const { submitSearch } = useSearch();

  if (!showQueries || !queryData) {
    return <></>;
  }

  return (
    <motion.div
      {...fadeInAndOut()}
      className="absolute z-50 h-60 w-full overflow-scroll rounded-b-lg border border-t-[1px] border-primary bg-background/30 text-sm backdrop-blur-md md:text-base"
    >
      <table>
        <motion.tbody {...fadeInAndOut(0.5)} key={queryData.tracks?.href}>
          {queryData.tracks?.items.map((track) => {
            const primaryArtist = track.artists[0]?.name || "";

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
                <td className="py-2 pl-3 pr-6 md:py-3 md:pl-5 md:pr-8">
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
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </motion.div>
  );
};

export default SearchQueries;
