<template>
  <v-card v-if="shouldShow" :loading="rateLimitLoading" :elevation="2" class="rate-limit-card mx-auto mb-4" max-width="600" :color="cardColor" variant="outlined">
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
            fetchLimits();
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
          <div v-if="rateLimitLoading" class="text-center py-2">
            <v-progress-circular size="20" indeterminate />
            <span class="ms-2 text-body-2">{{ $t("lookup.rateLimitLoading") }}</span>
          </div>

          <div v-else-if="effectiveRateLimitInfo" class="rate-limit-details">
            <!-- Rate limit type indicator -->
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">{{ $t("lookup.rateLimitType") }}:</span>
              <v-chip size="x-small" :color="effectiveRateLimitInfo.isApiKey ? 'primary' : 'secondary'">
                {{ effectiveRateLimitInfo.isApiKey ? $t("lookup.rateLimitApiKey") : $t("lookup.rateLimitIp") }}
              </v-chip>
            </div>

            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">{{ $t("lookup.rateLimitCurrent") }}:</span>
              <span class="text-body-2 font-weight-bold">{{ effectiveRateLimitInfo.current }}/{{ effectiveRateLimitInfo.maximum }}</span>
            </div>

            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">{{ $t("lookup.rateLimitRemaining") }}:</span>
              <span class="text-body-2 font-weight-bold" :class="remainingColor">{{ effectiveRateLimitInfo.remaining }}</span>
            </div>

            <div v-if="effectiveRateLimitInfo.restartsInMinutes > 0" class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">{{ $t("lookup.rateLimitResets") }}:</span>
              <span class="text-body-2 font-weight-bold">{{ effectiveRateLimitInfo.restartsInMinutes }} {{ $t("lookup.rateLimitMinutes") }}</span>
            </div>

            <!-- Show additional API key quota info if available -->
            <div v-if="effectiveRateLimitInfo.isApiKey && rateLimitInfoApi && rateLimitInfoApi.quotaRequests" class="mt-3 pt-2 border-t">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-2">{{ $t("lookup.rateLimitMonthlyQuota") }}:</span>
                <span class="text-body-2 font-weight-bold">{{ rateLimitInfoApi.quotaRequestsRemaining || 0 }}/{{ rateLimitInfoApi.quotaRequests }}</span>
              </div>
            </div>

            <!-- Progress bar -->
            <v-progress-linear :model-value="progressValue" :color="progressColor" height="6" rounded class="mt-2" />

            <div class="text-caption text-center mt-1 text-medium-emphasis">{{ Math.round(progressValue) }}% used</div>

            <!-- Refresh button -->
            <div class="text-center mt-3">
              <v-btn size="small" variant="text" color="primary" :loading="rateLimitLoading" @click="fetchLimits">
                <v-icon left size="small">mdi-refresh</v-icon>
                Refresh
              </v-btn>
            </div>
          </div>
        </div>
      </v-expand-transition>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ApiKeyRateLimitInfo, RateLimitInfo } from "~/composables/usePhoneApi";

interface Props {
  rateLimitInfo: RateLimitInfo | null;
  rateLimitInfoApi: ApiKeyRateLimitInfo | null;
  rateLimitLoading: boolean;
  autoShow?: boolean;
  hasApiKey?: boolean;
  fetchLimits: () => Promise<any>;
}

const props = withDefaults(defineProps<Props>(), {
  autoShow: true,
  hasApiKey: false,
});

const expanded = ref(false);

// Determine which rate limit to display (API key takes priority if available)
const effectiveRateLimitInfo = computed(() => {
  if (props.hasApiKey && props.rateLimitInfoApi && props.rateLimitInfoApi.requestRemaining !== undefined) {
    return {
      current: (props.rateLimitInfoApi.requestLimit || 0) - (props.rateLimitInfoApi.requestRemaining || 0),
      maximum: props.rateLimitInfoApi.requestLimit || 0,
      remaining: props.rateLimitInfoApi.requestRemaining || 0,
      restartsInMinutes: props.rateLimitInfoApi.requestReset ? Math.ceil(props.rateLimitInfoApi.requestReset / 60) : 0,
      isApiKey: true,
    };
  }

  if (props.rateLimitInfo) {
    return {
      current: props.rateLimitInfo.current,
      maximum: props.rateLimitInfo.maximum,
      remaining: props.rateLimitInfo.remaining,
      restartsInMinutes: props.rateLimitInfo.restartsInMinutes,
      isApiKey: false,
    };
  }

  return null;
});

// Show the card if autoShow is true or if rate limited
const shouldShow = computed(() => {
  return props.autoShow || (effectiveRateLimitInfo.value && effectiveRateLimitInfo.value.remaining <= 5);
});

// Card styling based on rate limit status
const cardColor = computed(() => {
  if (!effectiveRateLimitInfo.value) return "default";

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
  if (!effectiveRateLimitInfo.value) return "";

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
