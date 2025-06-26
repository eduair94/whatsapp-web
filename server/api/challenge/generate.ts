import { createChallengeToken, generateChallenge } from "~/utils/jsChallenge";

export default defineEventHandler(async (event) => {
  try {
    // Generate a new JavaScript challenge
    const challenge = generateChallenge();

    // Create a secure token containing the challenge data
    const challengeToken = createChallengeToken(challenge);

    // Return only the challenge string and ID to the client
    // The solution and token are kept secret
    return {
      success: true,
      challengeId: challenge.challengeId,
      challenge: challenge.challenge,
      expiresAt: challenge.expiresAt,
      token: challengeToken, // Server stores this for validation
    };
  } catch (error) {
    console.error("Error generating JavaScript challenge:", error);
    return {
      success: false,
      error: "Failed to generate challenge",
    };
  }
});
