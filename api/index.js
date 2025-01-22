import express from "express";
import cors from "cors";
import { photos } from "../handlers/photos"

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

app.get("/photos", photos);

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
