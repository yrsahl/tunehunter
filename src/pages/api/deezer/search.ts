import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q, limit } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });

  const params = new URLSearchParams({
    q: q as string,
    limit: (limit as string) ?? "30",
    output: "json",
  });

  const response = await fetch(`https://api.deezer.com/search?${params}`);
  if (!response.ok) return res.status(response.status).end();

  const data = await response.json();
  res.status(200).json(data);
}
