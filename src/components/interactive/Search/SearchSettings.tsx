import useRegionSettings from "@/hooks/settings/useRegionSettings";
import { useSearchSettingsStore } from "@/hooks/stores/useSearchSettingsStore";
import { growIn, slideInAndOutFromAbove } from "@/styles/animations";
import { AnimatePresence, motion } from "framer-motion";
import { Cog } from "lucide-react";
import { useSession } from "next-auth/react";
import { RefObject } from "react";
import IconButton from "../../IconButton";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Slider } from "../../ui/slider";
import { Switch } from "../../ui/switch";

type SearchSettings = {
  searchForClubMixesOnly: boolean;
  minimumLengthOption: boolean;
  minimumLengthSeconds: number;
};

const SearchSettings = ({ windowRef }: { windowRef: RefObject<HTMLDivElement> }) => {
  const { status } = useSession();
  const loggedIn = status === "authenticated";

  // State
  const {
    searchForClubMixesOnly,
    minimumLengthOption,
    minimumLengthSeconds,
    setSearchForClubMixesOnly,
    setMinimumLengthOption,
    setMinimumLengthSeconds,
  } = useSearchSettingsStore();
  const { region, changeRegion, createRegionName, setRegionByLocation, sortedRegions } =
    useRegionSettings();

  // Prepared strings
  const minimumLengthDisplayMinutes = Math.floor(minimumLengthSeconds / 60)
    .toString()
    .padStart(2, "0");
  const minimumLengthDisplaySeconds = (minimumLengthSeconds % 60).toString().padStart(2, "0");

  return (
    <Popover>
      <PopoverTrigger>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center"
        >
          <Cog />
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col items-center gap-4 px-6 py-4" ref={windowRef}>
        {/* <div className="absolute inset-0 -z-10 bg-background opacity-80" /> */}

        <p className="border-b-[1px] border-foreground px-2 pb-1 text-lg text-foreground">
          <span>Search Settings</span>
        </p>
        <div className="grid grid-cols-[240px_minmax(50px,_max-content)] gap-x-8 gap-y-1 opacity-100">
          {/* Minimum length */}
          <Label htmlFor="minimumlength" className="flex items-center text-base font-thin">
            <p>
              Set a minimum length
              {minimumLengthOption ? ":" : "?"}
            </p>
          </Label>
          <div className="flex h-10 items-center justify-end">
            <Switch
              id="minimumlength"
              checked={minimumLengthOption}
              onCheckedChange={setMinimumLengthOption}
            />
          </div>
          <AnimatePresence mode="popLayout">
            {minimumLengthOption && (
              <motion.div
                className="col-span-2 mx-auto flex w-4/5 cursor-pointer items-center justify-center gap-4 py-2"
                {...slideInAndOutFromAbove()}
                key="mnimumlengthslider"
              >
                <span className="font-normal">
                  {minimumLengthDisplayMinutes}:{minimumLengthDisplaySeconds}
                </span>
                <Slider
                  defaultValue={[minimumLengthSeconds]}
                  max={600}
                  min={1}
                  value={[minimumLengthSeconds]}
                  onValueChange={(value) => setMinimumLengthSeconds(value[0] ?? 0)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Club Mixes only */}
          <Label htmlFor="clubmixesonly" className="flex items-center font-thin">
            [Club], [Extended] only
            {!searchForClubMixesOnly && <span>?</span>}
          </Label>
          <div className="flex h-10 items-center justify-end">
            <Switch
              id="clubmixesonly"
              checked={searchForClubMixesOnly}
              onCheckedChange={setSearchForClubMixesOnly}
            />
          </div>

          {/* Region */}
          {!loggedIn && (
            <>
              <div className="flex items-center">
                <Label htmlFor="region" className="flex items-center font-thin">
                  Region:
                </Label>
                <Select onValueChange={changeRegion} value={region}>
                  <SelectTrigger
                    id="region"
                    className="h-9 max-w-44 justify-start gap-2 text-ellipsis whitespace-nowrap border-none bg-transparent p-0 px-1 text-base font-thin text-foreground focus:ring-0 focus:ring-offset-0"
                  >
                    <motion.div
                      key={region}
                      {...growIn()}
                      className="inline-block w-36 overflow-hidden text-ellipsis text-start"
                    >
                      <SelectValue />
                    </motion.div>
                  </SelectTrigger>
                  <SelectContent>
                    {sortedRegions.map((region) => (
                      <SelectItem key={region} value={region.toLowerCase()}>
                        {createRegionName(region)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex h-10 items-center justify-center">
                <IconButton
                  variant="ghostPrimary"
                  size="icon"
                  icon="mapPin"
                  iconSize="28px"
                  className="h-10 w-10"
                  bordered="default"
                  onClick={setRegionByLocation}
                />
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchSettings;
