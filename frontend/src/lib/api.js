// src/lib/api.js
const RAW_BASE =
  process.env.REACT_APP_BACKEND_URL?.trim() ||
  window.location.origin; // works locally if you proxy
const BASE = RAW_BASE.replace(/\/$/, "");   // strip trailing slash
export const API_BASE = BASE;

function buildUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
}

async function parseBody(res) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();                 // read once
  if (!text) return null;
  if (ct.includes("application/json")) {
    try { return JSON.parse(text); } catch { return null; }
  }
  return text;
}

async function request(path, opts = {}) {
  // simple timeout guard
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);

  try {
    const res = await fetch(buildUrl(path), {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      signal: controller.signal,
      ...opts,
    });

    const body = await parseBody(res);

    if (!res.ok) {
      // prefer JSON error fields, else text, else status
      const msg =
        (body && typeof body === "object" && (body.error || body.message)) ||
        (typeof body === "string" && body) ||
        `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return body ?? {};
  } finally {
    clearTimeout(t);
  }
}

export const apiGet  = (path, opts = {}) => request(path, opts);
export const apiSend = (path, method = "POST", body = {}, opts = {}) =>
  request(path, {
    method,
    body: Object.keys(body || {}).length ? JSON.stringify(body) : undefined,
    ...opts,
  });
