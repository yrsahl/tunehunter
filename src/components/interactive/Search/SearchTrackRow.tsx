import { SpotifyTrack } from "@/types/spotify";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

interface SpotifyTableRowProps {
  track: SpotifyTrack;
  userCountry?: string;
}

const SearchTrackRow = ({ track }: SpotifyTableRowProps) => {
  const trackDuration = new Date(track.duration_ms).toISOString().substr(14, 5);
  const router = useRouter();
  const addSearchActivity = api.userActivities.addSearchActivity.useMutation();
  const addSong = api.song.addSong.useMutation();
  const addArtists = api.artist.addArtists.useMutation();
  const addArtistsToSong = api.songArtists.addArtistsToSong.useMutation();

  const trackSearchHref = {
    pathname: router.pathname,
    query: { ...router.query, id: track.id },
  };

  const addSongDataToDB = async () => {
    await addArtists.mutateAsync(
      track.artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
        spotifyUrl: artist.external_urls.spotify,
      })),
    );
    await addSong.mutateAsync({
      id: track.id,
      title: track.name,
      duration: track.duration_ms,
      album: track.album.name,
      albumArtUrl: track.album.images[0]?.url || undefined,
      year: track.album.release_date,
      genre: track.album.album_type,
      spotifyUrl: track.external_urls.spotify,
    });
    await addArtistsToSong.mutateAsync({
      songId: track.id,
      artistIds: track.artists.map((artist) => artist.id),
    });
  };

  const startSearch = async () => {
    console.log("track", track);
    await addSongDataToDB();
    addSearchActivity.mutateAsync({ songId: track.id });
    router.push(trackSearchHref);
  };

  return (
    <motion.tr whileHover={{ scale: 1.03 }} className="cursor-pointer" onClick={startSearch}>
      <td className="py-3 pr-8">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="mask mask-squircle h-11 w-11">
              <img src={track.album.images[0]?.url} />
            </div>
          </div>
        </div>
      </td>
      <td className="overflow-hidden pr-4 align-middle">
        <p>{track.artists[0]?.name}</p>
        {track.artists[1] && (
          <p className="overflow-ellipsis whitespace-nowrap text-muted-foreground">
            {track.artists[1]?.name}
          </p>
        )}
      </td>
      <td className=" pr-4 align-middle">
        <span>{track.name}</span>
      </td>
      <td className="text-right align-middle text-base opacity-50">{trackDuration}</td>
    </motion.tr>
  );
};

export default SearchTrackRow;
