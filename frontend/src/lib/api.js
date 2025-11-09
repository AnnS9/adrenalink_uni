console.log(" api.js loaded from", import.meta.url || "unknown");

const RAW_BASE =
  (process.env.REACT_APP_BACKEND_URL || "").trim() ||
  window.location.origin;

export const API_BASE = RAW_BASE.replace(/\/$/, ""); // strip trailing slash

function buildUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${p}`;
  console.log("[api] ->", url, "from", path);
  return url;
}

async function parseBody(res) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!text) return null;
  if (ct.includes("application/json")) {
    try { return JSON.parse(text); } catch { return null; }
  }
  return text;
}

async function request(path, opts = {}) {
  const res = await fetch(buildUrl(path), {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });

  const body = await parseBody(res);

  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && (body.error || body.message)) ||
      (typeof body === "string" && body) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body ?? {};
}

export const apiGet  = (path, opts) => request(path, opts);
export const apiSend = (path, method = "POST", body = {}, opts = {}) =>
  request(path, {
    method,
    body: Object.keys(body || {}).length ? JSON.stringify(body) : undefined,
    ...opts,
  });