import cloudinary from "@/lib/cloudinary";
import { getServerAuthSession } from "@/server/auth";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  return match?.[1] ?? null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerAuthSession({ req, res });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { dataUrl, currentImageUrl } = req.body as {
    dataUrl: string;
    currentImageUrl?: string;
  };
  if (!dataUrl) return res.status(400).json({ error: "No image data provided" });

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
}
