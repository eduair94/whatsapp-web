<template>
  <div v-if="data" class="wp_output mt-5">
    <v-alert v-if="data.error || phoneApi.error.value" type="error">
      {{ data.error ? $t(data.error) : phoneApi.error.value }}
    </v-alert>
    <v-row v-if="data?.phone">
      <v-col cols="12" lg="6">
        <v-card :loading="loading" :elevation="10" class="mx-auto" style="position: relative">
          <!-- Loading Overlay -->
          <ClientOnly>
            <v-overlay :model-value="loading" contained class="d-flex align-center justify-center">
              <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
            </v-overlay>
          </ClientOnly>
          <v-img v-if="data.profilePic" @load="() => (imageLoaded = true)" class="grey" lazy-src="/placeholder.png" :src="data.profilePic" placeholder="/placeholder.jpg" width="500px" height="388px" cover>
            <v-btn v-show="imageLoaded" :loading="loadingDownloadImage" class="mx-2 button_download" fab dark link target="_blank" :href="data.profilePic" small download color="primary" @click.prevent="downloadImage">
              <v-icon dark> mdi-download </v-icon>
            </v-btn>
          </v-img>
          <v-list>
            <v-list-item :class="{ 'bg-warning': isCachedData, 'bg-success': !isCachedData }" :title="$t('lookup.cache')">
              {{ isCachedData ? $t("lookup.yes") : $t("lookup.no") }}
            </v-list-item>
            <v-list-item :title="$t('lookup.phone')">
              <p>{{ data.phone }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.name')">
              <p>{{ data.pushname || "--" }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.about')">
              <p>{{ data.about || "--" }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.business')">
              <p>{{ data.isBusiness ? $t("lookup.yes") : $t("lookup.no") }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.enterprise')">
              <p>{{ data.isEnterprise ? $t("lookup.yes") : $t("lookup.no") }}</p>
            </v-list-item>
            <v-list-item :title="$t('lookup.lastSync')">
              <p>{{ data.date ? formatDate(data.date) : $t("lookup.now") }}</p>
            </v-list-item>
          </v-list>

          <!-- WhatsApp Contact Button -->
          <v-card-actions v-if="data.phone" class="px-4 pb-4">
            <v-btn :href="formatPhoneForWhatsApp(data.phone)" target="_blank" rel="noopener noreferrer" color="success" variant="elevated" block prepend-icon="mdi-whatsapp" class="text-none">
              {{ $t("lookup.contactWhatsApp") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6">
        <v-textarea label="Raw Data" rows="30" :model-value="stringify(data)" readonly />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { WhatsAppProfileData } from "~/utils/interfaces/phone.interface";
import { formatPhoneForWhatsApp } from "~/utils/whatsapp";

interface Props {
  data: WhatsAppProfileData | null;
  loading: boolean;
  isCachedData: boolean;
}

const props = defineProps<Props>();

const phoneApi = usePhoneApi({
  includeAuth: true,
  retryAttempts: 2,
  timeout: 30000,
});

const imageLoaded = ref(false);
const loadingDownloadImage = ref(false);

const downloadImage = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();
  const url = props.data?.profilePic;
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
      a.download = `${(props.data?.phone || "unknown").replace(/\s+/g, "")}-profile.jpg`;

      document.body.appendChild(a);
      a.click();
      loadingDownloadImage.value = false;
    })
    .catch(() => {
      loadingDownloadImage.value = false;
    });
};

const stringify = (data: WhatsAppProfileData | null): string => {
  return JSON.stringify(data, null, 2);
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
</script>

<style lang="scss" scoped>
.button_download {
  position: absolute;
  bottom: 10px;
  right: 5px;
}
</style>
