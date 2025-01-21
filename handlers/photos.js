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
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
