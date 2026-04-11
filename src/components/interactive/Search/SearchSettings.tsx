import useRegionSettings from "@/hooks/settings/useRegionSettings";
import { trackEvent } from "@/lib/plausible";
import {
  LENGTH_MAX,
  LENGTH_MIN,
  VersionFilter,
  YEAR_MAX,
  YEAR_MIN,
  useSearchSettingsStore,
} from "@/hooks/stores/useSearchSettingsStore";
import { fadeInAndOut, growIn, slideInFromAbove } from "@/styles/animations";
import { AnimatePresence, motion } from "framer-motion";
import { Cog } from "lucide-react";
import { useSession } from "next-auth/react";
import { RefObject } from "react";
import IconButton from "../../IconButton";
import InfoWithToolTip from "../../InfoWithTooltip";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Slider } from "../../ui/slider";
import { Switch } from "../../ui/switch";

const formatSeconds = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const VERSION_OPTIONS: { value: VersionFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "originals", label: "Originals" },
  { value: "remixes", label: "Remixes" },
  { value: "extended", label: "Extended" },
];

const SearchSettings = ({ windowRef }: { windowRef: RefObject<HTMLDivElement> }) => {
  const { status } = useSession();
  const loggedIn = status === "authenticated";

  // State
  const {
    versionFilter,
    lengthFilter,
    lengthRange,
    yearFilter,
    yearRange,
    setVersionFilter,
    setLengthFilter,
    setLengthRange,
    setYearFilter,
    setYearRange,
  } = useSearchSettingsStore();
  const { region, changeRegion, createRegionName, setRegionByLocation, sortedRegions } =
    useRegionSettings();

  const areSettingsSet = versionFilter !== "all" || lengthFilter || yearFilter;

  const resetSettings = () => {
    setVersionFilter("all");
    setLengthFilter(false);
    setYearFilter(false);
  };

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
      <PopoverContent
        className="flex flex-col gap-3 px-5 py-4"
        ref={windowRef}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
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
          {/* Version filter */}
          <div className="col-span-2 flex items-center justify-between pb-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="versionfilter" className="text-base font-light">
                Version
              </Label>
              <InfoWithToolTip
                tooltip={
                  <div className="flex flex-col items-start gap-1">
                    <p>
                      <span className="font-semibold">All</span> — no filter
                    </p>
                    <p>
                      <span className="font-semibold">Originals</span> — hides remixes, covers &
                      edits
                    </p>
                    <p>
                      <span className="font-semibold">Remixes</span> — re-edits and bootlegs only
                    </p>
                    <p>
                      <span className="font-semibold">Extended</span> — club, extended & original
                      mixes
                    </p>
                  </div>
                }
                touchToast={
                  <div className="flex flex-col gap-0.5">
                    <p>
                      <span className="font-semibold">All</span> — no filter
                    </p>
                    <p>
                      <span className="font-semibold">Originals</span> — hides remixes, covers &
                      edits
                    </p>
                    <p>
                      <span className="font-semibold">Remixes</span> — re-edits and bootlegs only
                    </p>
                    <p>
                      <span className="font-semibold">Extended</span> — club, extended & original
                      mixes
                    </p>
                  </div>
                }
                iconSize="20px"
                side="right"
                variant="primary"
              />
            </div>
            <Select
              value={versionFilter}
              onValueChange={(v) => { setVersionFilter(v as VersionFilter); if (v !== "all") trackEvent(`Filter Applied: version/${v}`); }}
            >
              <SelectTrigger
                id="versionfilter"
                className="h-8 w-32 border-foreground/20 text-sm font-light focus:ring-0 focus:ring-offset-0"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERSION_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Track length range */}
          <Label htmlFor="lengthfilter" className="flex items-center text-base font-light">
            Track length
          </Label>
          <div className="flex h-10 items-center justify-end">
            <Switch id="lengthfilter" checked={lengthFilter} onCheckedChange={(v) => { setLengthFilter(v); if (v) trackEvent("Filter Applied: length"); }} />
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            {lengthFilter && (
              <motion.div
                className="col-span-2 flex items-center gap-2 pb-1 pt-0.5"
                {...slideInFromAbove()}
                key="lengthrangeslider"
              >
                <span className="w-10 shrink-0 text-center text-sm font-normal tabular-nums">
                  {formatSeconds(lengthRange[0])}
                </span>
                <Slider
                  value={lengthRange}
                  max={LENGTH_MAX}
                  min={LENGTH_MIN}
                  onValueChange={(value) => setLengthRange(value as [number, number])}
                />
                <span className="w-10 shrink-0 text-center text-sm font-normal tabular-nums">
                  {formatSeconds(lengthRange[1])}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Release year range */}
          <Label htmlFor="yearfilter" className="flex items-center text-base font-light">
            Release year
          </Label>
          <div className="flex h-10 items-center justify-end">
            <Switch id="yearfilter" checked={yearFilter} onCheckedChange={(v) => { setYearFilter(v); if (v) trackEvent("Filter Applied: year"); }} />
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            {yearFilter && (
              <motion.div
                className="col-span-2 flex items-center gap-2 pb-1 pt-0.5"
                {...slideInFromAbove()}
                key="yearrangeslider"
              >
                <span className="w-12 shrink-0 text-center text-sm font-normal tabular-nums">
                  {yearRange[0]}
                </span>
                <Slider
                  value={yearRange}
                  max={YEAR_MAX}
                  min={YEAR_MIN}
                  onValueChange={(value) => setYearRange(value as [number, number])}
                />
                <span className="w-12 shrink-0 text-center text-sm font-normal tabular-nums">
                  {yearRange[1]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Region */}
        <div className="border-t border-foreground/30 pt-3">
          {loggedIn ? (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-light text-muted-foreground">
                Manage your region in your profile settings.
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
              <p className="text-xs font-light text-muted-foreground">
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
