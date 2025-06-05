import { computed, onMounted, ref } from "vue";
import { useFirebaseAuth } from "./useFirebaseAuth";

/**
 * Hydration-safe wrapper for Firebase auth
 * Prevents SSR/client hydration mismatches
 */
export const useHydrationSafeAuth = () => {
  const { user, loading, error, ...authMethods } = useFirebaseAuth();

  // Track if component is mounted (client-side)
  const isMounted = ref(false);

  onMounted(() => {
    isMounted.value = true;
  });

  // During SSR and before mounting, always show loading state
  const safeLoading = computed(() => {
    if (!isMounted.value) return true; // Always loading during SSR/before mount
    return loading.value;
  });

  // Only show user data after mounting
  const safeUser = computed(() => {
    if (!isMounted.value) return null; // Always null during SSR/before mount
    return user.value;
  });

  // Safe authentication checks
  const safeIsAuthenticated = computed(() => {
    if (!isMounted.value) return false; // Always false during SSR/before mount
    return !!user.value;
  });

  const safeIsNotAuthenticated = computed(() => {
    if (!isMounted.value) return true; // Always true during SSR/before mount
    return !user.value;
  });

  return {
    user: safeUser,
    loading: safeLoading,
    error,
    isAuthenticated: safeIsAuthenticated,
    isNotAuthenticated: safeIsNotAuthenticated,
    isMounted,
    ...authMethods,
  };
};
