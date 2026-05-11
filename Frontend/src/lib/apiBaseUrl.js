const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim();

export const API_BASE_URL = backendUrl
  ? `${backendUrl.replace(/\/+$/, "")}/api`
  : "/api";
