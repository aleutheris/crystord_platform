// BI-260011: sign-in and sign-up connected to the GraphQL backend
import { test, expect } from "@playwright/test";
import { graphqlEndpoint, appOrigin } from "./active-config";

test.describe("Sign-in entry (BI-260001 / BI-260011)", () => {
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
    await expect(page.locator(".action-signin").getByRole("button", { name: "Sign In", exact: true })).toBeVisible();
  });

  test("nav sign-in link is labelled correctly", async ({ page }) => {
    const link = page.locator("header nav[aria-label='Main']").getByRole("link", { name: "Sign In" });
    await expect(link).toBeVisible();
  });
});

test.describe("Sign-in form submission (BI-260011)", () => {
  test("form data-graphql-url attribute points to the GraphQL endpoint", async ({ page }) => {
    await page.goto("/");
    const graphqlUrl = await page.locator("form.sign-in-form").getAttribute("data-graphql-url");
    expect(graphqlUrl).toBeTruthy();
    expect(graphqlUrl).toBe(graphqlEndpoint);
  });

  test("successful sign-in redirects to the app domain with a token", async ({ page }) => {
    await page.goto("/");

    const graphqlUrl = await page.locator("form.sign-in-form").getAttribute("data-graphql-url");
    expect(graphqlUrl).toBeTruthy();

    // The post-auth redirect targets the app origin, which is decoupled from the
    // GraphQL host (see active-config.ts). Mock both independently.
    // Wildcard registered first — specific GraphQL route registered second so it wins (Playwright LIFO)
    await page.route(`${appOrigin}/**`, async (route) => {
      await route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>app</body></html>" });
    });

    await page.route(graphqlUrl!, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { signin: "test-jwt-token" } }),
      });
    });

    await page.locator("form.sign-in-form").getByLabel(/email/i).fill("user@example.com");
    await page.locator("form.sign-in-form").getByLabel(/password/i).fill("secret");
    await page.locator("form.sign-in-form").getByRole("button", { name: "Sign In", exact: true }).click();

    await page.waitForURL((url) => url.href.startsWith(appOrigin));
    expect(page.url()).toMatch(new RegExp(`^${appOrigin}`));
    expect(page.url()).toContain("token=");
  });

  test("failed sign-in shows inline error and does not reload the page", async ({ page }) => {
    await page.goto("/");

    const graphqlUrl = await page.locator("form.sign-in-form").getAttribute("data-graphql-url");
    await page.route(graphqlUrl!, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ errors: [{ message: "Invalid credentials" }] }),
      });
    });

    await page.locator("form.sign-in-form").getByLabel(/email/i).fill("user@example.com");
    await page.locator("form.sign-in-form").getByLabel(/password/i).fill("wrong");
    await page.locator("form.sign-in-form").getByRole("button", { name: "Sign In", exact: true }).click();

    const errorEl = page.locator("form.sign-in-form .sign-in-error");
    await expect(errorEl).toBeVisible();
    await expect(errorEl).toContainText("Invalid credentials");

    // Form and submit button must remain on the page (no full reload)
    await expect(page.locator("form.sign-in-form")).toBeVisible();
    await expect(page.locator("form.sign-in-form").getByRole("button", { name: "Sign In", exact: true })).toBeEnabled();
  });

  test("network error shows generic inline error and re-enables the submit button", async ({ page }) => {
    await page.goto("/");

    const graphqlUrl = await page.locator("form.sign-in-form").getAttribute("data-graphql-url");
    await page.route(graphqlUrl!, async (route) => {
      await route.abort("failed");
    });

    await page.locator("form.sign-in-form").getByLabel(/email/i).fill("user@example.com");
    await page.locator("form.sign-in-form").getByLabel(/password/i).fill("secret");
    await page.locator("form.sign-in-form").getByRole("button", { name: "Sign In", exact: true }).click();

    const errorEl = page.locator("form.sign-in-form .sign-in-error");
    await expect(errorEl).toBeVisible();
    await expect(errorEl).toContainText(/unable to reach/i);
    await expect(page.locator("form.sign-in-form").getByRole("button", { name: "Sign In", exact: true })).toBeEnabled();
  });
});

test.describe("Sign-up form — two-step verify-first (BI-260011 / BI-260065)", () => {
  test("sign-up tab is reachable and starts on the email step", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /sign up/i }).click();
    await expect(page.locator(".tab-panel#tab-signup")).toBeVisible();
    // Step 1 asks only for an email; the button reads "Send code" until a code is requested.
    await expect(page.locator(".signup-form").getByRole("button", { name: "Send code", exact: true })).toBeVisible();
    await expect(page.locator(".signup-form").getByLabel(/^email/i)).toBeVisible();
    // The verification step must stay collapsed until a code is requested (regression: the `hidden`
    // attribute was being overridden by an author display rule, showing all fields on load).
    await expect(page.locator(".signup-form").getByLabel(/verification code/i)).toBeHidden();
    await expect(page.locator(".signup-form").getByLabel(/^password$/i)).toBeHidden();
    await expect(page.locator(".signup-form").getByLabel(/^username$/i)).toBeHidden();
  });

  test("requesting a code reveals the verification step", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /sign up/i }).click();

    const graphqlUrl = await page.locator("form.signup-form").getAttribute("data-graphql-url");
    await page.route(graphqlUrl!, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { beginSignup: true } }),
      });
    });

    await page.locator(".signup-form").getByLabel(/^email/i).fill("user@example.com");
    await page.locator(".signup-form").getByRole("button", { name: "Send code", exact: true }).click();

    await expect(page.locator(".signup-form").getByLabel(/verification code/i)).toBeVisible();
    await expect(page.locator(".signup-form").getByLabel(/^username$/i)).toBeVisible();
    await expect(page.locator(".signup-form").getByRole("button", { name: "Create account", exact: true })).toBeVisible();
  });

  test("password mismatch shows inline error without submitting", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /sign up/i }).click();

    const graphqlUrl = await page.locator("form.signup-form").getAttribute("data-graphql-url");
    await page.route(graphqlUrl!, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { beginSignup: true } }),
      });
    });

    await page.locator(".signup-form").getByLabel(/^email/i).fill("user@example.com");
    await page.locator(".signup-form").getByRole("button", { name: "Send code", exact: true }).click();

    await page.locator(".signup-form").getByLabel(/verification code/i).fill("123456");
    await page.locator(".signup-form").getByLabel(/^password$/i).fill("a-strong-password");
    await page.locator(".signup-form").getByLabel(/confirm/i).fill("different");
    await page.locator(".signup-form").getByLabel(/^username$/i).fill("johndoe");
    await page.locator(".signup-form").getByRole("button", { name: "Create account", exact: true }).click();

    const errorEl = page.locator(".signup-form .signup-error");
    await expect(errorEl).toBeVisible();
    await expect(errorEl).toContainText(/passwords do not match/i);
  });

  test("successful two-step sign-up redirects to the app domain with a token", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /sign up/i }).click();

    const graphqlUrl = await page.locator("form.signup-form").getAttribute("data-graphql-url");
    expect(graphqlUrl).toBeTruthy();

    // The post-auth redirect targets the app origin, which is decoupled from the
    // GraphQL host (see active-config.ts). Mock both independently.
    // Wildcard registered first — specific GraphQL route registered second so it wins (Playwright LIFO)
    await page.route(`${appOrigin}/**`, async (route) => {
      await route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>app</body></html>" });
    });

    // One endpoint serves both mutations — branch on the request body.
    await page.route(graphqlUrl!, async (route) => {
      const body = route.request().postData() || "";
      const data = body.includes("beginSignup")
        ? { beginSignup: true }
        : { completeSignup: "test-jwt-token" };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data }),
      });
    });

    await page.locator(".signup-form").getByLabel(/^email/i).fill("new@example.com");
    await page.locator(".signup-form").getByRole("button", { name: "Send code", exact: true }).click();

    await page.locator(".signup-form").getByLabel(/verification code/i).fill("123456");
    await page.locator(".signup-form").getByLabel(/^password$/i).fill("a-strong-password");
    await page.locator(".signup-form").getByLabel(/confirm/i).fill("a-strong-password");
    await page.locator(".signup-form").getByLabel(/^username$/i).fill("johndoe");
    await page.locator(".signup-form").getByRole("button", { name: "Create account", exact: true }).click();

    await page.waitForURL((url) => url.href.startsWith(appOrigin));
    expect(page.url()).toContain("token=");
  });
});

test.describe("/sign-up standalone page (BI-260011)", () => {
  test("sign-up page is accessible at /sign-up", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: /create your crystord account/i })).toBeVisible();
    await expect(page.locator(".signup-form")).toBeVisible();
  });
});
