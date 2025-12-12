// src/App.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "./styles/cloud-dancer.css";
import { API_BASE_URL } from "./config/api";
import { buildContrastInfo } from "./contrastDictionary";

// 이미지 Assets
import cloudBack from "./assets/cloud-back.jpg";
import cloud1 from "./assets/cloud-1.png";
import cloud2 from "./assets/cloud-2.png";
import cloud3 from "./assets/cloud-3.png";
import mountain from "./assets/mountain.jpg";
import tree1 from "./assets/tree-1.png";
import tree2 from "./assets/tree-2.png";

function App() {
  const [text, setText] = useState("");
  const [stage, setStage] = useState("idle");
  const [forestVisible, setForestVisible] = useState(false);

  const [closeResults, setCloseResults] = useState([]);
  const [loadingClose, setLoadingClose] = useState(false);

  const [contrastResults, setContrastResults] = useState([]);
  const [loadingContrast, setLoadingContrast] = useState(false);

  // 에러 메시지 상태 (여기에 값이 있으면 팝업이 뜸)
  const [globalError, setGlobalError] = useState("");

  const rootRef = useRef(null);
  const forestTriggerRef = useRef(null);
  const lastSearchRef = useRef({ base: "", contrast: "" });

  // -----------------------------------------------------------------
  // [테스트용] 팝업 UI 확인용 코드
  // 팝업이 잘 뜨는지 확인한 뒤에는 아래 useEffect 전체를 지우거나 주석 처리하세요.
  // -----------------------------------------------------------------
  /*
  useEffect(() => {
    setGlobalError("테스트 에러입니다. 이 창이 보이면 팝업 기능은 정상입니다.");
  }, []);
  */
  // -----------------------------------------------------------------


  // [스크롤] 배경 전환 (구름 <-> 숲)
  useEffect(() => {
    if (!forestTriggerRef.current || !rootRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // 스크롤 내려서 트리거가 보이면 true(숲), 다시 올리면 false(구름)
        setForestVisible(entry.isIntersecting);
      },
      {
        root: rootRef.current, 
        threshold: 0.1, 
      }
    );

    observer.observe(forestTriggerRef.current);
    return () => observer.disconnect();
  }, [stage]);


  // [스테이지] 텍스트 입력 감지
  useEffect(() => {
    const trimmed = text.trim();
    if (stage === "entering" || stage === "inside") return;
    setStage(trimmed.length > 0 ? "typing" : "idle");
  }, [text, stage]);


  // [API] 키워드 분석 및 호출
  const contrastInfo = useMemo(() => buildContrastInfo(text) || {}, [text]);
  const { primaryKeyword = "", contrastKeyword = "", keywordChips = [] } = contrastInfo;

  const getContrastWord = useCallback((base) => {
    return contrastInfo.getContrastWord ? contrastInfo.getContrastWord(base) : base;
  }, [contrastInfo]);

  useEffect(() => {
    const base = text.trim();
    if (stage !== "inside" || !base) {
      setCloseResults([]);
      setContrastResults([]);
      lastSearchRef.current = { base: "", contrast: "" };
      return;
    }

    const contrastWord = getContrastWord(base);
    if (lastSearchRef.current.base === base && lastSearchRef.current.contrast === contrastWord) return;

    lastSearchRef.current = { base, contrast: contrastWord };
    setGlobalError(""); // 새 검색 시 에러 초기화

    const closeController = new AbortController();
    const contrastController = new AbortController();

    // 1. 메인 검색 (비슷한 결)
    async function fetchClose() {
      try {
        setLoadingClose(true);
        const url = `${API_BASE_URL}/api/search-artists?query=${encodeURIComponent(base)}`;
        
        const res = await fetch(url, { signal: closeController.signal });
        
        if (!res.ok) {
           if (res.status === 429) {
             setGlobalError("하루 검색 허용량을 초과했습니다.\n(내일 다시 이용해 주세요)");
             return;
           }
           const errData = await res.json().catch(() => ({}));
           // 구글 쿼터 에러 명시적 처리
           if (errData?.error === "google_quota" || errData?.message?.includes("quota")) {
               setGlobalError("오늘 검색 가능한 횟수를 모두 사용했습니다.\n내일 다시 시도해 주세요.");
               return;
           }
           setGlobalError(errData?.message || "서버 연결에 실패했습니다.");
           return;
        }

        const data = await res.json();

        // 200 OK라도 에러 객체가 오는 경우 처리
        if (data.error?.type === "google_quota") {
            setGlobalError("오늘 검색 가능한 횟수를 모두 사용했습니다.\n(Quota Exceeded)");
            setCloseResults([]);
            return;
        }

        setCloseResults(data.results || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setGlobalError("네트워크 오류가 발생했습니다.");
        }
      } finally {
        setLoadingClose(false);
      }
    }

    // 2. 대비 검색 (반대 결)
    async function fetchContrast() {
      try {
        setLoadingContrast(true);
        const queryForContrast = contrastWord || base;
        if (queryForContrast === base) {
          setLoadingContrast(false);
          return;
        }

        const url = `${API_BASE_URL}/api/search-artists?query=${encodeURIComponent(queryForContrast)}`;
        const res = await fetch(url, { signal: contrastController.signal });

        if (!res.ok) {
            // 메인이 성공했으면 여기서는 조용히 넘어가거나 로그만 찍음
            if (res.status === 429) {
               // 둘 다 429면 메인에서 잡히므로 패스, 혹은 안전장치
            }
            return;
        }
        const data = await res.json();
        
        if (data.error?.type === "google_quota") {
            // 대비 검색에서 쿼터가 터져도 사용자에게 알려줌
            setGlobalError((prev) => prev || "오늘 검색 허용량을 모두 사용했습니다.");
            return;
        }
        setContrastResults(data.results || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
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
  }, [stage, text, getContrastWord]);


  // 렌더링용 변수
  const mainArtist = closeResults[0] || null;
  let contrastHero = null;
  let contrastCards = [];

  if (contrastKeyword && contrastResults.length > 0) {
    let contrastHeroIndex = 0;
    let contrastCardsStartIndex = 1;
    if (mainArtist && contrastResults.length > 1 && contrastResults[0].link === mainArtist.link) {
      contrastHeroIndex = 1;
      contrastCardsStartIndex = 2;
    }
    contrastHero = contrastResults[contrastHeroIndex] || null;
    contrastCards = contrastResults.slice(contrastCardsStartIndex, contrastCardsStartIndex + 3);
  } else if (!contrastKeyword) {
    const list = closeResults.slice(1);
    contrastHero = list[0] || null;
    contrastCards = list.slice(1, 4);
  }

  const handleEnter = () => {
    if (!text.trim()) return;
    if (stage === "entering" || stage === "inside") return;
    setGlobalError("");
    setStage("entering");
    setTimeout(() => {
      setStage("inside");
      if (rootRef.current) rootRef.current.scrollTo({ top: 0, behavior: "instant" });
    }, 1500);
  };

  const handleLogoClick = () => {
    if (rootRef.current) rootRef.current.scrollTo({ top: 0, behavior: "smooth" });
    if (stage === "idle" || stage === "typing") return;
    setForestVisible(false);
    setStage(text.trim().length > 0 ? "typing" : "idle");
    setGlobalError("");
    lastSearchRef.current = { base: "", contrast: "" };
  };

  const rootClassName = [
    "cd-root",
    `cd-root--stage-${stage}`,
    forestVisible ? "cd-root--forest-visible" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={rootClassName} ref={rootRef}>
      
      {/* 🔴 [팝업] 에러 발생 시 무조건 최상단 노출 */}
      {globalError && (
        <div className="cd-popup-overlay">
          <div className="cd-popup-box">
            <h3 className="cd-popup-title">알림</h3>
            <p className="cd-popup-desc">
                {globalError.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                        {line}
                        <br />
                    </React.Fragment>
                ))}
            </p>
            <button className="cd-popup-btn" onClick={() => setGlobalError("")}>
              확인
            </button>
          </div>
        </div>
      )}

      {/* 배경 레이어들 */}
      <div className="cd-bg-layer cd-bg-layer--sky" style={{ backgroundImage: `url(${cloudBack})` }} />
      <div className="cd-bg-layer cd-cloud-layer cd-cloud-layer--1" style={{ backgroundImage: `url(${cloud1})` }} />
      <div className="cd-bg-layer cd-cloud-layer cd-cloud-layer--2" style={{ backgroundImage: `url(${cloud2})` }} />
      <div className="cd-bg-layer cd-cloud-layer cd-cloud-layer--3" style={{ backgroundImage: `url(${cloud3})` }} />

      <div className="cd-bg-layer cd-forest-layer cd-forest-layer--mountain" style={{ backgroundImage: `url(${mountain})` }} />
      <div className="cd-bg-layer cd-forest-layer cd-forest-layer--tree1" style={{ backgroundImage: `url(${tree1})` }} />
      <div className="cd-bg-layer cd-forest-layer cd-forest-layer--tree2" style={{ backgroundImage: `url(${tree2})` }} />

      <div className="cd-shell">
        <header className="cd-header">
          <button type="button" className="cd-logo-block" onClick={handleLogoClick}>
            <div className="cd-logo-mark" />
            <div className="cd-logo-text">
              <span className="cd-logo-title">CLOUD DANCER</span>
              <span className="cd-logo-sub">INNER GAZE RECOMMENDER</span>
            </div>
          </button>
        </header>

        {stage !== "inside" && (
          <main className="cd-main cd-main--hero">
            <section className={`cd-polaroid ${stage === "entering" ? "cd-polaroid--exit" : ""}`}>
              <div className="cd-polaroid-frame">
                <div className="cd-polaroid-image-slot" />
                <form className="cd-polaroid-caption" onSubmit={(e) => { e.preventDefault(); handleEnter(); }}>
                  <label className="cd-caption-label">Write your mind</label>
                  <textarea
                    className="cd-caption-textarea"
                    rows={4}
                    placeholder="지금 머릿속에 맴도는 문장을 짧게 적어보세요."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnter(); } }}
                  />
                  <button type="submit" className="cd-btn-primary" disabled={!text.trim()}>
                    구름 속으로 보내기
                  </button>
                </form>
              </div>
            </section>
          </main>
        )}

        {stage === "inside" && (
          <main className="cd-main cd-main--inside">
            {/* 상단 (구름) */}
            <section className="cd-inside-panel cd-inside-panel--primary">
              <aside className="cd-palette-panel">
                <p className="cd-palette-label">FROM YOUR WORDS</p>
                <ul className="cd-palette-list">
                  {keywordChips.map((kw, i) => (
                    <li key={i} className="cd-palette-chip">
                      <span className="cd-palette-chip-swatch" />
                      <span className="cd-palette-chip-text">{kw}</span>
                    </li>
                  ))}
                </ul>
                <p className="cd-palette-note">이 단어들의 결과 닮은 디자이너와 작가들을 천천히 연결해 드립니다.</p>
              </aside>

              <div className="cd-inside-center">
                {mainArtist ? (
                   <a className="cd-inside-work-link" href={mainArtist.link} target="_blank" rel="noreferrer">
                    <div className="cd-inside-work-image cd-inside-work-image--photo" style={mainArtist.image ? { backgroundImage: `url(${mainArtist.image})` } : undefined} />
                   </a>
                ) : (
                   <div className="cd-inside-work-image" />
                )}
              </div>

              <div className="cd-inside-right">
                <p className="cd-inside-eyebrow">지금의 시간</p>
                <h2 className="cd-inside-title">당신이 보낸 문장</h2>
                <p className="cd-inside-usertext">"{text}"</p>
                <div className="cd-inside-artist">
                  <p className="cd-artist-label">비슷한 결을 가진 아티스트</p>
                  {loadingClose && <p className="cd-artist-loading">작가를 찾는 중입니다…</p>}
                  {!loadingClose && !mainArtist && <p className="cd-artist-desc">검색 결과가 없습니다.</p>}
                  {mainArtist && (
                    <>
                      <h3 className="cd-artist-name">{mainArtist.title}</h3>
                      <p className="cd-artist-desc">{mainArtist.snippet}</p>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* 트리거 존 */}
            <div ref={forestTriggerRef} className="cd-trigger-zone" />

            {/* 하단 (숲) */}
            <section className="cd-inside-panel cd-inside-panel--contrast">
              <h2 className="cd-inside-subtitle">다른 방향에서 균형을 잡아줄 작업들</h2>
              <p className="cd-inside-intro">
                {contrastKeyword ? `"${primaryKeyword}" ↔ "${contrastKeyword}"` : "다른 결의 작업들"}
              </p>

              <div className="cd-contrast-hero">
                  <a 
                    className="cd-contrast-hero-link"
                    href={contrastHero?.link || "#"}
                    target={contrastHero ? "_blank" : "_self"}
                    rel={contrastHero ? "noreferrer" : undefined}
                    onClick={(e) => { if (!contrastHero) e.preventDefault(); }}
                  >
                    <div className="cd-contrast-hero-image" style={contrastHero?.image ? { backgroundImage: `url(${contrastHero.image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
                  </a>
                  <div className="cd-contrast-hero-text">
                      <p className="cd-contrast-label">CONTRAST KEYWORD</p>
                      <h3 className="cd-contrast-artist-name-main">{contrastHero?.title || "Searching..."}</h3>
                  </div>
              </div>
              
              <div className="cd-contrast-grid">
                  {loadingContrast && <div>Loading...</div>}
                  {!loadingContrast && contrastCards.map((card, i) => (
                      <a key={i} className="cd-contrast-card" href={card.link} target="_blank" rel="noreferrer">
                          <div className="cd-contrast-image" style={card.image ? {backgroundImage: `url(${card.image})`} : undefined} />
                          <h4 className="cd-contrast-work-title">{card.title}</h4>
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