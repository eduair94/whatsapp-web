export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.siteUrl;

  const languages = ["en", "es", "pt", "ru"];
  const routes = ["/", "/api-status"];

  const urls = [
    // Original non-prefixed routes
    ...routes.map((route) => ({
      loc: `${baseUrl}${route}`,
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: route === "/" ? "1.0" : "0.8",
    })),
    // Language-prefixed routes
    ...routes.flatMap((route) =>
      languages.map((lang) => ({
        loc: `${baseUrl}/${lang}${route === "/" ? "" : route}`,
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
        priority: route === "/" ? "1.0" : "0.8",
      }))
    ),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`).join("\n")}
</urlset>`;

  setHeader(event, "content-type", "application/xml");
  return sitemap;
});
