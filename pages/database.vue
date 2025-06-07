<template>
  <div class="database-page">
    <v-container>
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="mb-2">
          <v-icon class="mr-3" size="40">mdi-database</v-icon>
          {{ t("database.title") }}
        </h1>
        <p class="text-h6 text-medium-emphasis">{{ t("database.subtitle") }}</p>
      </div>

      <!-- Authentication Required Card -->
      <v-card v-if="!isAuthenticated && !authLoading" class="mb-6" elevation="4" color="warning" variant="outlined">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="warning">mdi-lock</v-icon>
          {{ t("database.authRequired") }}
        </v-card-title>
        <v-card-text>
          <p class="mb-4">{{ t("database.authRequiredMessage") }}</p>
          <div class="d-flex flex-wrap ga-3">
            <v-btn color="primary" variant="elevated" size="large" :to="localePath('/auth')" class="mr-3">
              <v-icon class="mr-2">mdi-login</v-icon>
              {{ t("database.signIn") }}
            </v-btn>
            <v-btn color="secondary" variant="outlined" size="large" :to="localePath('/auth')">
              <v-icon class="mr-2">mdi-account-plus</v-icon>
              {{ t("database.signUp") }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Loading Card for Auth State -->
      <v-card v-if="authLoading" class="mb-6" elevation="4">
        <v-card-text class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
          <p class="text-h6">{{ t("database.checkingAuth") }}</p>
        </v-card-text>
      </v-card>

      <!-- Database Content (only show when authenticated) -->
      <div v-if="isAuthenticated && !authLoading">
        <!-- Search and Filters Card -->
        <v-card class="mb-6" elevation="4">
          <v-card-title class="pb-2">
            <v-icon class="mr-2">mdi-filter</v-icon>
            {{ t("database.searchAndFilters") }}
            <v-spacer></v-spacer>
            <!-- Rate Limit Info -->
            <v-chip v-if="rateLimitInfo" color="info" variant="outlined" size="small"> {{ rateLimitInfo.current }}/{{ rateLimitInfo.limit }} {{ t("database.requests") }} </v-chip>
          </v-card-title>
          <v-card-text>
            <v-row>
              <!-- Main Search -->
              <v-col cols="12" md="6">
                <v-text-field v-model="searchQuery" :label="t('database.searchPlaceholder')" prepend-inner-icon="mdi-magnify" variant="outlined" clearable></v-text-field>
              </v-col>

              <!-- Phone Number Filter -->
              <v-col cols="12" md="6">
                <v-text-field v-model="filters.number" :label="t('database.phoneNumber')" prepend-inner-icon="mdi-phone" variant="outlined" clearable></v-text-field>
              </v-col>

              <!-- Country Code Filter -->
              <v-col cols="12" md="3">
                <v-text-field v-model="filters.countryCode" :label="t('database.countryCode')" prepend-inner-icon="mdi-flag" variant="outlined" clearable placeholder="e.g. CN, US, GB"></v-text-field>
              </v-col>

              <!-- Business Profile Filter -->
              <v-col cols="12" md="3">
                <v-select v-model="filters.isBusiness" :items="businessOptions" :label="t('database.businessProfile')" prepend-inner-icon="mdi-briefcase" variant="outlined" clearable></v-select>
              </v-col>

              <!-- Profile Picture Filter -->
              <v-col cols="12" md="3">
                <v-select v-model="filters.hasProfilePic" :items="profilePicOptions" :label="t('database.hasProfilePic')" prepend-inner-icon="mdi-account-circle" variant="outlined" clearable></v-select>
              </v-col>

              <!-- Date Range -->
              <v-col cols="12" md="3">
                <v-text-field v-model="filters.dateFrom" :label="t('database.dateFrom')" type="date" prepend-inner-icon="mdi-calendar-start" variant="outlined" clearable></v-text-field>
              </v-col>
            </v-row>

            <!-- Action Buttons -->
            <v-row>
              <v-col cols="12" class="text-right">
                <v-btn color="secondary" variant="outlined" class="mr-3" @click="clearFilters">
                  <v-icon class="mr-2">mdi-filter-off</v-icon>
                  {{ t("database.clearFilters") }}
                </v-btn>
                <v-btn color="primary" :loading="loading" @click="performSearch">
                  <v-icon class="mr-2">mdi-magnify</v-icon>
                  {{ t("database.search") }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Results Data Table -->
        <v-card elevation="4">
          <v-card-title class="d-flex align-center flex-wrap ga-3">
            <v-icon class="mr-2">mdi-table</v-icon>
            {{ t("database.results") }}
            <v-spacer></v-spacer>
            <v-chip v-if="totalResults !== null" color="primary" variant="outlined"> {{ formatNumber(totalResults) }} {{ t("database.totalResults") }} </v-chip>
          </v-card-title>

          <v-data-table-server v-model:items-per-page="itemsPerPage" v-model:page="currentPage" :headers="headers" :items="searchResults" :items-length="totalResults || 0" :loading="loading" class="elevation-1" item-value="_id" show-current-page @update:options="loadItems">
            <!-- Profile Picture Column -->
            <template v-slot:item.profilePic="{ item }">
              <div class="d-flex align-center py-2">
                <v-avatar size="40" class="mr-3">
                  <v-img v-if="item.urlImage || item.profilePic" :src="item.urlImage || item.profilePic" :alt="item.phone" cover>
                    <template v-slot:error>
                      <v-icon>mdi-account-circle</v-icon>
                    </template>
                  </v-img>
                  <v-icon v-else>mdi-account-circle</v-icon>
                </v-avatar>
              </div>
            </template>

            <!-- Phone Number Column -->
            <template v-slot:item.phone="{ item }">
              <div class="d-flex flex-column">
                <span class="font-weight-bold">{{ item.phone }}</span>
                <span class="text-caption text-medium-emphasis">{{ item.number }}</span>
              </div>
            </template>

            <!-- Country Column -->
            <template v-slot:item.countryCode="{ item }">
              <v-chip :color="getCountryColor(item.countryCode)" variant="outlined" size="small" class="mr-2"> {{ getCountryFlag(item.countryCode) }} {{ item.countryCode }} </v-chip>
            </template>

            <!-- Business Status Column -->
            <template v-slot:item.isBusiness="{ item }">
              <v-chip :color="item.isBusiness ? 'success' : 'default'" :variant="item.isBusiness ? 'flat' : 'outlined'" size="small">
                <v-icon class="mr-1" size="16">
                  {{ item.isBusiness ? "mdi-briefcase" : "mdi-account" }}
                </v-icon>
                {{ item.isBusiness ? t("database.business") : t("database.personal") }}
              </v-chip>
            </template>

            <!-- About/Description Column -->
            <template v-slot:item.about="{ item }">
              <div class="max-width-200">
                <span v-if="item.about" class="text-body-2">{{ item.about }}</span>
                <span v-else-if="item.businessProfile?.description" class="text-body-2">
                  {{ item.businessProfile.description }}
                </span>
                <span v-else class="text-caption text-medium-emphasis">{{ t("database.noDescription") }}</span>
              </div>
            </template>

            <!-- Date Column -->
            <template v-slot:item.date="{ item }">
              <div class="d-flex flex-column">
                <span class="text-body-2">{{ formatDate(item.date) }}</span>
                <span class="text-caption text-medium-emphasis">{{ formatTimeAgo(item.date) }}</span>
              </div>
            </template>

            <!-- Actions Column -->
            <template v-slot:item.actions="{ item }">
              <div class="d-flex">
                <v-btn icon size="small" variant="text" @click="showDetails(item)">
                  <v-icon>mdi-open-in-new</v-icon>
                  <v-tooltip activator="parent">{{ t("database.showDetails") }}</v-tooltip>
                </v-btn>
                <v-btn icon size="small" variant="text" @click="copyToClipboard(item.phone)">
                  <v-icon>mdi-content-copy</v-icon>
                  <v-tooltip activator="parent">{{ t("database.copyPhone") }}</v-tooltip>
                </v-btn>
                <v-btn icon size="small" variant="text" :to="`/${item.number}`">
                  <v-icon>mdi-refresh</v-icon>
                  <v-tooltip activator="parent">{{ t("database.searchAgain") }}</v-tooltip>
                </v-btn>
              </div>
            </template>

            <!-- Loading state -->
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
            </template>

            <!-- No data state -->
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-database-search</v-icon>
                <h3 class="text-h6 mb-2">{{ t("database.noResults") }}</h3>
                <p class="text-body-2 text-medium-emphasis">{{ t("database.noResultsHint") }}</p>
              </div>
            </template>
          </v-data-table-server>
        </v-card>
      </div>
      <!-- End of authenticated content -->

      <!-- Details Dialog -->
      <v-dialog v-model="detailsDialog" max-width="900" scrollable>
        <v-card v-if="selectedItem">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-information</v-icon>
            {{ t("database.detailsTitle") }}
            <v-spacer></v-spacer>
            <v-btn icon variant="text" @click="detailsDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-row>
              <!-- Profile Picture Section -->
              <v-col cols="12" md="4">
                <div class="text-center">
                  <v-card variant="outlined" class="pa-4">
                    <h4 class="mb-3">{{ t("database.profilePicture") }}</h4>
                    <div v-if="selectedItem.urlImage || selectedItem.profilePic" class="mb-3">
                      <v-img :src="selectedItem.urlImage || selectedItem.profilePic" :alt="selectedItem.phone" max-height="300" max-width="300" class="mx-auto rounded" contain>
                        <template v-slot:error>
                          <div class="d-flex align-center justify-center fill-height">
                            <v-icon size="100" color="grey-lighten-2">mdi-account-circle</v-icon>
                          </div>
                        </template>
                      </v-img>
                      <v-btn v-if="selectedItem.urlImage || selectedItem.profilePic" color="primary" variant="outlined" class="mt-3" @click="downloadImage(selectedItem.urlImage || selectedItem.profilePic, selectedItem.phone)">
                        <v-icon class="mr-2">mdi-download</v-icon>
                        {{ t("database.downloadImage") }}
                      </v-btn>
                    </div>
                    <div v-else class="text-center py-8">
                      <v-icon size="100" color="grey-lighten-2">mdi-account-circle</v-icon>
                      <p class="text-caption text-medium-emphasis mt-2">{{ t("database.noProfilePic") }}</p>
                    </div>
                  </v-card>
                </div>
              </v-col>

              <!-- Profile Information Section -->
              <v-col cols="12" md="8">
                <v-card variant="outlined" class="pa-4">
                  <h4 class="mb-3">{{ t("database.profileInformation") }}</h4>

                  <v-list density="compact">
                    <!-- Phone Number -->
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-phone</v-icon>
                      </template>
                      <v-list-item-title>{{ t("database.phoneNumber") }}</v-list-item-title>
                      <v-list-item-subtitle class="font-weight-medium"> {{ getCountryFlag(selectedItem.countryCode) }} {{ selectedItem.phone }} </v-list-item-subtitle>
                      <template v-slot:append>
                        <v-btn icon size="small" variant="text" @click="copyToClipboard(selectedItem.phone)">
                          <v-icon>mdi-content-copy</v-icon>
                        </v-btn>
                      </template>
                    </v-list-item>

                    <!-- Alternative Number -->
                    <v-list-item v-if="selectedItem.number && selectedItem.number !== selectedItem.phone">
                      <template v-slot:prepend>
                        <v-icon>mdi-phone-outline</v-icon>
                      </template>
                      <v-list-item-title>{{ t("database.alternativeNumber") }}</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedItem.number }}</v-list-item-subtitle>
                    </v-list-item>

                    <!-- Name -->
                    <v-list-item v-if="selectedItem.name">
                      <template v-slot:prepend>
                        <v-icon>mdi-account</v-icon>
                      </template>
                      <v-list-item-title>{{ t("database.name") }}</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedItem.name }}</v-list-item-subtitle>
                    </v-list-item>

                    <!-- About -->
                    <v-list-item v-if="selectedItem.about">
                      <template v-slot:prepend>
                        <v-icon>mdi-information-outline</v-icon>
                      </template>
                      <v-list-item-title>{{ t("database.about") }}</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedItem.about }}</v-list-item-subtitle>
                    </v-list-item>

                    <!-- Country -->
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-flag</v-icon>
                      </template>
                      <v-list-item-title>{{ t("database.country") }}</v-list-item-title>
                      <v-list-item-subtitle> {{ getCountryFlag(selectedItem.countryCode) }} {{ getCountryName(selectedItem.countryCode) }} ({{ selectedItem.countryCode }}) </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Business Status -->
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>{{ selectedItem.isBusiness ? "mdi-briefcase" : "mdi-account" }}</v-icon>
                      </template>
                      <v-list-item-title>{{ t("database.accountType") }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip :color="selectedItem.isBusiness ? 'success' : 'default'" :variant="selectedItem.isBusiness ? 'flat' : 'outlined'" size="small">
                          {{ selectedItem.isBusiness ? t("database.business") : t("database.personal") }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Business Profile -->
                    <v-list-item v-if="selectedItem.businessProfile">
                      <template v-slot:prepend>
                        <v-icon>mdi-briefcase-outline</v-icon>
                      </template>
                      <v-list-item-title>{{ t("database.businessProfile") }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <div v-if="selectedItem.businessProfile.description">
                          <strong>{{ t("database.description") }}:</strong> {{ selectedItem.businessProfile.description }}
                        </div>
                        <div v-if="selectedItem.businessProfile.category">
                          <strong>{{ t("database.category") }}:</strong> {{ selectedItem.businessProfile.category }}
                        </div>
                        <div v-if="selectedItem.businessProfile.email">
                          <strong>{{ t("database.email") }}:</strong> {{ selectedItem.businessProfile.email }}
                        </div>
                        <div v-if="selectedItem.businessProfile.website">
                          <strong>{{ t("database.website") }}:</strong>
                          <a :href="selectedItem.businessProfile.website" target="_blank" class="text-primary">
                            {{ selectedItem.businessProfile.website }}
                          </a>
                        </div>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Date Added -->
                    <v-list-item v-if="selectedItem.date">
                      <template v-slot:prepend>
                        <v-icon>mdi-calendar</v-icon>
                      </template>
                      <v-list-item-title>{{ t("database.dateAdded") }}</v-list-item-title>
                      <v-list-item-subtitle> {{ formatDate(selectedItem.date) }} ({{ formatTimeAgo(selectedItem.date) }}) </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Enterprise Status -->
                    <v-list-item v-if="selectedItem.isEnterprise !== undefined">
                      <template v-slot:prepend>
                        <v-icon>mdi-office-building</v-icon>
                      </template>
                      <v-list-item-title>{{ t("database.enterprise") }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip :color="selectedItem.isEnterprise ? 'info' : 'default'" :variant="selectedItem.isEnterprise ? 'flat' : 'outlined'" size="small">
                          {{ selectedItem.isEnterprise ? t("database.yes") : t("database.no") }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>

            <!-- Raw Data Section -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="d-flex align-center flex-wrap ga-3 pb-4 pb-sm-2">
                    <v-icon class="mr-2">mdi-code-json</v-icon>
                    {{ t("database.rawData") }}
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="outlined" size="small" @click="copyRawData">
                      <v-icon class="mr-2">mdi-content-copy</v-icon>
                      {{ t("database.copyRawData") }}
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <pre class="raw-data-pre">{{ JSON.stringify(selectedItem, null, 2) }}</pre>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-btn color="secondary" variant="outlined" :to="`/${selectedItem.number}`">
              <v-icon class="mr-2">mdi-refresh</v-icon>
              {{ t("database.searchAgain") }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="detailsDialog = false">
              {{ t("database.close") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { phoneCodes } from "~/utils/phoneCodes";

definePageMeta({
  title: "Database Search",
  description: "Search and browse phone number database",
});

// Authentication
const { isAuthenticated, loading: authLoading, user } = useFirebaseAuth();
const { $firebase } = useNuxtApp();

// Rate limit tracking
const rateLimitInfo = ref<{ current: number; limit: number; restartsIn: number } | null>(null);

// Define interface for the phone data item
interface PhoneDataItem {
  _id?: string;
  phone: string;
  number?: string;
  name?: string;
  about?: string;
  countryCode: string;
  isBusiness: boolean;
  isEnterprise?: boolean;
  urlImage?: string;
  profilePic?: string;
  date: string;
  businessProfile?: {
    description?: string;
    category?: string;
    email?: string;
    website?: string;
  };
}

// Reactive data
const searchQuery = ref("");
const loading = ref(false);
const searchResults = ref<PhoneDataItem[]>([]);
const totalResults = ref<number | null>(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Details dialog
const detailsDialog = ref(false);
const selectedItem = ref<PhoneDataItem | null>(null);

// Filters
const filters = ref({
  number: "",
  countryCode: "",
  hasProfilePic: "",
  isBusiness: "",
  dateFrom: "",
  dateTo: "",
  includeCount: true,
});

// Filter options
const businessOptions = [
  { title: "Business", value: "true" },
  { title: "Personal", value: "false" },
];

const profilePicOptions = [
  { title: "Has Profile Picture", value: "true" },
  { title: "No Profile Picture", value: "false" },
];

// Table headers
const headers = [
  { title: "Profile", key: "profilePic", sortable: false, width: "80px" },
  { title: "Phone Number", key: "phone", sortable: false },
  { title: "Country", key: "countryCode", sortable: false, width: "120px" },
  { title: "Type", key: "isBusiness", sortable: false, width: "120px" },
  { title: "About", key: "about", sortable: false, width: "200px" },
  { title: "Date Added", key: "date", sortable: false, width: "150px" },
  { title: "Actions", key: "actions", sortable: false, width: "100px" },
];

// I18n
const { t } = useI18n();
const localePath = useLocalePath();

// Methods
const performSearch = async () => {
  // Don't search if not authenticated
  if (!isAuthenticated.value) {
    return;
  }

  loading.value = true;

  try {
    // Get Firebase ID token for authentication
    const token = await user.value?.getIdToken();

    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      includeCount: "true",
      ...Object.fromEntries(Object.entries(filters.value).filter(([_, value]) => value !== "" && value !== null)),
    };

    const response = await $fetch("/api/search", {
      query: params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.success) {
      searchResults.value = response.data.docs || [];
      totalResults.value = response.data.totalDocs;
      // Update rate limit info if provided
      if (response.rateLimit) {
        rateLimitInfo.value = response.rateLimit;
      }
    } else {
      console.error("Search failed:", response.error);
      searchResults.value = [];
      totalResults.value = 0;

      // Handle rate limit errors
      if (response.statusCode === 429 && response.rateLimit) {
        rateLimitInfo.value = response.rateLimit;
      }

      // Handle authentication errors
      if (response.authRequired || response.statusCode === 401) {
        // Could show a toast or notification here
        console.warn("Authentication required for database access");
      }
    }
  } catch (error: any) {
    console.error("Search error:", error);
    searchResults.value = [];
    totalResults.value = 0;

    // Handle authentication errors from fetch
    if (error.statusCode === 401) {
      console.warn("Authentication required for database access");
    } else if (error.statusCode === 429) {
      console.warn("Rate limit exceeded");
    }
  } finally {
    loading.value = false;
  }
};

const loadItems = ({ page, itemsPerPage: perPage }: { page: number; itemsPerPage: number }) => {
  currentPage.value = page;
  itemsPerPage.value = perPage;
  performSearch();
};

const clearFilters = () => {
  searchQuery.value = "";
  filters.value = {
    number: "",
    countryCode: "",
    hasProfilePic: "",
    isBusiness: "",
    dateFrom: "",
    dateTo: "",
    includeCount: true,
  };
  performSearch();
};

const getCountryFlag = (countryCode: string) => {
  const phoneCode = phoneCodes.find((code) => code.iso === countryCode);
  return phoneCode ? phoneCode.flag : "🏳️";
};

const getCountryName = (countryCode: string) => {
  const phoneCode = phoneCodes.find((code) => code.iso === countryCode);
  return phoneCode ? phoneCode.country : countryCode;
};

const getCountryColor = (countryCode: string) => {
  const colors = ["primary", "secondary", "success", "warning", "info"];
  const index = countryCode.charCodeAt(0) % colors.length;
  return colors[index];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num);
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // You could add a toast notification here
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

// Details dialog methods
const showDetails = (item: PhoneDataItem) => {
  selectedItem.value = item;
  detailsDialog.value = true;
};

const downloadImage = async (imageUrl: string | undefined, fileName: string) => {
  try {
    if (!imageUrl) {
      console.error("No image URL provided");
      return;
    }
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}-profile.jpg`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Failed to download image:", error);
  }
};

const copyRawData = async () => {
  if (selectedItem.value) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedItem.value, null, 2));
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy raw data:", err);
    }
  }
};

// Initialize with a basic search on mount (only if authenticated)
onMounted(async () => {
  // Wait for auth to be ready
  if (authLoading.value) {
    await new Promise((resolve) => {
      const unwatch = watch(authLoading, (loading) => {
        if (!loading) {
          unwatch();
          resolve(void 0);
        }
      });
    });
  }

  // Only perform initial search if user is authenticated
  if (isAuthenticated.value) {
    performSearch();
  }
});
</script>

<style scoped>
.database-page {
  min-height: 100vh;
}

.max-width-200 {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v-data-table {
  border-radius: 8px;
}

.v-card {
  border-radius: 12px;
}

.v-chip {
  font-weight: 500;
}

.raw-data-pre {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  font-family: "Courier New", Courier, monospace;
  font-size: 12px;
  overflow-x: auto;
  max-height: 400px;
  white-space: pre-wrap;
  word-break: break-word;
}

.v-theme--dark .raw-data-pre {
  background-color: #1e1e1e;
  color: #d4d4d4;
}
</style>
