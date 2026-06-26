import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  gqlSignIn,
  gqlBeginSignup,
  gqlCompleteSignup,
  friendlyAuthError,
  gqlSignInGoogle,
} from "./auth-graphql";

const GQL_URL = "https://app.crystord.com/graphql";

function mockFetch(body: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => body,
  });
}

function lastCall() {
  return (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
}

beforeEach(() => {
  vi.resetAllMocks();
});

// ── gqlSignIn ───────────────────────────────────────────────────────────────

describe("gqlSignIn", () => {
  it("returns ok:true with token on success", async () => {
    mockFetch({ data: { signin: "jwt-token" } });
    expect(await gqlSignIn(GQL_URL, "user@example.com", "pass")).toEqual({
      ok: true,
      token: "jwt-token",
    });
  });

  it("POSTs to the correct URL with Content-Type and no credentials option", async () => {
    mockFetch({ data: { signin: "jwt-token" } });
    await gqlSignIn(GQL_URL, "u", "p");
    const [url, opts] = lastCall();
    expect(url).toBe(GQL_URL);
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBe("application/json");
    expect(opts.credentials).toBeUndefined();
  });

  it("sends email and password as GraphQL variables", async () => {
    mockFetch({ data: { signin: "jwt-token" } });
    await gqlSignIn(GQL_URL, "user@example.com", "secret");
    const body = JSON.parse(lastCall()[1].body);
    expect(body.variables).toEqual({ email: "user@example.com", password: "secret" });
    expect(body.query).toContain("signin");
  });

  it("returns ok:false with server error message on GraphQL error", async () => {
    mockFetch({ errors: [{ message: "Invalid credentials" }] });
    expect(await gqlSignIn(GQL_URL, "u", "wrong")).toEqual({
      ok: false,
      message: "Invalid credentials",
    });
  });

  it("returns ok:false with default message when data has no token", async () => {
    mockFetch({ data: { signin: null } });
    expect(await gqlSignIn(GQL_URL, "u", "p")).toEqual({
      ok: false,
      message: "Sign-in failed. Please check your credentials.",
    });
  });

  it("propagates network errors", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(gqlSignIn(GQL_URL, "u", "p")).rejects.toThrow("Failed to fetch");
  });
});

// ── gqlBeginSignup ────────────────────────────────────────────────────────────

describe("gqlBeginSignup", () => {
  it("returns ok:true on success", async () => {
    mockFetch({ data: { beginSignup: true } });
    expect(await gqlBeginSignup(GQL_URL, "user@example.com")).toEqual({ ok: true });
  });

  it("sends email as a GraphQL variable to beginSignup", async () => {
    mockFetch({ data: { beginSignup: true } });
    await gqlBeginSignup(GQL_URL, "user@example.com");
    const body = JSON.parse(lastCall()[1].body);
    expect(body.variables).toEqual({ email: "user@example.com" });
    expect(body.query).toContain("beginSignup");
  });

  it("returns ok:false with server error message on GraphQL error", async () => {
    mockFetch({ errors: [{ message: "AUTH-RATE-LIMITED" }] });
    expect(await gqlBeginSignup(GQL_URL, "u")).toEqual({
      ok: false,
      message: "AUTH-RATE-LIMITED",
    });
  });

  it("propagates network errors", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(gqlBeginSignup(GQL_URL, "u")).rejects.toThrow("Failed to fetch");
  });
});

// ── gqlCompleteSignup ─────────────────────────────────────────────────────────

describe("gqlCompleteSignup", () => {
  it("returns ok:true with token on success", async () => {
    mockFetch({ data: { completeSignup: "jwt-token" } });
    expect(
      await gqlCompleteSignup(GQL_URL, "user@example.com", "123456", "pass", "johndoe")
    ).toEqual({ ok: true, token: "jwt-token" });
  });

  it("sends email, code, password and username as GraphQL variables", async () => {
    mockFetch({ data: { completeSignup: "jwt-token" } });
    await gqlCompleteSignup(GQL_URL, "user@example.com", "123456", "secret", "johndoe");
    const body = JSON.parse(lastCall()[1].body);
    expect(body.variables).toEqual({
      email: "user@example.com",
      code: "123456",
      password: "secret",
      username: "johndoe",
    });
    expect(body.query).toContain("completeSignup");
  });

  it("returns ok:false with server error message on GraphQL error", async () => {
    mockFetch({ errors: [{ message: "SIGNUP-INVALID-OR-EXPIRED-CODE" }] });
    expect(await gqlCompleteSignup(GQL_URL, "u", "000000", "p", "name")).toEqual({
      ok: false,
      message: "SIGNUP-INVALID-OR-EXPIRED-CODE",
    });
  });

  it("returns ok:false with default message when data has no token", async () => {
    mockFetch({ data: { completeSignup: null } });
    expect(await gqlCompleteSignup(GQL_URL, "u", "c", "p", "name")).toEqual({
      ok: false,
      message: "Sign-up failed. Please try again.",
    });
  });

  it("propagates network errors", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(gqlCompleteSignup(GQL_URL, "u", "c", "p", "n")).rejects.toThrow("Failed to fetch");
  });
});

// ── friendlyAuthError ─────────────────────────────────────────────────────────

describe("friendlyAuthError", () => {
  it("maps known rate-limit, code and account errors", () => {
    expect(friendlyAuthError("AUTH-RATE-LIMITED")).toMatch(/too many attempts/i);
    expect(friendlyAuthError("SIGNUP-INVALID-OR-EXPIRED-CODE")).toMatch(/incorrect or has expired/i);
    expect(friendlyAuthError("SIGNUP-ACCOUNT-ALREADY-EXISTS")).toMatch(/already exists/i);
    expect(friendlyAuthError("USER-ALREADY-EXISTS")).toMatch(/already taken/i);
  });

  it("includes the detail for password and username policy errors", () => {
    expect(friendlyAuthError("PASSWORD-TOO-SHORT: must be at least 12 characters")).toBe(
      "Password must be at least 12 characters."
    );
    expect(friendlyAuthError("USER-INVALID-USERNAME: must start with a letter")).toBe(
      "Username: must start with a letter."
    );
    expect(friendlyAuthError("PASSWORD-TOO-COMMON: choose a less common password")).toMatch(
      /too common/i
    );
  });

  it("passes unknown messages through unchanged", () => {
    expect(friendlyAuthError("Invalid email or password")).toBe("Invalid email or password");
  });
});

// ── gqlSignInGoogle ─────────────────────────────────────────────────────────

describe("gqlSignInGoogle", () => {
  it("returns ok:true with token on success", async () => {
    mockFetch({ data: { signinGoogle: "jwt-token" } });
    expect(await gqlSignInGoogle(GQL_URL, "google-id-token")).toEqual({
      ok: true,
      token: "jwt-token",
    });
  });

  it("sends idToken as a GraphQL variable", async () => {
    mockFetch({ data: { signinGoogle: "jwt-token" } });
    await gqlSignInGoogle(GQL_URL, "my-id-token");
    const body = JSON.parse(lastCall()[1].body);
    expect(body.variables).toEqual({ idToken: "my-id-token" });
    expect(body.query).toContain("signinGoogle");
  });

  it("returns ok:false with server error message on GraphQL error", async () => {
    mockFetch({ errors: [{ message: "Google token invalid" }] });
    expect(await gqlSignInGoogle(GQL_URL, "bad-token")).toEqual({
      ok: false,
      message: "Google token invalid",
    });
  });

  it("returns ok:false with default message when data has no token", async () => {
    mockFetch({ data: { signinGoogle: null } });
    expect(await gqlSignInGoogle(GQL_URL, "token")).toEqual({
      ok: false,
      message: "Google sign-in failed. Please try again.",
    });
  });

  it("propagates network errors", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(gqlSignInGoogle(GQL_URL, "t")).rejects.toThrow("Failed to fetch");
  });
});
