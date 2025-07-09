<template>
  <v-container class="fill-height">
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="4" class="pa-8">
          <v-card-text class="text-center">
            <!-- Loading state -->
            <div v-if="!redirected">
              <v-progress-circular indeterminate color="primary" size="64" class="mb-6"></v-progress-circular>

              <h1 class="text-h4 mb-4 text-primary">Redirecting to WhatsApp Profile API</h1>

              <p class="text-h6 text-medium-emphasis mb-6">You're being redirected to our WhatsApp Profile API on RapidAPI...</p>

              <p class="text-body-1 text-medium-emphasis">Get instant access to WhatsApp profile data, business information, and profile pictures.</p>
            </div>

            <!-- Fallback if redirect doesn't work -->
            <div v-else>
              <v-icon size="64" color="primary" class="mb-6">mdi-api</v-icon>

              <h1 class="text-h4 mb-4 text-primary">WhatsApp Profile API</h1>

              <p class="text-h6 mb-6 text-medium-emphasis">Access our powerful WhatsApp Profile API on RapidAPI</p>

              <v-btn color="primary" size="large" :href="apiUrl" target="_blank" rel="noopener noreferrer" @click="trackManualClick" class="mt-4">
                <v-icon start>mdi-open-in-new</v-icon>
                Go to RapidAPI
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
const apiUrl = "https://rapidapi.com/airaudoeduardo/api/whatsapp-data1/";
const redirected = ref(false);

// SEO Setup
const { $seo } = useNuxtApp();

$seo.setupPageSEO({
  title: "WhatsApp Profile API - RapidAPI Integration | CheckLeaked",
  description: "Access our powerful WhatsApp Profile API through RapidAPI. Get profile data, business information, and profile pictures with simple API calls. Fast, reliable, and affordable WhatsApp data integration.",
  keywords: ["WhatsApp API", "Profile API", "RapidAPI", "WhatsApp data", "business profiles", "profile pictures", "API integration", "WhatsApp business", "contact verification", "phone number lookup", "developer API", "REST API", "JSON API", "real-time data"].join(" "),
  ogImage: "https://whatsapp.checkleaked.cc/screenshot.png",
  canonicalUrl: "https://whatsapp.checkleaked.cc/api",
  structuredData: [
    {
      "@context": "https://schema.org",
      "@type": "WebAPI",
      name: "WhatsApp Profile API",
      description: "A powerful REST API that provides access to WhatsApp profile data, business information, and profile pictures through RapidAPI platform.",
      url: "https://rapidapi.com/airaudoeduardo/api/whatsapp-data1/",
      provider: {
        "@type": "Organization",
        name: "CheckLeaked",
        url: "https://whatsapp.checkleaked.cc",
        logo: {
          "@type": "ImageObject",
          url: "https://whatsapp.checkleaked.cc/favicon.png",
        },
      },
      documentation: "https://rapidapi.com/airaudoeduardo/api/whatsapp-data1/",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier available with paid plans for higher usage",
      },
      featureList: ["WhatsApp profile data retrieval", "Business information access", "Profile picture extraction", "Contact verification", "Real-time data updates", "JSON response format", "RESTful API design", "Rate limiting protection"],
      softwareRequirements: "HTTP client or any programming language with HTTP support",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "150",
        bestRating: "5",
        worstRating: "1",
      },
      potentialAction: {
        "@type": "ConsumeAction",
        target: "https://rapidapi.com/airaudoeduardo/api/whatsapp-data1/",
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
      name: "API",
      url: "https://whatsapp.checkleaked.cc/api",
    },
  ],
});

// Track page view
const trackPageView = () => {
  const { gtag } = useGtag();
  gtag("event", "page_view", {
    page_title: "API Redirect Page",
    page_location: window.location.href,
    custom_parameter_1: "whatsapp_data_api_redirect",
  });
};

// Track redirect event
const trackRedirect = () => {
  const { gtag } = useGtag();
  gtag("event", "api_redirect", {
    event_category: "API",
    event_label: "WhatsApp Data API",
    destination_url: apiUrl,
    redirect_type: "automatic",
  });
};

// Track manual click if redirect fails
const trackManualClick = () => {
  const { gtag } = useGtag();
  gtag("event", "api_manual_click", {
    event_category: "API",
    event_label: "WhatsApp Data API",
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
  }, 5500);
};

onMounted(() => {
  trackPageView();
  performRedirect();
});
</script>
