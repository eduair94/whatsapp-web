/**
 * Utility function to bypass service worker for critical API requests
 * This ensures that requests like /api/refresh are never cached
 */
export function bypassServiceWorkerRedirect(url: string) {
  // Add cache-busting parameters to ensure fresh request
  const separator = url.includes('?') ? '&' : '?';
  const timestamp = Date.now();
  const cacheBuster = `${separator}_t=${timestamp}&_nc=${Math.random()}`;
  const finalUrl = url + cacheBuster;
  
  // Clear any cached data for this URL
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.open(cacheName).then(cache => {
          cache.delete(url);
          cache.delete(finalUrl);
        });
      });
    });
  }
  
  // Use location.replace to bypass service worker navigation handling
  window.location.replace(finalUrl);
}

/**
 * Utility to clear all API-related caches
 */
export async function clearApiCaches() {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          await Promise.all(
            requests
              .filter(request => request.url.includes('/api/'))
              .map(request => cache.delete(request))
          );
        })
      );
    } catch (error) {
      console.warn('Failed to clear API caches:', error);
    }
  }
}
