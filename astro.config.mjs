import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://crystord.com",
  output: "static",
  devToolbar: { enabled: false },
  // Compatibility routes for high-value legacy archive URLs (ADR-260004)
  redirects: {
    "/landing": "/",
    "/gaddon": "/google-addon",
    "/gaddon/privacy": "/privacy",
    "/gaddon/terms": "/terms",
    "/gaddon/support": "/support",
    "/google-addon/support": "/support",
  },
});
