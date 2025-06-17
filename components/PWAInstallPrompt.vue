<template>
  <!-- PWA Install Prompt -->
  <Transition name="slide-up" appear>
    <div v-if="showInstallPrompt" class="install-prompt">
      <v-card class="install-card" elevation="12" rounded="lg">
        <v-card-text class="pa-4">
          <div class="d-flex align-center">
            <div class="install-icon me-3">
              <v-icon :color="isIOS ? 'blue' : 'primary'" size="32" :icon="isIOS ? 'mdi-apple' : 'mdi-download'" />
            </div>

            <div class="flex-grow-1">
              <div class="text-h6 font-weight-medium mb-1">
                {{ isIOS ? "Add to Home Screen" : "Install App" }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ installMessage }}
              </div>
            </div>

            <v-btn icon="mdi-close" variant="text" size="small" class="ms-2" @click="dismissPrompt" />
          </div>

          <!-- iOS Instructions -->
          <div v-if="isIOS && showIOSInstructions" class="mt-4 pa-3 bg-blue-lighten-5 rounded">
            <div class="text-body-2 mb-2">
              <v-icon color="blue" size="16" class="me-1">mdi-information</v-icon>
              To install this app:
            </div>
            <ol class="text-body-2 text-blue-darken-2 ps-4">
              <li>Tap the <v-icon size="14" class="mx-1">mdi-export-variant</v-icon> share button</li>
              <li>Select "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex justify-end gap-2 mt-4">
            <v-btn variant="text" size="small" @click="dismissPrompt">
              {{ isIOS ? "Maybe later" : "Not now" }}
            </v-btn>

            <v-btn v-if="!isIOS" :color="installState === 'installing' ? 'success' : 'primary'" variant="flat" size="small" :loading="installState === 'installing'" :disabled="installState === 'installed'" @click="installApp">
              <v-icon v-if="installState === 'installed'" start>mdi-check</v-icon>
              {{ getInstallButtonText() }}
            </v-btn>

            <v-btn v-else color="blue" variant="flat" size="small" @click="toggleIOSInstructions"> {{ showIOSInstructions ? "Hide" : "Show" }} Instructions </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </Transition>

  <!-- Update Available Prompt -->
  <Transition name="slide-up">
    <div v-if="showUpdatePrompt" class="update-prompt">
      <v-card class="update-card" elevation="12" rounded="lg" color="success">
        <v-card-text class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="white" class="me-3" size="24">mdi-update</v-icon>
            <div class="flex-grow-1">
              <div class="text-subtitle-1 font-weight-medium text-white mb-1">Update Available</div>
              <div class="text-body-2 text-green-lighten-4">A new version of the app is ready to install</div>
            </div>
            <div class="d-flex gap-2">
              <v-btn variant="text" size="small" color="white" @click="dismissUpdate"> Later </v-btn>
              <v-btn color="white" variant="flat" size="small" :loading="updateState === 'updating'" @click="updateApp"> Update </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

// Types
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type InstallState = "idle" | "installing" | "installed" | "error";
type UpdateState = "idle" | "updating" | "updated" | "error";

// Reactive state
const showInstallPrompt = ref(false);
const showUpdatePrompt = ref(false);
const showIOSInstructions = ref(false);
const installState = ref<InstallState>("idle");
const updateState = ref<UpdateState>("idle");

// PWA Events
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let registration: ServiceWorkerRegistration | null = null;

// Device detection
const isIOS = computed(() => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
});

const isStandalone = computed(() => {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
});

// Computed properties
const installMessage = computed(() => {
  if (isIOS.value) {
    return "Get the full app experience on your iPhone or iPad";
  }
  return "Add WhatsApp Profile API to your home screen for quick access and offline support";
});

// Local storage keys
const STORAGE_KEYS = {
  INSTALL_DISMISSED: "pwa-install-dismissed",
  INSTALL_DISMISSED_DATE: "pwa-install-dismissed-date",
  INSTALL_PROMPT_COUNT: "pwa-install-prompt-count",
};

// Check if should show install prompt based on user preferences
const shouldShowInstallPrompt = (): boolean => {
  try {
    // Don't show if already in standalone mode
    if (isStandalone.value) return false;

    // Don't show if user dismissed recently (within 7 days)
    const dismissedDate = localStorage.getItem(STORAGE_KEYS.INSTALL_DISMISSED_DATE);
    if (dismissedDate) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return false;
    }

    // Limit prompt frequency (max 3 times)
    const promptCount = parseInt(localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPT_COUNT) || "0");
    if (promptCount >= 3) return false;

    return true;
  } catch (error) {
    console.warn("Error checking install prompt preferences:", error);
    return true;
  }
};

// Event handlers
const handleBeforeInstallPrompt = (e: Event) => {
  const event = e as BeforeInstallPromptEvent;
  console.log("beforeinstallprompt event fired");
  event.preventDefault();
  deferredPrompt = event;

  if (shouldShowInstallPrompt()) {
    // Delay showing the prompt slightly for better UX
    setTimeout(() => {
      showInstallPrompt.value = true;
      incrementPromptCount();
    }, 2000);
  }
};

const handleAppInstalled = () => {
  console.log("PWA was installed successfully");
  showInstallPrompt.value = false;
  installState.value = "installed";
  deferredPrompt = null;

  // Clear dismissal preferences since app is now installed
  localStorage.removeItem(STORAGE_KEYS.INSTALL_DISMISSED);
  localStorage.removeItem(STORAGE_KEYS.INSTALL_DISMISSED_DATE);
  localStorage.removeItem(STORAGE_KEYS.INSTALL_PROMPT_COUNT);
};

const handleSWUpdate = (reg: ServiceWorkerRegistration) => {
  registration = reg;
  showUpdatePrompt.value = true;
};

// Methods
const installApp = async (): Promise<void> => {
  if (!deferredPrompt || installState.value === "installing") return;

  try {
    installState.value = "installing";

    // Show the browser's install prompt
    await deferredPrompt.prompt();

    // Wait for the user's choice
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
      installState.value = "installed";
    } else {
      console.log("User dismissed the install prompt");
      installState.value = "idle";
    }
  } catch (error) {
    console.error("Error during app installation:", error);
    installState.value = "error";
  } finally {
    deferredPrompt = null;
    showInstallPrompt.value = false;
  }
};

const dismissPrompt = (): void => {
  showInstallPrompt.value = false;

  try {
    localStorage.setItem(STORAGE_KEYS.INSTALL_DISMISSED, "true");
    localStorage.setItem(STORAGE_KEYS.INSTALL_DISMISSED_DATE, Date.now().toString());
  } catch (error) {
    console.warn("Could not save install prompt preferences:", error);
  }
};

const toggleIOSInstructions = (): void => {
  showIOSInstructions.value = !showIOSInstructions.value;
};

const updateApp = async (): Promise<void> => {
  if (!registration || updateState.value === "updating") return;

  try {
    updateState.value = "updating";

    if (registration.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }

    // Reload the page to activate the new service worker
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error("Error during app update:", error);
    updateState.value = "error";
  }
};

const dismissUpdate = (): void => {
  showUpdatePrompt.value = false;
};

const incrementPromptCount = (): void => {
  try {
    const currentCount = parseInt(localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPT_COUNT) || "0");
    localStorage.setItem(STORAGE_KEYS.INSTALL_PROMPT_COUNT, (currentCount + 1).toString());
  } catch (error) {
    console.warn("Could not increment prompt count:", error);
  }
};

const getInstallButtonText = (): string => {
  switch (installState.value) {
    case "installing":
      return "Installing...";
    case "installed":
      return "Installed";
    case "error":
      return "Try Again";
    default:
      return "Install";
  }
};

// Lifecycle
onMounted(() => {
  // PWA install event listeners
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
  window.addEventListener("appinstalled", handleAppInstalled);

  // Service worker update detection
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              handleSWUpdate(reg);
            }
          });
        }
      });
    });
  }

  // For iOS devices, show install prompt after some interaction
  if (isIOS.value && !isStandalone.value && shouldShowInstallPrompt()) {
    setTimeout(() => {
      showInstallPrompt.value = true;
      incrementPromptCount();
    }, 5000); // Show after 5 seconds on iOS
  }
});

onUnmounted(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
  window.removeEventListener("appinstalled", handleAppInstalled);
});
</script>

<style scoped>
/* Install Prompt Styles */
.install-prompt {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 420px;
  margin: 0 auto;
  pointer-events: none;
}

.install-card {
  pointer-events: auto;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.install-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.1);
}

/* Update Prompt Styles */
.update-prompt {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 1001;
  max-width: 420px;
  margin: 0 auto;
  pointer-events: none;
}

.update-card {
  pointer-events: auto;
  backdrop-filter: blur(10px);
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Dark mode support */
.v-theme--dark .install-card {
  background: rgba(18, 18, 18, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .install-icon {
  background: rgba(var(--v-theme-primary), 0.2);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .install-prompt,
  .update-prompt {
    bottom: 10px;
    top: 10px;
    left: 10px;
    right: 10px;
    max-width: none;
  }

  .install-icon {
    width: 40px;
    height: 40px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: opacity 0.2s;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .install-card,
  .update-card {
    border-width: 2px;
  }
}
</style>
