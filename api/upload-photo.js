import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false, // Disables body parsing so `req` remains a stream
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const filename = searchParams.get('filename') || "upload.jpg";

  try {
    const blob = await put(filename, req, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error("Blob upload error:", error);
    return res.status(500).json({ error: error.message });
  }
}
