import { api } from "@/lib/api";
import { useSession } from "next-auth/react";

const useSpotifyTokens = () => {
  const { data: userData, status } = useSession();
  const loggedIn = status === "authenticated";

  const userId = userData?.user.id;

  const { data: spotifyAccountData } = api.account.getSpotifyAccountById.useQuery(
    { userId: userId ?? "" },
    {
      enabled: loggedIn && !!userId,
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes to refresh the access token
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  );
  const { data: clientCredentialsData } = api.clientCredentials.getToken.useQuery(undefined, {
    staleTime: 25 * 60 * 1000,       // Consider fresh for 25 minutes
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
