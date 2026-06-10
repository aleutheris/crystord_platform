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

  test("nav contains Sign In button", async ({ page }) => {
    const nav = page.locator("header nav[aria-label='Main']");
    await expect(nav.getByRole("link", { name: "Sign In" })).toBeVisible();
  });

  test("sign-in link routes to app domain", async ({ page }) => {
    const nav = page.locator("header nav[aria-label='Main']");
    const signIn = nav.getByRole("link", { name: "Sign In" });
    const href = await signIn.getAttribute("href");
    expect(href).toContain("crystord.com");
  });
});

test.describe("Footer navigation (BI-260003)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("footer contains Privacy Policy link", async ({ page }) => {
    await expect(page.locator("footer").getByRole("link", { name: "Privacy Policy" })).toBeVisible();
  });

  test("footer contains Terms of Service link", async ({ page }) => {
    await expect(page.locator("footer").getByRole("link", { name: "Terms of Service" })).toBeVisible();
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

  test("trust strip is not present on landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav[aria-label='Legal and support']")).not.toBeVisible();
  });

  test("final CTA section is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".cta-section")).toBeVisible();
    await expect(
      page.locator(".cta-section").getByRole("link", { name: "Sign In" })
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
    await page.locator("footer").getByRole("link", { name: "Privacy Policy" }).click();
    await expect(page).toHaveURL(/\/privacy/);
  });

  test("Terms footer link navigates to /terms", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "Terms of Service" }).click();
    await expect(page).toHaveURL(/\/terms/);
  });

  test("Home nav link navigates to /", async ({ page }) => {
    await page.goto("/contact");
    await page.locator("header nav[aria-label='Main']").getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

});
