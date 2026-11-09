// Client IP for rate limiting.
//
// Never trust the FIRST x-forwarded-for entry: the visitor can send their own
// x-forwarded-for header, and most proxies append to it rather than replace
// it, so a fake first entry would give every request a fresh rate-limit bucket.
// Prefer headers the hosting platform sets itself, then the LAST
// x-forwarded-for entry (added by the proxy closest to us).
export function getClientIp(request: Request): string {
  const platformIp =
    request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-real-ip");
  if (platformIp) {
    const ip = platformIp.split(",")[0]?.trim();
    if (ip) return ip;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",").map((part) => part.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }

  return "unknown";
}

export function isJsonRequest(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.split(";")[0].trim().toLowerCase() === "application/json";
}
