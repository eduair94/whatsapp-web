// Google Analytics optimization - Load asynchronously to reduce blocking time
export default defineNuxtPlugin(() => {
  // Load Google Analytics in a non-blocking way
  if (import.meta.client) {
    // Use requestIdleCallback for better performance
    const loadGoogleAnalytics = () => {
      // Create script element for gtag
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-J7TCBEVNWR";
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(arguments);
      }

      // Make gtag globally available
      window.gtag = gtag;

      gtag("js", new Date());
      gtag("config", "G-J7TCBEVNWR", {
        // Performance optimizations
        send_page_view: false, // We'll send manually
        cookie_flags: "SameSite=None;Secure", // Better privacy
        anonymize_ip: true, // GDPR compliance
      });

      // Send initial page view
      gtag("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadGoogleAnalytics, { timeout: 2000 });
    } else {
      setTimeout(loadGoogleAnalytics, 100);
    }
  }
});

// TypeScript declarations
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
