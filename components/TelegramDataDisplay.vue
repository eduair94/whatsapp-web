<template>
  <div v-if="data?.telegram" class="wp_output mt-5">
    <v-alert v-if="data?.telegram.error" type="error">
      {{ $t(data?.telegram.error) }}
    </v-alert>
    <v-row v-if="data?.telegram?.phone">
      <v-col cols="12" lg="6">
        <v-card :loading="loading" :elevation="10" class="mx-auto" style="position: relative">
          <!-- Loading Overlay -->
          <ClientOnly>
            <v-overlay :model-value="loading" contained class="d-flex align-center justify-center">
              <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
            </v-overlay>
          </ClientOnly>
          <v-img v-if="data.telegram.hasPhoto && data.telegram.photoUrl" @load="() => (imageLoaded = true)" class="grey" lazy-src="/placeholder.png" :src="data.telegram.photoUrl" placeholder="/placeholder.jpg" width="500px" height="388px" cover>
            <v-btn v-show="imageLoaded" :loading="loadingDownloadImage" class="mx-2 button_download" fab dark link target="_blank" :href="data.telegram.photoUrl" small download color="primary" @click.prevent="downloadImage">
              <v-icon dark> mdi-download </v-icon>
            </v-btn>
          </v-img>
          <v-list>
            <v-list-item :class="{ 'bg-warning': isCachedData, 'bg-success': !isCachedData }" :title="$t('lookup.cache')">
              {{ isCachedData ? $t("lookup.yes") : $t("lookup.no") }}
            </v-list-item>
            <v-list-item :title="$t('lookup.telegram.id')">
              <p>{{ data.telegram.id || "--" }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.telegram.username')">
              <p>{{ data.telegram.username ? `@${data.telegram.username}` : "--" }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.telegram.firstName')">
              <p>{{ data.telegram.first_name || "--" }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.telegram.lastName')">
              <p>{{ data.telegram.last_name || "--" }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.telegram.phone')">
              <p>{{ data.telegram.phone || "--" }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.telegram.verified')">
              <p>{{ data.telegram.verified ? $t("lookup.yes") : $t("lookup.no") }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.telegram.premium')">
              <p>{{ data.telegram.premium ? $t("lookup.yes") : $t("lookup.no") }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.telegram.bot')">
              <p>{{ data.telegram.bot ? $t("lookup.yes") : $t("lookup.no") }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.telegram.fake')">
              <p>{{ data.telegram.fake ? $t("lookup.yes") : $t("lookup.no") }}</p>
            </v-list-item>
            <v-list-item v-if="data.telegram.user_was_online" :title="$t('lookup.telegram.lastOnline')">
              <p>{{ formatDate(data.telegram.user_was_online) }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.lastSync')">
              <p>{{ data.telegram.date ? formatDate(data.telegram.date.toString()) : $t("lookup.now") }}</p>
            </v-list-item>
            <v-list-item v-if="data.telegram.restriction_reason" :title="$t('lookup.telegram.restrictionReason')">
              <p>{{ data.telegram.restriction_reason }}</p>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6">
        <v-textarea label="Raw Telegram Data" rows="30" :model-value="stringify(data.telegram)" readonly />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { WhatsAppProfileData } from "~/utils/interfaces/phone.interface";

interface TelegramData {
  id: number;
  username: string | null;
  usernames: any;
  first_name: string | null;
  last_name: string | null;
  fake: boolean;
  verified: boolean;
  premium: boolean;
  mutual_contact: boolean;
  bot: boolean;
  bot_chat_history: boolean;
  restricted: boolean;
  restriction_reason: string | null;
  user_was_online: string | null;
  phone: string;
  hasPhoto: boolean;
  photoUrl: string | null;
}

interface Props {
  data: WhatsAppProfileData | null;
  loading: boolean;
  isCachedData: boolean;
}

const props = defineProps<Props>();

const imageLoaded = ref(false);
const loadingDownloadImage = ref(false);

const downloadImage = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();
  const url = props.data?.telegram?.photoUrl;
  if (!url) {
    throw new Error("Resource URL not provided! You need to provide one");
  }
  loadingDownloadImage.value = true;
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;
      a.style.display = "none";
      a.download = `${(props.data?.phone || "unknown").replace(/\s+/g, "")}-telegram-profile.jpg`;

      document.body.appendChild(a);
      a.click();
      loadingDownloadImage.value = false;
    })
    .catch(() => {
      loadingDownloadImage.value = false;
    });
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months !== 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years !== 1 ? "s" : ""} ago`;
    }
  } catch {
    return dateString;
  }
};

const stringify = (data: TelegramData | null): string => {
  return JSON.stringify(data, null, 2);
};
</script>

<style lang="scss" scoped>
.button_download {
  position: absolute;
  bottom: 10px;
  right: 5px;
}
</style>
