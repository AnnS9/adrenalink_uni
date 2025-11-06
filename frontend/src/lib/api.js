const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
export const API_BASE = BASE;

async function parseJsonSafe(res) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  const txt = await res.text();
  if (!txt) return null;
  try { return JSON.parse(txt); } catch { return null; }
}

export async function apiGet(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { credentials: "include", ...opts });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  const data = await parseJsonSafe(res);
  return data ?? {};
}

export async function apiSend(path, method = "POST", body = {}, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    credentials: "include",
    body: Object.keys(body || {}).length ? JSON.stringify(body) : undefined,
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  const data = await parseJsonSafe(res);
  return data ?? {};
}
