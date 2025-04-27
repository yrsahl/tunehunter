import { fetchSpotifyArtistData } from "./fetch-spotify-data";

export const amendArtistData = async (accessToken: string, artistIds: string[]) => {
  // 1. Get data from Spotify API
  const spotifyArtistDataQuery = artistIds.map(async (artistId) =>
    fetchSpotifyArtistData(accessToken, artistId),
  );
  const spotifyArtistsData = await Promise.all(spotifyArtistDataQuery);

  // 2. Amend data
  const amendedArtistsData = spotifyArtistsData.map((artist) => ({
    id: artist?.id,
    name: artist?.name,
    popularity: artist?.popularity,
    followers: artist?.followers.total,
    genres: artist?.genres,
  }));

  // 3. Return data
  return amendedArtistsData;
};
