import { AppRouter } from "@/server/api/root";
import { inferProcedureOutput } from "@trpc/server";

interface ISearchResultsTrackProps {
  songData: inferProcedureOutput<AppRouter["song"]["getSongById"]>;
}

export default function SearchResultsTrack({ songData }: ISearchResultsTrackProps) {
  const { albumArtUrl, title, duration, album } = songData!;

  return (
    <div className="lg m-0 flex w-96 flex-col items-center justify-evenly gap-4 rounded-bl-2xl rounded-tl-2xl p-8">
      <figure className="content-center">
        {albumArtUrl && (
          <img src={albumArtUrl} alt="Album cover art" className="h-48 w-48 rounded-xl" />
        )}
      </figure>
      <div className="text-primary-content flex flex-col items-center justify-start gap-1 overflow-scroll p-0 text-center">
        <h2 className="text-xl font-bold">{"artist"}</h2>
        <p>
          {title} ({duration})
        </p>
        <p>[{album}]</p>
      </div>
    </div>
  );
}
