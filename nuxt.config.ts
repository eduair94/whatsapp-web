// https://nuxt.com/docs/api/configuration/nuxt-config
import { locales } from "./server/utils/locales";
import { sitemaps } from "./server/utils/sitemaps";
import { baseUrl } from "./utils/pageUrl";
console.log("base url", baseUrl);
export default defineNuxtConfig({
  devtools: { enabled: false }, // Disable in production
  site: {
    url: baseUrl,
  },
  css: ["vuetify/lib/styles/main.sass", "@mdi/font/css/materialdesignicons.min.css"],
  build: {
    transpile: ["vuetify", "firebase", "tslib"],
  },
  vite: {
    define: {
      "process.env.DEBUG": false,
    },
    css: {
      devSourcemap: false, // Disable CSS sourcemaps in production
    },
    optimizeDeps: {
      exclude: ["@nuxtjs/i18n"],
    },
    ssr: {
      noExternal: ["@nuxtjs/i18n", "vue-i18n"],
    },
    build: {
      cssCodeSplit: false, // Disable CSS code splitting to avoid dependency issues
      minify: "esbuild", // Switch to esbuild for more reliable minification
      chunkSizeWarningLimit: 3000, // Increase from 2000 to 3000 to match our new cache limit
      // Optimize chunk splitting to reduce memory usage
      rollupOptions: {
        external: (id) => {
          // Don't externalize these in the browser build
          if (id.includes("node:") && typeof window !== "undefined") {
            return false;
          }
          return false;
        },
        output: {
          // Optimize chunk splitting to reduce memory pressure
          manualChunks: (id) => {
            // Split large node_modules into separate chunks
            if (id.includes("node_modules")) {
              if (id.includes("vue") || id.includes("nuxt")) {
                return "vendor-vue";
              }
              if (id.includes("firebase")) {
                return "vendor-firebase";
              }
              if (id.includes("vuetify")) {
                return "vendor-vuetify";
              }
              return "vendor-other";
            }
          },
        },
      },
    },
  },
  // Optimize runtime performance
  experimental: {
    // Disable features that might cause initialization issues
    treeshakeClientOnly: false,
    // Reduce memory usage during build
    payloadExtraction: false,
    // Disable other experimental features to reduce memory usage
    watcher: "chokidar",
  },

  // SEO and Performance optimizations
  app: {
    head: {
      titleTemplate: "%s - Whatsapp Checkleaked",
      htmlAttrs: {
        lang: "en",
      },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "WhatsApp Profile API - Get User Info & Profile Pictures | Only $99/month",
      meta: [
        // Primary SEO tags
        {
          name: "description",
          content: "Professional WhatsApp Profile API service. Get user profile information, pictures, and business status for only $99/month with 500,000 requests included. Fast, reliable, and easy to integrate.",
        },
        {
          name: "keywords",
          content: "whatsapp api, whatsapp profile api, user profile lookup, whatsapp business api, profile picture api, messaging api, affordable api, $99 api, phone verification",
        },
        { name: "author", content: "Eduardo Airaudo" },
        { name: "robots", content: "index, follow" },
        { name: "googlebot", content: "index, follow" },
        // Open Graph / Facebook
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "WhatsApp Profile API" },
        { property: "og:title", content: "WhatsApp Profile API - Get User Info & Profile Pictures | Only $99/month" },
        { property: "og:description", content: "Professional WhatsApp Profile API service. Get user profile information, pictures, and business status for only $99/month with 500,000 requests included." },
        { property: "og:image", content: "/web-app-manifest-512x512.png" },
        { property: "og:image:width", content: "512" },
        { property: "og:image:height", content: "512" },
        { property: "og:image:type", content: "image/png" },
        { property: "og:locale", content: "en_US" },
        { property: "og:url", content: baseUrl },

        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@checkleaked" },
        { name: "twitter:title", content: "WhatsApp Profile API - Only $99/month for 500K requests" },
        { name: "twitter:description", content: "Professional WhatsApp Profile API service. Get user profile information and pictures." },
        { name: "twitter:image", content: "/web-app-manifest-512x512.png" },

        // Technical SEO
        { name: "theme-color", content: "#25D366" }, // WhatsApp green
        { name: "msapplication-TileColor", content: "#25D366" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "format-detection", content: "telephone=no" },
        // Additional SEO
        { name: "rating", content: "general" },
        { name: "revisit-after", content: "1 days" },
        { name: "distribution", content: "global" },
        { name: "language", content: "English" },
        { name: "geo.region", content: "US" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "application-name", content: "WhatsApp Profile API" },
        { name: "msapplication-TileImage", content: "/web-app-manifest-192x192.png" },

        // Pricing related meta
        { name: "price", content: "$99 USD" },
        { name: "price:amount", content: "99" },
        { name: "price:currency", content: "USD" },
      ],
      link: [
        // Favicon and icons - comprehensive support for all formats
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon.png" },
        { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "mask-icon", href: "/favicon.svg", color: "#25D366" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        { rel: "manifest", href: "/manifest.json" },
        { rel: "manifest", href: "/manifest.webmanifest" }, //
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" },
        { rel: "dns-prefetch", href: "https://www.google.com" },
        { rel: "dns-prefetch", href: "https://www.googletagmanager.com" },
        { rel: "dns-prefetch", href: "https://www.google-analytics.com" },
        { rel: "dns-prefetch", href: "https://www.gstatic.com" },
        // Canonical URL
        { rel: "canonical", href: baseUrl },
      ],
      script: [
        // JSON-LD structured data for SEO
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "WhatsApp Profile API",
            description: "Professional WhatsApp Profile API service for developers. Get user profile information, pictures, and business status.",
            url: baseUrl,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: {
              "@type": "Offer",
              price: "99",
              priceCurrency: "USD",
              name: "Monthly API Access",
              description: "500,000 API requests per month",
              availability: "https://schema.org/InStock",
              validFrom: new Date().toISOString(),
              priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            },
            author: {
              "@type": "Person",
              name: "Eduardo Airaudo",
            },
            provider: {
              "@type": "Organization",
              name: "WhatsApp Profile API",
              url: baseUrl,
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "150",
              bestRating: "5",
              worstRating: "1",
            },
          }),
        },
        // Organization structured data
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "WhatsApp Profile API",
            url: baseUrl,
            logo: baseUrl + "/web-app-manifest-512x512.png",
            description: "Professional WhatsApp Profile API service for developers",
            founder: {
              "@type": "Person",
              name: "Eduardo Airaudo",
            },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "Customer Service",
              availableLanguage: "English",
            },
          }),
        },
        // FAQ structured data
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How much does the WhatsApp Profile API cost?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our WhatsApp Profile API costs only $99 per month and includes 500,000 API requests.",
                },
              },
              {
                "@type": "Question",
                name: "What information can I get from the API?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can get user profile pictures, public names, about sections, and business/enterprise status information.",
                },
              },
              {
                "@type": "Question",
                name: "How fast is the API response?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our API provides fast response times with reliable uptime and professional support.",
                },
              },
            ],
          }),
        },
      ],
    },
  }, // Nitro configuration for better performance
  nitro: {
    prerender: {
      routes: (() => {
        // Only prerender essential routes, not sitemaps
        const routes = ["/robots.txt", "/"];
        console.log(`Prerendering ${routes.length} routes`);
        return routes;
      })(),
      ignore: ["/manifest.json", "/sitemap.xml", "/__sitemap__/**"],
      crawlLinks: false,
      failOnError: false, // Don't fail build if some routes fail
      concurrency: 1, // Reduce concurrency to save memory
    },
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
    minify: true,
    // Optimize build performance and memory usage
    rollupConfig: {
      external: ["firebase-admin", "firebase-functions"],
      output: {
        manualChunks: undefined, // Disable manual chunks in nitro to reduce memory usage
      },
    },
    storage: {
      redis: {
        driver: "memory", // Use memory storage for development
      },
    },
    experimental: {
      wasm: false, // Disable WASM to save memory
    },
  }, // Route rules for optimal caching and security
  routeRules: {
    // Prerender all language versions of static pages
    "/**": {
      prerender: true,
      ssr: true,
      headers: { "cache-control": "max-age=300, s-maxage=300" },
    },
    "/": {
      ssr: true,
      prerender: true,
      headers: {
        "cache-control": "max-age=300, s-maxage=300",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
    // Prerender all static pages for all languages
    "/api-status": { prerender: false, ssr: true },
    "/pricing": { prerender: true, ssr: true },
    "/faqs": { prerender: true, ssr: true },
    "/terms": { prerender: true, ssr: true },
    "/privacy": { prerender: true, ssr: true },
    "/stats": { prerender: true, ssr: true },
    "/database": { prerender: false, ssr: true },
    "/history": { prerender: true, ssr: true },
    "/auth": { prerender: false, ssr: true },

    // Match routes that are likely phone numbers (start with digits)
    "/[0-9]*": {
      prerender: false,
      ssr: true,
      headers: {
        "cache-control": "no-cache, no-store, must-revalidate, max-age=0",
        pragma: "no-cache",
        expires: "0",
      },
    },

    // Match multi-language phone number routes
    "/*/[0-9]*": {
      prerender: false,
      ssr: true,
      headers: {
        "cache-control": "no-cache, no-store, must-revalidate, max-age=0",
        pragma: "no-cache",
        expires: "0",
      },
    },

    // Sitemap routes - dynamically generated with 300s cache
    "/__sitemap__/**": {
      prerender: false,
      ssr: true,
      headers: {
        "cache-control": "max-age=300, s-maxage=300", // 5 minute cache
        "Content-Type": "application/xml",
        "X-Content-Type-Options": "nosniff",
      },
    },
    "/sitemap.xml": {
      prerender: true,
      ssr: true,
      headers: {
        "cache-control": "max-age=300, s-maxage=300", // 5 minute cache
        "Content-Type": "application/xml",
      },
    },
    "/verification/**": {
      ssr: true,
      prerender: false,
      headers: { "cache-control": "max-age=300, s-maxage=300" },
    },
    "/api/search": {
      headers: {
        "cache-control": "max-age=60, s-maxage=60", // 1 minute cache
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        Vary: "Accept-Encoding, Accept-Language", // Cache varies by query parameters
      },
      cors: false,
    },
    "/api/__sitemap__/**": {
      prerender: false,
      ssr: true,
      headers: {
        "cache-control": "max-age=300, s-maxage=300", // 5 minute cache for sitemap API
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
      cors: false,
    },
    "/api/refresh": {
      prerender: false,
      ssr: false,
      headers: {
        "cache-control": "no-cache, no-store, must-revalidate, max-age=0, private",
        pragma: "no-cache",
        expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Surrogate-Control": "no-store",
        Vary: "*",
      },
      cors: false,
    },
    "/api/phone/limits": {
      prerender: false,
      ssr: false,
      headers: {
        "cache-control": "no-cache, no-store, must-revalidate, max-age=0",
        pragma: "no-cache",
        expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
      cors: false,
    },
    "/api/phone/**": {
      prerender: false,
      ssr: false, // Disable SSR for phone API to avoid conflicts
      headers: {
        "cache-control": "no-cache, no-store, must-revalidate, max-age=0",
        pragma: "no-cache",
        expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
      cors: false,
    },
    "/api/**": {
      prerender: false,
      headers: {
        "cache-control": "no-cache, no-store, must-revalidate, max-age=0",
        pragma: "no-cache",
        expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
      cors: false,
    },
    "/_nuxt/**": {
      prerender: true,
      headers: { "cache-control": "max-age=31536000, immutable" },
    },
    "/favicon.*": {
      prerender: true,
      headers: { "cache-control": "max-age=31536000, immutable" },
    },
    "/**/*.{png,jpg,jpeg,gif,webp,svg,ico}": {
      prerender: true,
      headers: { "cache-control": "max-age=31536000, immutable" },
    },
    "/**/*.{js,css,woff,woff2,ttf,eot}": {
      prerender: true,
      headers: { "cache-control": "max-age=31536000, immutable" },
    },
    "/.well-known/**": {
      prerender: true,
      headers: {
        "cache-control": "max-age=86400",
        "Content-Type": "application/json",
      },
    },
  }, // Runtime configuration
  runtimeConfig: {
    public: {
      siteUrl: baseUrl,
      firebase: {
        apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      },
    },
  },

  modules: [
    [
      "nuxt-gtag",
      {
        id: "G-J7TCBEVNWR",
      },
    ],
    [
      "@nuxtjs/i18n",
      {
        locales: locales,
        //lazy: true,
        defaultLocale: "en",
        strategy: "prefix_except_default",
        detectBrowserLanguage: {
          useCookie: true,
          cookieKey: "lang",
          alwaysRedirect: true,
          fallbackLocale: "en",
        },
        // Disable route generation features
        parsePages: false,
        pages: {},
        // imports: false, // Disable vue-i18n composable auto-imports (removed, not supported)
      },
    ],
    "@nuxtjs/sitemap",
    "@nuxtjs/seo",
    [
      "@nuxtjs/robots",
      {
        disallow: ["/admin/", "/server/"],
        sitemap: baseUrl + "/sitemap.xml",
        credits: false,
      },
    ],
    [
      "@vite-pwa/nuxt",
      {
        registerType: "autoUpdate",
        registerWebManifestInRouteRules: true,
        workbox: {
          globPatterns: ["**/*.{js,css,html,png,svg,ico,json,woff2,woff}"],
          globIgnores: [
            "**/node_modules/**/*",
            "sw.js",
            "workbox-*.js",
            "**/api/**/*", // Exclude ALL API files from caching
          ],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB limit instead of default 2 MB
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          // Force update by including a build timestamp
          additionalManifestEntries: [
            {
              url: "/sw-version.json",
              revision: new Date().getTime().toString(), // Force update with timestamp
            },
          ],
          navigateFallback: "/",
          navigateFallbackDenylist: [
            /^\/(?!$)/, // Deny fallback for all routes except the exact home page "/"
            /^\/api\/.*/, // Explicitly deny all API routes from fallback
            /^.*\/api\/refresh.*/, // Explicitly deny refresh endpoint from any fallback handling
          ],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
                },
              },
            },
            // Explicitly exclude ALL API routes from caching
            {
              urlPattern: /^.*\/api\/.*$/,
              handler: "NetworkOnly", // Never cache API routes
            },
            // Handle app routes with network-first strategy (excluding API routes)
            {
              urlPattern: /^\/(?:database|auth|api-status|pricing|faqs|terms|privacy|stats|history)(?:\/.*)?$/,
              handler: "NetworkFirst",
              options: {
                cacheName: "app-pages-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
                networkTimeoutSeconds: 3,
              },
            },
          ],
        },
        client: {
          installPrompt: false,
          periodicSyncForUpdates: 20,
        },
        // Injects a simple script to reload page when SW updates
        injectRegister: "script-defer",
        // Custom script to force reload on update and exclude API routes
        registerSW: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { 
              scope: '/',
              updateViaCache: 'none' // Always check for updates
            }).then((registration) => {
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      // New SW is available, force reload
                      if (confirm('New version available! Reload to get the latest features?')) {
                        window.location.reload();
                      }
                    }
                  });
                }
              });
            });
          }
        `,
        devOptions: {
          enabled: true,
          suppressWarnings: true,
          navigateFallback: "/",
          navigateFallbackAllowlist: [
            /^\/$/, // Only allow fallback for homepage
            /^\/[a-z]{2}\/$/, // Allow fallback for localized homepages (/es/, /fr/, etc.)
          ],
          navigateFallbackDenylist: [
            /^\/(?!$)/, // Deny fallback for all routes except the exact home page "/"
            /^\/api\/.*/, // Explicitly deny all API routes from fallback in dev mode
          ],
          type: "module",
        },
        manifest: {
          name: "WhatsApp Profile API",
          short_name: "WP API",
          description: "Professional WhatsApp Profile API service for developers",
          theme_color: "#25D366",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "/web-app-manifest-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/web-app-manifest-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/web-app-manifest-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/apple-touch-icon.png",
              sizes: "180x180",
              type: "image/png",
            },
          ],
          categories: ["developer", "utilities", "business"],
          lang: "en",
          dir: "ltr",
        },
      },
    ],
  ], // Sitemap Configuration
  sitemap: {
    sitemaps: sitemaps,
    autoLastmod: true,
    exclude: [],
    debug: true, // Enable debug mode to see chunking info
    // Disable auto-generation features
    discoverImages: false,
    discoverVideos: false,
    // Disable auto URL discovery
    sources: [],
  },

  // Performance and PWA optimizations
  ssr: true, // Ensure SSR is enabled for better SEO

  // Optimize module loading
  modulesDir: ["node_modules"],
  compatibilityDate: new Date().toISOString().split("T")[0] as any, // Set compatibility date to today
});
