import { neon } from "@neondatabase/serverless";
import "dotenv/config.js";
import { put } from "@vercel/blob";
import jwt from "jsonwebtoken";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const sql = neon(process.env.DATABASE_URL);

// Middleware for handling file uploads
export const uploadMiddleware = upload.single('image');

export const albums = async (req, res) => {
  try {
    const albums = await sql`SELECT * FROM albums`;
    res.status(200).json(albums);
  } catch (error) {
    console.error("Error Fetching Albums:", error);
    res.status(500).json({ error: "Error Fetching Albums" });
  }
};

export const albumByID = async (req, res) => {
  try {
    const [album] = await sql`SELECT * FROM albums WHERE id = ${req.params.id}`;
    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }
    res.status(200).json(album);
  } catch (error) {
    console.error("Error Fetching Album:", error);
    res.status(500).json({ error: "Error Fetching Album" });
  }
};

export const albumByUser = async (req, res) => {
  try {
    const albums = await sql`SELECT * FROM albums WHERE user_id = ${req.params.id}`;
    if (!albums || albums.length === 0) {
      return res.status(404).json({ error: "User's Albums Not Found" });
    }
    res.status(200).json(albums);
  } catch (error) {
    console.error("Error Fetching User's Albums:", error);
    res.status(500).json({ error: "Error Fetching User's Albums" });
  }
};

export const albumPhotos = async (req, res) => {
  try {
    const [album] = await sql`
      SELECT id, title, description, is_public, created_at, user_id, cover_photo_id
      FROM albums WHERE id = ${req.params.id}
    `;

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    const photos = await sql`
      SELECT p.id, p.title, p.description, p.file_url, p.created_at, p.thumbnail_url, 
             p.original_filename, p.file_size, p.width, p.height, p.content_type
      FROM photos p
      JOIN album_photos ap ON p.id = ap.photo_id
      WHERE ap.album_id = ${req.params.id}
      ORDER BY p.created_at DESC
    `;

    const tags = await sql`
      SELECT pt.photo_id, t.name
      FROM photo_tags pt
      JOIN tags t ON pt.tag_id = t.id
      WHERE pt.photo_id IN (
        SELECT p.id FROM photos p 
        JOIN album_photos ap ON p.id = ap.photo_id 
        WHERE ap.album_id = ${req.params.id}
      )
    `;

    const locations = await sql`
      SELECT pl.photo_id, l.name, l.latitude, l.longitude
      FROM photo_locations pl
      JOIN locations l ON pl.location_id = l.id
      WHERE pl.photo_id IN (
        SELECT p.id FROM photos p 
        JOIN album_photos ap ON p.id = ap.photo_id 
        WHERE ap.album_id = ${req.params.id}
      )
    `;

    const photosWithDetails = photos.map((photo) => ({
      ...photo,
      tags: tags
        .filter((tag) => tag.photo_id === photo.id)
        .map((tag) => tag.name),
      locations: locations
        .filter((location) => location.photo_id === photo.id)
        .map((location) => ({
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
        }))
    }));

    res.status(200).json({ ...album, photos: photosWithDetails });
  } catch (error) {
    console.error("Error Fetching Album Photos:", error);
    res.status(500).json({ error: "Error Fetching Album Photos" });
  }
};

export const postAlbumPhoto = async (req, res) => {
  try {
    // JWT verification
    const cookie = req.cookies["jwt"];
    if (!cookie) {
      return res.status(401).json({ error: "No authentication token" });
    }

    const claims = jwt.verify(cookie, process.env.JWT_SECRET);
    if (!claims) {
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    const userId = claims.id;
    const albumId = req.params.id;

    // File validation
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const { title, description } = req.body;
    const image = req.file;
    const imageName = `${userId}_${Date.now()}_${image.originalname}`;

    // Upload to blob storage
    const blob = await put(`photos/${userId}/${imageName}`, image.buffer, {
      access: 'public',
      contentType: image.mimetype
    });

    // Save to database
    const [photo] = await sql`
      INSERT INTO photos (
        user_id, title, description, file_url, 
        original_filename, file_size, content_type
      )
      VALUES (
        ${userId}, ${title}, ${description}, ${blob.url}, 
        ${imageName}, ${image.size}, ${image.mimetype}
      )
      RETURNING id, title, description, file_url, created_at
    `;

    await sql`
      INSERT INTO album_photos (album_id, photo_id)
      VALUES (${albumId}, ${photo.id})
    `;

    res.status(201).json(photo);
  } catch (error) {
    console.error("Error Uploading Photo:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Error uploading photo" });
  }
};