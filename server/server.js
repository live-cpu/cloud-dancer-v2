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

// 헬스체크용 루트 — 여기로 오면 JSON이 떠야 정상
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "cloud-dancer-api",
  });
});

// 메인 엔드포인트: /api/search-artists
app.get("/api/search-artists", async (req, res) => {
  const query = (req.query.query || "").trim();
  console.log("[cloud-dancer-api] /api/search-artists", { query });

  try {
    const result = await searchArtists(query);
    res.json(result);
  } catch (err) {
    console.error("[cloud-dancer-api] error in /api/search-artists:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(
    `[cloud-dancer-api] listening on http://localhost:${PORT} (PORT=${PORT})`
  );
});
