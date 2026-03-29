// Temporary test endpoint — delete after verifying Telegram alerts work.
// Usage: curl "http://localhost:3000/api/test-alert"

import { env } from "@/env.js";
import { sendTelegram } from "@/lib/telegram";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (env.NODE_ENV === "production") return res.status(404).end();

  await sendTelegram(
    `<b>⚠️ BANDCAMP scraper down</b>\n` +
    `3 unreachable errors in the last 10 minutes.\n\n<i>(test alert)</i>`,
  );

  res.status(200).json({ ok: true });
}
