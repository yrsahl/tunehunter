import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDeviceSize from "@/hooks/useDeviceSize";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";

interface TableHeaderProps<T extends string> {
  subTabs: readonly T[];
  activeSubTab: T;
  setActiveSubTab: Dispatch<SetStateAction<T>>;
  className?: string;
}

const TableHeader = <T extends string>({
  subTabs,
  activeSubTab,
  setActiveSubTab,
  className,
}: TableHeaderProps<T>) => {
  const { isMobileDevice } = useDeviceSize();

  const humanize = (s: string) => s.replaceAll("_", " ");
  const isTypeT = (value: string): value is T => {
    return subTabs.includes(value as T);
  };

  if (isMobileDevice) {
    return (
      <div className="absolute left-1/2 top-0 z-10 flex h-8 w-48 -translate-x-1/2 items-center justify-center overflow-hidden rounded-b-md border-[1px] border-t-0 border-foreground/30 bg-background">
        {/* <Select
          onValueChange={(value) => {
            if (!isTypeT(value)) return;
            setActiveSubTab(value);
          }}
          value={activeSubTab}
        >
          <SelectTrigger className="border-none text-sm capitalize outline-none ring-0 focus:ring-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-foreground/30 bg-background/30 backdrop-blur-md">
            <SelectGroup>
              {subTabs.map((subTab) => (
                <SelectItem
                  value={String(subTab)}
                  className="whitespace-nowrap text-xs capitalize ring-0 transition-colors md:text-base"
                >
                  {humanize(subTab)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select> */}
        <Select>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grapes">Grapes</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="border-x-1 absolute left-1/2 top-0 z-10 flex w-auto -translate-x-1/2 justify-around gap-4 rounded-b-sm border-b-[1px] border-primary bg-background px-6 py-[6px] md:gap-0">
      {subTabs.map((subTab) => {
        const subTabName = String(subTab).replaceAll("_", " ");
        return (
          <button
            key={String(subTab)}
            className={cn(
              // Hardcoded width of 32 to make all buttons the same size as the largest one (min-w-0 flex-1 doesn't work here)
              "flex justify-center whitespace-nowrap text-sm capitalize transition-colors hover:text-foreground sm:text-base md:w-32",
              className,
              subTab === activeSubTab ? "text-foreground" : "text-muted-foreground",
            )}
            onClick={() => setActiveSubTab(subTab)}
          >
            {subTabName}
          </button>
        );
      })}
    </div>
  );
};

export default TableHeader;
