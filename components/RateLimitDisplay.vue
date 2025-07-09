<template>
  <v-card :loading="rateLimitLoading" :elevation="2" class="rate-limit-card mx-auto mb-4" max-width="600" :color="cardColor" variant="outlined">
    <v-card-text class="py-3">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon :color="iconColor" class="me-2">{{ statusIcon }}</v-icon>
          <span class="text-body-2 font-weight-medium">{{ $t("lookup.rateLimitInfo") }}</span>
        </div>

        <v-btn
          v-if="!expanded"
          :loading="rateLimitLoading"
          size="x-small"
          variant="text"
          @click="
            expanded = true;
            fetchRateLimitInfo();
          "
        >
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>

        <v-btn v-else size="x-small" variant="text" @click="expanded = false">
          <v-icon>mdi-chevron-up</v-icon>
        </v-btn>
      </div>

      <v-expand-transition>
        <div v-if="expanded" class="mt-3">
          <div class="rate-limit-details">
            <!-- Rate limit type indicator -->
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">{{ $t("lookup.rateLimitType") }}:</span>
              <v-chip size="x-small" :color="effectiveRateLimitInfo?.isApiKey ? 'primary' : 'secondary'">
                {{ effectiveRateLimitInfo?.isApiKey ? $t("lookup.rateLimitApiKey") : $t("lookup.rateLimitIp") }}
              </v-chip>
            </div>

            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">{{ $t("lookup.rateLimitCurrent") }}:</span>
              <span class="text-body-2 font-weight-bold">{{ effectiveRateLimitInfo?.current }}/{{ effectiveRateLimitInfo?.maximum }}</span>
            </div>

            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">{{ $t("lookup.rateLimitRemaining") }}:</span>
              <span class="text-body-2 font-weight-bold" :class="remainingColor">{{ effectiveRateLimitInfo?.remaining }}</span>
            </div>

            <div v-if="effectiveRateLimitInfo && effectiveRateLimitInfo.restartsInMinutes > 0" class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">{{ $t("lookup.rateLimitResets") }}:</span>
              <span class="text-body-2 font-weight-bold">{{ formatTimeRemaining(effectiveRateLimitInfo?.restartsInMinutes) }}</span>
            </div>

            <!-- Show additional API key quota info if available -->
            <div v-if="effectiveRateLimitInfo?.isApiKey && rateLimitInfoApi && rateLimitInfoApi.quotaRequests" class="mt-3 pt-2 border-t">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-2">{{ $t("lookup.rateLimitMonthlyQuota") }}:</span>
                <span class="text-body-2 font-weight-bold">{{ rateLimitInfoApi.quotaRequestsRemaining || 0 }}/{{ rateLimitInfoApi.quotaRequests }}</span>
              </div>
            </div>

            <!-- Progress bar -->
            <v-progress-linear :model-value="progressValue" :color="progressColor" height="6" rounded class="mt-2" />

            <div class="text-caption text-center mt-1 text-medium-emphasis">{{ Math.round(progressValue) }}% used</div>

            <!-- Refresh button -->
            <div class="text-center mt-3 d-flex align-center ga-2 justify-center">
              <v-btn size="small" variant="text" color="primary" :loading="rateLimitLoading" @click="fetchRateLimitInfo">
                <v-icon class="mr-1" left size="small">mdi-refresh</v-icon>
                Refresh
              </v-btn>
              <v-btn size="small" variant="text" color="primary" @click="openApiKeyManager">
                <v-icon class="mr-1" left size="small">mdi-key</v-icon>
                Link Api Key
              </v-btn>
            </div>
          </div>
        </div>
      </v-expand-transition>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { usePhoneApi } from "~/composables/usePhoneApi";
const { openApiKeyManager } = useGlobalApiKeyManager();

const phoneApi = usePhoneApi({
  includeAuth: true,
  retryAttempts: 2,
  timeout: 30000,
});

const { rateLimitInfo, rateLimitInfoApi, rateLimitLoading, hasApiKey, fetchRateLimitInfo, startRateLimitMonitoring } = phoneApi;
const { user } = useFirebaseAuth();

const STORAGE_KEY = "rateLimitDisplay_expanded";

// Initialize expanded state
const expanded = ref(false);

// Load expanded state from localStorage on mount
onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      expanded.value = JSON.parse(saved);
    }
  }
});

// Watch for changes and save to localStorage
watch(
  expanded,
  (newValue) => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
    }
  },
  { immediate: false }
);

// Determine which rate limit to display (API key takes priority if available)
const effectiveRateLimitInfo = computed(() => {
  if (hasApiKey && rateLimitInfoApi.value && rateLimitInfoApi.value.requestRemaining !== undefined) {
    return {
      current: (rateLimitInfoApi.value.requestLimit || 0) - (rateLimitInfoApi.value.requestRemaining || 0),
      maximum: rateLimitInfoApi.value.requestLimit || 0,
      remaining: rateLimitInfoApi.value.requestRemaining || 0,
      restartsInMinutes: rateLimitInfoApi.value.requestReset ? Math.ceil(rateLimitInfoApi.value.requestReset / 60) : 0,
      isApiKey: true,
    };
  }

  if (rateLimitInfo.value) {
    return {
      current: rateLimitInfo.value.current,
      maximum: rateLimitInfo.value.maximum,
      remaining: rateLimitInfo.value.remaining,
      restartsInMinutes: rateLimitInfo.value.restartsInMinutes,
      isApiKey: false,
    };
  }

  return null;
});

const formatTimeRemaining = (minutes: number): string => {
  if (!minutes || minutes <= 0) return "0 minutes";

  const { locale } = useI18n();
  
  try {
    const rtf = new Intl.RelativeTimeFormat(locale.value, { 
      numeric: 'always',
      style: 'long' 
    });
    
    // Find the most appropriate unit
    const units = [
      { unit: 'year' as Intl.RelativeTimeFormatUnit, divisor: 525600 },
      { unit: 'month' as Intl.RelativeTimeFormatUnit, divisor: 43200 },
      { unit: 'day' as Intl.RelativeTimeFormatUnit, divisor: 1440 },
      { unit: 'hour' as Intl.RelativeTimeFormatUnit, divisor: 60 },
      { unit: 'minute' as Intl.RelativeTimeFormatUnit, divisor: 1 }
    ];
    
    for (const { unit, divisor } of units) {
      if (minutes >= divisor) {
        const value = Math.floor(minutes / divisor);
        return rtf.format(value, unit);
      }
    }
    
    return rtf.format(minutes, 'minute');
  } catch (error) {
    // Fallback to English if locale is not supported
    console.warn('Locale not supported for time formatting, falling back to English:', error);
    
    const years = Math.floor(minutes / (365 * 24 * 60));
    const months = Math.floor((minutes % (365 * 24 * 60)) / (30 * 24 * 60));
    const days = Math.floor((minutes % (30 * 24 * 60)) / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const remainingMinutes = minutes % 60;

    const parts = [];

    if (years > 0) {
      parts.push(years === 1 ? "1 year" : `${years} years`);
    }

    if (months > 0) {
      parts.push(months === 1 ? "1 month" : `${months} months`);
    }

    if (days > 0) {
      parts.push(days === 1 ? "1 day" : `${days} days`);
    }

    if (hours > 0) {
      parts.push(hours === 1 ? "1 hour" : `${hours} hours`);
    }

    if (remainingMinutes > 0) {
      parts.push(remainingMinutes === 1 ? "1 minute" : `${remainingMinutes} minutes`);
    }

    // Return the most significant 2 parts to keep it readable
    if (parts.length > 2) {
      return parts.slice(0, 2).join(", ");
    }

    return parts.join(", ");
  }
};

// Card styling based on rate limit status
const cardColor = computed(() => {
  if (!effectiveRateLimitInfo.value) return "";

  const remaining = effectiveRateLimitInfo.value.remaining;
  const percentage = (remaining / effectiveRateLimitInfo.value.maximum) * 100;

  if (percentage <= 0) return "error";
  if (percentage <= 25) return "warning";
  return "success";
});

const iconColor = computed(() => {
  if (!effectiveRateLimitInfo.value) return "primary";

  const remaining = effectiveRateLimitInfo.value.remaining;
  const percentage = (remaining / effectiveRateLimitInfo.value.maximum) * 100;

  if (percentage <= 0) return "error";
  if (percentage <= 25) return "warning";
  return "success";
});

const statusIcon = computed(() => {
  if (!effectiveRateLimitInfo.value) return "mdi-information";

  const remaining = effectiveRateLimitInfo.value.remaining;
  const percentage = (remaining / effectiveRateLimitInfo.value.maximum) * 100;

  if (percentage <= 0) return "mdi-alert-circle";
  if (percentage <= 25) return "mdi-alert";
  return "mdi-check-circle";
});

const remainingColor = computed(() => {
  if (!effectiveRateLimitInfo.value) return "text-white";

  const remaining = effectiveRateLimitInfo.value.remaining;
  const percentage = (remaining / effectiveRateLimitInfo.value.maximum) * 100;

  if (percentage <= 0) return "text-error";
  if (percentage <= 25) return "text-warning";
  return "text-success";
});

const progressValue = computed(() => {
  if (!effectiveRateLimitInfo.value) return 0;
  return (effectiveRateLimitInfo.value.current / effectiveRateLimitInfo.value.maximum) * 100;
});

const progressColor = computed(() => {
  const percentage = progressValue.value;

  if (percentage >= 100) return "error";
  if (percentage >= 75) return "warning";
  return "success";
});
startRateLimitMonitoring();
</script>

<style scoped>
.rate-limit-card {
  transition: all 0.3s ease;
}

.rate-limit-details {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  padding: 12px;
}
</style>
