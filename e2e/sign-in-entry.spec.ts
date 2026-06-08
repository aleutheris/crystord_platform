// BI-260001: sign-in entry on the public landing page
import { test, expect } from "@playwright/test";

test.describe("Sign-in entry (BI-260001)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sign-in form is visible on the landing page", async ({ page }) => {
    const signinPanel = page.locator(".action-signin");
    await expect(signinPanel).toBeVisible();
    await expect(signinPanel.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("email input is present in the sign-in form", async ({ page }) => {
    await expect(page.locator(".action-signin").getByLabel(/email/i)).toBeVisible();
  });

  test("password input is present in the sign-in form", async ({ page }) => {
    await expect(page.locator(".action-signin").getByLabel(/password/i)).toBeVisible();
  });

  test("submit button is present in the sign-in form", async ({ page }) => {
    await expect(page.locator(".action-signin").getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("nav sign-in link is labelled correctly", async ({ page }) => {
    const link = page.locator("header nav[aria-label='Main']").getByRole("link", { name: "Sign in to Crystord App" });
    await expect(link).toBeVisible();
  });

  test("final CTA sign-in link is labelled correctly", async ({ page }) => {
    const link = page.locator(".cta-section").getByRole("link", { name: "Sign in to Crystord App" });
    await expect(link).toBeVisible();
  });
});
