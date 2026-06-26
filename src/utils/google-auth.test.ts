import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadGsi, initGoogleButton } from "./google-auth";

// ── loadGsi ──────────────────────────────────────────────────────────────────

describe("loadGsi", () => {
  let mockScript: {
    src: string;
    onload: (() => void) | null;
    onerror: (() => void) | null;
  };
  let appendChildSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockScript = { src: "", onload: null, onerror: null };
    appendChildSpy = vi.fn();
    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue(mockScript),
      head: { appendChild: appendChildSpy },
    });
    // Ensure google is not yet loaded
    vi.stubGlobal("google", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves immediately when google is already loaded", async () => {
    vi.stubGlobal("google", { accounts: {} });
    await expect(loadGsi()).resolves.toBeUndefined();
    expect(appendChildSpy).not.toHaveBeenCalled();
  });

  it("appends the GSI script to document.head", async () => {
    const promise = loadGsi();
    expect(appendChildSpy).toHaveBeenCalledWith(mockScript);
    mockScript.onload!();
    await promise;
  });

  it("sets the correct script src", async () => {
    const promise = loadGsi();
    expect(mockScript.src).toBe("https://accounts.google.com/gsi/client");
    mockScript.onload!();
    await promise;
  });

  it("resolves when the script fires onload", async () => {
    const promise = loadGsi();
    mockScript.onload!();
    await expect(promise).resolves.toBeUndefined();
  });

  it("rejects when the script fires onerror", async () => {
    const promise = loadGsi();
    mockScript.onerror!();
    await expect(promise).rejects.toThrow("Failed to load Google Sign-In library");
  });
});

// ── initGoogleButton ─────────────────────────────────────────────────────────

describe("initGoogleButton", () => {
  const initializeSpy = vi.fn();
  const renderButtonSpy = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("google", {
      accounts: {
        id: {
          initialize: initializeSpy,
          renderButton: renderButtonSpy,
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("calls google.accounts.id.initialize with the correct client_id", () => {
    initGoogleButton("test-client-id", { offsetWidth: 300 } as HTMLElement, vi.fn());
    expect(initializeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "test-client-id" })
    );
  });

  it("calls google.accounts.id.renderButton with the container and outline theme", () => {
    const container = { offsetWidth: 300 } as HTMLElement;
    initGoogleButton("client-id", container, vi.fn());
    expect(renderButtonSpy).toHaveBeenCalledWith(
      container,
      expect.objectContaining({ theme: "outline", size: "large" })
    );
  });

  it("renders an icon-only button (no width, so it never needs to match the input width)", () => {
    const container = { offsetWidth: 420 } as HTMLElement;
    initGoogleButton("client-id", container, vi.fn());
    expect(renderButtonSpy).toHaveBeenCalledWith(
      container,
      expect.objectContaining({ type: "icon", theme: "outline", size: "large" })
    );
    // No `width` (icon button) and no `shape` (adding it renders a blank icon — see crystord_app).
    const cfg = renderButtonSpy.mock.calls[0][1] as Record<string, unknown>;
    expect(cfg).not.toHaveProperty("width");
    expect(cfg).not.toHaveProperty("shape");
  });

  it("invokes onIdToken with the credential from the GSI callback", () => {
    const onIdToken = vi.fn();
    initGoogleButton("client-id", { offsetWidth: 300 } as HTMLElement, onIdToken);
    const { callback } = initializeSpy.mock.calls[0][0] as {
      callback(r: { credential: string }): void;
    };
    callback({ credential: "test-id-token" });
    expect(onIdToken).toHaveBeenCalledWith("test-id-token");
  });
});
