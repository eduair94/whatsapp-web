import bcrypt from "bcryptjs";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SALT_ROUNDS = 12;

/**
 * Get encryption secret from environment variables
 */
function getEncryptionSecret(): string {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET environment variable is required");
  }
  if (secret.length < 32) {
    throw new Error("ENCRYPTION_SECRET must be at least 32 characters long");
  }
  return secret;
}

/**
 * Encrypt sensitive data (like API keys)
 */
export function encryptData(text: string): { encryptedData: string; iv: string; authTag: string } {
  try {
    const secret = getEncryptionSecret();
    const key = crypto.scryptSync(secret, "salt", 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from("apikey", "utf8"));

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
      encryptedData: encrypted,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    };
  } catch (error) {
    console.error("❌ Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt sensitive data (like API keys)
 */
export function decryptData(encryptedData: string, iv: string, authTag: string): string {
  try {
    const secret = getEncryptionSecret();
    const key = crypto.scryptSync(secret, "salt", 32);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, "hex"));
    decipher.setAAD(Buffer.from("apikey", "utf8"));
    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Hash data using bcrypt (for additional security layer)
 */
export async function hashData(data: string): Promise<string> {
  try {
    return await bcrypt.hash(data, SALT_ROUNDS);
  } catch (error) {
    console.error("❌ Hashing failed:", error);
    throw new Error("Failed to hash data");
  }
}

/**
 * Verify hashed data using bcrypt
 */
export async function verifyHash(data: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(data, hash);
  } catch (error) {
    console.error("❌ Hash verification failed:", error);
    return false;
  }
}

/**
 * Generate a secure random string for API key validation tokens
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Sanitize and validate API key format
 */
export function validateApiKey(apiKey: string): { isValid: boolean; error?: string } {
  if (!apiKey || typeof apiKey !== "string") {
    return { isValid: false, error: "API key must be a non-empty string" };
  }

  // Remove any whitespace
  const cleanKey = apiKey.trim();

  if (cleanKey.length < 20) {
    return { isValid: false, error: "API key must be at least 20 characters long" };
  }

  if (cleanKey.length > 200) {
    return { isValid: false, error: "API key is too long (maximum 200 characters)" };
  }

  // Check for common invalid patterns
  if (/^[0\s]+$/.test(cleanKey)) {
    return { isValid: false, error: "API key appears to be invalid (all zeros or spaces)" };
  }

  return { isValid: true };
}
