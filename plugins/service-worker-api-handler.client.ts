export default defineNuxtPlugin(() => {
  // Only run on client side
  if (import.meta.client && "serviceWorker" in navigator) {
    // Handle service worker registration and API request handling
    navigator.serviceWorker.ready.then((registration) => {
      // Listen for service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "API_REQUEST_FAILED") {
          console.warn("API request failed in service worker:", event.data.url);
          // Force reload the page to bypass service worker for this request
          if (event.data.url.includes("/api/phone/")) {
            // Don't reload automatically, let the application handle the error
            console.warn("Phone API request failed, bypassing service worker");
          }
        }
      });
    });

    // Override fetch for API requests to bypass service worker when needed
    const originalFetch = window.fetch;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      // Convert input to URL if it's a string
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

      // Check if this is an API request
      if (url.includes("/api/phone/")) {
        try {
          // First try with service worker
          const response = await originalFetch(input, init);

          // If we get a 403 or other error, try bypassing service worker
          if (response.status === 403 || response.status >= 500) {
            console.warn("API request failed with status:", response.status, "Retrying without service worker");

            // Add cache-busting headers to bypass service worker
            const modifiedInit = {
              ...init,
              headers: {
                ...init?.headers,
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                "SW-Bypass": "true",
              },
            };

            // Retry with modified headers
            return await originalFetch(input, modifiedInit);
          }

          return response;
        } catch (error) {
          console.error("API request failed:", error);

          // Try one more time with service worker bypass
          const modifiedInit = {
            ...init,
            headers: {
              ...init?.headers,
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              "SW-Bypass": "true",
            },
          };

          return await originalFetch(input, modifiedInit);
        }
      }

      // For non-API requests, use original fetch
      return originalFetch(input, init);
    };
  }
});
