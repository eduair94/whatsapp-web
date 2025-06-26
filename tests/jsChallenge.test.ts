import { createChallengeToken, generateChallenge, parseChallengeToken, solveChallenge, validateChallenge } from "~/utils/jsChallenge";

describe("JavaScript Challenge System", () => {
  test("should generate a valid challenge", () => {
    const challenge = generateChallenge();

    expect(challenge).toHaveProperty("challenge");
    expect(challenge).toHaveProperty("solution");
    expect(challenge).toHaveProperty("expiresAt");
    expect(challenge).toHaveProperty("challengeId");

    expect(typeof challenge.challenge).toBe("string");
    expect(typeof challenge.solution).toBe("number");
    expect(typeof challenge.expiresAt).toBe("number");
    expect(typeof challenge.challengeId).toBe("string");

    // Challenge should not expire immediately
    expect(challenge.expiresAt).toBeGreaterThan(Date.now());
  });

  test("should solve challenges correctly", () => {
    const challenge = generateChallenge();
    const solved = solveChallenge(challenge.challenge);

    expect(solved).toBe(challenge.solution);
  });

  test("should validate correct solutions", () => {
    const challenge = generateChallenge();
    const validation = validateChallenge(challenge, challenge.solution);

    expect(validation.valid).toBe(true);
    expect(validation.error).toBeUndefined();
  });

  test("should reject incorrect solutions", () => {
    const challenge = generateChallenge();
    const validation = validateChallenge(challenge, challenge.solution + 1);

    expect(validation.valid).toBe(false);
    expect(validation.error).toBeDefined();
  });

  test("should reject expired challenges", () => {
    const challenge = generateChallenge();
    // Manually set expiration to past
    challenge.expiresAt = Date.now() - 1000;

    const validation = validateChallenge(challenge, challenge.solution);

    expect(validation.valid).toBe(false);
    expect(validation.error).toBe("Challenge expired");
  });

  test("should create and parse challenge tokens", () => {
    const challenge = generateChallenge();
    const token = createChallengeToken(challenge);
    const parsed = parseChallengeToken(token);

    expect(parsed).toEqual(challenge);
  });

  test("should handle invalid tokens gracefully", () => {
    const parsed = parseChallengeToken("invalid-token");
    expect(parsed).toBeNull();
  });

  test("should reject unsafe JavaScript expressions", () => {
    const unsafeChallenge = 'alert("hack")';
    const result = solveChallenge(unsafeChallenge);

    expect(result).toBeNull();
  });

  test("should handle various challenge types", () => {
    // Generate multiple challenges to test different types
    for (let i = 0; i < 10; i++) {
      const challenge = generateChallenge();
      const solved = solveChallenge(challenge.challenge);

      expect(solved).toBe(challenge.solution);
      expect(typeof solved).toBe("number");
      expect(isFinite(solved)).toBe(true);
    }
  });
});
