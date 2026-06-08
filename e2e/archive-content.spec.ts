// BI-260002: curated archive content present in the public site
import { test, expect } from "@playwright/test";

test.describe("Google Add-on page (BI-260002)", () => {
  test("page loads and shows product heading", async ({ page }) => {
    await page.goto("/google-addon");
    await expect(page.getByRole("heading", { name: "Crystord" })).toBeVisible();
  });

  test("marketplace install link is present", async ({ page }) => {
    await page.goto("/google-addon");
    const installLink = page.getByRole("link", { name: /install/i }).first();
    await expect(installLink).toBeVisible();
    const href = await installLink.getAttribute("href");
    expect(href).toContain("workspace.google.com");
  });

  test("How It Works section is present", async ({ page }) => {
    await page.goto("/google-addon");
    await expect(page.getByRole("heading", { name: "How It Works" })).toBeVisible();
  });

  test("trademark disclaimer references Google Sheets and Slides", async ({ page }) => {
    await page.goto("/google-addon");
    await expect(page.locator(".trademark")).toContainText("Google Sheets");
    await expect(page.locator(".trademark")).toContainText("Google Slides");
  });

  test("links to support, privacy, and terms are present", async ({ page }) => {
    await page.goto("/google-addon");
    await expect(page.getByRole("link", { name: "Support" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Terms of Service" })).toBeVisible();
  });
});

test.describe("Support page (BI-260002)", () => {
  test("page loads successfully", async ({ page }) => {
    const response = await page.goto("/google-addon/support");
    expect(response?.status()).toBeLessThan(400);
  });

  test("page has a heading", async ({ page }) => {
    await page.goto("/google-addon/support");
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Legal pages (BI-260002)", () => {
  test("privacy page loads and has a heading", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("terms page loads and has a heading", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Contact path (BI-260002)", () => {
  test("contact page loads and has a heading", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Excluded archive content (BI-260002)", () => {
  test("newsletter route is not served", async ({ page }) => {
    const response = await page.goto("/newsletter");
    expect(response?.status()).toBe(404);
  });

  test("demo route is not served", async ({ page }) => {
    const response = await page.goto("/demo");
    expect(response?.status()).toBe(404);
  });
});
