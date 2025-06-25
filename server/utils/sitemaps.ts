import { locales } from "./locales";
let sitemaps: any = {};
const totalPages = 5;
for (let localeObj of locales) {
  const code = localeObj.code;
  // Create a separate sitemap for each page/chunk of this language
  for (let i = 0; i < totalPages; i++) {
    const sitemapKey = `${code}-${i}`;
    sitemaps[sitemapKey] = {
      sources: [`/api/__sitemap__/urls?lang=${code}&page=${i}`],
      defaults: { changefreq: "daily", priority: 0.8 },
    };
  }
}

export { sitemaps };
