import { neon } from "@neondatabase/serverless";
import "dotenv/config.js";

const sql = neon(process.env.DATABASE_URL);

exports.photos = async (req, res) => {
  try {
    const photos = await sql`
      SELECT p.id, p.title, p.description, p.file_url, p.created_at, p.album_id,
             a.title as album_title
      FROM photos p
      JOIN albums a ON p.album_id = a.id
      `;

    if (!photos) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ error: "Error fetching photo" });
  }
};
