export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.siteUrl || "https://whatsapp.checkleaked.cc";

  const robotsTxt = `User-agent: *
Allow: /
Allow: /en/
Allow: /es/
Allow: /pt/
Allow: /ru/

# Encourage indexing of important pages
Allow: /api-status
Allow: /pricing
Allow: /verification

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Disallow sensitive areas
Disallow: /api/
Disallow: /_nuxt/
Disallow: /.nuxt/
Disallow: /server/

# SEO optimization
Crawl-delay: 1

# Specific instructions for search engines
User-agent: Googlebot
Crawl-delay: 0.5

User-agent: Bingbot
Crawl-delay: 1`;

  setHeader(event, "content-type", "text/plain");
  return robotsTxt;
});
