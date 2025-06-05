import type { User } from "firebase/auth";

interface ApiKeyResponse {
  linkedAt: string;
  success: boolean;
  hasKey: boolean;
  apiKey?: string;
  lastSaved?: string;
  error?: string;
}

interface ApiKeyLinkResponse {
  success: boolean;
  message: string;
  lastSaved?: string;
  error?: string;
}

export const useApiKeyManagement = () => {
  const { $api } = useNuxtApp();
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Get Firebase ID token for authentication
   */
  const getAuthToken = async (user: User): Promise<string> => {
    try {
      const token = await user.getIdToken();
      return token;
    } catch (err) {
      console.error("Failed to get Firebase ID token:", err);
      throw new Error("Authentication failed. Please sign in again.");
    }
  };

  /**
   * Create authenticated request headers
   */
  const getAuthHeaders = async (user: User) => {
    const token = await getAuthToken(user);
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Link API key to user
  const linkApiKey = async (user: User, apiKey: string): Promise<ApiKeyLinkResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const headers = await getAuthHeaders(user);

      const response = await $api.post(
        "/api/user/api-key",
        {
          apiKey: apiKey.trim(),
        },
        { headers }
      );

      return response.data as ApiKeyLinkResponse;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to link API key";
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  // Get user's API key info (masked for display)
  const getUserApiKey = async (user: User): Promise<ApiKeyResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const headers = await getAuthHeaders(user);
      const response = await $api.get("/api/user/api-key", { headers });
      return response.data as ApiKeyResponse;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to get API key";
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  // Get full API key for API calls (unmasked)
  const getFullApiKey = async (user: User): Promise<ApiKeyResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const headers = await getAuthHeaders(user);
      const response = await $api.get("/api/user/api-key?full=true", { headers });
      return response.data as ApiKeyResponse;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to get API key";
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  // Remove API key
  const removeApiKey = async (user: User): Promise<ApiKeyLinkResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const headers = await getAuthHeaders(user);
      const response = await $api.delete("/api/user/api-key", { headers });
      return response.data as ApiKeyLinkResponse;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to remove API key";
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Validate API key format before sending to server
   */
  const validateApiKey = (apiKey: string): { isValid: boolean; error?: string } => {
    if (!apiKey || typeof apiKey !== "string") {
      return { isValid: false, error: "API key is required" };
    }

    const cleanKey = apiKey.trim();

    if (cleanKey.length < 20) {
      return { isValid: false, error: "API key must be at least 20 characters long" };
    }

    if (cleanKey.length > 200) {
      return { isValid: false, error: "API key is too long (maximum 200 characters)" };
    }

    return { isValid: true };
  };

  /**
   * Check if user is authenticated
   */
  const checkAuthentication = (user: User | null): boolean => {
    if (!user) {
      error.value = "You must be signed in to manage API keys";
      return false;
    }
    return true;
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    linkApiKey,
    getUserApiKey,
    getFullApiKey,
    removeApiKey,
    validateApiKey,
    checkAuthentication,
  };
};
