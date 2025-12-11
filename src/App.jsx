// src/App.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import "./styles/cloud-dancer.css";
import { API_BASE_URL } from "./config/api";

// 이미지 Assets import
import cloudBack from "./assets/cloud-back.jpg";
import cloud1 from "./assets/cloud-1.png";
import cloud2 from "./assets/cloud-2.png";
import cloud3 from "./assets/cloud-3.png";
import mountain from "./assets/mountain.jpg";
import tree1 from "./assets/tree-1.png";
import tree2 from "./assets/tree-2.png";

/** 사용자가 쓴 문장에서 "반대 결"의 키워드를 뽑아내는 간단한 매핑 */
function getContrastWord(word = "") {
  const pairs = [
    ["하늘", "땅"],
    ["sky", "ground"],
    ["밝", "어두움"],
    ["light", "shadow"],
    ["물", "불"],
    ["바다", "사막"],
    ["고요", "소란"],
    ["차분", "격렬"],
    ["soft", "raw"],
  ];

  for (const [k, v] of pairs) {
    if (word.includes(k)) return v;
  }
  return "다른 결의 키워드";
}

function App() {
  const [text, setText] = useState("");
  const [stage, setStage] = useState("idle"); // idle / typing / entering / inside
  const [forestVisible, setForestVisible] = useState(false);

  // ① “가까운 결” 검색 결과
  const [closeResults, setCloseResults] = useState([]);
  const [loadingClose, setLoadingClose] = useState(false);

  // ② “반대 결(콘트라스트)” 검색 결과
  const [contrastResults, setContrastResults] = useState([]);
  const [loadingContrast, setLoadingContrast] = useState(false);

  // DOM Refs
  const rootRef = useRef(null); // 스크롤 컨테이너 제어용
  const forestTriggerRef = useRef(null); // Contrast 섹션 감지용

  /* -----------------------------
   * 1) 텍스트 유무에 따라 stage idle <-> typing
   * ----------------------------- */
  useEffect(() => {
    if (stage !== "idle" && stage !== "typing") return;

    const hasText = text.trim().length > 0;
    if (hasText && stage === "idle") {
      setStage("typing");
    }
    if (!hasText && stage === "typing") {
      setStage("idle");
    }
  }, [text, stage]);

  /* -----------------------------
   * 2) 2페이지에서 “다른 방향…” 섹션이 화면에 들어올 때만 forestVisible 토글
   * ----------------------------- */
  useEffect(() => {
    if (stage !== "inside") {
      setForestVisible(false);
      return;
    }

    const triggerEl = forestTriggerRef.current;
    if (!triggerEl) return;

    let observer;
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;

          if (entry.isIntersecting) {
            setForestVisible(true); // 산/나무 ON
          } else {
            setForestVisible(false); // 다시 구름으로 복귀
          }
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -120px 0px",
        }
      );

      observer.observe(triggerEl);
    }, 400);

    return () => {
      clearTimeout(timer);
      if (observer && triggerEl) observer.unobserve(triggerEl);
    };
  }, [stage]);

  /* -----------------------------
   * 3) 2페이지(inside)에 들어갔을 때
   *    - 한 번은 “원래 문장으로” 검색 (closeResults)
   *    - 한 번은 “반대 키워드로” 검색 (contrastResults)
   * ----------------------------- */
  useEffect(() => {
    const base = text.trim();

    if (stage !== "inside" || !base) {
      setCloseResults([]);
      setContrastResults([]);
      return;
    }

    // 여기서 전체 문장을 그대로 넣고,
    // 반대 키워드용으로는 getContrastWord를 한 번 더 쓴다.
    const contrastWord = getContrastWord(base);

    const closeController = new AbortController();
    const contrastController = new AbortController();

    async function fetchClose() {
      try {
        setLoadingClose(true);
        const res = await fetch(
          `${API_BASE_URL}/api/search-artists?query=${encodeURIComponent(
            base
          )}`,
          { signal: closeController.signal }
        );

        if (!res.ok) {
          console.error("search-artists(close) HTTP error", res.status);
          setCloseResults([]);
          return;
        }

        const data = await res.json();
        setCloseResults(data.results || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("search-artists(close) error:", err);
        }
      } finally {
        setLoadingClose(false);
      }
    }

    async function fetchContrast() {
      try {
        setLoadingContrast(true);

        const res = await fetch(
          `${API_BASE_URL}/api/search-artists?query=${encodeURIComponent(
            contrastWord
          )}`,
          { signal: contrastController.signal }
        );

        if (!res.ok) {
          console.error("search-artists(contrast) HTTP error", res.status);
          setContrastResults([]);
          return;
        }

        const data = await res.json();
        setContrastResults(data.results || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("search-artists(contrast) error:", err);
        }
      } finally {
        setLoadingContrast(false);
      }
    }

    fetchClose();
    fetchContrast();

    return () => {
      closeController.abort();
      contrastController.abort();
    };
  }, [stage, text]);

  /* -----------------------------
   * 4) 키워드 칩 & 반대 키워드 계산
   * ----------------------------- */
  const keywordChips = useMemo(() => {
    const base = text.trim();
    if (!base) {
      return ["새벽 공기", "조용한 거리", "희미한 빛"];
    }
    const tokens = base
      .split(/[\s,.\n]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0)
      .slice(0, 4);

    if (tokens.length === 0) {
      return ["새벽 공기", "조용한 거리", "희미한 빛"];
    }
    return tokens;
  }, [text]);

  const primaryKeyword = keywordChips[0] || "Cloud Dancer";
  const contrastKeyword = getContrastWord(text.trim() || primaryKeyword);

  // 가까운 작업의 대표 아티스트
  const mainArtist = closeResults[0] || null;
  // 반대 결의 작업들
  const contrastHero = contrastResults[0] || null;
  const contrastCards = contrastResults.slice(0, 3);

  /* -----------------------------
   * 5) 진입 애니메이션 핸들러
   * ----------------------------- */
  const handleEnter = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (stage === "entering" || stage === "inside") return;

    setStage("entering");

    setTimeout(() => {
      setStage("inside");
      if (rootRef.current) {
        rootRef.current.scrollTo({ top: 0, behavior: "instant" });
      }
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleEnter();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnter();
    }
  };

  /* -----------------------------
   * 6) 로고 클릭 → 1페이지로 돌아가기
   * ----------------------------- */
  const handleLogoClick = () => {
    if (rootRef.current) {
      rootRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (stage === "idle" || stage === "typing") return;

    const hasText = text.trim().length > 0;
    setForestVisible(false);
    setStage(hasText ? "typing" : "idle");
  };

  // CSS 클래스 조합
  const rootClassName = [
    "cd-root",
    `cd-root--stage-${stage}`,
    forestVisible ? "cd-root--forest-visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} ref={rootRef}>
      {/* ================= BACKGROUND LAYERS ================= */}

      {/* 1. 하늘/구름 레이어 (고정 배경) */}
      <div
        className="cd-bg-layer cd-bg-layer--sky"
        style={{ backgroundImage: `url(${cloudBack})` }}
      />
      <div
        className="cd-bg-layer cd-cloud-layer cd-cloud-layer--1"
        style={{ backgroundImage: `url(${cloud1})` }}
      />
      <div
        className="cd-bg-layer cd-cloud-layer cd-cloud-layer--2"
        style={{ backgroundImage: `url(${cloud2})` }}
      />
      <div
        className="cd-bg-layer cd-cloud-layer cd-cloud-layer--3"
        style={{ backgroundImage: `url(${cloud3})` }}
      />

      {/* 2. 산/나무 레이어 (Forest Visible 시 등장) */}
      <div
        className="cd-bg-layer cd-forest-layer cd-forest-layer--mountain"
        style={{ backgroundImage: `url(${mountain})` }}
      />
      <div
        className="cd-bg-layer cd-forest-layer cd-forest-layer--tree1"
        style={{ backgroundImage: `url(${tree1})` }}
      />
      <div
        className="cd-bg-layer cd-forest-layer cd-forest-layer--tree2"
        style={{ backgroundImage: `url(${tree2})` }}
      />

      {/* ================= CONTENT SHELL ================= */}
      <div className="cd-shell">
        <header className="cd-header">
          <button
            type="button"
            className="cd-logo-block"
            onClick={handleLogoClick}
          >
            <div className="cd-logo-mark" />
            <div className="cd-logo-text">
              <span className="cd-logo-title">CLOUD DANCER</span>
              <span className="cd-logo-sub">INNER GAZE RECOMMENDER</span>
            </div>
          </button>
        </header>

        {/* --- PAGE 1: HERO & INPUT --- */}
        {stage !== "inside" && (
          <main className="cd-main cd-main--hero">
            <section
              className={`cd-polaroid ${
                stage === "entering" ? "cd-polaroid--exit" : ""
              }`}
            >
              <div className="cd-polaroid-frame">
                <div className="cd-polaroid-image-slot" />
                <form className="cd-polaroid-caption" onSubmit={handleSubmit}>
                  <label className="cd-caption-label" htmlFor="feelings">
                    Write your mind
                  </label>
                  <textarea
                    id="feelings"
                    className="cd-caption-textarea"
                    rows={4}
                    placeholder="지금 머릿속에 맴도는 문장을 짧게 적어보세요."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    type="submit"
                    className="cd-btn-primary"
                    disabled={!text.trim()}
                  >
                    구름 속으로 보내기
                  </button>
                </form>
              </div>
            </section>
          </main>
        )}

        {/* --- PAGE 2: RESULT & CONTRAST --- */}
        {stage === "inside" && (
          <main className="cd-main cd-main--inside">
            {/* 상단: 정서적으로 가까운 작업 */}
            <section className="cd-inside-panel cd-inside-panel--primary">
              {/* 왼쪽: 키워드 팔레트 */}
              <aside className="cd-palette-panel">
                <p className="cd-palette-label">FROM YOUR WORDS</p>
                <ul className="cd-palette-list">
                  {keywordChips.map((kw, index) => (
                    <li key={index} className="cd-palette-chip">
                      <span className="cd-palette-chip-swatch" />
                      <span className="cd-palette-chip-text">{kw}</span>
                    </li>
                  ))}
                </ul>
                <p className="cd-palette-note">
                  이 단어들의 결과 닮은 디자이너와 작가들을 천천히 연결해
                  드립니다.
                </p>
              </aside>

              {/* 가운데: 추천 작품 메인 이미지 */}
              <div className="cd-inside-center">
                {mainArtist ? (
                  <a
                    className="cd-inside-work-link"
                    href={mainArtist.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div
                      className="cd-inside-work-image cd-inside-work-image--photo"
                      style={
                        mainArtist.image
                          ? {
                              backgroundImage: `url(${mainArtist.image})`,
                            }
                          : undefined
                      }
                    />
                  </a>
                ) : (
                  <div className="cd-inside-work-image" />
                )}
              </div>

              {/* 오른쪽: 사용자 문장 + 가까운 아티스트 설명 */}
              <div className="cd-inside-right">
                <p className="cd-inside-eyebrow">지금의 시간</p>
                <h2 className="cd-inside-title">당신이 보낸 문장</h2>
                <p className="cd-inside-usertext">“{text}”</p>

                <div className="cd-inside-artist">
                  <p className="cd-artist-label">비슷한 결을 가진 아티스트</p>

                  {loadingClose && (
                    <p className="cd-artist-loading">
                      작가를 찾는 중입니다…
                    </p>
                  )}

                  {!loadingClose && !mainArtist && (
                    <p className="cd-artist-desc">
                      아직 검색된 작가가 없습니다. 문장에 조금 더 단서를
                      넣어보면 좋을 것 같습니다.
                    </p>
                  )}

                  {mainArtist && (
                    <>
                      <h3 className="cd-artist-name">{mainArtist.title}</h3>
                      {mainArtist.source && (
                        <a
                          className="cd-artist-link"
                          href={mainArtist.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {mainArtist.source}
                        </a>
                      )}
                      <p className="cd-artist-desc">{mainArtist.snippet}</p>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* 하단: Contrast Section (스크롤 트리거) */}
            <div ref={forestTriggerRef} className="cd-trigger-zone" />

            <section className="cd-inside-panel cd-inside-panel--contrast">
              <h2 className="cd-inside-subtitle">
                다른 방향에서 균형을 잡아줄 작업들
              </h2>
              <p className="cd-inside-intro">
                “{primaryKeyword}”라는 단어에서 출발했지만, 아래 작업들은{" "}
                “{contrastKeyword}”에 더 가까운 결을 가지고 있습니다. 때로는
                반대편의 온도가 마음의 수평을 맞춰 줍니다.
              </p>

              {/* 상단 큰 카드: 대비 키워드 소개 */}
              <div className="cd-contrast-hero">
                <a
                  className="cd-contrast-hero-link"
                  href={contrastHero?.link || "#"}
                  target={contrastHero ? "_blank" : "_self"}
                  rel={contrastHero ? "noreferrer" : undefined}
                  onClick={(e) => {
                    if (!contrastHero) e.preventDefault();
                  }}
                >
                  <div
                    className="cd-contrast-hero-image"
                    style={
                      contrastHero?.image
                        ? {
                            backgroundImage: `url(${contrastHero.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                </a>
                <div className="cd-contrast-hero-text">
                  <p className="cd-contrast-label">CONTRAST KEYWORD</p>
                  <h3 className="cd-contrast-artist-name-main">
                    {primaryKeyword} ↔ {contrastKeyword}
                  </h3>
                  <p className="cd-contrast-artist-meta">
                    첫 번째 카드는 “{contrastKeyword}” 쪽으로 기운 작업을
                    대표로 보여줍니다. 이미지를 클릭하면 원본 사이트에서 더
                    많은 정보를 볼 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 서브 작업 카드들: contrastCards */}
              <div className="cd-contrast-grid">
                {loadingContrast && (
                  <div className="cd-contrast-empty">
                    반대 결의 작업들을 찾는 중입니다…
                  </div>
                )}

                {!loadingContrast && contrastCards.length === 0 && (
                  <div className="cd-contrast-empty">
                    아직 대비되는 작업을 찾지 못했습니다. 문장을 조금 달리
                    적어 보면 새로운 연결이 생길 수 있습니다.
                  </div>
                )}

                {!loadingContrast &&
                  contrastCards.map((artist, i) => (
                    <a
                      key={artist.link || i}
                      className="cd-contrast-card"
                      href={artist.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div
                        className="cd-contrast-image"
                        style={
                          artist.image
                            ? {
                                backgroundImage: `url(${artist.image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      />
                      <div className="cd-contrast-body">
                        <h4 className="cd-contrast-work-title">
                          {artist.title}
                        </h4>
                        <p className="cd-artist-desc">{artist.snippet}</p>
                      </div>
                    </a>
                  ))}
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
