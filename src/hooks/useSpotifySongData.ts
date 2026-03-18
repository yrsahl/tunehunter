import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import { Track } from "@/types/song-types";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export type SpotifyTabData = {
  currentlyPlaying: Track | null;
  queue: Track[] | null;
  recentlyPlayed: Track[] | null;
  topTracks: Track[] | null;
};

const useSpotifySongData = () => {
  const { spotifyUserData, refetchSpotifyUserData, isSpotifyUserDataLoading } =
    useSpotifyUserDataContext();
  const storeSearchResults = api.song.storeQueryResults.useMutation();
  const [isDataStored, setIsDataStored] = useState(false);

  const { currentlyPlaying, queue, topTracks, recentlyPlayed } = spotifyUserData || {};

  const currentlyPlayingTrack = currentlyPlaying && {
    song: {
      id: currentlyPlaying?.item.id,
      title: currentlyPlaying?.item.name,
      duration: currentlyPlaying?.item.duration_ms,
      album: currentlyPlaying?.item.album.name,
      albumArtUrl: currentlyPlaying?.item.album.images[0]?.url || null,
      year: currentlyPlaying?.item.album.release_date,
      spotifyUrl: currentlyPlaying?.item.external_urls.spotify,
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
      id: queuedSong.id,
      title: queuedSong.name,
      duration: queuedSong.duration_ms,
      album: queuedSong.album.name,
      albumArtUrl: queuedSong.album.images[0]?.url || null,
      year: queuedSong.album.release_date,
      spotifyUrl: queuedSong.external_urls.spotify,
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
      id: track.id,
      title: track.name,
      duration: track.duration_ms,
      album: track.album.name,
      albumArtUrl: track.album.images[0]?.url || null,
      year: track.album.release_date,
      spotifyUrl: track.external_urls.spotify,
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
      id: track.track.id,
      title: track.track.name,
      duration: track.track.duration_ms,
      album: track.track.album.name,
      albumArtUrl: track.track.album.images[0]?.url || null,
      year: track.track.album.release_date,
      spotifyUrl: track.track.external_urls.spotify,
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

  useEffect(() => {
    if (!spotifyData || isDataStored) return;

    const { queue, topTracks, recentlyPlayed } = spotifyData;
    if (!(queue && topTracks && recentlyPlayed)) {
      return;
    }

    // Store in DB
    const allResults: Track[] = [...queue, ...topTracks, ...recentlyPlayed].filter(
      (result) => result !== null,
    );
    storeSearchResults.mutate(allResults);
    setIsDataStored(true);
  }, [spotifyData, isDataStored]);

  // Return
  return {
    data: spotifyData,
    isLoading: isSpotifyUserDataLoading,
    refetchData: refetchSpotifyUserData,
  };
};

export default useSpotifySongData;
