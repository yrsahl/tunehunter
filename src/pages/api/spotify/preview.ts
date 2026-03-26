import type { NextApiRequest, NextApiResponse } from "next";

type PreviewResult = {
  previewUrls: string[];
};

type FinderResponse = {
  success: boolean;
  results?: PreviewResult[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { title, artist } = req.query;
  if (!title) return res.status(400).json({ error: "Missing title" });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const spotifyPreviewFinder = require("spotify-preview-finder") as (
    title: string,
    artist?: string,
    limit?: number,
  ) => Promise<FinderResponse>;

  const result = await spotifyPreviewFinder(title as string, artist as string | undefined, 3);

  if (!result.success || !result.results?.length) {
    return res.status(200).json({ previewUrl: null });
  }

  const previewUrl =
    result.results.find((r) => r.previewUrls?.length > 0)?.previewUrls[0] ?? null;

  return res.status(200).json({ previewUrl });
}
