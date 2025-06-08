<template>
  <v-dialog v-model="dialog" max-width="400" persistent>
    <v-card class="review-popup">
      <v-card-title class="text-h6 pb-2">
        <v-icon color="primary" class="mr-2">mdi-heart</v-icon>
        {{ $t("review.popupTitle", "Enjoying our service?") }}
      </v-card-title>

      <v-card-text class="pb-2">
        <p class="text-body-2 mb-3">
          {{ $t("review.popupMessage", "Help others discover our WhatsApp lookup service by leaving a review!") }}
        </p>

        <div class="d-flex justify-start mb-3">
          <v-rating :model-value="5" color="yellow-darken-3" size="small" readonly density="compact"></v-rating>
        </div>

        <v-checkbox v-model="doNotShowAgain" :label="$t('review.doNotShowAgain', 'Do not show this again')" density="compact" hide-details @change="onDoNotShowAgainChange"></v-checkbox>
      </v-card-text>

      <v-card-actions class="pt-0">
        <v-btn variant="text" color="grey" size="small" @click="closePopup" class="text-none">
          {{ $t("review.later", "Maybe later") }}
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn link target="_blank" color="primary" variant="elevated" size="small" :href="REVIEW_URL" class="text-none">
          <v-icon size="16" class="mr-1">mdi-star</v-icon>
          {{ $t("review.leaveReview", "Leave a review") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const dialog = ref(false);
const doNotShowAgain = ref(false);
const REVIEW_URL = ref("https://www.trustpilot.com/review/whatsapp.checkleaked.cc");
const STORAGE_KEY = "reviewPopupShown";

// Emits
const emit = defineEmits<{
  shown: [];
  closed: [];
}>();

const hasBeenShown = (): boolean => {
  if (!import.meta.client) return true; // SSR safety
  return localStorage.getItem(STORAGE_KEY) === "true";
};

const markAsShown = (value = "true"): void => {
  if (import.meta.client) {
    localStorage.setItem(STORAGE_KEY, value);
  }
};

const onDoNotShowAgainChange = (): void => {
  if (doNotShowAgain.value) {
    markAsShown();
  } else {
    markAsShown("false");
  }
};

const showPopup = (): void => {
  console.log("ReviewPopup.showPopup() called");
  dialog.value = true;
  console.log("Opening review popup - dialog.value:", dialog.value);
  // Don't mark as shown immediately when showing popup
  emit("shown");
};

const closePopup = (): void => {
  dialog.value = false;
  doNotShowAgain.value = false; // Reset checkbox when closing
  emit("closed");
};

const open = (): void => {
  console.log("ReviewPopup.open() called - hasBeenShown:", hasBeenShown());
  if (!hasBeenShown()) {
    console.log("ReviewPopup: Showing popup");
    showPopup();
  } else {
    console.log("ReviewPopup: Popup already shown, skipping");
  }
};

const goToReview = (): void => {
  // Open review URL in new tab
  if (import.meta.client) {
    window.open(REVIEW_URL.value, "_blank", "noopener,noreferrer");
  }
  markAsShown(); // Mark as shown when user leaves a review
  closePopup();
};

// Expose methods for parent component
defineExpose({
  open,
  showPopup,
  closePopup,
  hasBeenShown,
});
</script>

<style scoped>
.review-popup {
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.review-popup .v-card-title {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-surface), 1) 100%);
}

/* Dark theme specific styles */
.v-theme--dark .review-popup {
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
}

.v-theme--dark .review-popup .v-card-title {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1) 0%, rgba(var(--v-theme-surface), 1) 100%);
}
</style>
