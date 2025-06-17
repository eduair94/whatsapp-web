export default defineEventHandler(async (event) => {
  // Fetch popular phone numbers from the search API
  let urls: any[] = [];
  try {
    // Get a sample of phone numbers from the database
    // Using multiple pages to get a good variety of numbers
    const sampleRequests = [{ limit: 2000, page: 1 }];

    const phoneNumbers = new Set<string>();

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
        timeoutId = setTimeout(() => controller.abort(), 25000); // 5 second timeout

        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && Array.isArray(data.data.docs)) {
            console.log(`Fetched ${data.data.docs.length} phone numbers from page ${params.page}`);
            data.data.docs.forEach((item: any) => {
              if (item.number) {
                if (item.number.includes("@")) {
                  item.number = item.number.split("@")[0]; // Remove any domain part if present
                }
                // Clean and format the phone number
                phoneNumbers.add(item.number);
              }
            });
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

    // Define available locales (from nuxt.config.ts)
    const locales = [
      { code: "en", isDefault: true }, // Default locale (no prefix)
      { code: "es", isDefault: false },
      { code: "pt", isDefault: false },
      { code: "ru", isDefault: false },
      { code: "hi", isDefault: false },
      { code: "my", isDefault: false },
      { code: "de", isDefault: false },
      { code: "ur", isDefault: false },
      { code: "th", isDefault: false },
      { code: "fa", isDefault: false },
      { code: "it", isDefault: false },
    ];

    // Add phone number URLs for all locales
    Array.from(phoneNumbers).forEach((number) => {
      locales.forEach((locale) => {
        const path = locale.isDefault ? `/${number}` : `/${locale.code}/${number}`;
        urls.push({
          loc: path,
          lastmod: new Date().toISOString(),
          changefreq: "monthly",
          priority: 0.6,
        });
      });
    });
  } catch (error) {
    console.error("Error fetching phone numbers for sitemap:", error);
    // Continue without phone numbers if API is unavailable
  }

  console.log(`Generated ${urls.length} URLs for sitemap`);
  return urls;
});
