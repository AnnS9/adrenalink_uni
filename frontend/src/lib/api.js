console.log("api.js loaded from", import.meta.url || "unknown");

const RAW_BASE =
  (process.env.REACT_APP_BACKEND_URL || "").trim() ||
  window.location.origin;

export const API_BASE = RAW_BASE.replace(/\/$/, "");

function buildUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${p}`;
  console.log("[api] ->", url, "from", path);
  return url;
}

// Robust body parser that never throws
async function parseBody(res) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!text) return null;

  if (ct.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch (err) {
      console.warn("[api] Failed to parse JSON:", err, "Text:", text);
      return { error: "Invalid JSON response from server", raw: text };
    }
  }

  // Return raw text if not JSON
  return text;
}

// Core request function
async function request(path, opts = {}) {
  try {
    const res = await fetch(buildUrl(path), {
      credentials: "include", // always include cookies/session
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      ...opts,
    });

    const body = await parseBody(res);
    console.log("[api] response", res.status, body);

    // If HTTP error, throw with message from JSON or text
    if (!res.ok) {
      const msg =
        (body && typeof body === "object" && (body.error || body.message)) ||
        (typeof body === "string" && body) ||
        `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return body ?? {};
  } catch (err) {
    console.error("[api] request error:", err);
    throw err;
  }
}

// GET helper
export const apiGet = (path, opts) => request(path, { method: "GET", ...opts });

// POST/PUT/DELETE helper
export const apiSend = (path, method = "POST", body = {}, opts = {}) =>
  request(path, {
    method,
    body: Object.keys(body || {}).length ? JSON.stringify(body) : undefined,
    ...opts,
  });
