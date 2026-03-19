import { fetchSpotifyTrack } from "./api";

export const enrichSongData = async (
  userAccessToken: string,
  artist: string,
  title: string,
  duration: number,
) => {
  // Check if song is already rich

  // If not, query spotify data and store it
  const query = `${artist} - ${title}`;
  const spotifyData = await fetchSpotifyTrack(userAccessToken, query, duration);

  return spotifyData;
};
