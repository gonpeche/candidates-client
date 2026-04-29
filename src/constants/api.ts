const DEFAULT_API_BASE_URL = "http://localhost:3001";

const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/$/, "");
