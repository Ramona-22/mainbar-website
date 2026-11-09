import { describe, expect, it } from "vitest";
import { getClientIp } from "./clientIp";

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/booking", { headers });
}

describe("getClientIp", () => {
  it("ignores a spoofed first x-forwarded-for entry and uses the last hop", () => {
    const req = requestWithHeaders({ "x-forwarded-for": "1.2.3.4, 203.0.113.5" });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("trims whitespace around the last address", () => {
    const req = requestWithHeaders({ "x-forwarded-for": "1.2.3.4,   203.0.113.5  " });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("prefers the platform-set x-real-ip over x-forwarded-for", () => {
    const req = requestWithHeaders({
      "x-forwarded-for": "1.2.3.4, 70.41.3.18",
      "x-real-ip": "198.51.100.7",
    });
    expect(getClientIp(req)).toBe("198.51.100.7");
  });

  it("prefers x-vercel-forwarded-for when present", () => {
    const req = requestWithHeaders({
      "x-vercel-forwarded-for": "192.0.2.44",
      "x-real-ip": "198.51.100.7",
    });
    expect(getClientIp(req)).toBe("192.0.2.44");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    const req = requestWithHeaders({});
    expect(getClientIp(req)).toBe("unknown");
  });
});
