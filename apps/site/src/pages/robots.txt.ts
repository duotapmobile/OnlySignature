import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const base = site || new URL("https://onlysignature.app");
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", base)}\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
