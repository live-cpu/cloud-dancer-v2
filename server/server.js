// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { searchArtists } from "./googleArtistSearch.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5175;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/search-artists", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ error: "query parameter is required", results: [] });
  }

  try {
    const { results } = await searchArtists(query);
    return res.json({ results });
  } catch (err) {
    console.error("[cloud-dancer-api] /api/search-artists error:", err);
    return res.status(500).json({ error: "internal error", results: [] });
  }
});

app.listen(PORT, () => {
  console.log(`[cloud-dancer-api] listening on http://localhost:${PORT}`);
});
