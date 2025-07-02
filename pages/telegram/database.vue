<template>
  <div class="database-page">
    <v-container>
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="mb-2">
          <v-icon class="mr-3" size="40">mdi-telegram</v-icon>
          Telegram Database
        </h1>
        <p class="text-h6 text-medium-emphasis">Search and explore our comprehensive Telegram database</p>
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
        <!-- Error Alert -->
        <v-alert v-if="errorMessage" type="error" dismissible class="mb-6" @input="errorMessage = null">
          <v-icon class="mr-2">mdi-alert-circle</v-icon>
          <strong>Error:</strong> {{ errorMessage }}
        </v-alert>

        <!-- Search and Filters Card -->
        <v-form @submit.prevent="submitSearch(true)">
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
                  <v-text-field v-model="searchQuery" label="Search by username, name, or description..." prepend-inner-icon="mdi-magnify" variant="outlined" clearable @click:clear="clearSearchQuery"></v-text-field>
                </v-col>

                <!-- Phone Number Filter -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="filters.number" :label="t('database.phoneNumber')" prepend-inner-icon="mdi-phone" variant="outlined" clearable @click:clear="clearNumberFilter"></v-text-field>
                </v-col>

                <!-- Username Filter -->
                <v-col cols="12" md="4">
                  <v-text-field v-model="filters.username" label="Username" prepend-inner-icon="mdi-at" variant="outlined" clearable></v-text-field>
                </v-col>

                <!-- First Name Filter -->
                <v-col cols="12" md="4">
                  <v-text-field v-model="filters.firstName" label="First Name" prepend-inner-icon="mdi-account" variant="outlined" clearable></v-text-field>
                </v-col>

                <!-- Last Name Filter -->
                <v-col cols="12" md="4">
                  <v-text-field v-model="filters.lastName" label="Last Name" prepend-inner-icon="mdi-account-outline" variant="outlined" clearable></v-text-field>
                </v-col>

                <!-- Country Code Filter -->
                <v-col cols="12" md="3">
                  <v-autocomplete v-model="filters.countryCode" :label="t('database.countryCode')" :items="phoneCodes" item-title="country" item-value="iso" prepend-inner-icon="mdi-flag" variant="outlined" clearable auto-select-first>
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props" :title="`${item.raw.flag} ${item.raw.country} (${item.raw.iso})`"></v-list-item>
                    </template>
                    <template v-slot:selection="{ item }">
                      <span>{{ item.raw.flag }} {{ item.raw.country }}</span>
                    </template>
                  </v-autocomplete>
                </v-col>

                <!-- Account Type Filter -->
                <v-col cols="12" md="3">
                  <v-select v-model="filters.isPremium" :items="premiumOptions" label="Account Type" prepend-inner-icon="mdi-star" variant="outlined" clearable></v-select>
                </v-col>

                <!-- Verification Status Filter -->
                <v-col cols="12" md="3">
                  <v-select v-model="filters.isVerified" :items="verifiedOptions" label="Verification Status" prepend-inner-icon="mdi-check-decagram" variant="outlined" clearable></v-select>
                </v-col>

                <!-- Bot Status Filter -->
                <v-col cols="12" md="3">
                  <v-select v-model="filters.isBot" :items="botOptions" label="Bot Status" prepend-inner-icon="mdi-robot" variant="outlined" clearable></v-select>
                </v-col>

                <!-- Profile Picture Filter -->
                <v-col cols="12" md="3">
                  <v-select v-model="filters.hasPhoto" :items="profilePicOptions" :label="t('database.hasProfilePic')" prepend-inner-icon="mdi-account-circle" variant="outlined" clearable></v-select>
                </v-col>

                <!-- Date Range -->
                <v-col cols="12" md="3">
                  <v-text-field v-model="filters.dateFrom" :label="t('database.dateFrom')" type="date" prepend-inner-icon="mdi-calendar-start" variant="outlined" clearable></v-text-field>
                </v-col>
              </v-row>

              <!-- Action Buttons -->
              <v-row>
                <v-col cols="12" class="text-right d-flex ga-3 flex-wrap justify-end">
                  <v-btn type="button" color="secondary" variant="outlined" class="mr-3" @click="clearFilters">
                    <v-icon class="mr-2">mdi-filter-off</v-icon>
                    {{ t("database.clearFilters") }}
                  </v-btn>
                  <v-btn type="submit" color="primary" :loading="loading">
                    <v-icon class="mr-2">mdi-magnify</v-icon>
                    {{ t("database.search") }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-form>

        <!-- Results Data Table -->
        <v-card elevation="4">
          <v-card-title class="d-flex align-center flex-wrap ga-3">
            <v-icon class="mr-2">mdi-table</v-icon>
            {{ t("database.results") }}
            <v-spacer></v-spacer>
          </v-card-title>

          <v-data-table-server :mobile="mobile" v-model:items-per-page="itemsPerPage" v-model:page="currentPage" :headers="headers" :items="searchResults" :items-length="hasMorePages ? currentPage * itemsPerPage + 1 : (currentPage - 1) * itemsPerPage + searchResults.length" :loading="loading" class="elevation-1" item-value="_id" show-current-page @update:options="loadItems">
            <!-- Profile Picture Column -->
            <template v-slot:item.profilePic="{ item }">
              <div class="d-flex align-center py-2 justify-end">
                <v-avatar :size="mobile ? 120 : 40" class="mr-3" :class="{ 'cursor-pointer': item.photoUrl || item.urlImage || item.profilePic }" @click="item.photoUrl || item.urlImage || item.profilePic ? showFullImage(item.photoUrl || item?.urlImage || item?.profilePic || '', item.phone || item.username || '') : null">
                  <v-img v-if="item.photoUrl || item.urlImage || item.profilePic" :src="item.photoUrl || item.urlImage || item.profilePic" lazy-src="/placeholder.png" height="100%" :alt="item.phone || item.username" cover>
                    <template v-slot:error>
                      <v-icon>mdi-account-circle</v-icon>
                    </template>
                  </v-img>
                  <v-icon :size="mobile ? 120 : 40" v-else>mdi-account-circle</v-icon>
                </v-avatar>
              </div>
            </template>

            <!-- Username/Phone Column -->
            <template v-slot:item.identifier="{ item }">
              <div class="d-flex flex-column">
                <span v-if="item.username" class="font-weight-bold">@{{ item.username }}</span>
                <span v-if="item.phone" class="font-weight-bold">{{ item.phone }}</span>
                <span v-if="item.first_name || item.last_name" class="text-caption text-medium-emphasis">{{ item.first_name }} {{ item.last_name }}</span>
              </div>
            </template>

            <!-- Country Column -->
            <template v-slot:item.countryCode="{ item }">
              <v-chip v-if="item.countryCode" :color="getCountryColor(item.countryCode)" variant="outlined" size="small" class="mr-2"> {{ getCountryFlag(item.countryCode) }} {{ item.countryCode }} </v-chip>
              <span v-else class="text-caption text-medium-emphasis">N/A</span>
            </template>

            <!-- Status Column -->
            <template v-slot:item.status="{ item }">
              <div class="d-flex flex-column ga-1">
                <v-chip v-if="item.verified" color="success" variant="flat" size="small">
                  <v-icon class="mr-1" size="16">mdi-check-decagram</v-icon>
                  Verified
                </v-chip>
                <v-chip v-if="item.premium" color="warning" variant="flat" size="small">
                  <v-icon class="mr-1" size="16">mdi-star</v-icon>
                  Premium
                </v-chip>
                <v-chip v-if="item.bot" color="info" variant="flat" size="small">
                  <v-icon class="mr-1" size="16">mdi-robot</v-icon>
                  Bot
                </v-chip>
              </div>
            </template>

            <!-- About/Description Column -->
            <template v-slot:item.about="{ item }">
              <div class="max-width-200 ml-auto">
                <span v-if="item.about" class="text-body-2">{{ item.about }}</span>
                <span v-else-if="item.bio" class="text-body-2">{{ item.bio }}</span>
                <span v-else class="text-caption text-medium-emphasis">{{ t("database.noDescription") }}</span>
              </div>
            </template>

            <!-- Date Column -->
            <template v-slot:item.date="{ item }">
              <div class="d-flex flex-column py-1">
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
                <v-btn v-if="item.phone" icon size="small" variant="text" @click="copyToClipboard(item.phone)">
                  <v-icon>mdi-content-copy</v-icon>
                  <v-tooltip activator="parent">{{ t("database.copyPhone") }}</v-tooltip>
                </v-btn>
                <v-btn v-if="item.username" icon size="small" variant="text" @click="copyToClipboard(item.username)">
                  <v-icon>mdi-at</v-icon>
                  <v-tooltip activator="parent">Copy Username</v-tooltip>
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
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-telegram</v-icon>
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
                    <div v-if="selectedItem.photoUrl || selectedItem.urlImage || selectedItem.profilePic" class="mb-3">
                      <v-img :src="selectedItem.photoUrl || selectedItem.urlImage || selectedItem.profilePic" :alt="selectedItem.phone || selectedItem.username" max-height="300" max-width="300" class="mx-auto rounded cursor-pointer" contain @click="showFullImage(selectedItem.photoUrl || selectedItem?.urlImage || selectedItem?.profilePic || '', selectedItem.phone || selectedItem.username || '')">
                        <template v-slot:error>
                          <div class="d-flex align-center justify-center fill-height">
                            <v-icon size="100" color="grey-lighten-2">mdi-account-circle</v-icon>
                          </div>
                        </template>
                      </v-img>
                      <v-btn v-if="selectedItem.photoUrl || selectedItem.urlImage || selectedItem.profilePic" color="primary" variant="outlined" class="mt-3" @click="downloadImage(selectedItem.photoUrl || selectedItem.urlImage || selectedItem.profilePic || '', selectedItem.phone || selectedItem.username || '')"
                        >>
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
                    <!-- Username -->
                    <v-list-item v-if="selectedItem.username">
                      <template v-slot:prepend>
                        <v-icon>mdi-at</v-icon>
                      </template>
                      <v-list-item-title>Username</v-list-item-title>
                      <v-list-item-subtitle class="font-weight-medium">@{{ selectedItem.username }}</v-list-item-subtitle>
                      <template v-slot:append>
                        <v-btn icon size="small" variant="text" @click="copyToClipboard(selectedItem.username)">
                          <v-icon>mdi-content-copy</v-icon>
                        </v-btn>
                      </template>
                    </v-list-item>

                    <!-- Phone Number -->
                    <v-list-item v-if="selectedItem.phone">
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

                    <!-- First Name -->
                    <v-list-item v-if="selectedItem.first_name">
                      <template v-slot:prepend>
                        <v-icon>mdi-account</v-icon>
                      </template>
                      <v-list-item-title>First Name</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedItem.first_name }}</v-list-item-subtitle>
                    </v-list-item>

                    <!-- Last Name -->
                    <v-list-item v-if="selectedItem.last_name">
                      <template v-slot:prepend>
                        <v-icon>mdi-account-outline</v-icon>
                      </template>
                      <v-list-item-title>Last Name</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedItem.last_name }}</v-list-item-subtitle>
                    </v-list-item>

                    <!-- About/Bio -->
                    <v-list-item v-if="selectedItem.about || selectedItem.bio">
                      <template v-slot:prepend>
                        <v-icon>mdi-information-outline</v-icon>
                      </template>
                      <v-list-item-title>{{ t("database.about") }}</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedItem.about || selectedItem.bio }}</v-list-item-subtitle>
                    </v-list-item>

                    <!-- Country -->
                    <v-list-item v-if="selectedItem.countryCode">
                      <template v-slot:prepend>
                        <v-icon>mdi-flag</v-icon>
                      </template>
                      <v-list-item-title>{{ t("database.country") }}</v-list-item-title>
                      <v-list-item-subtitle> {{ getCountryFlag(selectedItem.countryCode) }} {{ getCountryName(selectedItem.countryCode) }} ({{ selectedItem.countryCode }}) </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Verification Status -->
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-check-decagram</v-icon>
                      </template>
                      <v-list-item-title>Verification Status</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip :color="selectedItem.verified ? 'success' : 'default'" :variant="selectedItem.verified ? 'flat' : 'outlined'" size="small">
                          {{ selectedItem.verified ? "Verified" : "Not Verified" }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Premium Status -->
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-star</v-icon>
                      </template>
                      <v-list-item-title>Premium Status</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip :color="selectedItem.premium ? 'warning' : 'default'" :variant="selectedItem.premium ? 'flat' : 'outlined'" size="small">
                          {{ selectedItem.premium ? "Premium" : "Regular" }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Bot Status -->
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-robot</v-icon>
                      </template>
                      <v-list-item-title>Bot Status</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip :color="selectedItem.bot ? 'info' : 'default'" :variant="selectedItem.bot ? 'flat' : 'outlined'" size="small">
                          {{ selectedItem.bot ? "Bot" : "User" }}
                        </v-chip>
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

                    <!-- Last Seen -->
                    <v-list-item v-if="selectedItem.user_was_online">
                      <template v-slot:prepend>
                        <v-icon>mdi-clock-outline</v-icon>
                      </template>
                      <v-list-item-title>Last Seen</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedItem.user_was_online }}</v-list-item-subtitle>
                    </v-list-item>

                    <!-- Telegram ID -->
                    <v-list-item v-if="selectedItem.id">
                      <template v-slot:prepend>
                        <v-icon>mdi-identifier</v-icon>
                      </template>
                      <v-list-item-title>Telegram ID</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedItem.id }}</v-list-item-subtitle>
                      <template v-slot:append>
                        <v-btn icon size="small" variant="text" @click="copyToClipboard(selectedItem.id.toString())">
                          <v-icon>mdi-content-copy</v-icon>
                        </v-btn>
                      </template>
                    </v-list-item>

                    <!-- Error Status -->
                    <v-list-item v-if="selectedItem.error">
                      <template v-slot:prepend>
                        <v-icon color="warning">mdi-alert-circle</v-icon>
                      </template>
                      <v-list-item-title>Status</v-list-item-title>
                      <v-list-item-subtitle class="text-warning">{{ selectedItem.error }}</v-list-item-subtitle>
                    </v-list-item>

                    <!-- Photo URL -->
                    <v-list-item v-if="selectedItem.photoUrl">
                      <template v-slot:prepend>
                        <v-icon>mdi-image</v-icon>
                      </template>
                      <v-list-item-title>Photo URL</v-list-item-title>
                      <v-list-item-subtitle class="text-truncate">{{ selectedItem.photoUrl }}</v-list-item-subtitle>
                      <template v-slot:append>
                        <v-btn icon size="small" variant="text" @click="copyToClipboard(selectedItem.photoUrl)">
                          <v-icon>mdi-content-copy</v-icon>
                        </v-btn>
                      </template>
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
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="detailsDialog = false">
              {{ t("database.close") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Full Image Dialog -->
      <FullImageDialog v-model="fullImageDialog" :image-url="fullImageData.url" :phone-number="fullImageData.phoneNumber" @download="downloadImage" />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import { phoneCodes } from "~/utils/phoneCodes";

definePageMeta({
  title: "Telegram Database Search",
  description: "Search and browse Telegram database",
});

// Authentication
const { isAuthenticated, loading: authLoading, user } = useFirebaseAuth();
const { $firebase } = useNuxtApp();
const { mobile } = useDisplay();

// Router and route for query parameters
const route = useRoute();
const router = useRouter();

// Rate limit tracking
const rateLimitInfo = ref<{ current: number; limit: number; restartsIn: number } | null>(null);

// Define interface for the telegram data item based on actual API response
interface TelegramDataItem {
  _id?: string;
  number?: string; // Phone number without formatting
  phone?: string; // Formatted phone number with country code
  username?: string;
  first_name?: string;
  last_name?: string;
  about?: string;
  bio?: string;
  countryCode?: string;
  bot?: boolean; // Note: API uses 'bot' not 'isBot'
  verified?: boolean; // Note: API uses 'verified' not 'isVerified'
  premium?: boolean; // Note: API uses 'premium' not 'isPremium'
  hasPhoto?: boolean; // API uses 'hasPhoto' for profile picture presence
  photoUrl?: string; // New: Direct URL to profile photo
  urlImage?: string;
  profilePic?: string;
  date: string;
  id?: number; // Telegram user ID
  fake?: boolean;
  restricted?: boolean;
  restriction_reason?: string | null;
  mutual_contact?: boolean;
  user_was_online?: string;
  usernames?: string[] | null;
  bot_chat_history?: boolean;
  error?: string;
  type?: string | null;
}

// Reactive data - initialize from query parameters
const searchQuery = ref((route.query.search as string) || "");
const loading = ref(false);
const searchResults = ref<TelegramDataItem[]>([]);
const currentPage = ref(parseInt(route.query.page as string) || 1);
const itemsPerPage = ref(parseInt(route.query.limit as string) || 10);
const hasMorePages = ref(true); // Track if there are more pages available
const errorMessage = ref<string | null>(null); // Track error messages

// Details dialog
const detailsDialog = ref(false);
const selectedItem = ref<TelegramDataItem | null>(null);

// Full image dialog
const fullImageDialog = ref(false);
const fullImageData = ref({ url: "", phoneNumber: "" });

// Filters - initialize from query parameters
const filters = ref({
  number: (route.query.number as string) || "",
  username: (route.query.username as string) || "",
  firstName: (route.query.firstName as string) || "",
  lastName: (route.query.lastName as string) || "",
  countryCode: (route.query.countryCode as string) || "",
  hasPhoto: (route.query.hasPhoto as string) || "",
  isBot: (route.query.isBot as string) || "", // Will be mapped to 'bot' in API call
  isVerified: (route.query.isVerified as string) || "", // Will be mapped to 'verified' in API call
  isPremium: (route.query.isPremium as string) || "", // Will be mapped to 'premium' in API call
  dateFrom: (route.query.dateFrom as string) || "",
  dateTo: (route.query.dateTo as string) || "",
  includeCount: true,
});

// Filter options
const premiumOptions = [
  { title: "Premium", value: "true" },
  { title: "Regular", value: "false" },
];

const verifiedOptions = [
  { title: "Verified", value: "true" },
  { title: "Not Verified", value: "false" },
];

const botOptions = [
  { title: "Bot", value: "true" },
  { title: "User", value: "false" },
];

const profilePicOptions = [
  { title: "Has Profile Picture", value: "true" },
  { title: "No Profile Picture", value: "false" },
];

// Table headers
const headers = [
  { title: "Profile", key: "profilePic", sortable: false, width: "80px" },
  { title: "Username/Phone", key: "identifier", sortable: false },
  { title: "Country", key: "countryCode", sortable: false, width: "120px" },
  { title: "Status", key: "status", sortable: false, width: "120px" },
  { title: "About", key: "about", sortable: false, width: "200px" },
  { title: "Date Added", key: "date", sortable: false, width: "150px" },
  { title: "Actions", key: "actions", sortable: false, width: "100px" },
];

// I18n
const { t } = useI18n();
const localePath = useLocalePath();

// Methods
const updateQueryParams = () => {
  const query: Record<string, string> = {};

  // Add search query if not empty
  if (searchQuery.value) {
    query.search = searchQuery.value;
  }

  // Add pagination
  if (currentPage.value > 1) {
    query.page = currentPage.value.toString();
  }
  if (itemsPerPage.value !== 10) {
    query.limit = itemsPerPage.value.toString();
  }

  // Add filters if not empty
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value && key !== "includeCount") {
      query[key] = value.toString();
    }
  });

  // Update URL without triggering navigation
  router.push({ query });
};

const submitSearch = (resetPage = false) => {
  if (resetPage) {
    currentPage.value = 1;
  }
  if (!isAuthenticated.value) {
    return;
  }
  // Update query parameters first
  updateQueryParams();
};

const performSearch = async (resetPage = false) => {
  // Don't search if not authenticated
  if (!isAuthenticated.value) {
    return;
  }

  // Reset to page 1 if explicitly requested (when search button is clicked)
  if (resetPage) {
    currentPage.value = 1;
  }

  loading.value = true;

  try {
    // Clear any previous error messages
    errorMessage.value = null;

    // Get Firebase ID token for authentication
    const token = await user.value?.getIdToken();

    // Map filter parameters to match API expectations
    const apiParams: Record<string, any> = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      includeCount: "false", // Don't include count to hide total results
    };

    // Add filters with correct parameter names
    if (filters.value.number) apiParams.number = filters.value.number;
    if (filters.value.username) apiParams.username = filters.value.username;
    if (filters.value.firstName) apiParams.firstName = filters.value.firstName;
    if (filters.value.lastName) apiParams.lastName = filters.value.lastName;
    if (filters.value.countryCode) apiParams.countryCode = filters.value.countryCode;
    if (filters.value.hasPhoto) apiParams.hasPhoto = filters.value.hasPhoto;
    if (filters.value.isBot) apiParams.isBot = filters.value.isBot; // API expects 'isBot'
    if (filters.value.isVerified) apiParams.isVerified = filters.value.isVerified; // API expects 'isVerified'
    if (filters.value.isPremium) apiParams.isPremium = filters.value.isPremium; // API expects 'isPremium'
    if (filters.value.dateFrom) apiParams.dateFrom = filters.value.dateFrom;
    if (filters.value.dateTo) apiParams.dateTo = filters.value.dateTo;

    const response = await $fetch("/api/telegram/search", {
      query: apiParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(async (e) => {
      // Handle fetch errors
      console.error("Fetch error:", e);
      if (e?.response?.status === 403) {
        const { bypassServiceWorkerRedirect } = await import("~/utils/bypassServiceWorker");
        bypassServiceWorkerRedirect("/api/refresh");
      }
      return {
        success: false,
        error: e.message || "An unexpected error occurred. Please try again.",
        statusCode: e?.response?.status || 500,
      };
    });

    if (response.success) {
      const docs = response.data.docs || [];

      // If current page is empty and we're not on page 1, go back to previous page
      if (docs.length === 0 && currentPage.value > 1) {
        currentPage.value = currentPage.value - 1;
        hasMorePages.value = false; // No more pages after this
        updateQueryParams();
        return;
      }

      searchResults.value = docs;

      // Determine if there are more pages by checking if we got a full page
      // If we got fewer items than requested, there are no more pages
      hasMorePages.value = docs.length === itemsPerPage.value;

      // Update rate limit info if provided
      if (response.rateLimit) {
        rateLimitInfo.value = response.rateLimit;
      }
    } else {
      console.error("Search failed:", response.error);
      errorMessage.value = response.error || "Search failed. Please try again.";
      searchResults.value = [];
      hasMorePages.value = false;

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
  } catch (e: any) {
    console.error("Search error:", e);
    errorMessage.value = e.message || e?.response?.statusText || "An unexpected error occurred. Please try again.";
    searchResults.value = [];
    hasMorePages.value = false;

    // Handle authentication errors from fetch
    if (e?.response?.status === 401) {
      console.warn("Authentication required for database access");
    } else if (e?.response?.status === 429) {
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
  errorMessage.value = null; // Clear any error messages
  filters.value = {
    number: "",
    username: "",
    firstName: "",
    lastName: "",
    countryCode: "",
    hasPhoto: "",
    isBot: "",
    isVerified: "",
    isPremium: "",
    dateFrom: "",
    dateTo: "",
    includeCount: true,
  };
  currentPage.value = 1;
  itemsPerPage.value = 10;

  // Clear query parameters
  router.push({ query: {} });
};

const clearSearchQuery = () => {
  searchQuery.value = "";
  updateQueryParams();
};

const clearNumberFilter = () => {
  filters.value.number = "";
  updateQueryParams();
};

const getCountryFlag = (countryCode?: string) => {
  if (!countryCode) return "🏳️";
  const phoneCode = phoneCodes.find((code) => code.iso === countryCode);
  return phoneCode ? phoneCode.flag : "🏳️";
};

const getCountryName = (countryCode?: string) => {
  if (!countryCode) return countryCode;
  const phoneCode = phoneCodes.find((code) => code.iso === countryCode);
  return phoneCode ? phoneCode.country : countryCode;
};

const getCountryColor = (countryCode?: string) => {
  if (!countryCode) return "default";
  const colors = ["primary", "secondary", "success", "warning", "info"];
  const index = countryCode.charCodeAt(0) % colors.length;
  return colors[index];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());

  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;
  if (diffYears === 1) return "1 year ago";
  return `${diffYears} years ago`;
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
const showDetails = (item: TelegramDataItem) => {
  selectedItem.value = item;
  detailsDialog.value = true;
};

const showFullImage = (imageUrl: string | undefined, phoneNumber: string) => {
  if (!imageUrl) return;
  fullImageData.value = { url: imageUrl, phoneNumber };
  fullImageDialog.value = true;
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

// Watch for route query changes (for browser back/forward navigation)
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // Only update if the query actually changed (prevent infinite loops)
    if (JSON.stringify(newQuery) === JSON.stringify(oldQuery)) {
      return;
    }

    // Update reactive state from query parameters
    searchQuery.value = (newQuery.search as string) || "";
    currentPage.value = parseInt(newQuery.page as string) || 1;
    itemsPerPage.value = parseInt(newQuery.limit as string) || 10;

    filters.value = {
      number: (newQuery.number as string) || "",
      username: (newQuery.username as string) || "",
      firstName: (newQuery.firstName as string) || "",
      lastName: (newQuery.lastName as string) || "",
      countryCode: (newQuery.countryCode as string) || "",
      hasPhoto: (newQuery.hasPhoto as string) || "",
      isBot: (newQuery.isBot as string) || "",
      isVerified: (newQuery.isVerified as string) || "",
      isPremium: (newQuery.isPremium as string) || "",
      dateFrom: (newQuery.dateFrom as string) || "",
      dateTo: (newQuery.dateTo as string) || "",
      includeCount: true,
    };

    // Perform search if authenticated (but don't update query params again)
    if (isAuthenticated.value) {
      loading.value = true;

      // Perform search without updating query params to avoid infinite loop
      const performSearchWithoutUrlUpdate = async () => {
        try {
          // Clear any previous error messages
          errorMessage.value = null;

          const token = await user.value?.getIdToken();

          // Map filter parameters to match API expectations
          const apiParams: Record<string, any> = {
            page: currentPage.value,
            limit: itemsPerPage.value,
            search: searchQuery.value,
            includeCount: "false",
          };

          // Add filters with correct parameter names
          if (filters.value.number) apiParams.number = filters.value.number;
          if (filters.value.username) apiParams.username = filters.value.username;
          if (filters.value.firstName) apiParams.firstName = filters.value.firstName;
          if (filters.value.lastName) apiParams.lastName = filters.value.lastName;
          if (filters.value.countryCode) apiParams.countryCode = filters.value.countryCode;
          if (filters.value.hasPhoto) apiParams.hasPhoto = filters.value.hasPhoto;
          if (filters.value.isBot) apiParams.isBot = filters.value.isBot;
          if (filters.value.isVerified) apiParams.isVerified = filters.value.isVerified;
          if (filters.value.isPremium) apiParams.isPremium = filters.value.isPremium;
          if (filters.value.dateFrom) apiParams.dateFrom = filters.value.dateFrom;
          if (filters.value.dateTo) apiParams.dateTo = filters.value.dateTo;

          const response = await $fetch("/api/telegram/search", {
            query: apiParams,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).catch(async (e) => {
            // Handle fetch errors
            console.error("Fetch error:", e);
            if (e?.response?.status === 403) {
              const { bypassServiceWorkerRedirect } = await import("~/utils/bypassServiceWorker");
              bypassServiceWorkerRedirect("/api/refresh");
            }
            return {
              success: false,
              error: e.message || "An unexpected error occurred. Please try again.",
              statusCode: e?.response?.status || 500,
            };
          });

          if (response.success) {
            searchResults.value = response.data.docs || [];

            // Determine if there are more pages by checking if we got a full page
            hasMorePages.value = (response.data.docs || []).length === itemsPerPage.value;

            if (response.rateLimit) {
              rateLimitInfo.value = response.rateLimit;
            }
          } else {
            console.error("Search failed:", response.error);
            errorMessage.value = response.error || "Search failed. Please try again.";
            searchResults.value = [];
            hasMorePages.value = false;

            if (response.statusCode === 429 && response.rateLimit) {
              rateLimitInfo.value = response.rateLimit;
            }

            if (response.authRequired || response.statusCode === 401) {
              console.warn("Authentication required for database access");
            }
          }
        } catch (e: any) {
          console.error("Search error:", e);
          errorMessage.value = e.message || e.statusText || "An unexpected error occurred. Please try again.";
          searchResults.value = [];
          hasMorePages.value = false;

          if (e?.response?.status === 401) {
            console.warn("Authentication required for database access");
          } else if (e?.response?.status === 429) {
            console.warn("Rate limit exceeded");
          }
        } finally {
          loading.value = false;
        }
      };

      performSearchWithoutUrlUpdate();
    }
  },
  { deep: true }
);
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

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
  transition: opacity 0.2s;
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

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}
</style>
