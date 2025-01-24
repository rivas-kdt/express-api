import express from "express";
import cors from "cors";
import {
  photos,
  photosByID,
  photosByAlbum,
  photosByUser,
} from "../handlers/photos.js";
import {
  albums,
  albumByID,
  albumByUser,
  albumPhotos,
  postAlbumPhoto,
} from "../handlers/albums.js";
import { login, logout, register, user } from "../handlers/auth.js";
import cookieParser from "cookie-parser";

import { feedAlbums, fullAlbums } from "../handlers/album.js";
import { feedPhotos } from "../handlers/photo.js";

const app = express();
const corsOptions = {
  origin: ["https://neon-photo-ad.vercel.app", "https://triptos.vercel.app", "http://localhost:3000"], // Frontend URL
  credentials: true, // Allow cookies to be sent
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(5000, () => console.log("Server ready on http://localhost:5000."));

app.post("/auth/register", register);
app.post("/auth/login", login);
app.post("/auth/logout", logout);
app.get("/auth/user", user);

app.get("/api/photos", photos);
app.get("/api/photos/id=:id", photosByID);
app.get("/api/photos/album=:id", photosByAlbum);
app.get("/api/photos/user=:id", photosByUser);

app.post("/try/id=:id", postAlbumPhoto);

app.get("/api/albums", albums);
app.get("/api/albums/id=:id", albumByID);
app.get("/api/albums/user", albumByUser);
app.get("/api/albumsp/id=:id", albumPhotos);

app.get("/v2/api/albums", feedAlbums)
app.get("/v2/api/album?id=:id", fullAlbums)
app.get("/v2/api/user/albums", albumByUser)

app.get("v2/api/photos", feedPhotos)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
