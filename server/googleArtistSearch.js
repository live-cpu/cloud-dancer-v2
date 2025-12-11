// server/googleArtistSearch.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // 이 파일이 로드될 때 .env 먼저 읽어오기

const API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CX;

// 유저가 보낸 문장에 작가 키워드만 살짝 붙여서 검색어를 만든다.
function buildSearchQuery(userText) {
  const base = (userText || "").trim();
  if (!base) return "현대 미술 작가 디자이너";

  const trimmed = base.slice(0, 80);
  return `${trimmed} (작가 OR 디자이너 OR artist OR designer)`;
}

export async function searchArtists(userText) {
  if (!API_KEY || !CX) {
    console.warn(
      "[cloud-dancer-api] GOOGLE_API_KEY 또는 GOOGLE_CX가 설정돼 있지 않습니다."
    );
    return { results: [] };
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
      console.error("[cloud-dancer-api] google error", res.status, text);
      return { results: [] };
    }

    const data = await res.json();
    console.log(
      "[cloud-dancer-api] totalResults=",
      data.searchInformation?.totalResults
    );

    if (!Array.isArray(data.items)) {
      console.log("[cloud-dancer-api] no items in response");
      return { results: [] };
    }

    const results = data.items.map((item) => ({
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
    return { results: [] };
  }
}
