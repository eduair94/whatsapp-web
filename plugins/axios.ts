import axios from "axios";

export default defineNuxtPlugin((nuxtApp) => {
  let api = axios.create({
    headers: {
      common: {},
    },
  });

  // Add request interceptor to handle service worker bypass for API routes
  api.interceptors.request.use(
    (config) => {
      // Add service worker bypass headers for API requests
      if (config.url && config.url.includes('/api/')) {
        config.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        config.headers.set('Pragma', 'no-cache');
        config.headers.set('SW-Bypass', 'true');
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle service worker issues
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // If we get a service worker related error or unexpected HTML response
      if (error.response && error.response.headers['content-type']?.includes('text/html') && error.config.url?.includes('/api/')) {
        console.warn('Received HTML response for API request, possible service worker interference');
        
        // Retry the request with additional bypass headers
        const retryConfig = { ...error.config };
        retryConfig.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        retryConfig.headers.set('Pragma', 'no-cache');
        retryConfig.headers.set('SW-Bypass', 'true');
        retryConfig.headers.set('X-Bypass-Cache', 'true');
        
        return api.request(retryConfig);
      }
      
      return Promise.reject(error);
    }
  );

  return {
    provide: {
      api: api,
    },
  };
});