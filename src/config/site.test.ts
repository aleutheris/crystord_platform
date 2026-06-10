import { describe, it, expect } from "vitest";
import { siteConfig, mainNav, signInLink, footerNav } from "./site";

describe("siteConfig", () => {
  it("appSignInUrl points to the Crystord app domain", () => {
    expect(siteConfig.appSignInUrl).toContain("crystord.com");
  });

  it("graphqlUrl points to the Crystord app domain", () => {
    expect(siteConfig.graphqlUrl).toContain("crystord.com");
  });
});

// BI-260001: sign-in entry must carry the required label and route
describe("signInLink (BI-260001)", () => {
  it("label is 'Sign In'", () => {
    expect(signInLink.label).toBe("Sign In");
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

  it("contains Privacy Policy", () => {
    expect(labels()).toContain("Privacy Policy");
  });

  it("contains Terms of Service", () => {
    expect(labels()).toContain("Terms of Service");
  });
});
