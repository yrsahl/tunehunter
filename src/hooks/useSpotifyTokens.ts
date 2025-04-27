import { api } from "@/utils/api";
import { useSession } from "next-auth/react";

const useSpotifyTokens = () => {
  const { data: userData, status } = useSession();
  const loggedIn = status === "authenticated";

  const { data: spotifyAccountData } = api.account.getSpotifyAccountById.useQuery(
    { userId: userData?.user.id! },
    {
      enabled: loggedIn,
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes to refresh the access token
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  );
  const { data: clientCredentialsData } = api.clientCredentials.getToken.useQuery(undefined, {
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes to refresh the access token
  });
  const userAccessToken = spotifyAccountData?.data?.access_token;
  const appAccessToken = clientCredentialsData?.token;
  const accessToken = userAccessToken || appAccessToken;

  return {
    userAccessToken,
    appAccessToken,
    accessToken,
  };
};

export default useSpotifyTokens;
