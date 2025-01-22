import { neon } from "@neondatabase/serverless";
import "dotenv/config.js";

const sql = neon(process.env.DATABASE_URL);

exports.albums = async (req, res) => {
  try {
    const albums = await sql`SELECT * FROM albums`;

    if (!albums) {
      return res.status(404).json({ error: "Albums not found" });
    }
    res.status(200).json(albums);
  } catch (error) {
    console.error("Error Fetching Albums");
    res.status(500).json({ error: "Error Fetching Albums" });
  }
};

exports.albumByID = async (req, res) => {
  try {
    const albums = await sql`SELECT * FROM albums WHERE id = ${req.params.id}`;

    if (!albums) {
      return res.status(404).json({ error: "Album not found" });
    }
    res.status(200).json(albums);
  } catch (error) {
    console.error("Error Fetching Album");
    res.status(500).json({ error: "Error Fetching Album" });
  }
};

exports.albumByUser = async (req, res) => {
    try {
      const albums = await sql`SELECT * FROM albums WHERE user_id = ${req.params.id}`;
  
      if (!albums) {
        return res.status(404).json({ error: "User's Albums Not Found" });
      }
      res.status(200).json(albums);
    } catch (error) {
      console.error("Error Fetching User's Albums");
      res.status(500).json({ error: "Error Fetching User's Albums" });
    }
  };