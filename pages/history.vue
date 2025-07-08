<template>
  <v-container>
    <div class="mb-5 mb-md-8 text-center">
      <h1>{{ t("history.title") }}</h1>
      <v-btn class="mt-3" v-if="searchHistory.length > 0" color="error" variant="outlined" :loading="loading" @click="confirmClear = true">
        <v-icon left>mdi-delete</v-icon>
        {{ t("history.clearAll") }}
      </v-btn>
    </div>

    <!-- Loading state -->
    <div v-if="loading && searchHistory.length === 0" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">{{ t("history.loading") }}</p>
    </div>

    <!-- Error state -->
    <v-alert v-if="error" type="error" class="mb-5" dismissible @click:close="error = null">
      {{ error }}
    </v-alert>

    <!-- Empty state -->
    <div v-if="!loading && searchHistory.length === 0" class="text-center py-10">
      <v-icon size="64" color="grey">mdi-history</v-icon>
      <h3 class="mt-4 mb-2">{{ t("history.empty.title") }}</h3>
      <p class="mb-4">{{ t("history.empty.description") }}</p>
      <v-btn color="primary" :to="localePath('/')">
        {{ t("history.empty.searchNow") }}
      </v-btn>
    </div>

    <!-- Filter input -->
    <div v-if="searchHistory.length > 0" class="mb-5">
      <v-text-field v-model="searchFilter" prepend-inner-icon="mdi-magnify" :label="t('history.filter.placeholder')" variant="outlined" clearable density="compact" class="mx-auto" style="max-width: 500px"></v-text-field>
    </div>

    <!-- Search history list -->
    <div v-if="searchHistory.length > 0">
      <v-row>
        <v-col v-for="item in filteredSearchHistory" :key="item.id" cols="12" md="6" lg="4">
          <v-card class="history-card d-flex flex-column h-100" elevation="3">
            <!-- Profile Image Header -->
            <div class="position-relative w-100">
              <v-img :src="item.urlImage || '/placeholder.jpg'" height="200" class="grey lighten-2" cover>
                <div class="image-overlay d-flex justify-space-between pa-2">
                  <v-btn v-if="item.urlImage" icon size="small" color="white" @click="showFullImage(item.urlImage!, item.phoneNumber)">
                    <v-icon>mdi-magnify-plus</v-icon>
                  </v-btn>
                  <div class="d-flex">
                    <v-btn v-if="item.urlImage" icon size="small" color="white" class="mr-2" @click="downloadImage(item.urlImage!, `${item.phoneNumber}_profile.jpeg`)">
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                    <v-btn icon size="small" color="error" @click="deleteSearchItem(item.id)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </v-img>
            </div>

            <!-- Card Content -->
            <v-card-title class="pb-2">
              <div class="d-flex justify-space-between align-center w-100">
                <span class="text-h6">{{ formatPhoneNumber(item.phoneNumber) }}</span>
                <v-chip :color="item.data.error ? 'error' : 'success'" size="small" variant="flat">
                  {{ item.data.error ? t("history.failed") : t("history.success") }}
                </v-chip>
              </div>
            </v-card-title>

            <v-card-text class="pt-0">
              <!-- Search Date -->
              <div class="d-flex align-center mb-2">
                <v-icon size="small" class="mr-2">mdi-clock-outline</v-icon>
                <span class="text-caption">{{ formatDate(item.searchDate) }}</span>
              </div>

              <!-- Profile Info (if available) -->
              <div v-if="!item.data.error">
                <div v-if="item.data.pushname" class="mb-1">
                  <strong>{{ t("lookup.name") }}:</strong> {{ item.data.pushname }}
                </div>
                <div v-if="item.data.about" class="mb-1 text-truncate">
                  <strong>{{ t("lookup.about") }}:</strong> {{ item.data.about }}
                </div>
                <div class="d-flex gap-2 mt-2">
                  <v-chip v-if="item.data.isBusiness" size="x-small" color="blue" variant="flat">
                    {{ t("lookup.business") }}
                  </v-chip>
                  <v-chip v-if="item.data.isEnterprise" size="x-small" color="purple" variant="flat">
                    {{ t("lookup.enterprise") }}
                  </v-chip>
                </div>
              </div>

              <!-- Error message -->
              <div v-else class="text-error">
                <v-icon size="small" class="mr-1">mdi-alert-circle</v-icon>
                {{ t(item.data.error) || item.data.error }}
              </div>
            </v-card-text>

            <!-- Actions -->
            <v-card-actions>
              <v-btn variant="text" color="primary" :to="localePath(`/${item.phoneNumber}`)" size="small">
                <v-icon left size="small">mdi-magnify</v-icon>
                {{ t("history.searchAgain") }}
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn icon variant="text" size="small" @click="showDetails[item.id] = !showDetails[item.id]">
                <v-icon>{{ showDetails[item.id] ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
              </v-btn>
            </v-card-actions>

            <!-- Contact Buttons -->
            <v-card-actions v-if="!item.data.error" class="pt-0">
              <ContactButtons :phone="item.phoneNumber" />
            </v-card-actions>

            <!-- Expandable Details -->
            <v-expand-transition>
              <div v-if="showDetails[item.id]">
                <v-divider></v-divider>
                <v-card-text>
                  <h4 class="mb-2">{{ t("history.rawData") }}</h4>
                  <v-textarea :model-value="JSON.stringify(item.data, null, 2)" readonly rows="6" variant="outlined" density="compact" class="raw-data"></v-textarea>
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Clear confirmation dialog -->
    <v-dialog v-model="confirmClear" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          {{ t("history.confirmClear.title") }}
        </v-card-title>
        <v-card-text>
          {{ t("history.confirmClear.message") }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="confirmClear = false">
            {{ t("history.confirmClear.cancel") }}
          </v-btn>
          <v-btn color="error" variant="text" @click="handleClearAll">
            {{ t("history.confirmClear.confirm") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Full image dialog -->
    <FullImageDialog v-model="fullImageDialog" :image-url="fullImageData.url" :phone-number="fullImageData.phoneNumber" @download="downloadImage" />
  </v-container>
</template>

<script setup lang="ts">
import { useHead, useLocalePath } from "#imports";
import parsePhoneNumber from "libphonenumber-js";
import { onMounted, reactive, ref } from "vue";
import { useSearchHistory } from "~/composables/useSearchHistory";

const { t, locale } = useI18n();
const localePath = useLocalePath();

const { searchHistory, loading, error, initializeStorage, loadSearchHistory, clearAllHistory, deleteSearchItem, downloadImage } = useSearchHistory();

const confirmClear = ref(false);
const showDetails = reactive<Record<string, boolean>>({});
const searchFilter = ref("");
const fullImageDialog = ref(false);
const fullImageData = ref({ url: "", phoneNumber: "" });

// SEO
const pageUrl = `${baseUrl}/${locale}/history`;

useHead({
  title: computed(() => t("history.title") + " - " + t("meta.suffix")),
  meta: [
    { name: "description", content: computed(() => t("history.meta.description")) },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: computed(() => t("meta.siteName")) },
    { property: "og:title", content: computed(() => t("history.title") + " - " + t("meta.suffix")) },
    { property: "og:description", content: computed(() => t("history.meta.description")) },
    { property: "og:url", content: pageUrl },
    { name: "twitter:title", content: computed(() => t("history.title") + " - " + t("meta.suffix")) },
    { name: "twitter:description", content: computed(() => t("history.meta.description")) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex, nofollow" }, // Private page
    { name: "language", content: computed(() => locale.value) },
  ],
});

const formatPhoneNumber = (phoneNumber: string): string => {
  try {
    const phone = parsePhoneNumber("+" + phoneNumber);
    return phone?.formatInternational() || `+${phoneNumber}`;
  } catch {
    return `+${phoneNumber}`;
  }
};

const formatDate = (date: Date): string => {
  if (!date) return "";

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffInDays === 1) {
    return t("history.yesterday");
  } else if (diffInDays < 7) {
    return t("history.daysAgo", { count: diffInDays });
  } else {
    return date.toLocaleDateString();
  }
};

const handleClearAll = async () => {
  confirmClear.value = false;
  await clearAllHistory();
};

const showFullImage = (imageUrl: string, phoneNumber: string) => {
  fullImageData.value = { url: imageUrl, phoneNumber };
  fullImageDialog.value = true;
};

const filteredSearchHistory = computed(() => {
  if (!searchFilter.value) return searchHistory.value;

  const filter = searchFilter.value.toLowerCase();
  return searchHistory.value.filter((item) => item.phoneNumber.includes(filter) || (item.data.about && item.data.about.toLowerCase().includes(filter)) || (item.data.pushname && item.data.pushname.toLowerCase().includes(filter)));
});

onMounted(async () => {
  await initializeStorage();
  await loadSearchHistory();
});
</script>

<style scoped lang="scss">
.history-card {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.image-overlay {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7));
}

.raw-data {
  font-family: "Courier New", monospace;
  font-size: 0.8rem;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
