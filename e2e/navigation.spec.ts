// BI-260003: landing-page section model and navigation structure
import { test, expect } from "@playwright/test";

test.describe("Main navigation (BI-260003)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("site name links to home page", async ({ page }) => {
    const siteName = page.locator("header .site-name");
    await expect(siteName).toBeVisible();
    await expect(siteName).toHaveAttribute("href", "/");
  });

  test("nav contains Home link", async ({ page }) => {
    const nav = page.locator("header nav[aria-label='Main']");
    await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();
  });

  test("nav contains Google Add-on link", async ({ page }) => {
    const nav = page.locator("header nav[aria-label='Main']");
    await expect(nav.getByRole("link", { name: "Google Add-on" })).toBeVisible();
  });

  test("nav contains Contact link", async ({ page }) => {
    const nav = page.locator("header nav[aria-label='Main']");
    await expect(nav.getByRole("link", { name: "Contact" })).toBeVisible();
  });

  test("nav contains Sign in to Crystord App button", async ({ page }) => {
    const nav = page.locator("header nav[aria-label='Main']");
    await expect(nav.getByRole("link", { name: "Sign in to Crystord App" })).toBeVisible();
  });

  test("sign-in link routes to app domain", async ({ page }) => {
    const nav = page.locator("header nav[aria-label='Main']");
    const signIn = nav.getByRole("link", { name: "Sign in to Crystord App" });
    const href = await signIn.getAttribute("href");
    expect(href).toContain("crystord.com");
  });
});

test.describe("Footer navigation (BI-260003)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("footer contains Google Add-on link", async ({ page }) => {
    await expect(page.locator("footer").getByRole("link", { name: "Google Add-on" })).toBeVisible();
  });

  test("footer contains Support link", async ({ page }) => {
    await expect(page.locator("footer").getByRole("link", { name: "Support" })).toBeVisible();
  });

  test("footer contains Privacy link", async ({ page }) => {
    await expect(page.locator("footer").getByRole("link", { name: "Privacy" })).toBeVisible();
  });

  test("footer contains Terms link", async ({ page }) => {
    await expect(page.locator("footer").getByRole("link", { name: "Terms" })).toBeVisible();
  });

  test("footer contains Contact link", async ({ page }) => {
    await expect(page.locator("footer").getByRole("link", { name: "Contact" })).toBeVisible();
  });

  test("footer contains YouTube link opening in new tab", async ({ page }) => {
    const yt = page.locator("footer").getByRole("link", { name: "YouTube" });
    await expect(yt).toBeVisible();
    await expect(yt).toHaveAttribute("target", "_blank");
    await expect(yt).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("footer shows copyright notice", async ({ page }) => {
    await expect(page.locator(".footer-copy")).toContainText("Crystord");
  });
});

test.describe("Landing page section order (BI-260003)", () => {
  test("hero section is rendered first", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hero h1")).toBeVisible();
  });

  test("primary actions panel is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".actions-grid")).toBeVisible();
  });

  test("product overview section is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".overview")).toBeVisible();
  });

  test("trust strip with legal and support links is present", async ({ page }) => {
    await page.goto("/");
    const strip = page.locator("nav[aria-label='Legal and support']");
    await expect(strip).toBeVisible();
    await expect(strip.getByRole("link", { name: "Privacy" })).toBeVisible();
    await expect(strip.getByRole("link", { name: "Terms" })).toBeVisible();
    await expect(strip.getByRole("link", { name: "Support" })).toBeVisible();
  });

  test("final CTA section is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".cta-section")).toBeVisible();
    await expect(
      page.locator(".cta-section").getByRole("link", { name: "Sign in to Crystord App" })
    ).toBeVisible();
  });
});

test.describe("Route navigation (BI-260003)", () => {
  test("Google Add-on nav link navigates to /google-addon", async ({ page }) => {
    await page.goto("/");
    await page.locator("header nav[aria-label='Main']").getByRole("link", { name: "Google Add-on" }).click();
    await expect(page).toHaveURL(/\/google-addon/);
  });

  test("Contact nav link navigates to /contact", async ({ page }) => {
    await page.goto("/");
    await page.locator("header nav[aria-label='Main']").getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact/);
  });

  test("Privacy footer link navigates to /privacy", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/\/privacy/);
  });

  test("Terms footer link navigates to /terms", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "Terms" }).click();
    await expect(page).toHaveURL(/\/terms/);
  });

  test("Support footer link navigates to /google-addon/support", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "Support" }).click();
    await expect(page).toHaveURL(/\/google-addon\/support/);
  });
});
