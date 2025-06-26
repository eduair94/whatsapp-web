<template>
  <v-container class="mx-auto p-4">
    <h1 class="mb-5 mb-md-8 text-center">{{ t("status.title") }}</h1>
    <v-row v-if="apiStatus" class="gap-4">
      <v-col cols="12" md="6">
        <v-card :loading="loading" class="pa-4">
          <v-card-title class="text-h5 font-semibold">
            {{ t("status.currentStatus") }}: <span :class="apiStatus.status ? 'text-green' : 'text-red'">{{ apiStatus.status ? t("status.online") : t("status.offline") }}</span>
          </v-card-title>
          <v-card-text class="text-lg font-semibold">
            <v-list>
              <v-list-item class="pl-0">
                <div class="text-h6">
                  {{ t("status.isWorking") }}: <span :class="apiStatus?.isBroken ? 'text-red' : 'text-green'">{{ apiStatus.isBroken ? t("status.no") : t("status.yes") }}</span>
                </div>
              </v-list-item>
              <v-list-item class="pl-0">
                <div class="text-h6">{{ t("status.lastChecked") }}: {{ formatDistanceToNow(new Date(apiStatus.lastCheck)) }}</div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card :loading="loading" class="pa-4">
          <v-card-title class="text-lg font-semibold">{{ t("status.requestsPerMinute") }}</v-card-title>
          <v-row class="mt-4">
            <v-col cols="6">
              <v-card class="pa-4 text-center" color="green lighten-4">
                <v-card-title class="text-h4 font-bold">{{ apiStatus.successCount }}</v-card-title>
                <v-card-subtitle>{{ t("status.success") }}</v-card-subtitle>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card class="pa-4 text-center" color="red lighten-4">
                <v-card-title class="text-h4 font-bold">{{ apiStatus.errorCount }}</v-card-title>
                <v-card-subtitle>{{ t("status.error") }}</v-card-subtitle>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        <v-alert type="info">{{ t("status.checking") }}</v-alert>
      </v-col>
    </v-row>
    <v-btn :loading="loading" class="mt-4" color="primary" @click="fetchApiStatus" elevation="2">
      <v-icon class="mr-2" left>mdi-reload</v-icon>
      {{ t("status.reload") }}
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { useNuxtApp } from "#app";
import { useHead, useRoute } from "#imports";
import { computed, onMounted, ref } from "vue";

const { t, locale, locales } = useI18n();

const route = useRoute();
const localizedPath = computed(() => `/${locale}${route.path}`);
const pageUrl = computed(() => `${baseUrl}${localizedPath.value}`);

useHead({
  title: computed(() => t("status.title")),
  meta: [
    { name: "description", content: computed(() => t("status.desc")) },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: computed(() => t("meta.siteName")) },
    { property: "og:title", content: computed(() => t("status.title")) },
    { property: "og:description", content: computed(() => t("status.desc")) },
    { property: "og:url", content: pageUrl },
    { name: "twitter:title", content: computed(() => t("status.title")) },
    { name: "twitter:description", content: computed(() => t("status.desc")) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "index, follow" },
    { name: "language", content: computed(() => locale.value) },
  ],
});

interface ApiStatus {
  status: boolean;
  isBroken: boolean;
  lastCheck: string;
  successCount: number;
  errorCount: number;
}

const apiStatus = ref<ApiStatus | null>(null);
const loading = ref(false);
const { $api } = useNuxtApp();

const fetchApiStatus = async () => {
  loading.value = true;
  try {
    const json = await $api.get("/api/status").then((res) => res.data);
    apiStatus.value = json as ApiStatus;
  } catch (error) {
    console.error("Failed to fetch API status:", error);
  }
  loading.value = false;
};

const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

onMounted(() => {
  fetchApiStatus();
});

// SEO setup with translations and structured data
const { $seo } = useNuxtApp();

const setupSEO = () => {
  const canonicalUrl = `${baseUrl}${route.path}`;

  const structuredData = [
    $seo.generateWebApplicationData(),
    {
      "@context": "https://schema.org",
      "@type": "MonitoringService",
      name: "WhatsApp API Status Monitor",
      description: "Real-time monitoring of WhatsApp Profile API service status and performance",
      provider: {
        "@type": "Organization",
        name: "CheckLeaked",
      },
      serviceType: "API Monitoring",
      monitoredService: {
        "@type": "WebAPI",
        name: "WhatsApp Profile API",
        description: "WhatsApp number verification and profile lookup API",
      },
    },
  ];

  const breadcrumbs = [
    { name: t("nav.home"), url: "/" },
    { name: t("nav.apiStatus"), url: route.path },
  ];

  $seo.setupPageSEO({
    title: t("seo.apiStatus.title"),
    description: t("seo.apiStatus.description"),
    keywords: t("seo.apiStatus.keywords"),
    canonicalUrl,
    structuredData,
    breadcrumbs,
  });
};

setupSEO();
</script>

<style scoped>
/* Add your styles here */
</style>
