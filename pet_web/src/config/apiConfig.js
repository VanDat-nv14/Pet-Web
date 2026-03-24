/**
 * Một nguồn URL API cho toàn app. Ghi đè bằng REACT_APP_API_URL trong .env.development.
 * Mặc định HTTPS :7164 — trùng launchSettings của API; cần: dotnet dev-certs https --trust
 * Nếu chỉ chạy HTTP: đặt REACT_APP_API_URL=http://localhost:5181/api
 */
function normalizeApiBase(url) {
  const fallback = 'https://localhost:7164/api';
  const raw = (url || '').trim();
  if (!raw) return fallback;
  const noTrail = raw.replace(/\/+$/, '');
  if (/\/api$/i.test(noTrail)) return noTrail;
  return `${noTrail}/api`;
}

export const API_BASE_URL = normalizeApiBase(process.env.REACT_APP_API_URL);

/** Origin gốc (không có /api) — dùng cho ảnh, SignalR, fetch trực tiếp */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/i, '');

export function getAxiosBaseURL() {
  return API_BASE_URL;
}

export function getApiOrigin() {
  return API_ORIGIN;
}
