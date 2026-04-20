import axios from "axios";

const TOKEN_STORAGE_KEY = "amazon_auth_token";

export function getAuthToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
}

export function setAuthToken(token) {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function clearAuthToken() {
  setAuthToken("");
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const API_URL = import.meta.env.VITE_API_URL;
