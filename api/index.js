import express from "express"
import { photos } from "../handlers/photos"
const app = express();

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

app.get('/photos?id=:id', photos)

module.exports = app;