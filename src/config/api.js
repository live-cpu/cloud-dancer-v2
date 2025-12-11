// src/config/api.js

// 개발 환경: 로컬 서버
const LOCAL_API_BASE = "http://localhost:5175";

// 배포용: Render API 주소
const PROD_API_BASE = "https://cloud-dancer-api.onrender.com";

export const API_BASE_URL =
  import.meta.env.MODE === "production" ? PROD_API_BASE : LOCAL_API_BASE;
