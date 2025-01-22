import { neon } from "@neondatabase/serverless";
import "dotenv/config.js";

const url = "postgres://neondb_owner:qTW3gjS8ltVk@ep-wild-queen-a1lj8262-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
const sql = neon(process.env.DATABASE_URL || url);

export const albums = async (req, res) => {
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

export const albumByID = async (req, res) => {
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

export const albumByUser = async (req, res) => {
  try {
    const albums =
      await sql`SELECT * FROM albums WHERE user_id = ${req.params.id}`;

    if (!albums) {
      return res.status(404).json({ error: "User's Albums Not Found" });
    }
    res.status(200).json(albums);
  } catch (error) {
    console.error("Error Fetching User's Albums");
    res.status(500).json({ error: "Error Fetching User's Albums" });
  }
};

export const albumPhotos = async (req, res) => {
  try {
    const [album] = await sql`
    SELECT id, title, description, is_public, created_at, user_id, cover_photo_id
    FROM albums WHERE id = ${req.params.id}`;

    const photos = await sql`
    SELECT p.id, p.title, p.description, p.file_url, p.created_at, p.thumbnail_url, p.original_filename, p.file_size, p.width, p.height, p.content_type
    FROM photos p
    JOIN album_photos ap ON p.id = ap.photo_id
    WHERE ap.album_id = ${req.params.id}
    ORDER BY p.created_at DESC`;

    const tags = await sql`
    SELECT pt.photo_id, t.name
    FROM photo_tags pt
    JOIN tags t ON pt.tag_id = t.id
    WHERE pt.photo_id IN (SELECT p.id FROM photos p JOIN album_photos ap ON p.id = ap.photo_id WHERE ap.album_id = ${req.params.id})`;

    const locations = await sql`
    SELECT pl.photo_id, l.name, l.latitude, l.longitude
    FROM photo_locations pl
    JOIN locations l ON pl.location_id = l.id
    WHERE pl.photo_id IN (SELECT p.id FROM photos p JOIN album_photos ap ON p.id = ap.photo_id WHERE ap.album_id = ${req.params.id})`;

    const photosWithDetails = photos.map((photo) => {
      // Fetch associated tags
      const photoTags = tags
        .filter((tag) => tag.photo_id === photo.id)
        .map((tag) => tag.name);
      const photoLocations = locations
        .filter((location) => location.photo_id === photo.id)
        .map((location) => ({
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
        }));

      return {
        ...photo,
        tags: photoTags,
        locations: photoLocations,
      };
    });

    res.status(200).json({ ...album, photos: photosWithDetails });
  } catch (error) {}
};
