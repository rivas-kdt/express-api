import { neon } from "@neondatabase/serverless";

exports.photos = async (req, res) => {
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
};
