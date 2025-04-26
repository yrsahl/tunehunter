import { Skeleton } from "@/components/ui/skeleton";
import { CountryCode } from "@/helpers/region";

interface SearchResultsRowSkeletonProps {
  store: string;
  region: CountryCode;
}

const VendorResultsRowSkeleton = ({ store, region }: SearchResultsRowSkeletonProps) => {
  return (
    <tr>
      {/* Store */}
      <td>
        <div className="flex items-center space-x-5">
          <div className="avatar ">
            <div className="mask mask-squircle h-12 w-12">
              <img src={`logos/${store.toLowerCase()}.svg`} alt="Avatar Tailwind CSS Component" />
            </div>
          </div>
        </div>
      </td>

      {/* Quality */}
      <td>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-11" />
          <Skeleton className="h-3 w-16" />
        </div>
      </td>

      {/* Price */}
      <td>
        <Skeleton className="h-4 w-12" />
      </td>

      {/* Artist's share */}
      <td>
        <Skeleton className="h-2 w-28" />
      </td>

      {/* Link */}
      <td>
        <Skeleton className="h-8 w-8 rounded-full" />
      </td>
    </tr>
  );
};

export default VendorResultsRowSkeleton;
