// https://nuxt.com/docs/api/configuration/nuxt-config
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
      chunkSizeWarningLimit: 1000,
      // Remove manual chunking that's causing issues
      rollupOptions: {
        external: (id) => {
          // Don't externalize these in the browser build
          if (id.includes("node:") && typeof window !== "undefined") {
            return false;
          }
          return false;
        },
      },
    },
  },

  // Optimize runtime performance
  experimental: {
    // Disable features that might cause initialization issues
    treeshakeClientOnly: false,
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
      routes: ["/sitemap.xml", "/robots.txt", "/"],
      ignore: ["/manifest.json"],
      crawlLinks: true,
    },
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
    minify: true,
    storage: {
      redis: {
        driver: "memory", // Use memory storage for development
      },
    },
    experimental: {
      wasm: true,
    },
  },

  // Route rules for optimal caching and security
  routeRules: {
    "/": {
      ssr: true,
      prerender: false,
      headers: {
        "cache-control": "no-cache",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
    "/verification/**": {
      ssr: true, // Disable SSR for verification pages that use client-side only features
      headers: { "cache-control": "no-cache" },
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
    "/api/phone/limits": {
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
      headers: { "cache-control": "max-age=31536000, immutable" },
    },
    "/favicon.*": {
      headers: { "cache-control": "max-age=31536000, immutable" },
    },
    "/**/*.{png,jpg,jpeg,gif,webp,svg,ico}": {
      headers: { "cache-control": "max-age=31536000, immutable" },
    },
    "/**/*.{js,css,woff,woff2,ttf,eot}": {
      headers: { "cache-control": "max-age=31536000, immutable" },
    },
    "/.well-known/**": {
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
      "@nuxtjs/i18n",
      {
        locales: [
          { code: "en", iso: "en-US", name: "English", file: "en.ts" },
          { code: "es", iso: "es-ES", name: "Español", file: "es.ts" },
          { code: "pt", iso: "pt-PT", name: "Português", file: "pt.ts" },
          { code: "ru", iso: "ru-RU", name: "Русский", file: "ru.ts" },
          { code: "hi", iso: "hi-IN", name: "हिन्दी", file: "hi.ts" },
          { code: "my", iso: "my-MM", name: "မြန်မာစာ", file: "my.ts" },
          { code: "de", iso: "de-DE", name: "Deutsch", file: "de.ts" },
          { code: "ur", iso: "ur-PK", name: "اردو", file: "ur.ts" },
          { code: "th", iso: "th-TH", name: "ไทย", file: "th.ts" },
          { code: "fa", iso: "fa-IR", name: "فارسی", file: "fa.ts" },
          { code: "it", iso: "it-IT", name: "Italiano", file: "it.ts" },
          { code: "fr", iso: "fr-FR", name: "Français", file: "fr.ts" },
          { code: "zh", iso: "zh-CN", name: "中文", file: "zh.ts" },
          { code: "ja", iso: "ja-JP", name: "日本語", file: "ja.ts" },
          { code: "ko", iso: "ko-KR", name: "한국어", file: "ko.ts" },
          { code: "ar", iso: "ar-SA", name: "العربية", file: "ar.ts" },
          { code: "id", iso: "id-ID", name: "Bahasa Indonesia", file: "id.ts" },
          { code: "vi", iso: "vi-VN", name: "Tiếng Việt", file: "vi.ts" },
          { code: "tr", iso: "tr-TR", name: "Türkçe", file: "tr.ts" },
          { code: "nl", iso: "nl-NL", name: "Nederlands", file: "nl.ts" },
        ],
        //lazy: true,
        defaultLocale: "en",
        strategy: "prefix_except_default",
        detectBrowserLanguage: {
          useCookie: true,
          cookieKey: "lang",
          alwaysRedirect: true,
          fallbackLocale: "en",
        },
        // imports: false, // Disable vue-i18n composable auto-imports (removed, not supported)
      },
    ],
    "@nuxtjs/sitemap",
    "@nuxtjs/seo",
    [
      "@nuxtjs/robots",
      {
        disallow: ["/admin/", "/_nuxt/", "/.nuxt/", "/server/"],
        sitemap: baseUrl + "/sitemap.xml",
        credits: false,
      },
    ],
    [
      "@vite-pwa/nuxt",
      {
        registerType: "autoUpdate",
        workbox: {
          navigateFallback: "/",
          globPatterns: ["**/*.{js,css,html,png,svg,ico,json,woff2,woff}"],
          globIgnores: [
            "**/node_modules/**/*",
            "sw.js",
            "workbox-*.js",
            "**/_payload.json", // Explicitly ignore payload files to avoid warnings
          ],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
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
            {
              urlPattern: /\/api\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 16,
                  maxAgeSeconds: 300, // 5 minutes
                },
              },
            },
          ],
        },
        client: {
          installPrompt: true,
          periodicSyncForUpdates: 20,
        },
        devOptions: {
          enabled: true,
          suppressWarnings: true,
          navigateFallbackAllowlist: [/^\/$/],
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
  ],

  // Sitemap Configuration
  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },

  // Performance and PWA optimizations
  ssr: true, // Ensure SSR is enabled for better SEO

  // Optimize module loading
  modulesDir: ["node_modules"],
});
