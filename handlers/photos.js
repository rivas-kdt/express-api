import { neon } from "@neondatabase/serverless";
import "dotenv/config.js";

const sql = neon(process.env.DATABASE_URL);

exports.photos = async (req, res) => {
  try {
    const photos = await sql`SELECT * FROM photos`;

    if (!photos) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ error: "Error fetching photo" });
  }
};
