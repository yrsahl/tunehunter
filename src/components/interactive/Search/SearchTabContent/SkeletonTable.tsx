import { Skeleton } from "@/components/ui/skeleton";
import useDeviceSize from "@/hooks/useDeviceSize";
import clsx from "clsx";

const SKELETON_ROW_COUNT = 20;

interface SkeletonTableProps {
  hasHeader: boolean;
  hasExtraElement?: boolean;
}

const SkeletonTable = ({ hasHeader, hasExtraElement }: SkeletonTableProps) => {
  const { isSmallDevice } = useDeviceSize();

  return (
    <div
      className={clsx(
        "hide-scrollbars relative h-full w-full overflow-scroll overflow-x-hidden px-3 pb-4 sm:px-5 md:px-7",
        hasHeader ? "pt-8 sm:pt-12 md:pt-12" : "pt-2 sm:pt-4",
      )}
    >
      <table className="w-full table-fixed">
        <tbody>
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => (
            <tr key={i} className="max-h-16 overflow-hidden">
              <td className="w-[56px] py-2 pr-4 sm:w-[84px] sm:pr-8">
                <div className="avatar">
                  <div className="mask mask-squircle h-10 w-10 md:h-12 md:w-12">
                    <Skeleton className="h-full w-full" />
                  </div>
                </div>
              </td>
              <td
                className={clsx(
                  "align-middle",
                  hasExtraElement ? "w-0 pr-0 sm:w-12 sm:pr-5" : "w-0 pr-0 sm:w-0 sm:pr-0",
                )}
              >
                {!isSmallDevice && hasExtraElement && <Skeleton className="h-6 w-6" />}
              </td>
              <td className="w-[30%] min-w-0 pr-5 sm:w-[28%] sm:pr-6">
                <Skeleton className="h-4 w-3/4" />
              </td>
              <td className="w-[48%] min-w-0 pl-1 pr-2 sm:w-[52%] sm:pl-2 sm:pr-4">
                <Skeleton className="h-4 w-4/5" />
              </td>
              <td className="hidden w-[60px] pr-2 align-middle sm:table-cell sm:pr-4">
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="hidden w-[96px] pl-2 text-right align-middle sm:table-cell sm:pl-4">
                <Skeleton className="h-8 w-20 bg-primary/50 sm:h-9 sm:w-20" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkeletonTable;
