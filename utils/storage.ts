// Storage utility with IndexedDB and localStorage fallback
export interface SearchHistoryItem {
  id: string;
  phoneNumber: string;
  searchDate: Date;
  data: any;
  profilePic?: string;
  urlImage?: string;
}

// Internal interface for IndexedDB storage (dates stored as ISO strings)
interface StoredSearchHistoryItem {
  id: string;
  phoneNumber: string;
  searchDate: string; // ISO string in storage
  data: any;
  profilePic?: string;
  urlImage?: string;
}

class StorageManager {
  private dbName = "WhatsAppSearchHistory";
  private storeName = "searches";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (!this.isIndexedDBSupported()) {
      console.log("IndexedDB not supported, falling back to localStorage");
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });
          store.createIndex("phoneNumber", "phoneNumber", { unique: false });
          store.createIndex("searchDate", "searchDate", { unique: false });
        }
      };
    });
  }

  private isIndexedDBSupported(): boolean {
    return typeof window !== "undefined" && "indexedDB" in window;
  }

  async addSearch(item: Omit<SearchHistoryItem, "id">): Promise<void> {
    if (this.db) {
      return this.addOrUpdateIndexedDBOptimized(item);
    } else {
      return this.addOrUpdateLocalStorage({
        ...item,
        id: `${item.phoneNumber}_${Date.now()}`,
        searchDate: new Date(),
      });
    }
  }

  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    if (this.db) {
      return this.getFromIndexedDB();
    } else {
      return this.getFromLocalStorage();
    }
  }

  async clearHistory(): Promise<void> {
    if (this.db) {
      return this.clearIndexedDB();
    } else {
      return this.clearLocalStorage();
    }
  }

  async deleteSearch(id: string): Promise<void> {
    if (this.db) {
      return this.deleteFromIndexedDB(id);
    } else {
      return this.deleteFromLocalStorage(id);
    }
  }

  private async addOrUpdateIndexedDBOptimized(item: Omit<SearchHistoryItem, "id">): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("phoneNumber");
      const getRequest = index.get(item.phoneNumber);

      getRequest.onsuccess = () => {
        const existingItem = getRequest.result as StoredSearchHistoryItem | undefined;
        const now = new Date();

        // Serialize the data for IndexedDB storage
        const searchItem: StoredSearchHistoryItem = {
          ...item,
          id: existingItem ? existingItem.id : `${item.phoneNumber}_${Date.now()}`,
          searchDate: now.toISOString(), // Store as ISO string instead of Date object
          data: JSON.parse(JSON.stringify(item.data)), // Deep clone to ensure serializability
        };

        // Use put() which will either insert or update
        const putRequest = store.put(searchItem);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  private async addOrUpdateIndexedDB(item: SearchHistoryItem, isUpdate: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      // Serialize the item for IndexedDB storage
      const serializedItem: StoredSearchHistoryItem = {
        ...item,
        searchDate: item.searchDate instanceof Date ? item.searchDate.toISOString() : item.searchDate,
        data: JSON.parse(JSON.stringify(item.data)), // Deep clone to ensure serializability
      };

      const request = isUpdate ? store.put(serializedItem) : store.add(serializedItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromIndexedDB(): Promise<SearchHistoryItem[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("searchDate");
      const request = index.openCursor(null, "prev"); // Most recent first

      const results: SearchHistoryItem[] = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const item = cursor.value as StoredSearchHistoryItem;
          // Convert ISO string back to Date object
          results.push({
            ...item,
            searchDate: new Date(item.searchDate),
          });
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromIndexedDB(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private addOrUpdateLocalStorage(item: SearchHistoryItem): void {
    try {
      const existingData = localStorage.getItem("whatsapp_search_history");
      const history: SearchHistoryItem[] = existingData ? JSON.parse(existingData) : [];

      // Remove existing entry for this phone number
      const filteredHistory = history.filter((h) => h.phoneNumber !== item.phoneNumber);

      // Add the new/updated item at the beginning
      filteredHistory.unshift(item);

      // Limit to 100 items to prevent localStorage from getting too large
      const limitedHistory = filteredHistory.slice(0, 100);

      localStorage.setItem("whatsapp_search_history", JSON.stringify(limitedHistory));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  private getFromLocalStorage(): SearchHistoryItem[] {
    try {
      const data = localStorage.getItem("whatsapp_search_history");
      if (!data) return [];

      const history = JSON.parse(data);
      // Convert date strings back to Date objects
      return history
        .map((item: any) => ({
          ...item,
          searchDate: new Date(item.searchDate),
        }))
        .sort((a: SearchHistoryItem, b: SearchHistoryItem) => b.searchDate.getTime() - a.searchDate.getTime());
    } catch (error) {
      console.error("Failed to get from localStorage:", error);
      return [];
    }
  }

  private clearLocalStorage(): void {
    try {
      localStorage.removeItem("whatsapp_search_history");
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }

  private deleteFromLocalStorage(id: string): void {
    try {
      const existingData = localStorage.getItem("whatsapp_search_history");
      if (!existingData) return;

      const history: SearchHistoryItem[] = JSON.parse(existingData);
      const filteredHistory = history.filter((item) => item.id !== id);

      localStorage.setItem("whatsapp_search_history", JSON.stringify(filteredHistory));
    } catch (error) {
      console.error("Failed to delete from localStorage:", error);
    }
  }
}

export const storageManager = new StorageManager();
