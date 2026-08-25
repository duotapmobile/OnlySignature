import { defineConfig } from "astro/config";

const site = process.env.PUBLIC_SITE_URL || "https://onlysignature.invalid";

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
