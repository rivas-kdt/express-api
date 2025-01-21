import express from "express";
import cors from "cors";
import { neon } from "@neondatabase/serverless";
import "dotenv/config.js"

const app = express();

app.use(cors());
app.use(express.json());
const sql = neon(process.env.DATABASE_URL);

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

app.get("/photos/id=:id", async (req, res) => {
  try {
    const photoId = req.params.id;
    const [photo] = await sql`
        SELECT p.id, p.title, p.description, p.file_url, p.created_at, p.album_id,
               a.title as album_title
        FROM photos p
        JOIN albums a ON p.album_id = a.id
        WHERE p.id = ${photoId}
      `;

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.status(200).json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ error: "Error fetching photo" });
  }
});

app.get("/api/users/:id", (req, res) => {
  res.json({
    id: req.params.id,
    message: `Fetching user with ID: ${req.params.id}`,
  });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
