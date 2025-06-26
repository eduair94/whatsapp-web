/**
 * JavaScript Challenge System for Bot Prevention
 * This utility generates mathematical challenges that require JavaScript execution
 * to solve, helping prevent automated bot requests.
 */

export interface JSChallenge {
  challenge: string;
  solution: number;
  expiresAt: number;
  challengeId: string;
}

export interface JSChallengeResponse {
  challengeId: string;
  solution: number;
}

/**
 * Generate a random mathematical challenge
 */
export const generateChallenge = (): JSChallenge => {
  const challengeId = generateChallengeId();
  const expiresAt = Date.now() + 5 * 60 * 1000; // Expires in 5 minutes

  // Generate different types of mathematical challenges
  const challengeType = Math.floor(Math.random() * 4);
  let challenge: string;
  let solution: number;

  switch (challengeType) {
    case 0: {
      // Simple arithmetic
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 30) + 5;
      const operations = ["+", "-", "*"];
      const op = operations[Math.floor(Math.random() * operations.length)];
      challenge = `${a} ${op} ${b}`;

      switch (op) {
        case "+":
          solution = a + b;
          break;
        case "-":
          solution = a - b;
          break;
        case "*":
          solution = a * b;
          break;
        default:
          solution = a + b;
      }
      break;
    }

    case 1: {
      // Array operations
      const arr = Array.from({ length: Math.floor(Math.random() * 5) + 3 }, () => Math.floor(Math.random() * 20) + 1);
      challenge = `[${arr.join(", ")}].reduce((a, b) => a + b, 0)`;
      solution = arr.reduce((a, b) => a + b, 0);
      break;
    }

    case 2: {
      // String length and character codes
      const words = ["hello", "world", "javascript", "challenge", "security", "verify"];
      const word = words[Math.floor(Math.random() * words.length)];
      challenge = `'${word}'.length + '${word}'.charCodeAt(0)`;
      solution = word.length + word.charCodeAt(0);
      break;
    }

    case 3: {
      // Math operations
      const base = Math.floor(Math.random() * 10) + 2;
      const power = Math.floor(Math.random() * 3) + 2;
      const randomAdd = Math.floor(Math.random() * 20) + 1;
      challenge = `Math.pow(${base}, ${power}) + ${randomAdd}`;
      solution = Math.pow(base, power) + randomAdd;
      break;
    }

    default: {
      // Fallback to simple addition
      const a = Math.floor(Math.random() * 100) + 1;
      const b = Math.floor(Math.random() * 100) + 1;
      challenge = `${a} + ${b}`;
      solution = a + b;
    }
  }

  return {
    challenge,
    solution,
    expiresAt,
    challengeId,
  };
};

/**
 * Generate a unique challenge ID
 */
const generateChallengeId = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + Date.now().toString(36);
};

/**
 * Client-side challenge solver
 * This function evaluates the JavaScript challenge safely
 */
export const solveChallenge = (challenge: string): number | null => {
  try {
    // Use the comprehensive validation function
    if (!validateChallengeString(challenge)) {
      console.error("Challenge contains unsafe operations:", challenge);
      return null;
    }

    // Disable dangerous functions in evaluation context
    const safeEval = new Function(
      "Math",
      `
      "use strict";
      const window = undefined;
      const document = undefined;
      const global = undefined;
      const process = undefined;
      const require = undefined;
      const console = undefined;
      
      return ${challenge};
      `
    );

    const result = safeEval(Math);

    // Ensure result is a finite number
    if (typeof result === "number" && isFinite(result)) {
      return Math.floor(result); // Always return integer
    }

    console.error("Challenge result is not a valid number:", result);
    return null;
  } catch (error) {
    console.error("Error solving challenge:", error, "Challenge:", challenge);
    return null;
  }
};

/**
 * Validate challenge solution server-side
 */
export const validateChallenge = (challengeData: JSChallenge, providedSolution: number): { valid: boolean; error?: string } => {
  // Check if challenge has expired
  if (Date.now() > challengeData.expiresAt) {
    return { valid: false, error: "Challenge expired" };
  }

  // Validate solution
  if (providedSolution !== challengeData.solution) {
    return { valid: false, error: "Invalid solution" };
  }

  return { valid: true };
};

/**
 * Create a challenge token that can be stored temporarily
 */
export const createChallengeToken = (challenge: JSChallenge): string => {
  return Buffer.from(JSON.stringify(challenge)).toString("base64");
};

/**
 * Parse challenge token back to challenge object
 */
export const parseChallengeToken = (token: string): JSChallenge | null => {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(decoded) as JSChallenge;
  } catch (error) {
    return null;
  }
};

/**
 * Validate challenge string for security
 */
const validateChallengeString = (challenge: string): boolean => {
  // Check for common dangerous patterns
  const dangerousPatterns = [/eval\s*\(/, /Function\s*\(/, /setTimeout\s*\(/, /setInterval\s*\(/, /import\s*\(/, /require\s*\(/, /process\./, /global\./, /window\./, /document\./, /__proto__/, /constructor/, /prototype/];

  // Check for dangerous patterns
  for (const pattern of dangerousPatterns) {
    if (pattern.test(challenge)) {
      return false;
    }
  }

  // Validate specific challenge patterns
  const validPatterns = [
    // Simple arithmetic: "number operator number"
    /^\d+\s*[+\-*]\s*\d+$/,
    // Array reduce: "[numbers].reduce((a, b) => a + b, 0)"
    /^\[\d+(?:,\s*\d+)*\]\.reduce\(\(a,\s*b\)\s*=>\s*a\s*\+\s*b,\s*0\)$/,
    // String operations: "'word'.length + 'word'.charCodeAt(0)"
    /^'[a-zA-Z]+'\s*\.\s*length\s*\+\s*'[a-zA-Z]+'\s*\.\s*charCodeAt\(0\)$/,
    // Math operations: "Math.pow(number, number) + number"
    /^Math\.pow\(\d+,\s*\d+\)\s*\+\s*\d+$/,
  ];

  // Check if challenge matches any valid pattern
  return validPatterns.some((pattern) => pattern.test(challenge));
};

/**
 * Test function to verify challenge generation and validation
 */
export const testChallengeGeneration = (): void => {
  console.log("Testing challenge generation...");

  for (let i = 0; i < 20; i++) {
    const challenge = generateChallenge();
    const solution = solveChallenge(challenge.challenge);

    console.log(`Challenge ${i + 1}:`, {
      challenge: challenge.challenge,
      expectedSolution: challenge.solution,
      computedSolution: solution,
      valid: solution === challenge.solution,
    });

    if (solution !== challenge.solution) {
      console.error(`Challenge ${i + 1} failed validation!`);
    }
  }

  console.log("Challenge generation test complete.");
};
