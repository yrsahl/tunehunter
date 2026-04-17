import { api } from "@/lib/api";
import { fetchSpotifyTrackById } from "@/services/spotify/api";
import { useEffect, useRef, useState } from "react";
import useSpotifyTokens from "./useSpotifyTokens";

const useSpotifyPreviewUrl = (
  spotifyId: string | null | undefined,
  title?: string,
  artist?: string,
  existingPreviewUrl?: string | null,
  songId?: string,
) => {
  const { accessToken } = useSpotifyTokens();
  // Use a ref so the token is always current inside the effect without being a dependency.
  // This prevents the effect from re-running (and showing loading again) just because the
  // token loaded asynchronously after the component mounted.
  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;

  const savePreviewUrl = api.song.savePreviewUrl.useMutation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingPreviewUrl ?? null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Already have it from DB — no need to fetch
    if (existingPreviewUrl) {
      setPreviewUrl(existingPreviewUrl);
      return;
    }

    if (!spotifyId && !title) return;
    if (!accessTokenRef.current) return; // wait for client credentials token before attempting Step 1
    let cancelled = false;

    const fetchPreview = async () => {
      setIsLoading(true);

      // Step 1: try direct Spotify track lookup by ID (precise, no extra search)
      if (spotifyId && accessTokenRef.current) {
        const url = await fetchSpotifyTrackById(accessTokenRef.current, spotifyId);
        if (!cancelled && url) {
          setPreviewUrl(url);
          if (songId) savePreviewUrl.mutate({ songId, previewUrl: url });
          setIsLoading(false);
          return;
        }
      }

      // Step 2: fallback to spotify-preview-finder (finds previews Spotify API omits)
      if (title && !cancelled) {
        const params = new URLSearchParams({ title });
        if (artist) params.set("artist", artist);
        try {
          const response = await fetch(`/api/spotify/preview?${params}`);
          if (!cancelled && response.ok) {
            const data = (await response.json()) as { previewUrl: string | null };
            setPreviewUrl(data.previewUrl);
            if (songId && data.previewUrl) savePreviewUrl.mutate({ songId, previewUrl: data.previewUrl });
          }
        } catch {
          // silently fall through — component will show "Open in Spotify" link
        }
      }

      if (!cancelled) setIsLoading(false);
    };

    fetchPreview();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyId, title, artist, existingPreviewUrl, !!accessToken]); // !!accessToken re-fires once token first loads; ref handles subsequent refreshes

  return { previewUrl, isLoading };
};

export default useSpotifyPreviewUrl;
