import { Skeleton } from "@/components/ui/skeleton";
import clsx from "clsx";
import { SearchTab } from "../SearchTabs/SearchTabBar";

interface SkeletonTableProps {
  tab: SearchTab;
  hasHeader: boolean;
}

const SkeletonTable = ({ tab, hasHeader }: SkeletonTableProps) => {
  const SkeletonRow = () => {
    if (tab === "trending" || tab == "history") {
      return (
        // Avatar
        <tr className="max-h-16">
          <td className="py-2 pr-8">
            <Skeleton className="h-12 w-12 rounded-full bg-foreground" />
          </td>
          {/* Extra element */}
          <td className="pr-6 align-middle">
            <Skeleton className={"h-4 w-4"} />
          </td>
          {/* Artist */}
          <td className="pr-4">
            <Skeleton className="h-4 w-36" />
          </td>
          {/* Title */}
          <td className="pr-4">
            <Skeleton className="h-4 w-44" />
          </td>
          {/* Duration */}
          <td className="pr-4 text-foreground/50">
            <Skeleton className="h-4 w-12" />
          </td>
          {/* Search */}
          <td className="pl-4 text-right">
            <Skeleton className="h-9 w-24 bg-primary/50" />
          </td>
        </tr>
      );
    }
    if (tab === "spotify") {
      return (
        // Avatar
        <tr className="max-h-16">
          <td className="py-2 pr-8">
            <Skeleton className="h-12 w-12 rounded-full" />
          </td>
          {/* Extra element */}
          <td className="pr-8 align-middle">
            <Skeleton className={"h-4 w-8"} />
          </td>
          {/* Artist */}
          <td className="pr-14">
            <Skeleton className="h-4 w-28" />
          </td>
          {/* Title */}
          <td className="pr-8">
            <Skeleton className="h-4 w-32" />
          </td>
          {/* Duration */}
          <td className="pr-4 text-foreground/50">
            <Skeleton className="h-4 w-14" />
          </td>
          {/* Search */}
          <td className="pl-4 text-right">
            <Skeleton className="h-9 w-[90px] bg-primary/50" />
          </td>
        </tr>
      );
    }
  };

  return (
    <div className="h-full w-full px-3 sm:px-5 md:px-7">
      <div
        className={clsx(
          "hide-scrollbars relative h-full w-full overflow-scroll pb-4",
          hasHeader ? "pt-12" : "pt-4",
        )}
      >
        <table className="w-full">
          <tbody>
            {Array(20)
              .fill("")
              .map((_, index) => (
                <SkeletonRow key={index} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SkeletonTable;
