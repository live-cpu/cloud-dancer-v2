// src/contrastDictionary.js

export const CONTRAST_DB = [
  // --- 자연/공간 계열 ---
  { ko: "하늘", antonym: "땅", antonym2: "아래", en: "sky" },
  { ko: "땅", antonym: "하늘", antonym2: "위", en: "ground" },
  { ko: "바다", antonym: "사막", antonym2: "산", en: "sea" },
  { ko: "산", antonym: "바다", antonym2: "평야", en: "mountain" },
  { ko: "물", antonym: "불", antonym2: "불꽃", en: "water" },
  { ko: "불", antonym: "물", antonym2: "비", en: "fire" },
  { ko: "비", antonym: "해", antonym2: "맑음", en: "rain" },
  { ko: "해", antonym: "비", antonym2: "구름", en: "sun" },
  { ko: "흙", antonym: "물", antonym2: "하늘", en: "earth" },
  { ko: "공기", antonym: "물", antonym2: "땅", en: "air" },

  // --- 빛/어둠/시간 계열 ---
  { ko: "빛", antonym: "어둠", antonym2: "그림자", en: "light" },
  { ko: "어둠", antonym: "빛", antonym2: "밝음", en: "darkness" },
  { ko: "밝다", antonym: "어둡다", antonym2: "흐리다", en: "bright" },
  { ko: "어둡다", antonym: "밝다", antonym2: "환하다", en: "dark" },
  { ko: "낮", antonym: "밤", antonym2: "어둠", en: "day" },
  { ko: "밤", antonym: "낮", antonym2: "아침", en: "night" },
  { ko: "새벽", antonym: "밤", antonym2: "저녁", en: "dawn" },
  { ko: "저녁", antonym: "아침", antonym2: "낮", en: "evening" },
  { ko: "오늘", antonym: "어제", antonym2: "내일", en: "today" },
  { ko: "과거", antonym: "미래", antonym2: "현재", en: "past" },
  { ko: "미래", antonym: "과거", antonym2: "현재", en: "future" },
  { ko: "현재", antonym: "과거", antonym2: "미래", en: "present" },

  // --- 감정/정서 계열 ---
  { ko: "고요", antonym: "소란", antonym2: "소음", en: "calm" },
  { ko: "소란", antonym: "고요", antonym2: "침묵", en: "noise" },
  { ko: "차분", antonym: "격렬", antonym2: "거칠음", en: "calm" },
  { ko: "격렬", antonym: "차분", antonym2: "고요", en: "intense" },
  { ko: "행복", antonym: "불행", antonym2: "고통", en: "happiness" },
  { ko: "불행", antonym: "행복", antonym2: "기쁨", en: "unhappiness" },
  { ko: "기쁨", antonym: "슬픔", antonym2: "고통", en: "joy" },
  { ko: "슬픔", antonym: "기쁨", antonym2: "환희", en: "sadness" },
  { ko: "사랑", antonym: "미움", antonym2: "증오", en: "love" },
  { ko: "미움", antonym: "사랑", antonym2: "애정", en: "hate" },
  { ko: "고통", antonym: "기쁨", antonym2: "행복", en: "pain" },
  { ko: "불안", antonym: "안정", antonym2: "평온", en: "anxiety" },
  { ko: "안정", antonym: "불안", antonym2: "변화", en: "stability" },
  { ko: "희망", antonym: "절망", antonym2: "포기", en: "hope" },
  { ko: "절망", antonym: "희망", antonym2: "기대", en: "despair" },

  // --- 생명/존재 계열 ---
  { ko: "삶", antonym: "죽음", antonym2: "사망", en: "life" },
  { ko: "죽음", antonym: "삶", antonym2: "탄생", en: "death" },
  { ko: "태어나다", antonym: "죽다", antonym2: "사라지다", en: "birth" },
  { ko: "살다", antonym: "죽다", antonym2: "떠나다", en: "live" },
  { ko: "존재", antonym: "부재", antonym2: "사라짐", en: "existence" },
  { ko: "존재하다", antonym: "사라지다", antonym2: "없다", en: "exist" },
  { ko: "사라지다", antonym: "나타나다", antonym2: "존재하다", en: "vanish" },
  { ko: "나타나다", antonym: "사라지다", antonym2: "숨다", en: "appear" },

  // --- 크기/거리/형태 ---
  { ko: "크다", antonym: "작다", antonym2: "작아지다", en: "big" },
  { ko: "작다", antonym: "크다", antonym2: "넓다", en: "small" },
  { ko: "높다", antonym: "낮다", antonym2: "짧다", en: "high" },
  { ko: "낮다", antonym: "높다", antonym2: "길다", en: "low" },
  { ko: "멀다", antonym: "가깝다", antonym2: "근처", en: "far" },
  { ko: "가깝다", antonym: "멀다", antonym2: "떨어지다", en: "close" },
  { ko: "넓다", antonym: "좁다", antonym2: "작다", en: "wide" },
  { ko: "좁다", antonym: "넓다", antonym2: "크다", en: "narrow" },
  { ko: "단순하다", antonym: "복잡하다", antonym2: "어렵다", en: "simple" },
  { ko: "복잡하다", antonym: "간단하다", antonym2: "단순하다", en: "complex" },

  // --- 온도/질감 ---
  { ko: "차갑다", antonym: "따뜻하다", antonym2: "뜨겁다", en: "cold" },
  { ko: "따뜻하다", antonym: "차갑다", antonym2: "춥다", en: "warm" },
  { ko: "춥다", antonym: "덥다", antonym2: "따뜻하다", en: "cold" },
  { ko: "덥다", antonym: "춥다", antonym2: "시원하다", en: "hot" },
  { ko: "부드럽다", antonym: "거칠다", antonym2: "딱딱하다", en: "soft" },
  { ko: "거칠다", antonym: "부드럽다", antonym2: "매끄럽다", en: "rough" },
  { ko: "뜨겁다", antonym: "차갑다", antonym2: "미지근하다", en: "hot" },
  { ko: "마르다", antonym: "젖다", antonym2: "축축하다", en: "dry" },
  { ko: "젖다", antonym: "마르다", antonym2: "건조하다", en: "wet" },

  // --- 정적/동적, 움직임 ---
  { ko: "정지", antonym: "운동", antonym2: "흐름", en: "stillness" },
  { ko: "운동", antonym: "정지", antonym2: "휴식", en: "movement" },
  { ko: "흐르다", antonym: "멈추다", antonym2: "괴다", en: "flow" },
  { ko: "멈추다", antonym: "움직이다", antonym2: "계속하다", en: "stop" },
  { ko: "빠르다", antonym: "느리다", antonym2: "천천히", en: "fast" },
  { ko: "느리다", antonym: "빠르다", antonym2: "천천히", en: "slow" },

  // --- 질서/혼돈 ---
  { ko: "질서", antonym: "무질서", antonym2: "혼란", en: "order" },
  { ko: "무질서", antonym: "질서", antonym2: "정리", en: "chaos" },
  { ko: "균형", antonym: "불균형", antonym2: null, en: "balance" },
  { ko: "평화", antonym: "전쟁", antonym2: "갈등", en: "peace" },
  { ko: "전쟁", antonym: "평화", antonym2: "휴전", en: "war" },
  { ko: "갈등", antonym: "화해", antonym2: "평화", en: "conflict" },
  { ko: "화해", antonym: "갈등", antonym2: "싸움", en: "reconcile" },

  // --- 새로움/낡음 ---
  { ko: "새롭다", antonym: "낡다", antonym2: "오래되다", en: "new" },
  { ko: "낡다", antonym: "새롭다", antonym2: "새", en: "old" },
  { ko: "새", antonym: "헌", antonym2: "오래된", en: "new" },
  { ko: "헌", antonym: "새", antonym2: "새롭다", en: "old" },

  // --- 예술/과학/자연 ---
  { ko: "예술", antonym: "과학", antonym2: "기술", en: "art" },
  { ko: "과학", antonym: "예술", antonym2: "종교", en: "science" },
  { ko: "자연", antonym: "인공", antonym2: "문명", en: "nature" },
  { ko: "인공", antonym: "자연", antonym2: null, en: "artificial" },

  // --- 소리/침묵 ---
  { ko: "소리", antonym: "침묵", antonym2: "무음", en: "sound" },
  { ko: "음악", antonym: "소음", antonym2: "침묵", en: "music" },
  { ko: "소음", antonym: "음악", antonym2: "침묵", en: "noise" },
  { ko: "침묵", antonym: "소리", antonym2: "노래", en: "silence" },

  // --- 감각/몸 ---
  { ko: "눈물", antonym: "웃음", antonym2: "기쁨", en: "tears" },
  { ko: "웃음", antonym: "눈물", antonym2: "울음", en: "laughter" },
  { ko: "아프다", antonym: "건강하다", antonym2: "괜찮다", en: "painful" },
  { ko: "건강하다", antonym: "아프다", antonym2: "병들다", en: "healthy" },

  // --- 가치/의미 ---
  { ko: "의미", antonym: "무의미", antonym2: null, en: "meaning" },
  { ko: "무의미", antonym: "의미", antonym2: null, en: "meaningless" },
  { ko: "가치", antonym: "무가치", antonym2: "비용", en: "value" },
  { ko: "무가치", antonym: "가치", antonym2: null, en: "worthless" },

  // --- 기타 자주 쓸 법한 단어들 ---
  { ko: "고향", antonym: "타향", antonym2: "외국", en: "hometown" },
  { ko: "도시", antonym: "시골", antonym2: "농촌", en: "city" },
  { ko: "시골", antonym: "도시", antonym2: "산업", en: "countryside" },
  { ko: "자유", antonym: "구속", antonym2: "속박", en: "freedom" },
  { ko: "구속", antonym: "자유", antonym2: "해방", en: "constraint" },
  { ko: "희다", antonym: "검다", antonym2: "까맣다", en: "white" },
  { ko: "검다", antonym: "희다", antonym2: "하얗다", en: "black" },
  { ko: "붉다", antonym: "푸르다", antonym2: "희다", en: "red" },
  { ko: "푸르다", antonym: "붉다", antonym2: "노랗다", en: "blue" },
];

function normalize(text) {
  return (text || "").replace(/\s+/g, "").trim();
}

export function pickMainKeywordFromSentence(sentence) {
  const raw = (sentence || "").trim();
  if (!raw) return null;

  const norm = normalize(raw);
  let picked = null;

  for (const entry of CONTRAST_DB) {
    if (!entry.ko) continue;
    if (norm.includes(entry.ko)) {
      if (!picked || entry.ko.length > picked.ko.length) {
        picked = entry;
      }
    }
  }
  return picked;
}

/**
 * 🔥 핵심: App.jsx와 호환되도록 수정
 * - getContrastWord 함수 추가
 * - keywordChips 생성 로직 추가
 */
export function buildContrastInfo(sentence) {
  const raw = (sentence || "").trim();
  const entry = pickMainKeywordFromSentence(raw);

  if (entry) {
    const primaryKeyword = entry.ko;
    const contrastKeyword = entry.antonym || entry.antonym2 || "";

    // 🔹 키워드 칩: 최대 4개
    const keywordChips = [
      entry.ko,
      entry.en,
      entry.antonym,
      entry.antonym2
    ].filter(Boolean).slice(0, 4);

    return {
      primaryKeyword,
      contrastKeyword,
      keywordChips,
      // ✅ App.jsx에서 사용하는 getContrastWord 함수
      getContrastWord: (base) => {
        return contrastKeyword || base;
      }
    };
  }

  // 사전에 없는 경우: 입력 문장을 그대로 사용
  const words = raw.split(/\s+/).filter(w => w.length > 1);
  const primaryKeyword = words[0] || raw || "Cloud Dancer";

  return {
    primaryKeyword,
    contrastKeyword: "",
    keywordChips: words.slice(0, 4),
    getContrastWord: (base) => base // 반대어 없음
  };
}