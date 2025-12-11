// src/config/api.js

const LOCAL_API_BASE = "http://localhost:5175";
const PROD_API_BASE = "https://your-cloud-dancer-api.example.com";

export const API_BASE_URL =
  import.meta.env.MODE === "production" ? PROD_API_BASE : LOCAL_API_BASE;

