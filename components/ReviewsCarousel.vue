<template>
  <v-container fluid class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Header Section -->
        <div class="text-center mb-3 mb-md-6">
          <h2 class="text-h4 font-weight-bold mb-2">{{ $t("reviews.title") }}</h2>
          <p class="text-subtitle-1 text-medium-emphasis">{{ $t("reviews.subtitle") }}</p>

          <!-- Rating Summary -->
          <div v-if="!pending && !error && data?.data" class="d-flex align-center justify-center mt-4 mb-2">
            <v-rating :model-value="data.data.averageRating" color="amber" density="compact" half-increments readonly size="small"></v-rating>
            <span class="text-h6 ml-2">{{ data.data.averageRating }}/5</span>
            <span class="text-body-2 text-medium-emphasis ml-2"> ({{ data.data.totalReviews }} {{ data.data.totalReviews === 1 ? $t("reviews.review") : $t("reviews.reviews") }}) </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="text-body-1 mt-4">{{ $t("reviews.loading") }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8">
          <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
          <p class="text-body-1 text-error">{{ $t("reviews.failed") }}</p>
          <v-btn color="primary" variant="outlined" @click="refresh()" class="mt-2"> {{ $t("reviews.tryAgain") }} </v-btn>
        </div>

        <!-- Reviews Carousel -->
        <div v-else-if="data?.data && data.data.reviews.length > 0">
          <div class="d-flex align-center">
            <!-- Left Arrow (Desktop only) -->
            <v-btn v-if="!mobile && data.data.reviews.length > reviewsPerSlide" @click="previousSlide" icon="mdi-chevron-left" variant="text" size="small" class="me-4 opacity-60"></v-btn>

            <!-- Carousel Container -->
            <div class="flex-grow-1">
              <v-carousel v-model="currentSlide" :show-arrows="mobile && data.data.reviews.length > reviewsPerSlide" hide-delimiter-background hide-delimiters :height="carouselHeight" interval="5000" cycle continuous class="rounded">
                <!-- Custom Arrow Templates for Mobile -->
                <template v-if="mobile" #prev="{ props }">
                  <v-btn v-bind="props" icon="mdi-chevron-left" variant="text" size="small" class="opacity-60"></v-btn>
                </template>

                <template v-if="mobile" #next="{ props }">
                  <v-btn v-bind="props" icon="mdi-chevron-right" variant="text" size="small" class="opacity-60"></v-btn>
                </template>
                <!-- Group reviews by slides (responsive) -->
                <v-carousel-item v-for="(slideReviews, slideIndex) in groupedReviews" :key="`slide-${slideIndex}`">
                  <v-container class="pa-4" style="height: 100%">
                    <v-row class="h-100">
                      <v-col v-for="(review, reviewIndex) in slideReviews" :key="`${review.id}-${slideIndex}-${reviewIndex}`" cols="12" :md="reviewsPerSlide > 1 ? '6' : '12'" :lg="reviewsPerSlide > 2 ? '4' : reviewsPerSlide > 1 ? '6' : '12'" class="d-flex">
                        <v-card elevation="2" class="h-100 d-flex flex-column w-100">
                          <v-card-text class="flex-grow-1">
                            <!-- Rating -->
                            <div class="d-flex align-center justify-space-between mb-3">
                              <v-rating :model-value="review.rating" color="amber" size="small" readonly density="compact"></v-rating>
                              <v-chip v-if="review.isVerified" color="success" size="small" variant="tonal"> {{ $t("reviews.verified") }} </v-chip>
                            </div>

                            <!-- Review Title -->
                            <h5 class="text-h6 mb-2 text-secondary">
                              {{ review.title }}
                            </h5>

                            <!-- Review Text -->
                            <p class="text-body-2 mb-3">
                              {{ review.text }}
                            </p>
                          </v-card-text>

                          <v-card-actions class="pt-0">
                            <div class="d-flex align-center w-100">
                              <!-- Author Info -->
                              <v-avatar size="32" color="primary" class="mr-2">
                                <span class="text-caption font-weight-bold">
                                  {{ getInitials(review.author) }}
                                </span>
                              </v-avatar>
                              <div class="flex-grow-1">
                                <div class="text-subtitle-2 font-weight-medium">
                                  {{ review.author }}
                                </div>
                                <ClientOnly>
                                  <div class="text-caption text-medium-emphasis">{{ getCountryName(review.country) }} • {{ formatDate(review.date) }}</div>
                                </ClientOnly>
                              </div>
                              <v-chip size="x-small" variant="text" color="primary">
                                {{ review.source }}
                              </v-chip>
                            </div>
                          </v-card-actions>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-carousel-item>
              </v-carousel>
            </div>

            <!-- Right Arrow (Desktop only) -->
            <v-btn v-if="!mobile && data.data.reviews.length > reviewsPerSlide" @click="nextSlide" icon="mdi-chevron-right" variant="text" size="small" class="ms-4 opacity-60"></v-btn>
          </div>

          <!-- View All Reviews Link -->
          <div class="text-center mt-4">
            <v-btn v-if="data?.data?.trustpilotUrl" :href="data.data.trustpilotUrl" target="_blank" rel="noopener noreferrer" color="primary" variant="outlined" append-icon="mdi-open-in-new"> {{ $t("reviews.viewAll") }} </v-btn>
          </div>
        </div>

        <!-- No Reviews State -->
        <div v-else class="text-center py-8">
          <v-icon color="info" size="64" class="mb-4">mdi-comment-text-outline</v-icon>
          <p class="text-body-1">{{ $t("reviews.noReviews") }}</p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useDisplay } from "vuetify";

// Composables
const { mobile, mdAndDown } = useDisplay();
const { t } = useI18n();

// Types
interface ReviewSummary {
  id: string;
  rating: number;
  title: string;
  text: string;
  author: string;
  country: string;
  date: string;
  isVerified: boolean;
  source: string;
}

interface ReviewsData {
  domain: string;
  trustpilotUrl: string;
  businessName: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    total: number;
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
  };
  reviews: ReviewSummary[];
}

interface ReviewsResponse {
  success: boolean;
  data: ReviewsData | null;
  error?: string;
}

// Data fetching - server-side first, then client-side updates
const { data, pending, error, refresh } = await useLazyFetch<ReviewsResponse>("/api/reviews", {
  server: true, // Enable server-side rendering for prerendered pages
  default: () => null, // Default value while loading
});

// Client-side refresh to get latest data after initial load
onMounted(() => {
  // Refresh data on client-side to ensure fresh content
  if (import.meta.client) {
    refresh();
  }
});

// Reactive data
const currentSlide = ref(0);

// Computed properties
const reviewsPerSlide = computed(() => {
  if (mobile.value) return 1;
  if (mdAndDown.value) return 2;
  return 3;
});

const groupedReviews = computed(() => {
  if (!data.value?.data?.reviews) return [];

  const reviews = data.value.data.reviews;
  const perSlide = reviewsPerSlide.value;

  // If we have fewer reviews than needed for smooth infinite scroll, duplicate them
  let extendedReviews = [...reviews];

  // Calculate minimum reviews needed for smooth infinite scroll (at least 3 full slides)
  const minReviewsNeeded = perSlide * 3;

  // Duplicate reviews until we have enough for smooth scrolling
  while (extendedReviews.length < minReviewsNeeded) {
    extendedReviews = [...extendedReviews, ...reviews];
  }

  // Group into slides
  const groups = [];
  for (let i = 0; i < extendedReviews.length; i += perSlide) {
    const toAdd = extendedReviews.slice(i, i + perSlide);
    if (toAdd.length === perSlide) {
      groups.push(toAdd);
    }
  }

  return groups;
});

// Computed property for consistent carousel height
const carouselHeight = computed(() => {
  // Fixed height to prevent jumping between slides
  if (mobile.value) return "380px";
  if (mdAndDown.value) return "320px";
  return "300px";
});

// Methods for external arrow navigation
const previousSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + groupedReviews.value.length) % groupedReviews.value.length;
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % groupedReviews.value.length;
};

// Methods
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const getCountryName = (countryCode: string): string => {
  // Simple country code mapping - can be expanded as needed
  const countryObj = phoneCodes.find((c) => c.code === countryCode);
  if (!countryObj) return countryCode;

  return t(countryObj.country);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return t("reviews.daysAgo", { count: 1 });
  if (diffDays < 7) return t("reviews.daysAgo", { count: diffDays });
  if (diffDays < 30) {
    const weeks = Math.ceil(diffDays / 7);
    return t("reviews.weeksAgo", { count: weeks });
  }
  if (diffDays < 365) {
    const months = Math.ceil(diffDays / 30);
    return t("reviews.monthsAgo", { count: months });
  }

  return date.toLocaleDateString();
};
</script>
