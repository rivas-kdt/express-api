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
import { login, logout, user } from "../handlers/auth.js";
import cookieParser from "cookie-parser";
import { bodyparser } from "body-parser";

const app = express();

app.use(bodyparser());
app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3001, () => console.log("Server ready on port 3001."));

app.post("/login", login);
app.post("/logout", logout);
app.get("/user", user);

app.get("/photos", photos);
app.get("/photos/id=:id", photosByID);
app.get("/photos/album=:id", photosByAlbum);
app.get("/photos/user=:id", photosByUser);

app.post("/try/id=:id", postAlbumPhoto);

app.get("/albums", albums);
app.get("/albums/id=:id", albumByID);
app.get("/albums/user=:id", albumByUser);
app.get("/albumsp/id=:id", albumPhotos);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
