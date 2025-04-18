import { AppRouter } from "@/server/api/root";
import { inferProcedureOutput } from "@trpc/server";

interface ISearchResultsTrackProps {
  songData: inferProcedureOutput<AppRouter["song"]["getSongById"]>;
}

export default function SearchResultsTrack({ songData }: ISearchResultsTrackProps) {
  return (
    <div className="">{songData?.id}</div>
    // <div className="lg m-0 flex w-96 flex-col items-center justify-evenly gap-4 rounded-2xl bg-primary p-8">
    //   <figure className="content-center">
    //     <img src={songData[0].artLink} alt="Album cover art" className="h-40 w-40 rounded-xl" />
    //   </figure>
    //   <div className="text-primary-content flex flex-col items-center justify-start gap-1 overflow-scroll p-0 text-center">
    //     <h2 className="text-xl font-bold">{songData[0].artist}</h2>
    //     <p>
    //       {songData[0].title} ({formatDuration(songData[0].duration)})
    //     </p>
    //     <p>[{songData[0].album}]</p>
    //   </div>
    //   <label
    //     htmlFor="preview-modal"
    //     className={`btn btn-outline text-primary-content w-auto rounded-full text-xs ${songData.length === 1 ? "hidden" : ""}`}
    //   >
    //     {t("trackpreview.wrongsong")}
    //   </label>
    //   <Modal />
    // </div>
  );
}
