import { describe, it, expect } from "vitest";

describe("GET /api/applications", () => {
  it("returns 401 when nobody is logged in", async () => {
    const res = await fetch("http://localhost:3000/api/applications");
    expect(res.status).toBe(401);
  });
});