import { api } from "@/lib/api";

const useSpotifyTokens = () => {
  const { data: clientCredentialsData } = api.clientCredentials.getToken.useQuery(undefined, {
    staleTime: 25 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });

  return {
    accessToken: clientCredentialsData?.token,
  };
};

export default useSpotifyTokens;
