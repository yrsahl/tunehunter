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
  return (
    <div className="border-x-1 absolute left-1/2 top-0 z-10 flex w-auto -translate-x-1/2 justify-around gap-4 rounded-b-sm border-b-[1px] border-primary bg-background px-6 py-[6px] md:gap-0">
      {subTabs.map((subTab) => {
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
            {String(subTab).replaceAll("_", " ")}
          </button>
        );
      })}
    </div>
  );
};

export default TableHeader;
