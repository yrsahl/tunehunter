import { Skeleton } from "@/components/ui/skeleton";
import { CountryCode } from "@/lib/validators";

interface SongListingRowSkeletonProps {
  store: string;
  region: CountryCode;
}

const SongListingRowSkeleton = ({ store, region }: SongListingRowSkeletonProps) => {
  return (
    <tr>
      {/* Store */}
      <td>
        <div className="flex items-center space-x-5">
          <div className="avatar">
            <div className="mask mask-squircle h-10 w-10 sm:h-12 sm:w-12">
              <img src={`logos/${store.toLowerCase()}.svg`} alt="Avatar Tailwind CSS Component" />
            </div>
          </div>
        </div>
      </td>

      {/* Quality */}
      <td className="pl-2 sm:pl-0">
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
      <td className="hidden sm:table-cell md:hidden lg:table-cell">
        <Skeleton className="h-2 w-28 sm:w-32" />
      </td>

      {/* Link */}
      <td className="">
        <Skeleton className="mx-auto h-8 w-8 rounded-full" />
      </td>
    </tr>
  );
};

export default SongListingRowSkeleton;
