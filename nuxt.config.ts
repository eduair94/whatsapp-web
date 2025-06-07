// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false }, // Disable in production
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
        { property: "og:url", content: process.env.NODE_ENV === "production" ? "https://whatsapp.checkleaked.cc" : "http://localhost:3000" },

        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@whatsappapi" },
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
        { rel: "manifest", href: "/site.webmanifest" }, // SEO and performance - optimized loading
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" },
        { rel: "dns-prefetch", href: "https://www.google.com" },
        { rel: "dns-prefetch", href: "https://www.googletagmanager.com" },
        { rel: "dns-prefetch", href: "https://www.google-analytics.com" },
        { rel: "dns-prefetch", href: "https://www.gstatic.com" },
        // Canonical URL
        { rel: "canonical", href: process.env.NODE_ENV === "production" ? "https://whatsapp.checkleaked.cc" : "http://localhost:3000" },
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
            url: process.env.NODE_ENV === "production" ? "https://whatsapp.checkleaked.cc" : "http://localhost:3000",
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
              url: process.env.NODE_ENV === "production" ? "https://whatsapp.checkleaked.cc" : "http://localhost:3000",
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
            url: process.env.NODE_ENV === "production" ? "https://whatsapp.checkleaked.cc" : "http://localhost:3000",
            logo: process.env.NODE_ENV === "production" ? "https://whatsapp.checkleaked.cc/web-app-manifest-512x512.png" : "http://localhost:3000/web-app-manifest-512x512.png",
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
      prerender: true,
      headers: {
        "cache-control": "s-maxage=3600",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
    "/verification/**": {
      ssr: false, // Disable SSR for verification pages that use client-side only features
      headers: { "cache-control": "no-cache" },
    },
    "/api/search": {
      headers: {
        "cache-control": "max-age=60, s-maxage=60", // 1 minute cache
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        Vary: "Accept-Encoding, Accept-Language", // Cache varies by query parameters
      },
      cors: true,
    },
    "/api/phone/limits": {
      headers: {
        "cache-control": "no-cache, no-store, must-revalidate, max-age=0",
        pragma: "no-cache",
        expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
      cors: true,
    },
    "/api/**": {
      headers: {
        "cache-control": "no-cache, no-store, must-revalidate, max-age=0",
        pragma: "no-cache",
        expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
      cors: true,
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
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://whatsapp.checkleaked.cc" : "http://localhost:3000"),
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
  ],

  // Performance and PWA optimizations
  ssr: true, // Ensure SSR is enabled for better SEO

  // Optimize module loading
  modulesDir: ["node_modules"],
});
