import { neon } from "@neondatabase/serverless";
import "dotenv/config.js";
import { put } from "@vercel/blob";
import jwt from "jsonwebtoken";
import multer from "multer";

const storage = multer.memoryStorage(); // Store file in memory or configure diskStorage if you need to store files locally
const upload = multer({ storage: storage });
const url =
  "postgres://neondb_owner:qTW3gjS8ltVk@ep-wild-queen-a1lj8262-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
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
//used in app
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

export const postAlbumPhoto = async (req, res) => {
  upload.single("image");
  const albumId = req.params.id;
  const cookie = req.cookies["jwt"];
  const claims = jwt.verify(cookie, process.env.JWT_SECRET);
  if (!claims) {
    res.status(401).json("Unauthenticated");
  }
  const id = claims.id;

  const image = req.file;
  if (!image) {
    return res.status(400).json({ error: "Image file is required" });
  }
  const name = "try";
  const imageName = `${id}_${image.originalname}`;
  const { title, description } = req.body;

  const blob = await put(`photos/${id}/${imageName}`, img, {
    access: "public",
  });
  const result = await sql`
  INSERT INTO photos (user_id, title, description, file_url, original_filename, file_size, content_type)
  VALUES (${id}, ${title}, ${description}, ${blob.url}, ${imageName}, ${img.size}, ${img.mimetype})
  RETURNING id, title, description, file_url, created_at
`;
  await sql`
    INSERT INTO album_photos (album_id, photo_id)
    VALUES (${albumId}, ${result[0].id})
  `;
  res.status(200).json(result[0]);
};
