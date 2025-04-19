import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import useSearch from "@/hooks/useSearch";
import { motion } from "framer-motion";

interface SearchTableProps {
  searchQueriesRef: React.RefObject<HTMLTableElement>;
}

const SearchQueries = ({ searchQueriesRef }: SearchTableProps) => {
  const { queryData } = useQueryDataContext();
  const { region } = useRegionSettings();
  const { submitSearch } = useSearch();

  console.log("queryData", queryData);

  if (!queryData) {
    return <></>;
  }

  return (
    <motion.div
      {...fadeInAndOut()}
      className="absolute z-50 h-60 w-full overflow-scroll rounded-b-lg border border-t-[1px] border-primary bg-background/30 text-base backdrop-blur-md"
    >
      <div className="px-3 py-3 sm:px-5 md:px-7">
        {/* <p className="text-center text-foreground/50">
          {queryData.tracks?.total} results found for 'love'.
        </p> */}
        <table ref={searchQueriesRef}>
          <motion.tbody {...fadeInAndOut(0.5)} key={queryData.tracks?.href}>
            {queryData.tracks?.items.map((track) => {
              const primaryArtist = track.artists[0]?.name || "";

              return (
                <motion.tr
                  whileHover={{ scale: 1.03 }}
                  className="cursor-pointer"
                  onClick={() => submitSearch(track.id, region, track.name, primaryArtist)}
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
                    <p>{primaryArtist}</p>
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
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SearchQueries;
