import { describe, it, expect } from "vitest";
import { siteConfig, mainNav, signInLink, footerNav } from "./site";

describe("siteConfig", () => {
  it("appSignInUrl points to the Crystord app domain", () => {
    expect(siteConfig.appSignInUrl).toContain("crystord.com");
  });
});

// BI-260001: sign-in entry must carry the required label and route
describe("signInLink (BI-260001)", () => {
  it("label is 'Sign in to Crystord App'", () => {
    expect(signInLink.label).toBe("Sign in to Crystord App");
  });

  it("href resolves to the app sign-in URL", () => {
    expect(signInLink.href).toBe(siteConfig.appSignInUrl);
  });
});

// BI-260003: main nav must contain the four accepted destinations, with sign-in separated
describe("mainNav (BI-260003)", () => {
  it("contains Home", () => {
    expect(mainNav.map((n) => n.label)).toContain("Home");
  });

  it("contains Google Add-on", () => {
    expect(mainNav.map((n) => n.label)).toContain("Google Add-on");
  });

  it("contains Contact", () => {
    expect(mainNav.map((n) => n.label)).toContain("Contact");
  });

  it("does not include sign-in (kept separate in signInLink)", () => {
    const hasSignIn = mainNav.some((n) => /sign.?in/i.test(n.label));
    expect(hasSignIn).toBe(false);
  });
});

// BI-260003: footer must contain the six accepted destinations
describe("footerNav (BI-260003)", () => {
  const labels = () => footerNav.map((n) => n.label);

  it("contains Google Add-on", () => {
    expect(labels()).toContain("Google Add-on");
  });

  it("contains Support", () => {
    expect(labels()).toContain("Support");
  });

  it("contains Privacy", () => {
    expect(labels()).toContain("Privacy");
  });

  it("contains Terms", () => {
    expect(labels()).toContain("Terms");
  });

  it("contains Contact", () => {
    expect(labels()).toContain("Contact");
  });

  it("contains YouTube marked as external", () => {
    const yt = footerNav.find((n) => n.label === "YouTube");
    expect(yt).toBeDefined();
    expect(yt?.external).toBe(true);
  });

  it("only YouTube is marked external", () => {
    const externalCount = footerNav.filter((n) => n.external).length;
    expect(externalCount).toBe(1);
  });
});
