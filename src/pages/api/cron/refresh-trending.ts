import { db } from "@/server/db";
import {
  trendingViewLast30Days,
  trendingViewLast7Days,
  trendingViewToday,
} from "@/server/db/schema";
import { env } from "@/env.js";
import { redis } from "@/lib/redis";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.authorization !== `Bearer ${env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  await Promise.all([
    db.refreshMaterializedView(trendingViewToday),
    db.refreshMaterializedView(trendingViewLast7Days),
    db.refreshMaterializedView(trendingViewLast30Days),
  ]);

  await redis.set("trending:last_refreshed", Date.now().toString());

  res.status(200).json({ refreshed: true, at: new Date().toISOString() });
}
