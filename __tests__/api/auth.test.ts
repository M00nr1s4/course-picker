import { describe, it, expect } from "vitest";

const BASE = "http://localhost:3000/api";

describe("Auth API", () => {
  const testUser = { email: `test-${Date.now()}@test.com`, name: "测试用户", password: "test123456" };

  it("POST /api/auth/register - creates a new user", async () => {
    const res = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.email).toBe(testUser.email);
    expect(data.user.name).toBe(testUser.name);
  });

  it("POST /api/auth/register - rejects duplicate email", async () => {
    const res = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });
    expect(res.status).toBe(409);
  });

  it("POST /api/auth/register - rejects missing fields", async () => {
    const res = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("Public API - Majors", () => {
  it("GET /api/majors returns major list", async () => {
    const res = await fetch(`${BASE}/majors`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("id");
    expect(data[0]).toHaveProperty("name");
  });
});

describe("Public API - Search", () => {
  it("GET /api/teachers/search?q= returns results", async () => {
    const res = await fetch(`${BASE}/teachers/search?q=张`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("teachers");
    expect(data).toHaveProperty("courses");
    expect(data).toHaveProperty("majors");
  });
});
