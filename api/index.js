import express from "express";
import cors from "cors";
import {
  photos,
  photosByID,
  photosByAlbum,
  photosByUser,
} from "../handlers/photos";
import { albums, albumByID, albumByUser} from "../handlers/albums"

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

app.get("/photos", photos);
app.get("/photos/id=:id", photosByID);
app.get("/photos/album=:id", photosByAlbum);
app.get("/photos/user=:id", photosByUser);

app.get("/albums", albums);
app.get("/albums/id=:id", albumByID);
app.get("/albums/user=:id", albumByUser);
app.get("/albumsp/id=:id", albumPhotos);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
