import { defineConfig } from "astro/config";

const basePath = process.env.GITHUB_PAGES_BASE || "/";

export default defineConfig({
  output: "static",
  base: basePath
});
