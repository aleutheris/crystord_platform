import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitSignIn } from "./sign-in";

const AUTH_URL = "https://app.crystord.com/sign-in";

describe("submitSignIn", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns redirect to origin on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const result = await submitSignIn(AUTH_URL, "user@example.com", "secret");

    expect(result).toEqual({ ok: true, redirectUrl: "https://app.crystord.com" });
    expect(fetch).toHaveBeenCalledWith(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: "user@example.com", password: "secret" }),
    });
  });

  it("returns message from response body on auth failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    const result = await submitSignIn(AUTH_URL, "user@example.com", "wrong");

    expect(result).toEqual({ ok: false, message: "Invalid credentials" });
  });

  it("returns default message when response body has no message field", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const result = await submitSignIn(AUTH_URL, "u", "p");

    expect(result).toEqual({
      ok: false,
      message: "Sign-in failed. Please check your credentials.",
    });
  });

  it("returns default message when response body is unparseable", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => { throw new Error("not json"); },
    });

    const result = await submitSignIn(AUTH_URL, "u", "p");

    expect(result).toEqual({
      ok: false,
      message: "Sign-in failed. Please check your credentials.",
    });
  });

  it("propagates network errors so the caller can show a connection message", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(submitSignIn(AUTH_URL, "u", "p")).rejects.toThrow("Failed to fetch");
  });
});
