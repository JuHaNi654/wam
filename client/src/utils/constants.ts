export const API_URL = import.meta.env.VITE_API_URL
// The SSE endpoint is served off the API host root, not under the `/api`
// prefix (e.g. API_URL = "http://localhost:8000/api" -> SSE at
// "http://localhost:8000/events"), so it's derived rather than hardcoded.
export const SSE_URL = `${API_URL.replace(/\/api\/?$/, "")}/events`
