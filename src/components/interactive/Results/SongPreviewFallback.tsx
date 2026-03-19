import { Album, Calendar, Clock, Music } from "lucide-react";

const SongPreviewFallback = () => {
  return (
    <>
      {/* Mobile */}
      <div className="mx-auto block w-4/5 pb-2 text-center sm:pb-0 sm:pt-2 md:hidden">
        <h2 className="text-lg font-bold tracking-normal drop-shadow-sm sm:text-xl text-muted-foreground">
          Track not found
        </h2>
      </div>
      {/* Medium and up */}
      <div className="my-auto hidden w-1/2 md:block">
        <div className="flex w-full flex-col gap-6 pl-2">
          {/* Top Row */}
          <div className="flex gap-8 rounded-3xl px-3 py-4 pl-4 drop-shadow-sm">
            {/* Art placeholder */}
            <figure className="h-48 w-48 flex-shrink-0 content-center overflow-hidden rounded-2xl drop-shadow-lg bg-muted" />
            <div className="flex flex-grow flex-col justify-evenly">
              <div className="flex flex-col gap-2 p-0">
                <h2 className="text-lg font-bold tracking-normal drop-shadow-sm text-muted-foreground">
                  Track not found
                </h2>
                <p className="text-md text-muted-foreground">—</p>
              </div>
            </div>
          </div>
          {/* Details */}
          <div className="grid grid-cols-2 gap-4 px-4">
            <div className="flex items-center gap-3">
              <Music className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">—</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">—</span>
            </div>
            <div className="flex items-center gap-3">
              <Album className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">—</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">—</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SongPreviewFallback;
