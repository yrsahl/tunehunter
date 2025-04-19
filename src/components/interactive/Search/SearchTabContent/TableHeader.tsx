import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDeviceSize from "@/hooks/useDeviceSize";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";

interface TableHeaderProps<T> {
  subTabs: readonly T[];
  activeSubTab: T;
  setActiveSubTab: Dispatch<SetStateAction<T>>;
  className?: string;
}

const TableHeader = <T,>({
  subTabs,
  activeSubTab,
  setActiveSubTab,
  className,
}: TableHeaderProps<T>) => {
  const { isMobileDevice } = useDeviceSize();

  const activeSubTabName = String(activeSubTab).replaceAll("_", " ");

  if (isMobileDevice) {
    return (
      <div className="absolute left-1/2 top-0 z-10  w-1/2 -translate-x-1/2 rounded-b-sm border-b-[1px] border-primary bg-background px-6">
        <Select onValueChange={(value) => {}} value={activeSubTabName}>
          <SelectTrigger className="text-md border-none capitalize ring-0 focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {subTabs.map((subTab) => (
              <SelectItem
                key={String(subTab)}
                value={String(subTab)}
                className="ring-none whitespace-nowrap border-none text-base capitalize transition-colors"
              >
                {String(subTab).replaceAll("_", " ")}
              </SelectItem>
            ))}
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
              "flex justify-center whitespace-nowrap text-base capitalize transition-colors hover:text-foreground sm:w-32",
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
