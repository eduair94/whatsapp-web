import { computed, ref } from "vue";
import { solveChallenge } from "~/utils/jsChallenge";

interface ChallengeData {
  challengeId: string;
  challenge: string;
  expiresAt: number;
  token: string;
}

interface ChallengeState {
  loading: boolean;
  error: string | null;
  challengeData: ChallengeData | null;
  solution: number | null;
  validated: boolean;
}

const challengeState = ref<ChallengeState>({
  loading: false,
  error: null,
  challengeData: null,
  solution: null,
  validated: false,
});

export const useJSChallenge = () => {
  /**
   * Generate a new JavaScript challenge from the server
   */
  const generateChallenge = async (): Promise<boolean> => {
    try {
      challengeState.value.loading = true;
      challengeState.value.error = null;

      const { $api } = useNuxtApp();
      const response = await $api.get("/api/challenge/generate");

      if (response.data.success) {
        challengeState.value.challengeData = {
          challengeId: response.data.challengeId,
          challenge: response.data.challenge,
          expiresAt: response.data.expiresAt,
          token: response.data.token,
        };

        // Automatically solve the challenge
        const solution = solveChallenge(response.data.challenge);

        if (solution !== null) {
          challengeState.value.solution = solution;
          return true;
        } else {
          challengeState.value.error = "Failed to solve challenge";
          return false;
        }
      } else {
        challengeState.value.error = response.data.error || "Failed to generate challenge";
        return false;
      }
    } catch (error: any) {
      console.error("Error generating challenge:", error);
      challengeState.value.error = error.message || "Network error";
      return false;
    } finally {
      challengeState.value.loading = false;
    }
  };

  /**
   * Validate the solved challenge with the server
   */
  const validateChallenge = async (): Promise<boolean> => {
    if (!challengeState.value.challengeData || challengeState.value.solution === null) {
      challengeState.value.error = "No challenge data available";
      return false;
    }

    try {
      challengeState.value.loading = true;
      challengeState.value.error = null;

      const { $api } = useNuxtApp();
      const response = await $api.post("/api/challenge/validate", {
        challengeToken: challengeState.value.challengeData.token,
        challengeId: challengeState.value.challengeData.challengeId,
        solution: challengeState.value.solution,
      });

      if (response.data.success) {
        challengeState.value.validated = true;
        return true;
      } else {
        challengeState.value.error = response.data.error || "Challenge validation failed";
        return false;
      }
    } catch (error: any) {
      console.error("Error validating challenge:", error);
      challengeState.value.error = error.message || "Network error";
      return false;
    } finally {
      challengeState.value.loading = false;
    }
  };

  /**
   * Get challenge parameters for API requests
   */
  const getChallengeParams = () => {
    if (!challengeState.value.challengeData || challengeState.value.solution === null || !challengeState.value.validated) {
      return {};
    }

    return {
      challengeToken: challengeState.value.challengeData.token,
      challengeId: challengeState.value.challengeData.challengeId,
      challengeSolution: challengeState.value.solution,
    };
  };

  /**
   * Check if challenge is expired
   */
  const isExpired = computed(() => {
    if (!challengeState.value.challengeData) return false;
    return Date.now() > challengeState.value.challengeData.expiresAt;
  });

  /**
   * Check if challenge is ready to use
   */
  const isReady = computed(() => {
    return challengeState.value.challengeData !== null && challengeState.value.solution !== null && challengeState.value.validated && !isExpired.value;
  });

  /**
   * Reset challenge state
   */
  const resetChallenge = () => {
    challengeState.value = {
      loading: false,
      error: null,
      challengeData: null,
      solution: null,
      validated: false,
    };
  };

  /**
   * Complete challenge flow (generate + validate)
   */
  const completeChallenge = async (): Promise<boolean> => {
    const generated = await generateChallenge();
    if (!generated) return false;

    const validated = await validateChallenge();
    return validated;
  };

  return {
    // State
    loading: computed(() => challengeState.value.loading),
    error: computed(() => challengeState.value.error),
    isReady,
    isExpired,
    validated: computed(() => challengeState.value.validated),

    // Actions
    generateChallenge,
    validateChallenge,
    completeChallenge,
    getChallengeParams,
    resetChallenge,
  };
};
