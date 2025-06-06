import { computed, ref, watch } from "vue";
import { useReCaptcha } from "vue-recaptcha-v3";
import type { WhatsAppProfileData } from "~/utils/interfaces/phone.interface";
import { useFirebaseAuth } from "./useFirebaseAuth";

interface PhoneApiOptions {
  includeAuth?: boolean;
  retryAttempts?: number;
  timeout?: number;
}

interface PhoneApiResponse {
  data: WhatsAppProfileData | null;
  loading: boolean;
  error: string | null;
  rateLimited: boolean;
}

interface RateLimitInfo {
  current: number;
  maximum: number;
  remaining: number;
  restartsInSeconds: number;
  restartsInMinutes: number;
}

interface ApiKeyRateLimitInfo {
  requestLimit?: number;
  requestRemaining?: number;
  requestReset?: number;
  quotaRequests?: number;
  quotaRequestsRemaining?: number;
  lastUpdated?: Date;
}

interface RateLimitResponse {
  success: boolean;
  ip: string;
  authenticated?: boolean;
  hasApiKey?: boolean;
  limits: RateLimitInfo;
  apiKeyLimits?: ApiKeyRateLimitInfo;
  error?: string;
}

// State
const loading = ref(false);
const error = ref<string | null>(null);
const rateLimited = ref(false);
const lastRequestTime = ref<number>(0);
const rateLimitInfo = ref<RateLimitInfo | null>(null);
const rateLimitInfoApi = ref<ApiKeyRateLimitInfo | null>(null);
const rateLimitLoading = ref(false);
const hasApiKey = ref(false);

export const usePhoneApi = (options: PhoneApiOptions = {}) => {
  const { includeAuth = true, retryAttempts = 2, timeout = 30000 } = options;

  // Dependencies
  const { user } = useFirebaseAuth();
  const recaptchaInstance = useReCaptcha();

  /**
   * Get reCAPTCHA token for API request
   */
  const getRecaptchaToken = async (): Promise<string | undefined> => {
    try {
      await recaptchaInstance?.recaptchaLoaded();
      const token = await recaptchaInstance?.executeRecaptcha("wp");
      return token;
    } catch (err) {
      console.error("Failed to get reCAPTCHA token:", err);
      throw new Error("reCAPTCHA verification failed");
    }
  };

  /**
   * Get Firebase auth token if authentication is enabled and user is logged in
   */
  const getAuthToken = async (): Promise<string | null> => {
    if (!includeAuth || !user.value) {
      return null;
    }

    try {
      const token = await user.value.getIdToken();
      return token;
    } catch (err) {
      console.error("Failed to get Firebase auth token:", err);
      throw new Error("Authentication failed");
    }
  };

  /**
   * Check if we're rate limited (considering both IP and API key limits)
   */
  const checkRateLimit = (): boolean => {
    // If user has API key and API key limits are available, check API key limits
    if (hasApiKey.value && rateLimitInfoApi.value && rateLimitInfoApi.value.requestRemaining !== undefined) {
      const apiKeyRateLimited = rateLimitInfoApi.value.requestRemaining <= 0;
      rateLimited.value = apiKeyRateLimited;
      return apiKeyRateLimited;
    }

    // If no API key info available but user has API key, allow the request
    // (server will handle API key rate limiting)
    if (hasApiKey.value && !rateLimitInfoApi.value) {
      rateLimited.value = false;
      return false;
    }

    // Fallback to IP-based rate limiting for non-API key users
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.value;
    const minInterval = 3000; // 3 seconds between requests

    if (timeSinceLastRequest < minInterval) {
      rateLimited.value = true;
      return true;
    }

    // Also check server-side IP rate limits if available
    if (rateLimitInfo.value && rateLimitInfo.value.remaining <= 0) {
      rateLimited.value = true;
      return true;
    }

    rateLimited.value = false;
    return false;
  };

  /**
   * Build request URL with query parameters
   */
  const buildRequestUrl = (phoneNumber: string, recaptchaToken: string): string => {
    const baseUrl = `/api/phone/${phoneNumber}`;
    const params = new URLSearchParams();

    params.append("token", recaptchaToken);

    return `${baseUrl}?${params.toString()}`;
  };

  /**
   * Perform the API request with retry logic
   */
  const performRequest = async (url: string, attempt: number = 1): Promise<WhatsAppProfileData> => {
    try {
      const { $api } = useNuxtApp();
      const headers = await getAuthHeaders();

      const response = (await Promise.race([$api.get(url, { headers }), new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeout))])) as any;

      return response.data as WhatsAppProfileData;
    } catch (err: any) {
      // Handle rate limiting
      if (err.response?.status === 429) {
        rateLimited.value = true;
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      // Handle authentication errors
      if (err.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }

      // Handle server errors with retry
      if (err.response?.status >= 500 && attempt < retryAttempts) {
        console.warn(`API request failed (attempt ${attempt}), retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        return performRequest(url, attempt + 1);
      }

      // Handle other errors
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }

      if (err.message === "Request timeout") {
        throw new Error("Request timed out. Please try again.");
      }

      throw new Error("Failed to fetch profile data. Please try again.");
    }
  };

  /**
   * Search for WhatsApp profile data
   */
  const searchProfile = async (phoneNumber: string): Promise<PhoneApiResponse> => {
    // Reset state
    error.value = null;
    rateLimited.value = false;

    // Validate input
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      error.value = "Phone number is required";
      return {
        data: null,
        loading: false,
        error: error.value,
        rateLimited: false,
      };
    }

    loading.value = true;

    try {
      // Get required tokens
      const recaptchaToken = await getRecaptchaToken();

      if (!recaptchaToken) {
        throw new Error("reCAPTCHA verification is required");
      }

      // Build request URL
      const url = buildRequestUrl(phoneNumber, recaptchaToken);

      // Perform the request
      const data = await performRequest(url);

      // Update last request time
      lastRequestTime.value = Date.now();

      // Refresh rate limit info after successful request
      fetchRateLimitInfo();

      return {
        data,
        loading: false,
        error: null,
        rateLimited: false,
      };
    } catch (err: any) {
      error.value = err.message || "An unexpected error occurred";
      console.error("Phone API error:", err);

      // Also refresh rate limit info after failed request (in case it was rate limited)
      fetchRateLimitInfo();

      return {
        data: null,
        loading: false,
        error: error.value,
        rateLimited: rateLimited.value,
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null;
    rateLimited.value = false;
  };

  /**
   * Check if user is authenticated (when auth is enabled)
   */
  const isAuthenticated = computed(() => {
    return !includeAuth || !!user.value;
  });

  /**
   * Get time remaining before next request is allowed
   */
  const getRateLimitTimeRemaining = (): number => {
    if (!rateLimited.value) return 0;

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.value;
    const minInterval = 3000;

    return Math.max(0, minInterval - timeSinceLastRequest);
  };

  const getAuthHeaders = async () => {
    const token = await getAuthToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  /**
   * Fetch current rate limit information from the server
   */
  const fetchRateLimitInfo = async (): Promise<RateLimitResponse | null> => {
    if (!import.meta.client) return null;
    rateLimitLoading.value = true;

    try {
      const { $api } = useNuxtApp();
      const { waitForLoadingFirebase } = useFirebaseAuth();
      await waitForLoadingFirebase();
      // Build URL with auth token if available
      const url = "/api/phone/limits";
      const headers = await getAuthHeaders();

      const response = (await $api.get(url, { headers })).data as RateLimitResponse;

      if (response.success && response.limits) {
        rateLimitInfo.value = response.limits;

        // Handle API key rate limits
        if (response.apiKeyLimits) {
          rateLimitInfoApi.value = response.apiKeyLimits;
        } else {
          rateLimitInfoApi.value = null;
        }

        // Update hasApiKey state
        hasApiKey.value = response.hasApiKey || false;

        // Update rate limited state based on server response
        // If user has API key and API key limits are available, use those limits
        // Otherwise, use IP-based limits
        if (hasApiKey.value && rateLimitInfoApi.value && rateLimitInfoApi.value.requestRemaining !== undefined) {
          rateLimited.value = rateLimitInfoApi.value.requestRemaining <= 0;
        } else if (hasApiKey.value && !rateLimitInfoApi.value) {
          // If user has API key but no rate limit info available, allow requests
          rateLimited.value = false;
        } else {
          rateLimited.value = response.limits.remaining <= 0;
        }
      }

      return response;
    } catch (err: any) {
      console.error("Failed to fetch rate limit info:", err);
      return null;
    } finally {
      rateLimitLoading.value = false;
    }
  };

  /**
   * Auto-refresh rate limit info periodically
   */
  const startRateLimitMonitoring = (intervalMs: number = 30000) => {
    // Initial fetch
    fetchRateLimitInfo();

    watch(
      user,
      (newUser) => {
        fetchRateLimitInfo();
      },
      { immediate: true }
    );
  };

  return {
    // State
    loading,
    error: error,
    rateLimited: rateLimited,
    isAuthenticated,
    rateLimitInfo,
    rateLimitInfoApi,
    rateLimitLoading,
    hasApiKey,

    // Methods
    searchProfile,
    clearError,
    getRateLimitTimeRemaining,
    fetchRateLimitInfo,
    startRateLimitMonitoring,

    // Configuration
    options: ref(options),
  };
};

// Export types for external use
export type { ApiKeyRateLimitInfo, PhoneApiOptions, PhoneApiResponse, RateLimitInfo, RateLimitResponse };
