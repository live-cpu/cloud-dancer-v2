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

// (선택) 간단 로그
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url}`
  );
  next();
});

/**
 * 🔒 초당 10건 제한 레이트 리미터
 * - 1초(window) 안에 11번째 요청부터는 429 반환
 * - 프론트 App.jsx에서 res.status === 429 분기로 잡아 에러 메시지 표시
 */
const WINDOW_MS = 1000;               // 1초
const MAX_REQUESTS_PER_WINDOW = 10;   // 1초 안에 최대 10건

let windowStart = Date.now();
let windowCount = 0;

function rateLimit(req, res, next) {
  const now = Date.now();

  // 새 윈도우로 롤오버
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    windowCount = 0;
  }

  if (windowCount >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: "rate_limited",
      message:
        "요청이 너무 빠르게 반복되고 있습니다. 잠시 후 다시 시도해 주세요.",
    });
  }

  windowCount += 1;
  next();
}

// 헬스 체크용
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "cloud-dancer-api" });
});

/**
 * 🔍 아티스트 검색 API
 * - 레이트 리미터 적용
 * - query 길이 방어 (400 + error: query_too_long)
 * - 실제 검색 로직은 googleArtistSearch.js 의 searchArtists 에서 처리
 */
app.get("/api/search-artists", rateLimit, async (req, res) => {
  const query = (req.query.query || "").toString();
  const MAX_QUERY_LENGTH = 1800; // App.jsx의 400/query_too_long 분기와 맞춤

  if (!query) {
    return res.status(400).json({
      error: "missing_query",
      message: "query 파라미터가 비어 있습니다.",
    });
  }

  // 너무 긴 문장은 프론트에서 400 + query_too_long로 처리하도록
  if (query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({
      error: "query_too_long",
      message: `검색 문장이 너무 깁니다. 최대 ${MAX_QUERY_LENGTH}자까지 입력할 수 있습니다.`,
      length: query.length,
      maxLength: MAX_QUERY_LENGTH,
    });
  }

  try {
    // googleArtistSearch.js: { results, error } 형태로 반환
    const result = await searchArtists(query);

    // 여기서는 그대로 통과시킴
    //  - 쿼터 초과: { error: { type: "google_quota", ... }, results: [] }
    //  - 일반 에러: { error: { type: "google_error" | "config_error" | "network_error", ... }, results: [] }
    // App.jsx에서 data.error?.type 보고 UI에 맞게 처리
    return res.json(result);
  } catch (err) {
    console.error("[server] /api/search-artists unexpected error:", err);
    return res.status(500).json({
      error: "internal_error",
      message: "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    });
  }
});

// 나머지 경로 404
app.use((req, res) => {
  res.status(404).json({
    error: "not_found",
    message: "존재하지 않는 경로입니다.",
  });
});

app.listen(PORT, () => {
  console.log(
    `[cloud-dancer-api] listening on http://localhost:${PORT}`
  );
});
