import { defineNuxtPlugin } from "#app";

interface PhoneSearchMeta {
  title: string;
  description: string;
  keywords: string;
}

interface StructuredDataItem {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface PhoneData {
  number: string;
  country: string;
  verified: boolean;
  hasWhatsApp: boolean;
}

export default defineNuxtPlugin(() => {
  // SEO utilities and optimizations for WhatsApp number search
  const seoUtils = {
    // Generate phone number search specific meta tags
    generatePhoneSearchMeta(phoneNumber?: string, country?: string): PhoneSearchMeta {
      const { $i18n } = useNuxtApp();

      if (phoneNumber && country) {
        const countryName = country;
        const countryLower = country.toLowerCase();
        const countryNameLower = countryName.toLowerCase();

        return {
          title: $i18n.t("seo.meta.phoneSearchTitle", { phoneNumber }),
          description: $i18n.t("seo.meta.phoneSearchDescription", { phoneNumber, countryName }),
          keywords: $i18n.t("seo.meta.phoneSearchKeywords", { phoneNumber, countryLower, countryNameLower }),
        };
      }

      return {
        title: $i18n.t("seo.meta.defaultTitle"),
        description: $i18n.t("seo.meta.defaultDescription"),
        keywords: $i18n.t("seo.meta.defaultKeywords"),
      };
    },

    // Generate canonical URL with proper formatting
    generateCanonicalUrl(path: string): string {
      // Ensure no double slashes and proper formatting
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      return `${baseUrl}${cleanPath}`;
    },

    // Generate breadcrumb structured data
    generateBreadcrumbData(breadcrumbs: BreadcrumbItem[]): StructuredDataItem {
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
    },

    // Generate FAQ structured data
    generateFAQData(faqs: FAQ[]): StructuredDataItem {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      };
    },

    // Generate WebApplication structured data for homepage
    generateWebApplicationData(): StructuredDataItem {
      const { $i18n } = useNuxtApp();

      return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: $i18n.t("seo.structuredData.webAppName"),
        description: $i18n.t("seo.structuredData.webAppDescription"),
        url: baseUrl, // Replace with your actual domain
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "All",
        browserRequirements: "HTML5, CSS3, JavaScript",
        softwareVersion: "2.0.0",
        offers: {
          "@type": "Offer",
          description: $i18n.t("seo.structuredData.webAppOfferDescription"),
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@type": "Organization",
          name: "CheckLeaked",
          url: baseUrl, // Replace with your actual domain
        },
        creator: {
          "@type": "Person",
          name: "Eduardo Airaudo",
          url: "https://www.linkedin.com/in/eduardo-airaudo/",
          jobTitle: $i18n.t("seo.structuredData.webAppCreatorJobTitle"),
        },
        featureList: [$i18n.t("seo.structuredData.webAppFeature1"), $i18n.t("seo.structuredData.webAppFeature2"), $i18n.t("seo.structuredData.webAppFeature3"), $i18n.t("seo.structuredData.webAppFeature4"), $i18n.t("seo.structuredData.webAppFeature5"), $i18n.t("seo.structuredData.webAppFeature6")],
        screenshot: baseUrl + "/img/screenshot.png", // Replace with your actual image
      };
    },

    // Generate phone number specific structured data
    generatePhoneNumberData(phoneNumber: string, phoneData: PhoneData): StructuredDataItem {
      const { $i18n } = useNuxtApp();

      return {
        "@context": "https://schema.org",
        "@type": "ContactPoint",
        telephone: phoneNumber,
        contactType: $i18n.t("seo.structuredData.contactPointContactType"),
        areaServed: phoneData.country,
        availableLanguage: $i18n.t("seo.structuredData.contactPointLanguage"),
        description: $i18n.t("seo.structuredData.contactPointDescription", { phoneNumber }),
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "hasWhatsApp",
            value: phoneData.hasWhatsApp.toString(),
          },
          {
            "@type": "PropertyValue",
            name: "verified",
            value: phoneData.verified.toString(),
          },
          {
            "@type": "PropertyValue",
            name: "country",
            value: phoneData.country,
          },
        ],
      };
    },

    // Generate meta tags for Open Graph
    generateOpenGraphMeta(title: string, description: string, url: string, image?: string): Record<string, string> {
      const { $i18n } = useNuxtApp();

      return {
        "og:type": "website",
        "og:site_name": $i18n.t("seo.openGraph.siteName"),
        "og:title": title,
        "og:description": description,
        "og:url": url,
        "og:image": image || baseUrl + "/img/favicon.png", // Replace with your actual image
        "og:image:width": "1200",
        "og:image:height": "630",
        "og:image:alt": title,
        "og:locale": $i18n.t("seo.openGraph.locale"),
      };
    },

    // Generate Twitter Card meta tags
    generateTwitterMeta(title: string, description: string, image?: string): Record<string, string> {
      return {
        "twitter:card": "summary_large_image",
        "twitter:site": "checkleaked",
        "twitter:creator": "checkleaked",
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": image || baseUrl + "/img/favicon.png", // Replace with your actual image
        "twitter:image:alt": title,
      };
    },

    // Generate FAQ data specific to WhatsApp number search
    generateWhatsAppFAQData(): StructuredDataItem {
      const { $i18n } = useNuxtApp();

      const faqs: FAQ[] = [
        {
          question: $i18n.t("seo.faq.question1"),
          answer: $i18n.t("seo.faq.answer1"),
        },
        {
          question: $i18n.t("seo.faq.question2"),
          answer: $i18n.t("seo.faq.answer2"),
        },
        {
          question: $i18n.t("seo.faq.question3"),
          answer: $i18n.t("seo.faq.answer3"),
        },
        {
          question: $i18n.t("seo.faq.question4"),
          answer: $i18n.t("seo.faq.answer4"),
        },
        {
          question: $i18n.t("seo.faq.question5"),
          answer: $i18n.t("seo.faq.answer5"),
        },
      ];

      return this.generateFAQData(faqs);
    },

    // Generate database service structured data
    generateDatabaseServiceData(): StructuredDataItem {
      const { $i18n } = useNuxtApp();

      return {
        "@context": "https://schema.org",
        "@type": "Service",
        name: $i18n.t("seo.structuredData.databaseServiceName"),
        description: $i18n.t("seo.structuredData.databaseServiceDescription"),
        provider: {
          "@type": "Organization",
          name: $i18n.t("seo.structuredData.webAppAuthorName"),
          url: baseUrl, // Replace with your actual domain
        },
        serviceType: $i18n.t("seo.structuredData.databaseServiceType"),
        areaServed: $i18n.t("seo.structuredData.databaseServiceAreaServed"),
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: baseUrl + "/database", // Replace with your actual URL
          serviceType: "API",
        },
        termsOfService: baseUrl + "/terms", // Replace with your actual URL
        offers: {
          "@type": "Offer",
          description: $i18n.t("seo.structuredData.databaseServiceOfferDescription"),
          priceCurrency: "USD",
        },
      };
    },

    // Generate country-specific meta for phone numbers
    generateCountryPhoneMeta(countryCode: string, countryName: string): PhoneSearchMeta {
      const { $i18n } = useNuxtApp();
      const countryNameLower = countryName.toLowerCase();

      return {
        title: $i18n.t("seo.meta.countryTitle", { countryName }),
        description: $i18n.t("seo.meta.countryDescription", { countryName, countryCode }),
        keywords: $i18n.t("seo.meta.countryKeywords", { countryNameLower, countryCode }),
      };
    },

    // Generate complete SEO meta setup for a page
    setupPageSEO(options: { title: string; description: string; keywords?: string; canonicalUrl: string; ogImage?: string; structuredData?: StructuredDataItem[]; breadcrumbs?: BreadcrumbItem[]; phoneNumber?: string; phoneData?: PhoneData }) {
      // Set basic meta tags
      useSeoMeta({
        title: options.title,
        description: options.description,
        keywords: options.keywords,
        ...this.generateOpenGraphMeta(options.title, options.description, options.canonicalUrl, options.ogImage),
        ...this.generateTwitterMeta(options.title, options.description, options.ogImage),
      });

      // Set canonical URL
      if (options.canonicalUrl)
        useHead({
          link: [
            {
              rel: "canonical",
              href: options.canonicalUrl,
            },
          ],
        });

      // Add phone number structured data if provided
      if (options.phoneNumber && options.phoneData) {
        const phoneStructuredData = this.generatePhoneNumberData(options.phoneNumber, options.phoneData);
        useHead({
          script: [
            {
              type: "application/ld+json",
              innerHTML: JSON.stringify(phoneStructuredData),
            },
          ],
        });
      }

      // Add structured data if provided
      if (options.structuredData && options.structuredData.length > 0) {
        useHead({
          script: options.structuredData.map((data) => ({
            type: "application/ld+json",
            innerHTML: JSON.stringify(data),
          })),
        });
      }

      // Add breadcrumb structured data if provided
      if (options.breadcrumbs && options.breadcrumbs.length > 0) {
        useHead({
          script: [
            {
              type: "application/ld+json",
              innerHTML: JSON.stringify(this.generateBreadcrumbData(options.breadcrumbs)),
            },
          ],
        });
      }
    },
  };

  // Return plugin object for Nuxt 3
  return {
    provide: {
      seo: seoUtils,
    },
  };
});
