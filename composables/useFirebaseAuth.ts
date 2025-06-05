import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, type User } from "firebase/auth";
import { computed, nextTick, ref } from "vue";

const user = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
let authInitialized = false;
const isSSR = typeof window === 'undefined';

export const useFirebaseAuth = () => {
  const { $firebase } = useNuxtApp();
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      error.value = null;
      loading.value = true;
      const userCredential = await signInWithEmailAndPassword($firebase.auth, email, password);
      user.value = userCredential.user;
      return userCredential.user;
    } catch (err: any) {
      error.value = getFirebaseErrorMessage(err.code);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      error.value = null;
      loading.value = true;
      const userCredential = await createUserWithEmailAndPassword($firebase.auth, email, password);

      // Update profile with display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      user.value = userCredential.user;
      return userCredential.user;
    } catch (err: any) {
      error.value = getFirebaseErrorMessage(err.code);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      error.value = null;
      loading.value = true;
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope("profile");
      provider.addScope("email");

      const userCredential = await signInWithPopup($firebase.auth, provider);
      user.value = userCredential.user;
      return userCredential.user;
    } catch (err: any) {
      error.value = getFirebaseErrorMessage(err.code);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      error.value = null;
      await signOut($firebase.auth);
      user.value = null;
    } catch (err: any) {
      error.value = getFirebaseErrorMessage(err.code);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      error.value = null;
      await sendPasswordResetEmail($firebase.auth, email);
    } catch (err: any) {
      error.value = getFirebaseErrorMessage(err.code);
      throw err;
    }
  };

  // Initialize auth state listener
  const initializeAuth = async () => {
    console.log("Init auth");
    const isNotLogged = ultraFastAuthCheck().definitelyNotLoggedIn;
    console.log("not logged in", isNotLogged);
    if (isNotLogged) loading.value = false;

    return new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged($firebase.auth, (firebaseUser) => {
        user.value = firebaseUser;
        loading.value = false; // Set loading to false regardless of user state
        resolve(firebaseUser);
        // Don't unsubscribe immediately - keep listening for auth changes
      });

      // Return unsubscribe function for cleanup if needed
      return unsubscribe;
    });
  };

  // Helper function to get user-friendly error messages
  const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No user found with this email address";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/email-already-in-use":
        return "Email address is already in use";
      case "auth/weak-password":
        return "Password should be at least 6 characters";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later";
      case "auth/network-request-failed":
        return "Network error. Please check your connection";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled";
      case "auth/popup-blocked":
        return "Pop-up was blocked by your browser. Please enable pop-ups and try again";
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with the same email address but different sign-in credentials";
      default:
        return "An error occurred. Please try again";
    }
  };

  // Quick direct Firebase auth check (synchronous)
  const getCurrentUser = () => $firebase.auth.currentUser;
  const isCurrentUserNull = () => !$firebase.auth.currentUser;

  // Fastest way to discard non-authenticated users
  const quickAuthCheck = () => {
    const currentUser = $firebase.auth.currentUser;
    return {
      isLoggedIn: !!currentUser,
      isNotLoggedIn: !currentUser,
      user: currentUser,
      // Additional quick checks
      hasEmailVerified: currentUser?.emailVerified || false,
      hasDisplayName: !!currentUser?.displayName,
      authMethod: currentUser?.providerData?.[0]?.providerId || null,
    };
  };

  // Ultra-fast storage-based checks (fastest possible)
  const ultraFastAuthCheck = () => {
    // Check if there's any Firebase auth data in storage at all
    const hasFirebaseAuth = typeof window !== "undefined" && (localStorage.getItem("firebase:authUser:" + $firebase.auth.app.options.apiKey + ":[DEFAULT]") || sessionStorage.getItem("firebase:authUser:" + $firebase.auth.app.options.apiKey + ":[DEFAULT]"));

    return {
      hasStorageData: !!hasFirebaseAuth,
      noStorageData: !hasFirebaseAuth,
      currentUserExists: !!$firebase.auth.currentUser,
      // Quick disqualification - if no storage AND no currentUser, definitely not logged in
      definitelyNotLoggedIn: !hasFirebaseAuth && !$firebase.auth.currentUser,
    };
  };

  // Computed helpers for quick checks
  const isAuthenticated = computed(() => !!user.value);
  const isNotAuthenticated = computed(() => !user.value);
  const isLoading = computed(() => loading.value);
  const isReady = computed(() => !loading.value); // Auth state has been determined

  // Auto-initialize auth on first call (SSR-friendly approach)
  if (!isSSR && !authInitialized) {
    authInitialized = true;
    // Use nextTick to ensure consistent hydration
    nextTick(() => {
      initializeAuth();
    });
  }

  return {
    user,
    loading: loading,
    error: error,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    initializeAuth,
    // Direct Firebase checks
    getCurrentUser,
    isCurrentUserNull,
    quickAuthCheck,
    ultraFastAuthCheck,
    // Helper computed properties
    isAuthenticated,
    isNotAuthenticated,
    isLoading,
    isReady,
  };
};
