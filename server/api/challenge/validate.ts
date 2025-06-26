import { parseChallengeToken, validateChallenge } from "~/utils/jsChallenge";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { challengeToken, challengeId, solution } = body;

    if (!challengeToken || !challengeId || typeof solution !== "number") {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Parse the challenge token to get the original challenge data
    const challengeData = parseChallengeToken(challengeToken);

    if (!challengeData) {
      return {
        success: false,
        error: "Invalid challenge token",
      };
    }

    // Verify the challenge ID matches
    if (challengeData.challengeId !== challengeId) {
      return {
        success: false,
        error: "Challenge ID mismatch",
      };
    }

    // Validate the solution
    const validation = validateChallenge(challengeData, solution);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || "Invalid solution",
      };
    }

    // Challenge solved successfully
    return {
      success: true,
      message: "Challenge solved successfully",
    };
  } catch (error) {
    console.error("Error validating JavaScript challenge:", error);
    return {
      success: false,
      error: "Failed to validate challenge",
    };
  }
});
