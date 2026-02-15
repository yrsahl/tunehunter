import { Skeleton } from "@/components/ui/skeleton";

const SongPreviewSkeleton = () => {
  return (
    <>
      {/* Mobile */}
      <div className="mx-auto flex w-4/5 flex-col items-center gap-[2px] pb-2 sm:gap-1 sm:pb-0 sm:pt-2 md:hidden">
        <Skeleton className="my-1 h-5 w-36 lg:w-36" />
        <Skeleton className="my-1 h-3.5 w-28 sm:h-4 lg:w-32" />
      </div>
      {/* Medium and up */}

      <div className="lg my-auto hidden w-1/2 flex-col gap-6 pl-2 md:flex">
        {/* Top Row */}
        <div className="flex gap-8 px-3 py-4 pl-4">
          {/* Art */}
          <Skeleton className="h-48 w-48 rounded-3xl drop-shadow-lg" />

          <div className="flex flex-grow flex-col justify-evenly">
            <div className="flex flex-col gap-2 p-0">
              {/* Artist & Title */}
              <Skeleton className="my-1 h-5 w-28 lg:w-36" />
              <div className="flex flex-col gap-1">
                <Skeleton className="my-1 h-3.5 w-24 lg:w-32" />
                <Skeleton className="my-1 h-3.5 w-24 lg:w-32" />
              </div>

              {/* Play & Wishlist */}
              <div className="mt-3 flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-primary" />
                <Skeleton className="my-auto h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 px-4">
          <div className="flex h-5 items-center gap-3">
            <Skeleton className="h-4 w-4 bg-primary" />
            <Skeleton className="h-2 w-24 lg:w-28" />
          </div>
          <div className="flex h-5 items-center gap-3">
            <Skeleton className="h-4 w-4 bg-primary" />
            <Skeleton className="h-2 w-24 lg:w-28" />
          </div>
          <div className="flex h-5 items-center gap-3">
            <Skeleton className="h-4 w-4 bg-primary" />
            <Skeleton className="h-2 w-24 lg:w-28" />
          </div>
          <div className="flex h-5 items-center gap-3">
            <Skeleton className="h-4 w-4 bg-primary" />
            <Skeleton className="h-2 w-24 lg:w-28" />
          </div>
        </div>
      </div>
    </>
  );
};

export default SongPreviewSkeleton;
