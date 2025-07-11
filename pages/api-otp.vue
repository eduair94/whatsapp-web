<template>
  <v-container class="fill-height">
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="4" class="pa-8">
          <v-card-text class="text-center">
            <!-- Loading state -->
            <div v-if="!redirected">
              <v-progress-circular indeterminate color="primary" size="64" class="mb-6"></v-progress-circular>

              <h1 class="text-h4 mb-4 text-primary">{{ t("apiOtp.redirecting") }}</h1>

              <p class="text-h6 text-medium-emphasis mb-6">{{ t("apiOtp.redirectingText") }}</p>

              <p class="text-body-1 text-medium-emphasis">{{ t("apiOtp.description") }}</p>
            </div>

            <!-- Fallback if redirect doesn't work -->
            <div v-else>
              <v-icon size="64" color="primary" class="mb-6">mdi-shield-check</v-icon>

              <h1 class="text-h4 mb-4 text-primary">{{ t("apiOtp.title") }}</h1>

              <p class="text-h6 mb-6 text-medium-emphasis">{{ t("apiOtp.subtitle") }}</p>

              <v-btn color="primary" size="large" :href="apiUrl" target="_blank" rel="noopener noreferrer" @click="trackManualClick" class="mt-4">
                <v-icon start>mdi-open-in-new</v-icon>
                {{ t("apiOtp.goToRapidAPI") }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
const apiUrl = "https://rapidapi.com/airaudoeduardo/api/whatsauth-whatsapp-otp1";
const redirected = ref(false);
const { t } = useI18n();

// SEO setup
const { $seo } = useNuxtApp();

$seo.setupPageSEO({
  title: t("seo.apiOtp.title"),
  description: t("seo.apiOtp.description"),
  keywords: t("seo.apiOtp.keywords"),
  ogImage: "https://whatsapp.checkleaked.cc/screenshot.png",
  canonicalUrl: "https://whatsapp.checkleaked.cc/api-otp",
  structuredData: [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "WhatsAuth OTP API",
      url: "https://whatsapp.checkleaked.cc/api-otp",
      description: "Send and verify OTP codes via WhatsApp with our WhatsAuth API. Perfect for secure authentication and verification systems.",
      publisher: {
        "@type": "Organization",
        name: "CheckLeaked",
        url: "https://whatsapp.checkleaked.cc",
        logo: {
          "@type": "ImageObject",
          url: "https://whatsapp.checkleaked.cc/placeholder.png",
          width: 600,
          height: 60,
        },
      },
      potentialAction: {
        "@type": "ConsumeAction",
        target: "https://rapidapi.com/airaudoeduardo/api/whatsauth-whatsapp-otp1/",
        actionStatus: "https://schema.org/PotentialActionStatus",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "WhatsAuth OTP API",
      url: "https://rapidapi.com/airaudoeduardo/api/whatsauth-whatsapp-otp1/",
      description: "Send and verify OTP codes via WhatsApp with our WhatsAuth API. Perfect for secure authentication and verification systems.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0.00",
        priceCurrency: "USD",
        description: "Free tier available",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.7",
        reviewCount: "85",
        bestRating: "5",
        worstRating: "1",
      },
      potentialAction: {
        "@type": "ConsumeAction",
        target: "https://rapidapi.com/airaudoeduardo/api/whatsauth-whatsapp-otp1/",
        actionStatus: "https://schema.org/PotentialActionStatus",
      },
    },
  ],
  breadcrumbs: [
    {
      name: "Home",
      url: "https://whatsapp.checkleaked.cc",
    },
    {
      name: "OTP API",
      url: "https://whatsapp.checkleaked.cc/api-otp",
    },
  ],
});

// Track page view
const trackPageView = () => {
  const { gtag } = useGtag();
  gtag("event", "page_view", {
    page_title: "API Top Redirect Page",
    page_location: window.location.href,
    custom_parameter_1: "whatsauth_otp_api_redirect",
  });
};

// Track redirect event
const trackRedirect = () => {
  const { gtag } = useGtag();
  gtag("event", "api_redirect", {
    event_category: "API",
    event_label: "WhatsAuth OTP API",
    destination_url: apiUrl,
    redirect_type: "automatic",
  });
};

// Track manual click if redirect fails
const trackManualClick = () => {
  const { gtag } = useGtag();
  gtag("event", "api_manual_click", {
    event_category: "API",
    event_label: "WhatsAuth OTP API",
    destination_url: apiUrl,
    redirect_type: "manual",
  });
};

// Perform redirect
const performRedirect = () => {
  trackRedirect();

  // Wait a moment to ensure analytics is tracked
  setTimeout(() => {
    window.location.href = apiUrl;
    redirected.value = true;
  }, 1500);
};

onMounted(() => {
  trackPageView();
  performRedirect();
});
</script>
