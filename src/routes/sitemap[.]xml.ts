import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/map", changefreq: "weekly", priority: "0.9" },
          { path: "/agents", changefreq: "weekly", priority: "0.9" },
          { path: "/missions", changefreq: "weekly", priority: "0.9" },
          { path: "/knowledge", changefreq: "weekly", priority: "0.8" },
          { path: "/reasoning", changefreq: "weekly", priority: "0.8" },
          { path: "/simulator", changefreq: "weekly", priority: "0.8" },
          { path: "/feed", changefreq: "daily", priority: "0.7" },
          { path: "/memory", changefreq: "weekly", priority: "0.7" },
          { path: "/governance", changefreq: "weekly", priority: "0.7" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
