import { ref } from "vue";
import { storageManager, type SearchHistoryItem } from "~/utils/storage";

export const useSearchHistory = () => {
  const searchHistory = ref<SearchHistoryItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const initializeStorage = async () => {
    try {
      if (import.meta.client) {
        await storageManager.init();
      }
    } catch (err) {
      console.error("Failed to initialize storage:", err);
      error.value = "Failed to initialize storage";
    }
  };

  const addSearchToHistory = async (phoneNumber: string, data: any) => {
    if (!import.meta.client) return;

    try {
      await storageManager.addSearch({
        phoneNumber,
        data,
        searchDate: new Date(),
        profilePic: data.profilePic,
        urlImage: data.urlImage,
      });
      await loadSearchHistory(); // Refresh the list
    } catch (err) {
      console.error("Failed to add search to history:", err);
      error.value = "Failed to save search";
    }
  };

  const loadSearchHistory = async () => {
    if (!import.meta.client) return;

    loading.value = true;
    error.value = null;

    try {
      const history = await storageManager.getSearchHistory();
      searchHistory.value = history;
    } catch (err) {
      console.error("Failed to load search history:", err);
      error.value = "Failed to load search history";
    } finally {
      loading.value = false;
    }
  };

  const clearAllHistory = async () => {
    if (!import.meta.client) return;

    loading.value = true;
    error.value = null;

    try {
      await storageManager.clearHistory();
      searchHistory.value = [];
    } catch (err) {
      console.error("Failed to clear history:", err);
      error.value = "Failed to clear history";
    } finally {
      loading.value = false;
    }
  };

  const deleteSearchItem = async (id: string) => {
    if (!import.meta.client) return;

    try {
      await storageManager.deleteSearch(id);
      searchHistory.value = searchHistory.value.filter((item) => item.id !== id);
    } catch (err) {
      console.error("Failed to delete search item:", err);
      error.value = "Failed to delete search";
    }
  };

  const downloadImage = async (url: string, filename: string = "profile.jpeg") => {
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobURL = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobURL;
      a.style.display = "none";
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(blobURL);
    } catch (err) {
      console.error("Failed to download image:", err);
      error.value = "Failed to download image";
    }
  };

  return {
    searchHistory,
    loading,
    error,
    initializeStorage,
    addSearchToHistory,
    loadSearchHistory,
    clearAllHistory,
    deleteSearchItem,
    downloadImage,
  };
};
