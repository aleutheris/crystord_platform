import { defineConfig } from "astro/config";

const basePath = process.env.GITHUB_PAGES_BASE || "/";

export default defineConfig({
  output: "static",
  base: basePath,
  devToolbar: { enabled: false },
  // Compatibility routes for high-value legacy archive URLs (ADR-260004)
  redirects: {
    "/landing": "/",
    "/gaddon": "/google-addon",
    "/gaddon/privacy": "/privacy",
    "/gaddon/terms": "/terms",
    "/gaddon/support": "/google-addon/support",
  },
});
