import cloudinary from "@/lib/cloudinary";
import { getServerAuthSession } from "@/server/auth";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: {
      // 5 MB source file → ~6.7 MB base64 + JSON framing
      sizeLimit: "7mb",
    },
  },
};

// Simple in-memory rate limiter: 5 uploads per user per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const DATA_URL_RE = /^data:(image\/[a-z]+);base64,/;

const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  return match?.[1] ?? null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const session = await getServerAuthSession({ req, res });
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    if (!checkRateLimit(session.user.id)) {
      return res.status(429).json({ error: "Too many uploads. Please wait a moment." });
    }

    const { dataUrl, currentImageUrl } = req.body as {
      dataUrl: string;
      currentImageUrl?: string;
    };

    if (!dataUrl) return res.status(400).json({ error: "No image data provided" });

    const mimeMatch = DATA_URL_RE.exec(dataUrl);
    if (!mimeMatch) return res.status(400).json({ error: "Invalid image format" });

    const mimeType = mimeMatch[1];
    if (!ALLOWED_MIME_TYPES.has(mimeType!)) {
      return res.status(400).json({ error: "Only JPEG, PNG, and WebP images are allowed" });
    }

    // Delete old Cloudinary image if it exists
    if (currentImageUrl?.includes("res.cloudinary.com")) {
      const publicId = extractPublicId(currentImageUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "avatars",
      transformation: [
        { width: 256, height: 256, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("[avatar upload]", err);
    const message =
      process.env.NODE_ENV === "development" && err instanceof Error
        ? err.message
        : "Upload failed. Please try again.";
    return res.status(500).json({ error: message });
  }
}
