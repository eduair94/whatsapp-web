<template>
  <div v-if="showStatus" class="pwa-status">
    <!-- Online/Offline Status -->
    <v-chip v-if="!isOnline" color="warning" variant="flat" size="small" class="ma-1">
      <v-icon start size="16">mdi-wifi-off</v-icon>
      Offline
    </v-chip>

    <!-- PWA Installation Status -->
    <v-chip v-if="isStandalone" color="success" variant="flat" size="small" class="ma-1">
      <v-icon start size="16">mdi-cellphone-check</v-icon>
      App Mode
    </v-chip>

    <!-- Update Available -->
    <v-chip v-if="needsRefresh" color="info" variant="flat" size="small" class="ma-1" @click="handleRefresh" style="cursor: pointer">
      <v-icon start size="16">mdi-refresh</v-icon>
      Update Available
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  showOfflineStatus?: boolean;
  showInstallStatus?: boolean;
  showUpdateStatus?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const props = withDefaults(defineProps<Props>(), {
  showOfflineStatus: true,
  showInstallStatus: true,
  showUpdateStatus: true,
  position: "top-right",
});

const { isOnline, isStandalone, needsRefresh } = usePWAWeb();

const showStatus = computed(() => {
  return (props.showOfflineStatus && !isOnline.value) || (props.showInstallStatus && isStandalone.value) || (props.showUpdateStatus && needsRefresh.value);
});

const handleRefresh = () => {
  window.location.reload();
};
</script>

<style scoped>
.pwa-status {
  position: fixed;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.pwa-status.top-left {
  top: 20px;
  left: 20px;
  align-items: flex-start;
}

.pwa-status.top-right {
  top: 20px;
  right: 20px;
  align-items: flex-end;
}

.pwa-status.bottom-left {
  bottom: 20px;
  left: 20px;
  align-items: flex-start;
}

.pwa-status.bottom-right {
  bottom: 20px;
  right: 20px;
  align-items: flex-end;
}

@media (max-width: 600px) {
  .pwa-status {
    top: 10px;
    right: 10px;
    left: auto;
    bottom: auto;
  }
}
</style>
