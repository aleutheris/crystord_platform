import { describe, it, expect, vi, beforeEach } from "vitest";
import { gqlSignIn, gqlSignUp, gqlSignInGoogle, getGoogleClientId } from "./auth-graphql";

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

// ── gqlSignUp ───────────────────────────────────────────────────────────────

describe("gqlSignUp", () => {
  it("returns ok:true with token on success", async () => {
    mockFetch({ data: { signup: "jwt-token" } });
    expect(await gqlSignUp(GQL_URL, "user@example.com", "pass")).toEqual({
      ok: true,
      token: "jwt-token",
    });
  });

  it("sends email and password as GraphQL variables", async () => {
    mockFetch({ data: { signup: "jwt-token" } });
    await gqlSignUp(GQL_URL, "user@example.com", "pass");
    const body = JSON.parse(lastCall()[1].body);
    expect(body.variables).toEqual({ email: "user@example.com", password: "pass" });
    expect(body.query).toContain("signup");
  });

  it("includes username in variables when provided", async () => {
    mockFetch({ data: { signup: "jwt-token" } });
    await gqlSignUp(GQL_URL, "user@example.com", "pass", "johndoe");
    const body = JSON.parse(lastCall()[1].body);
    expect(body.variables).toEqual({
      email: "user@example.com",
      password: "pass",
      username: "johndoe",
    });
  });

  it("omits username from variables when not provided", async () => {
    mockFetch({ data: { signup: "jwt-token" } });
    await gqlSignUp(GQL_URL, "user@example.com", "pass");
    const body = JSON.parse(lastCall()[1].body);
    expect(Object.keys(body.variables)).not.toContain("username");
  });

  it("returns ok:false with server error message on GraphQL error", async () => {
    mockFetch({ errors: [{ message: "Email already in use" }] });
    expect(await gqlSignUp(GQL_URL, "u", "p")).toEqual({
      ok: false,
      message: "Email already in use",
    });
  });

  it("returns ok:false with default message when data has no token", async () => {
    mockFetch({ data: { signup: null } });
    expect(await gqlSignUp(GQL_URL, "u", "p")).toEqual({
      ok: false,
      message: "Sign-up failed. Please try again.",
    });
  });

  it("propagates network errors", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(gqlSignUp(GQL_URL, "u", "p")).rejects.toThrow("Failed to fetch");
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

// ── getGoogleClientId ────────────────────────────────────────────────────────

describe("getGoogleClientId", () => {
  it("returns the client ID on success", async () => {
    mockFetch({ data: { getGoogleClientID: "my-client.apps.googleusercontent.com" } });
    expect(await getGoogleClientId(GQL_URL)).toBe("my-client.apps.googleusercontent.com");
  });

  it("omits variables from the request body", async () => {
    mockFetch({ data: { getGoogleClientID: "client-id" } });
    await getGoogleClientId(GQL_URL);
    const body = JSON.parse(lastCall()[1].body);
    expect(body.variables).toBeUndefined();
  });

  it("throws with server error message on GraphQL error", async () => {
    mockFetch({ errors: [{ message: "Unauthorized" }] });
    await expect(getGoogleClientId(GQL_URL)).rejects.toThrow("Unauthorized");
  });

  it("throws with default message when data has no client ID", async () => {
    mockFetch({ data: { getGoogleClientID: null } });
    await expect(getGoogleClientId(GQL_URL)).rejects.toThrow(
      "Failed to retrieve Google client ID."
    );
  });

  it("propagates network errors", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(getGoogleClientId(GQL_URL)).rejects.toThrow("Failed to fetch");
  });
});
