import useRegionSettings from "@/hooks/settings/useRegionSettings";
import { useSearchSettingsStore } from "@/hooks/stores/useSearchSettingsStore";
import { fadeInAndOut, growIn, slideInFromAbove } from "@/styles/animations";
import { AnimatePresence, motion } from "framer-motion";
import { Cog } from "lucide-react";
import { useSession } from "next-auth/react";
import { RefObject } from "react";
import IconButton from "../../IconButton";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "../../ui/select";
import { Slider } from "../../ui/slider";
import { Switch } from "../../ui/switch";

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

  const areSettingsSet = searchForClubMixesOnly || minimumLengthOption;

  const resetSettings = () => {
    setSearchForClubMixesOnly(false);
    setMinimumLengthOption(false);
  };

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
          className="relative flex items-center justify-center"
        >
          <Cog />
          {/* Settings indicator */}
          <AnimatePresence>
            {areSettingsSet && (
              <motion.div
                {...fadeInAndOut(0.5)}
                className="absolute -right-1 top-3 z-10 h-2 w-2 rounded-full bg-accent"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-3 px-5 py-4" ref={windowRef}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium uppercase tracking-widest text-foreground opacity-60">
            Search Filters
          </p>
          <AnimatePresence>
            {areSettingsSet && (
              <motion.button
                {...fadeInAndOut(0.2)}
                onClick={resetSettings}
                className="text-xs font-light text-muted-foreground underline-offset-2 hover:underline"
              >
                Reset
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1">
          {/* Minimum length */}
          <Label htmlFor="minimumlength" className="flex items-center text-base font-light">
            Minimum length
          </Label>
          <div className="flex h-10 items-center justify-end">
            <Switch
              id="minimumlength"
              checked={minimumLengthOption}
              onCheckedChange={setMinimumLengthOption}
            />
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            {minimumLengthOption && (
              <motion.div
                className="col-span-2 flex items-center gap-4 pb-1 pt-0.5"
                {...slideInFromAbove()}
                key="minimumlengthslider"
              >
                <span className="w-10 shrink-0 text-center text-sm font-normal tabular-nums">
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
          <Label htmlFor="clubmixesonly" className="flex items-center text-base font-light">
            Club &amp; Extended mixes only
          </Label>
          <div className="flex h-10 items-center justify-end">
            <Switch
              id="clubmixesonly"
              checked={searchForClubMixesOnly}
              onCheckedChange={setSearchForClubMixesOnly}
            />
          </div>
        </div>

        {/* Region */}
        <div className="border-t border-foreground/30 pt-3">
          {loggedIn ? (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-light text-muted-foreground">
                Manage your region in your profile settings.
              </p>
              <p className="text-xs font-light text-muted-foreground/60">
                Affects which store and prices are shown.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0">
                  <Label htmlFor="region" className="shrink-0 text-base font-light">
                    Region:
                  </Label>
                  <div className="flex items-center gap-1">
                    <Select onValueChange={changeRegion} value={region}>
                      <SelectTrigger
                        id="region"
                        className="h-9 max-w-36 justify-start gap-2 text-ellipsis whitespace-nowrap border-none bg-transparent p-0 px-1 text-base font-light text-foreground focus:ring-0 focus:ring-offset-0"
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
                        {sortedRegions.priority.map((region) => (
                          <SelectItem key={region} value={region}>
                            {createRegionName(region)}
                          </SelectItem>
                        ))}
                        <SelectSeparator />
                        {sortedRegions.rest.map((region) => (
                          <SelectItem key={region} value={region}>
                            {createRegionName(region)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <IconButton
                  variant="ghostPrimary"
                  size="icon"
                  icon="mapPin"
                  iconSize="24px"
                  className="h-8 w-8 shrink-0"
                  bordered="default"
                  onClick={setRegionByLocation}
                />
              </div>
              <p className="text-xs font-light text-muted-foreground/60">
                Affects which store and prices are shown.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchSettings;
