import { Skeleton } from "@/components/ui/skeleton";

const SearchResultsTrackSkeleton = () => {
  return (
    <div className="lg flex w-full flex-col gap-8 pl-2">
      {/* Top Row */}
      <div className="flex gap-8 px-3 py-4 pl-4">
        {/* Art */}
        <Skeleton className="h-48 w-48 rounded-3xl drop-shadow-lg" />

        <div className="flex flex-grow flex-col justify-evenly">
          <div className="flex flex-col gap-2 overflow-scroll p-0">
            {/* Artist & Title */}
            <Skeleton className="my-1 h-5 w-36" />
            <Skeleton className="my-1 h-4 w-32" />

            {/* Play & Wishlist */}
            <div className="mt-3 flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-primary" />
              <Skeleton className="my-auto h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 px-4">
        <div className="flex h-5 items-center gap-2">
          <Skeleton className="h-4 w-4 bg-primary" />
          <Skeleton className="h-2 w-32" />
        </div>
        <div className="flex h-5 items-center gap-2">
          <Skeleton className="h-4 w-4 bg-primary" />
          <Skeleton className="h-2 w-32" />
        </div>
        <div className="flex h-5 items-center gap-2">
          <Skeleton className="h-4 w-4 bg-primary" />
          <Skeleton className="h-2 w-32" />
        </div>
        <div className="flex h-5 items-center gap-2">
          <Skeleton className="h-4 w-4 bg-primary" />
          <Skeleton className="h-2 w-32" />
        </div>
      </div>
    </div>
  );
};

export default SearchResultsTrackSkeleton;
