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

test.describe("Sign-in form submission (BI-260001)", () => {
  test("form data-auth-url attribute is configured from the app sign-in URL", async ({ page }) => {
    await page.goto("/");
    const authUrl = await page.locator("form.sign-in-form").getAttribute("data-auth-url");
    expect(authUrl).toBeTruthy();
    expect(authUrl).toContain("crystord.com");
  });

  test("successful sign-in redirects to the app domain", async ({ page }) => {
    await page.goto("/");

    const authUrl = await page.locator("form.sign-in-form").getAttribute("data-auth-url");
    expect(authUrl).toBeTruthy();

    // Intercept the auth API call and return success
    await page.route(authUrl!, async (route) => {
      await route.fulfill({ status: 200 });
    });

    // Intercept navigation to the app origin so the test does not actually leave the test runner
    const appOrigin = new URL(authUrl!).origin;
    await page.route(`${appOrigin}/**`, async (route) => {
      await route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>app</body></html>" });
    });

    await page.locator("form.sign-in-form").getByLabel(/email/i).fill("user@example.com");
    await page.locator("form.sign-in-form").getByLabel(/password/i).fill("secret");
    await page.locator("form.sign-in-form").getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL(`${appOrigin}/**`);
    expect(page.url()).toMatch(new RegExp(`^${appOrigin}`));
  });

  test("failed sign-in shows inline error and does not reload the page", async ({ page }) => {
    await page.goto("/");

    const authUrl = await page.locator("form.sign-in-form").getAttribute("data-auth-url");
    await page.route(authUrl!, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid credentials" }),
      });
    });

    await page.locator("form.sign-in-form").getByLabel(/email/i).fill("user@example.com");
    await page.locator("form.sign-in-form").getByLabel(/password/i).fill("wrong");
    await page.locator("form.sign-in-form").getByRole("button", { name: /sign in/i }).click();

    const errorEl = page.locator("form.sign-in-form .sign-in-error");
    await expect(errorEl).toBeVisible();
    await expect(errorEl).toContainText("Invalid credentials");

    // Form and submit button must remain on the page (no full reload)
    await expect(page.locator("form.sign-in-form")).toBeVisible();
    await expect(page.locator("form.sign-in-form").getByRole("button", { name: /sign in/i })).toBeEnabled();
  });

  test("network error shows generic inline error and re-enables the submit button", async ({ page }) => {
    await page.goto("/");

    const authUrl = await page.locator("form.sign-in-form").getAttribute("data-auth-url");
    await page.route(authUrl!, async (route) => {
      await route.abort("failed");
    });

    await page.locator("form.sign-in-form").getByLabel(/email/i).fill("user@example.com");
    await page.locator("form.sign-in-form").getByLabel(/password/i).fill("secret");
    await page.locator("form.sign-in-form").getByRole("button", { name: /sign in/i }).click();

    const errorEl = page.locator("form.sign-in-form .sign-in-error");
    await expect(errorEl).toBeVisible();
    await expect(errorEl).toContainText(/unable to reach/i);
    await expect(page.locator("form.sign-in-form").getByRole("button", { name: /sign in/i })).toBeEnabled();
  });
});
