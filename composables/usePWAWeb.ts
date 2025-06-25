// composables/usePWAWeb.ts
import { computed, onMounted, ref } from "vue";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAWeb = () => {
  // State
  const isSupported = ref(false);
  const isInstalled = ref(false);
  const isStandalone = ref(false);
  const isInstallable = ref(false);
  const isIOS = ref(false);
  const isOffline = ref(false);
  const needsRefresh = ref(false);

  // Install prompt event
  const installPromptEvent = ref<BeforeInstallPromptEvent | null>(null);

  // Computed properties
  const canInstall = computed(() => {
    return isSupported.value && !isInstalled.value && isInstallable.value;
  });

  const isOnline = computed(() => !isOffline.value);

  // Device detection
  const detectDevice = () => {
    if (typeof navigator === "undefined") return;

    // Check if iOS
    isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    // Check if standalone mode (app-like)
    if (window.matchMedia) {
      isStandalone.value = window.matchMedia("(display-mode: standalone)").matches;
    }

    // Check if PWA is supported
    isSupported.value = "serviceWorker" in navigator && "PushManager" in window;

    // Check if already installed (standalone mode or TWA)
    isInstalled.value = isStandalone.value || document.referrer.includes("android-app://");
  };

  // Network status
  const updateOnlineStatus = () => {
    isOffline.value = !navigator.onLine;
  };

  // Install app function
  const install = async (): Promise<boolean> => {
    if (!installPromptEvent.value) {
      console.warn("No install prompt available");
      return false;
    }

    try {
      await installPromptEvent.value.prompt();
      const { outcome } = await installPromptEvent.value.userChoice;

      if (outcome === "accepted") {
        console.log("PWA installation accepted");
        installPromptEvent.value = null;
        isInstallable.value = false;
        return true;
      } else {
        console.log("PWA installation dismissed");
        return false;
      }
    } catch (error) {
      console.error("Error during PWA installation:", error);
      return false;
    }
  };

  // Check for app updates
  const checkForUpdate = async (): Promise<boolean> => {
    if (!("serviceWorker" in navigator)) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      return true;
    } catch (error) {
      console.error("Error checking for updates:", error);
      return false;
    }
  };

  // Show install instructions for iOS
  const getIOSInstallInstructions = () => {
    return ["Tap the share button in Safari", 'Scroll down and tap "Add to Home Screen"', 'Tap "Add" to confirm'];
  };

  // Initialize PWA functionality
  const init = () => {
    if (typeof window === "undefined") return;

    detectDevice();
    updateOnlineStatus();

    // Listen for install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      installPromptEvent.value = e as BeforeInstallPromptEvent;
      isInstallable.value = true;
    });

    // Listen for app installation
    window.addEventListener("appinstalled", () => {
      console.log("PWA installed successfully");
      isInstalled.value = true;
      isInstallable.value = false;
      installPromptEvent.value = null;
    });

    // Listen for network status changes
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Listen for service worker updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        needsRefresh.value = true;
      });
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (typeof window === "undefined") return;

    window.removeEventListener("online", updateOnlineStatus);
    window.removeEventListener("offline", updateOnlineStatus);
  };

  // Auto-initialize only when called within Vue context
  if (typeof window !== "undefined") {
    onMounted(() => {
      init();
    });
  }

  return {
    // State
    isSupported: isSupported,
    isInstalled: isInstalled,
    isStandalone: isStandalone,
    isInstallable: isInstallable,
    isIOS: isIOS,
    isOffline: isOffline,
    isOnline,
    canInstall,
    needsRefresh: needsRefresh,

    // Methods
    install,
    checkForUpdate,
    getIOSInstallInstructions,
    init,
    cleanup,
  };
};
