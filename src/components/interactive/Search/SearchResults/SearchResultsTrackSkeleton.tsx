import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Heart, Music, Play, User } from "lucide-react";

const SearchResultsTrackSkeleton = () => {
  return (
    <div className="lg flex w-full flex-col gap-8 px-3">
      {/* Top Row */}
      <div className="flex gap-8">
        {/* Art */}
        <Skeleton className="h-48 w-48 rounded-3xl border-2 border-primary" />

        <div className="flex flex-grow flex-col justify-evenly">
          <div className="flex flex-col gap-2 overflow-scroll p-0">
            {/* Artist & Title */}
            <Skeleton className="my-1 h-5 w-36" />
            <Skeleton className="my-1 h-4 w-32" />

            {/* Play & Wishlist */}
            <div className="flex gap-2 ">
              <div className="mt-3 flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full bg-primary">
                <Play className="h-6 w-6 text-foreground" />
              </div>
              <div className="mt-3 flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full ">
                <Heart className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex h-5 items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <Skeleton className="h-2 w-32" />
        </div>
        <div className="flex h-5 items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <Skeleton className="h-2 w-32" />
        </div>
        <div className="flex h-5 items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <Skeleton className="h-2 w-32" />
        </div>
        <div className="flex h-5 items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <Skeleton className="h-2 w-32" />
        </div>
      </div>
    </div>
  );
};

export default SearchResultsTrackSkeleton;
