import { ref } from "vue";

// Global state for API Key Manager
const isApiKeyManagerOpen = ref(false);
const onApiKeySavedCallbacks = ref<Array<() => void | Promise<void>>>([]);

export const useGlobalApiKeyManager = () => {
  const openApiKeyManager = () => {
    isApiKeyManagerOpen.value = true;
  };

  const closeApiKeyManager = () => {
    isApiKeyManagerOpen.value = false;
  };

  const onApiKeySaved = async () => {
    // Execute all registered callbacks
    for (const callback of onApiKeySavedCallbacks.value) {
      await callback();
    }
    closeApiKeyManager();
  };

  const registerApiKeySavedCallback = (callback: () => void | Promise<void>) => {
    onApiKeySavedCallbacks.value.push(callback);
  };

  const unregisterApiKeySavedCallback = (callback: () => void | Promise<void>) => {
    const index = onApiKeySavedCallbacks.value.indexOf(callback);
    if (index > -1) {
      onApiKeySavedCallbacks.value.splice(index, 1);
    }
  };

  return {
    isApiKeyManagerOpen,
    openApiKeyManager,
    closeApiKeyManager,
    onApiKeySaved,
    registerApiKeySavedCallback,
    unregisterApiKeySavedCallback,
  };
};
