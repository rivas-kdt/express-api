import express from "express";
import { neon } from "@neondatabase/serverless";
const app = express();

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

app.get("/photos/id=:id", async (req, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const photoId = req.params.id;

    const [photo] = await sql`
              SELECT p.id, p.title, p.description, p.file_url, p.created_at, p.album_id,
                     a.title as album_title
              FROM photos p
              JOIN albums a ON p.album_id = a.id
              WHERE p.id = ${photoId}
            `;

    if (!photo) {
      res.status(404).send("Photo not found ");
    }

    res.status(200).send(photo);
  } catch (error) {
    res.status(500).send("Error Fetching Photo ");
  }
});

app.get("/api/users/:id", (req, res) => {
  res.json({
    id: req.params.id,
    message: `Fetching user with ID: ${req.params.id}`,
  });
});

module.exports = app;
