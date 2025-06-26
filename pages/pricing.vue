<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section pb-12 pt-3 text-center">
      <v-container class="pt-1">
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <h1 class="mb-4 text-gradient">{{ t("hero.title") }}</h1>
            <h2 class="headline font-weight-regular mb-6 text-white">{{ t("hero.subtitle") }}</h2>
            <p class="title mb-8">{{ t("hero.desc") }}</p>

            <!-- Pricing Highlight -->
            <v-card class="mx-auto mb-8 pricing-card" max-width="400" elevation="8">
              <v-card-text class="text-center py-6">
                <div class="text-h3 font-weight-bold text-primary mb-2">{{ t("hero.price") }}</div>
                <div class="text-h6 text-grey-darken-1 mb-4">{{ t("hero.perMonth") }}</div>
                <div class="text-body-1 font-weight-bold mb-2">{{ t("hero.requests") }}</div>
                <div class="text-body-2 text-grey-darken-1">{{ t("hero.included") }}</div>
              </v-card-text>
            </v-card>

            <v-btn color="primary" size="large" class="mr-4 mb-4" href="https://rapidapi.com/airaudoeduardo/api/whatsapp-data1/" target="_blank" prepend-icon="mdi-rocket-launch"> {{ t("hero.start") }} </v-btn>
            <v-btn color="secondary" size="large" variant="outlined" class="mb-4" to="/api-status" prepend-icon="mdi-speedometer"> {{ t("hero.status") }} </v-btn>
            <v-btn color="info" size="large" variant="outlined" class="mb-4 ml-2" @click="scrollToPricing" prepend-icon="mdi-currency-usd"> {{ t("hero.seePlans") }} </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Features Section -->
    <section class="features-section py-12">
      <v-container>
        <v-row>
          <v-col cols="12" class="text-center mb-8">
            <h2 class="text-h3 font-weight-bold mb-4">{{ t("features.title") }}</h2>
            <p class="text-h6 text-grey-darken-1">{{ t("features.desc") }}</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4" class="mb-4">
            <v-card class="h-100 feature-card" elevation="2">
              <v-card-text class="text-center pa-6">
                <v-avatar size="64" color="primary" class="mb-4">
                  <v-icon size="32" color="white">mdi-account-circle</v-icon>
                </v-avatar>
                <h3 class="text-h6 font-weight-bold mb-3">{{ t("features.profile") }}</h3>
                <p class="text-body-1">{{ t("features.profileDesc") }}</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" class="mb-4">
            <v-card class="h-100 feature-card" elevation="2">
              <v-card-text class="text-center pa-6">
                <v-avatar size="64" color="success" class="mb-4">
                  <v-icon size="32" color="white">mdi-image-outline</v-icon>
                </v-avatar>
                <h3 class="text-h6 font-weight-bold mb-3">{{ t("features.pictures") }}</h3>
                <p class="text-body-1">{{ t("features.picturesDesc") }}</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" class="mb-4">
            <v-card class="h-100 feature-card" elevation="2">
              <v-card-text class="text-center pa-6">
                <v-avatar size="64" color="warning" class="mb-4">
                  <v-icon size="32" color="white">mdi-office-building</v-icon>
                </v-avatar>
                <h3 class="text-h6 font-weight-bold mb-3">{{ t("features.business") }}</h3>
                <p class="text-body-1">{{ t("features.businessDesc") }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Demo Section -->
    <section class="lookup-section py-12" id="demo">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-8">
            <h2 class="text-h3 font-weight-bold mb-4 text-white">{{ t("demo.title") }}</h2>
            <p class="text-h6 text-grey-lighten-2">{{ t("demo.desc") }}</p>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card class="pa-6" elevation="8">
              <v-card-text>
                <h3 class="text-h6 font-weight-bold mb-4 text-center">{{ t("demo.tryIt") }}</h3>

                <PhoneInput v-model="phoneData" class="mb-4" />

                <v-btn @click="lookupPhone" :loading="loading" color="primary" size="large" block prepend-icon="mdi-magnify" class="mt-4">
                  {{ t("demo.lookup") }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section py-12">
      <v-row justify="center" class="px-0 mx-0">
        <v-col cols="12" class="text-center mb-8">
          <h2 class="text-h3 font-weight-bold mb-4 text-white">{{ t("pricing.title") }}</h2>
          <p class="text-h6 text-white">{{ t("pricing.desc") }}</p>
        </v-col>
      </v-row>
      <v-container>
        <v-row justify="center" align="stretch" class="gap-4">
          <!-- BASIC Plan -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="pricing-plan h-100" elevation="6">
              <v-card-title class="text-center py-6 bg-grey-darken-4">
                <h3 class="text-h5 font-weight-bold text-white">{{ t("plan.basic") }}</h3>
              </v-card-title>
              <v-card-text class="text-center py-8">
                <div class="text-h3 font-weight-bold text-success mb-2">FREE</div>
                <div class="text-h6 text-white mb-6">{{ t("plan.basic.limit") }}</div>
                <v-list class="bg-transparent">
                  <v-list-item class="px-0">
                    <template #prepend><v-icon color="success">mdi-check-circle</v-icon></template>
                    <v-list-item-title class="text-white text-left">{{ t("plan.basic.feature1") }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <template #prepend><v-icon color="success">mdi-check-circle</v-icon></template>
                    <v-list-item-title class="text-white text-left">{{ t("plan.basic.feature2") }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-actions class="pa-6">
                <v-btn color="success" size="large" block href="https://rapidapi.com/airaudoeduardo/api/whatsapp-data1/pricing" target="_blank"> {{ t("plan.basic.cta") }} </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <!-- PRO Plan -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="pricing-plan h-100" elevation="6">
              <v-card-title class="text-center py-6 bg-blue-darken-3">
                <h3 class="text-h5 font-weight-bold text-white">{{ t("plan.pro") }}</h3>
              </v-card-title>
              <v-card-text class="text-center py-8">
                <div class="text-h3 font-weight-bold text-blue mb-2">$10</div>
                <div class="text-h6 text-white mb-6">{{ t("plan.pro.limit") }}</div>
                <v-list class="bg-transparent">
                  <v-list-item class="px-0">
                    <template #prepend><v-icon color="success">mdi-check-circle</v-icon></template>
                    <v-list-item-title class="text-white text-left">{{ t("plan.pro.feature1") }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <template #prepend><v-icon color="success">mdi-check-circle</v-icon></template>
                    <v-list-item-title class="text-white text-left">{{ t("plan.pro.feature2") }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-actions class="pa-6">
                <v-btn color="blue" size="large" block href="https://rapidapi.com/airaudoeduardo/api/whatsapp-data1/pricing" target="_blank"> {{ t("plan.pro.cta") }} </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <!-- ULTRA Plan -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="pricing-plan h-100" elevation="6">
              <v-card-title class="text-center py-6 bg-purple-darken-3">
                <h3 class="text-h5 font-weight-bold text-white">{{ t("plan.ultra") }}</h3>
              </v-card-title>
              <v-card-text class="text-center py-8">
                <div class="text-h3 font-weight-bold text-purple mb-2">$20</div>
                <div class="text-h6 text-white mb-6">{{ t("plan.ultra.limit") }}</div>
                <v-list class="bg-transparent">
                  <v-list-item class="px-0">
                    <template #prepend><v-icon color="success">mdi-check-circle</v-icon></template>
                    <v-list-item-title class="text-white text-left">{{ t("plan.ultra.feature1") }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <template #prepend><v-icon color="success">mdi-check-circle</v-icon></template>
                    <v-list-item-title class="text-white text-left">{{ t("plan.ultra.feature2") }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-actions class="pa-6">
                <v-btn color="purple" size="large" block href="https://rapidapi.com/airaudoeduardo/api/whatsapp-data1/pricing" target="_blank"> {{ t("plan.ultra.cta") }} </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <!-- MEGA Plan -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="pricing-plan h-100" elevation="8">
              <v-card-title class="text-center py-6 bg-primary">
                <h3 class="text-h5 font-weight-bold text-white">MEGA</h3>
              </v-card-title>
              <v-card-text class="text-center py-8">
                <div class="text-h3 font-weight-bold text-primary mb-2">$99</div>
                <div class="text-h6 text-white mb-6 text-center">{{ t("plan.mega.limit") }}</div>
                <v-list class="bg-transparent">
                  <v-list-item class="px-0">
                    <template #prepend><v-icon color="success">mdi-check-circle</v-icon></template>
                    <v-list-item-title class="text-white text-left">{{ t("plan.mega.feature1") }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <template #prepend><v-icon color="success">mdi-check-circle</v-icon></template>
                    <v-list-item-title class="text-white text-left">{{ t("plan.mega.feature2") }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <template #prepend><v-icon color="success">mdi-check-circle</v-icon></template>
                    <v-list-item-title class="text-white text-left">{{ t("plan.mega.feature4") }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-actions class="pa-6">
                <v-btn color="primary" size="large" block href="https://rapidapi.com/airaudoeduardo/api/whatsapp-data1/" target="_blank"> {{ t("plan.mega.cta") }} </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useHead, useRoute, useRouter } from "#imports";
import { computed, ref } from "vue";

const { t, locale, locales } = useI18n();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const phoneData = ref({
  phoneCode: "598",
  phoneNumber: "",
});

const pageUrl = computed(() => `${baseUrl}${route.path}`);

useHead({
  title: computed(() => t("pricing.title")),
  meta: [
    { name: "description", content: computed(() => t("pricing.desc")) },
    { name: "keywords", content: "whatsapp api, whatsapp profile api, user profile lookup, whatsapp business api, profile picture api, messaging api, affordable api, $99 api, phone verification" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: computed(() => t("meta.siteName")) },
    { property: "og:title", content: computed(() => t("pricing.title")) },
    { property: "og:description", content: computed(() => t("pricing.desc")) },
    { property: "og:url", content: pageUrl },
    { name: "twitter:title", content: computed(() => t("pricing.title")) },
    { name: "twitter:description", content: computed(() => t("pricing.desc")) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "index, follow" },
    { name: "language", content: computed(() => locale.value) },
  ],
});

const lookupPhone = async (): Promise<void> => {
  if (phoneData.value.phoneCode && phoneData.value.phoneNumber) {
    loading.value = true;
    // Use Nuxt i18n locale in the path
    await router.push(`/${locale.value}/${phoneData.value.phoneCode}${phoneData.value.phoneNumber}`);
    loading.value = false;
  }
};

const scrollToPricing = () => {
  const section = document.querySelector(".pricing-section");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};

// SEO setup with translations and structured data
const { $seo } = useNuxtApp();

const setupSEO = () => {
  const canonicalUrl = pageUrl.value;

  const structuredData = [
    $seo.generateWebApplicationData(),
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "WhatsApp API Pricing",
      description: t("seo.pricing.description"),
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      offers: [
        {
          "@type": "Offer",
          name: t("plan.basic"),
          description: t("plan.basic.limit"),
          price: "0",
          priceCurrency: "USD",
          priceValidUntil: "2025-12-31",
        },
        {
          "@type": "Offer",
          name: t("plan.pro"),
          description: t("plan.pro.limit"),
          price: "10",
          priceCurrency: "USD",
          priceValidUntil: "2025-12-31",
        },
        {
          "@type": "Offer",
          name: t("plan.ultra"),
          description: t("plan.ultra.limit"),
          price: "20",
          priceCurrency: "USD",
          priceValidUntil: "2025-12-31",
        },
        {
          "@type": "Offer",
          name: t("plan.mega"),
          description: t("plan.mega.limit"),
          price: "99",
          priceCurrency: "USD",
          priceValidUntil: "2025-12-31",
        },
      ],
    },
  ];

  const breadcrumbs = [
    { name: t("nav.home"), url: "/" },
    { name: t("nav.pricing"), url: route.path },
  ];

  $seo.setupPageSEO({
    title: t("seo.pricing.title"),
    description: t("seo.pricing.description"),
    keywords: t("seo.pricing.keywords"),
    canonicalUrl,
    structuredData,
    breadcrumbs,
  });
};

setupSEO();
</script>

<style scoped>
.hero-section h1 {
  font-size: 2em;
}

.phone {
  max-width: 700px;
  margin: auto;
  .v-field {
    border-radius: 0;
  }
}

.text-gradient {
  background: linear-gradient(45deg, #25d366, #128c7e);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pricing-card {
  border: 2px solid #25d366;
}

.feature-card {
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.phone-input-group {
  gap: 8px;
}

.phone-code {
  flex: 0 0 120px;
}

.phone-number {
  flex: 1;
}

.pricing-plan {
  border: 2px solid #25d366;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.lookup-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
}

.pricing-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.bg-dark {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
}

@media (max-width: 600px) {
  .phone-input-group {
    flex-direction: column;
  }

  .phone-code {
    flex: 1;
  }
}
</style>
