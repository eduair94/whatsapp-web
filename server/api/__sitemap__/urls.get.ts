import { promises as fs } from "fs";
import { join } from "path";

// Function to dynamically scan pages directory
async function getStaticPages(): Promise<Array<{ path: string; priority: number }>> {
  try {
    const pagesDir = join(process.cwd(), "pages");
    const files = await fs.readdir(pagesDir, { recursive: true });

    const staticPages: Array<{ path: string; priority: number }> = [];

    for (const file of files) {
      if (typeof file === "string" && (file.endsWith(".vue") || file.endsWith(".ts") || file.endsWith(".js"))) {
        // Skip dynamic routes (those with brackets)
        if (file.includes("[") || file.includes("]")) {
          continue;
        }

        // Convert file path to route
        let route = file
          .replace(/\.(vue|ts|js)$/, "") // Remove extension
          .replace(/index$/, "") // Remove index
          .replace(/\\/g, "/"); // Normalize slashes

        // Add leading slash if not empty
        if (route && !route.startsWith("/")) {
          route = "/" + route;
        }

        // Determine priority based on route
        let priority = 0.5;
        if (route === "" || route === "/") priority = 1.0;
        else if (route === "/pricing") priority = 0.9;
        else if (route === "/api-status") priority = 0.8;
        else if (route === "/faqs" || route === "/database") priority = 0.7;
        else if (route === "/stats" || route === "/history") priority = 0.6;
        else if (route === "/terms" || route === "/privacy") priority = 0.5;
        else if (route === "/auth") priority = 0.4;

        staticPages.push({ path: route, priority });
      }
    }

    console.log(
      `Found ${staticPages.length} static pages:`,
      staticPages.map((p) => p.path)
    );
    return staticPages;
  } catch (error) {
    console.warn("Could not scan pages directory, falling back to hardcoded pages:", error);
    // Fallback to hardcoded pages
    return [
      { path: "", priority: 1.0 },
      { path: "/api-status", priority: 0.8 },
      { path: "/pricing", priority: 0.9 },
      { path: "/faqs", priority: 0.7 },
      { path: "/terms", priority: 0.5 },
      { path: "/privacy", priority: 0.5 },
      { path: "/stats", priority: 0.6 },
      { path: "/database", priority: 0.7 },
      { path: "/history", priority: 0.6 },
      { path: "/auth", priority: 0.4 },
    ];
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const requestedLang = query.lang as string;
  const page = query.page ? parseInt(query.page as string, 10) : 0;

  // Initialize fresh URLs array for each request (ensure complete isolation)
  let allUrls: any[] = [];

  // Log the request parameters for debugging
  console.log(`[SITEMAP] Starting request: lang=${requestedLang}, page=${page}`);
  try {
    // Calculate the actual page number for the API call (1-based)
    const apiPage = page + 1;
    const limit = 2000; // 1000 URLs per sitemap chunk

    const sampleRequests = [{ limit, page: apiPage }];

    for (const params of sampleRequests) {
      let timeoutId: NodeJS.Timeout | undefined;
      try {
        // Make internal request to the search endpoint
        const searchParams = new URLSearchParams({
          limit: params.limit.toString(),
          page: params.page.toString(),
          bypassPagination: "true",
          includeCount: "false",
        });

        // Since we're making an internal request, we need to simulate the search API call
        // but without authentication requirements for sitemap generation
        const endpoint = `http://104.234.204.107:3728/phone-numbers/search?${searchParams.toString()}`;

        // Note: This is a direct call to the external API for sitemap generation
        // In production, you might want to cache this or use a different approach
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && Array.isArray(data.data.docs)) {
            console.log(`Fetched ${data.data.docs.length} phone numbers from page ${params.page} for language ${requestedLang}`);
            data.data.docs.forEach((item: any) => {
              let number = item.number;
              if (number) {
                if (number.includes("@")) {
                  number = number.split("@")[0]; // Remove any domain part if present
                }
                const path = requestedLang === "en" ? `/${number}` : `/${requestedLang}/${number}`;
                allUrls.push({
                  loc: path,
                  lastmod: new Date().toISOString(),
                  changefreq: "monthly",
                  priority: 0.6,
                });
              }
            });
            console.log(`Added ${allUrls.length} URLs for ${requestedLang} page ${page}`);
          }
        }
      } catch (apiError) {
        console.warn(`Failed to fetch phone numbers for page ${params.page}:`, apiError);
        // Continue with other requests even if one fails
      } finally {
        // Ensure cleanup happens even if request fails
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    }

    // Add static pages only for the first page (page 0) to avoid duplication
    if (page === 0) {
      const staticPages = await getStaticPages();

      staticPages.forEach((staticPage) => {
        const path = requestedLang === "en" ? staticPage.path : `/${requestedLang}${staticPage.path}`;
        allUrls.unshift({
          loc: path || "/",
          lastmod: new Date().toISOString(),
          changefreq: "weekly",
          priority: staticPage.priority,
        });
      });
      console.log(`Added ${staticPages.length} static pages for ${requestedLang} page ${page}`);
    }
  } catch (error) {
    console.error("Error fetching phone numbers for sitemap:", error);
    // Continue without phone numbers if API is unavailable
  }

  const langInfo = requestedLang ? ` for language '${requestedLang}'` : " for all languages";
  const pageInfo = page !== undefined ? ` page ${page}` : "";
  console.log(`Generated ${allUrls.length} URLs for sitemap${langInfo}${pageInfo}`);

  // Return a fresh array to ensure no cross-contamination
  return [...allUrls];
});
