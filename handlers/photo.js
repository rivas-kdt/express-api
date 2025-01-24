import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export const feedPhotos = async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, process.env.JWT_SECRET);
    if (!claims) {
      res.status(401).json("Unauthenticated");
    }
    const id = claims.id;
    const photos = await sql`
    SELECT ap.photo_id, ap.album_id, p.user_id, u.full_name
    FROM album_photos ap 
    JOIN photos p ON p.id=ap.photo_id
    JOIN users u ON u.id=p.user_id
    WHERE ap.album_id IN (
    SELECT id FROM albums WHERE is_public = 'TRUE'
    UNION
    SELECT id FROM albums WHERE user_id = ${id})`;
    if (!photos) {
      return res.status(404).json({ error: "Photos not found" });
    }
    res.status(200).json(photos);
  } catch (error) {
    console.error("Error Fetching Photos");
    res.status(500).json({ error: "Error Fetching Photos" });
  }
};
