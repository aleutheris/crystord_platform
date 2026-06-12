import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://crystord.com",
  output: "static",
  devToolbar: { enabled: false },
  // The repo lives on a FUSE (fuseblk/NTFS) mount where native fs.watch leaks
  // file descriptors and crashes the dev server with EMFILE. Use polling instead.
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 300,
        ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**"],
      },
    },
  },
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
