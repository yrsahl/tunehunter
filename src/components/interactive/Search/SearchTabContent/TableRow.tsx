import IconButton from "@/components/IconButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import { useActiveSearchTabStore } from "@/hooks/stores/useActiveSearchTab";
import useDeviceSize from "@/hooks/useDeviceSize";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import useSearch from "@/hooks/useSearch";
import { Track } from "@/types/song";
import clsx from "clsx";
import { ReactNode } from "react";

interface TableRowProps {
  track: Track;
  showDuration?: boolean;
  extraElement?: ReactNode;
}

const TableRow = ({ track, showDuration = false, extraElement }: TableRowProps) => {
  const { submitSearch } = useSearch();
  const router = useRouterWithHelpers();
  const { song, artists } = track;
  const { region } = useRegionSettings();
  const { isSmallDevice } = useDeviceSize();
  const { setActiveSearchTab } = useActiveSearchTabStore();
  const buttonSize = isSmallDevice ? "xs" : "sm";

  const primaryArtist = artists[0]?.name || "";

  const handleSearchClick = async () => {
    // Start search
    submitSearch(song.id, region, song.title, primaryArtist);

    // // Hide tabs
    // if (isSmallDevice) {
    //   setActiveSearchTab("");
    //   const trackSearchHref = {
    //     pathname: router.pathname,
    //     query: {
    //       ...router.query,
    //       search: "",
    //     },
    //   };
    //   await router.push(trackSearchHref);
    // }
  };

  return (
    <tr className="max-h-16" key={song.id}>
      <td className="py-2 pr-4 sm:pr-8">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="mask mask-squircle h-10 w-10 md:h-12 md:w-12">
              {song.albumArtUrl && <img src={song.albumArtUrl} />}
              {!song.albumArtUrl && (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
      {/* Extra Element */}
      <td className={clsx("align-middle", extraElement ? "pr-2 sm:pr-4" : "pr-0")}>
        <div className="flex text-sm md:text-base">{extraElement}</div>
      </td>
      {/* Artist(s) */}
      <td className="pr-3 sm:pr-4">
        <p className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap text-sm md:text-base">
          {primaryArtist}
        </p>
        {artists[1] && (
          <p className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted-foreground md:text-base">
            {artists[1].name}
          </p>
        )}
      </td>
      {/* Title */}
      <td className="pr-2 sm:pr-4">
        <Tooltip>
          <TooltipTrigger>
            <span className="block max-w-48 overflow-hidden text-ellipsis whitespace-nowrap text-sm md:text-base">
              {song.title}
            </span>
            <TooltipContent className="border-foreground/30 bg-background text-sm text-foreground md:text-base">
              {song.title}
            </TooltipContent>
          </TooltipTrigger>
        </Tooltip>
      </td>
      {/* Duration */}
      {showDuration && (
        <td className="pr-2 text-xs text-foreground/50 sm:pr-4 md:text-sm">
          <span>{new Date(song.duration).toISOString().substr(14, 5)}</span>
        </td>
      )}
      {/* Search */}
      <td className="pl-2 text-right sm:pl-4">
        <IconButton
          variant="primary"
          text="Search"
          size={buttonSize}
          textStyle="uppercase text-xs"
          onClick={handleSearchClick}
        />
      </td>
    </tr>
  );
};

export default TableRow;
