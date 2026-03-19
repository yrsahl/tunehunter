import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import { SpotifyTrack } from "@/types/song-types";

export type SpotifyTabData = {
  currentlyPlaying: SpotifyTrack | null;
  queue: SpotifyTrack[] | null;
  recentlyPlayed: SpotifyTrack[] | null;
  topTracks: SpotifyTrack[] | null;
};

const useSpotifySongData = () => {
  const { spotifyUserData, refetchSpotifyUserData, isSpotifyUserDataLoading } =
    useSpotifyUserDataContext();

  const { currentlyPlaying, queue, topTracks, recentlyPlayed } = spotifyUserData || {};

  const currentlyPlayingTrack = currentlyPlaying && {
    song: {
      title: currentlyPlaying?.item.name,
      duration: currentlyPlaying?.item.duration_ms,
      album: currentlyPlaying?.item.album.name,
      albumArtUrl: currentlyPlaying?.item.album.images[0]?.url || null,
      year: currentlyPlaying?.item.album.release_date,
      spotifyId: currentlyPlaying?.item.id,
      isrc: null,
    },
    artists: currentlyPlaying?.item.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      popularity: null,
      followers: null,
    })),
  };

  const spotifyQueue = queue?.queue.map((queuedSong) => ({
    song: {
      title: queuedSong.name,
      duration: queuedSong.duration_ms,
      album: queuedSong.album.name,
      albumArtUrl: queuedSong.album.images[0]?.url || null,
      year: queuedSong.album.release_date,
      spotifyId: queuedSong.id,
      isrc: null,
    },
    artists: queuedSong.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      popularity: null,
      followers: null,
    })),
  }));

  const spotifyTopTracks = topTracks?.items.map((track) => ({
    song: {
      title: track.name,
      duration: track.duration_ms,
      album: track.album.name,
      albumArtUrl: track.album.images[0]?.url || null,
      year: track.album.release_date,
      spotifyId: track.id,
      isrc: null,
    },
    artists: track.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      popularity: null,
      followers: null,
    })),
  }));

  const spotifyRecentlyPlayed = recentlyPlayed?.items.map((track) => ({
    song: {
      title: track.track.name,
      duration: track.track.duration_ms,
      album: track.track.album.name,
      albumArtUrl: track.track.album.images[0]?.url || null,
      year: track.track.album.release_date,
      spotifyId: track.track.id,
      isrc: null,
    },
    artists: track.track.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      popularity: null,
      followers: null,
    })),
  }));

  const spotifyData: SpotifyTabData = {
    currentlyPlaying: currentlyPlayingTrack || null,
    queue: spotifyQueue || null,
    topTracks: spotifyTopTracks || null,
    recentlyPlayed: spotifyRecentlyPlayed || null,
  };

  // Return
  return {
    data: spotifyData,
    isLoading: isSpotifyUserDataLoading,
    refetchData: refetchSpotifyUserData,
  };
};

export default useSpotifySongData;
