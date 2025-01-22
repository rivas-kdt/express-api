import { neon } from "@neondatabase/serverless";
import "dotenv/config.js";

const url = "postgres://neondb_owner:qTW3gjS8ltVk@ep-wild-queen-a1lj8262-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
const sql = neon(process.env.DATABASE_URL || url);

export const photos = async (req, res) => {
  try {
    const photos = await sql`SELECT * FROM photos`;

    if (!photos) {
      return res.status(404).json({ error: "Photos not found" });
    }

    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: "Error fetching photos" });
  }
};

export const photosByID = async (req, res) => {
  try {
    const photos = await sql`SELECT * FROM photos WHERE id=${req.params.id}`;

    if (!photos) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ error: "Error fetching photo" });
  }
};

export const photosByAlbum = async (req, res) => {
  try {
    const photos = await sql`
    SELECT p.id, p.title, p.description, p.file_url, p.created_at, 
    a.title as album_title
      FROM photos p
      JOIN album_photos ap ON ap.photo_id = p.id
      JOIN albums a ON a.id = ap.album_id
      WHERE a.id =${req.params.id}`;

    if (!photos) {
      return res.status(404).json({ error: "Photos in album not found" });
    }

    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: "Error fetching photos" });
  }
};

export const photosByUser = async (req, res) => {
  try {
    const photos =
      await sql`SELECT * FROM photos WHERE user_id =${req.params.id}`;

    if (!photos) {
      return res.status(404).json({ error: "Photos in user not found" });
    }

    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: "Error fetching photos" });
  }
};
