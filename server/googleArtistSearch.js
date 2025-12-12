// server/googleArtistSearch.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CX;

// 🔹 '채용' 관련 결과 제외
const BLOCK_KEYWORDS = ["채용"];

function isBlockedByKeyword(item) {
  const title = (item.title || "").toLowerCase();
  const snippet = (item.snippet || "").toLowerCase();
  const text = `${title} ${snippet}`;
  return BLOCK_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

// 유저 문장을 기반으로 검색어 구성
function buildSearchQuery(userText) {
  const base = (userText || "").trim();
  if (!base) return "현대 미술 작가 디자이너";

  const trimmed = base.slice(0, 80);
  return `${trimmed} (작가 OR 디자이너 OR artist OR designer)`;
}

// 구글 에러 파싱 (쿼터 초과 / 일반 오류 구분)
function parseGoogleError(text, status) {
  try {
    const json = JSON.parse(text);
    const firstError = json?.error?.errors?.[0];
    const reason = firstError?.reason;
    const code = json?.error?.code ?? status;
    const message =
      json?.error?.message || `Google API error (status ${status})`;

    // 쿼터/레이트 관련 reason 값들
    const quotaReasons = [
      "dailyLimitExceeded",
      "userRateLimitExceeded",
      "rateLimitExceeded",
      "quotaExceeded",
    ];

    if (quotaReasons.includes(reason)) {
      return {
        type: "google_quota",
        code,
        reason,
        message,
      };
    }

    return {
      type: "google_error",
      code,
      reason,
      message,
    };
  } catch (e) {
    return {
      type: "google_error",
      code: status,
      reason: null,
      message: `Google API error (status ${status})`,
      raw: text,
    };
  }
}

export async function searchArtists(userText) {
  if (!API_KEY || !CX) {
    console.warn(
      "[cloud-dancer-api] GOOGLE_API_KEY 또는 GOOGLE_CX가 설정돼 있지 않습니다."
    );
    return {
      results: [],
      error: {
        type: "config_error",
        message: "Google API 설정이 올바르지 않습니다.",
      },
    };
  }

  const q = buildSearchQuery(userText);

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", API_KEY);
  url.searchParams.set("cx", CX);
  url.searchParams.set("q", q);
  url.searchParams.set("num", "5");

  console.log("[cloud-dancer-api] requesting:", url.toString());

  try {
    const res = await fetch(url.toString());

    if (!res.ok) {
      const text = await res.text();
      const errInfo = parseGoogleError(text, res.status);
      console.error("[cloud-dancer-api] google error", res.status, errInfo);

      // 프론트에서 구글 쿼터 초과 여부를 알 수 있도록 error를 그대로 전달
      return { results: [], error: errInfo };
    }

    const data = await res.json();
    console.log(
      "[cloud-dancer-api] totalResults =",
      data.searchInformation?.totalResults
    );

    const items = Array.isArray(data.items) ? data.items : [];

    if (items.length === 0) {
      console.log("[cloud-dancer-api] no items in response");
      return { results: [] };
    }

    // 1차: 채용 관련 키워드로 필터
    const filteredItems = items.filter((item) => !isBlockedByKeyword(item));

    console.log(
      `[cloud-dancer-api] items=${items.length}, filtered=${filteredItems.length}`
    );

    // ⚠️ 만약 전부 필터돼버리면, 최소한 원본이라도 보여주기
    const finalItems =
      filteredItems.length > 0
        ? filteredItems
        : (console.log(
            "[cloud-dancer-api] all items filtered; falling back to original items."
          ),
          items);

    // 2차: 화면에서 쓰는 형태로 매핑
    const results = finalItems.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: item.displayLink,
      image:
        item.pagemap?.cse_image?.[0]?.src ||
        item.pagemap?.thumbnail?.[0]?.src ||
        null,
    }));

    return { results };
  } catch (err) {
    console.error("[cloud-dancer-api] fetch failed:", err);
    return {
      results: [],
      error: {
        type: "network_error",
        message: "Google API 호출에 실패했습니다.",
        detail: String(err),
      },
    };
  }
}
