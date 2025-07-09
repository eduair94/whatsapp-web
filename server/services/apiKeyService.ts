import axios, { AxiosResponse } from "axios";
import { ApiKey } from "../models/ApiKey";
import { decryptData, encryptData, hashData, validateApiKey } from "../utils/encryption";
import { connectToMongoDB } from "../utils/mongodb";

export interface ApiKeyMetadata {
  userAgent?: string;
  ipAddress?: string;
  platform?: string;
}

export interface SaveApiKeyResult {
  success: boolean;
  message: string;
  lastSaved?: Date;
}

export interface GetApiKeyResult {
  success: boolean;
  apiKey?: string;
  lastSaved?: Date;
  message?: string;
  rateLimitInfo?: RateLimitInfo;
}

export interface RateLimitInfo {
  requestLimit?: number;
  requestRemaining?: number;
  requestReset?: number;
  quotaRequests?: number;
  quotaRequestsRemaining?: number;
  lastUpdated?: Date;
}

export interface UpdateRateLimitResult {
  success: boolean;
  message: string;
}

const processRateLimitJson = (json: any) => {
  for (let key in json) {
    json[key] = json[key] ? parseInt(json[key]) : undefined;
  }
  return json;
};

export const getRateLimitInfoReq = (rapidApiResponse: AxiosResponse<any, any>): RateLimitInfo => {
  const responseHeaders = rapidApiResponse.headers;
  console.log("Headers", responseHeaders);
  const rateLimitInfo = processRateLimitJson({
    requestReset: responseHeaders["x-ratelimit-requests-reset"],
    requestLimit: responseHeaders["x-ratelimit-requests-limit"],
    requestRemaining: responseHeaders["x-ratelimit-requests-remaining"],
  });
  return rateLimitInfo;
};

const validateApiKeyReq = async (apiKey: string) => {
  // Basic validation for API key doing a request.
  const number = "123";
  const rapidApiUrl = `https://whatsapp-data1.p.rapidapi.com/number/${number}`;
  const rapidApiResponse = await axios
    .get(rapidApiUrl, {
      headers: {
        "x-rapidapi-host": "whatsapp-data1.p.rapidapi.com",
        "x-rapidapi-key": apiKey,
      },
    })
    .catch((e) => {
      if (e?.response.status === 403) {
        throw new Error("invalid_key");
      } else {
        console.error(e);
        throw new Error("api_error");
      }
    }); // Extract rate limit headers from response
  const rateLimitInfo = getRateLimitInfoReq(rapidApiResponse);
  return rateLimitInfo;
};

/**
 * Save or update an API key for a user
 */
export async function saveApiKey(userId: string, apiKey: string, metadata?: ApiKeyMetadata): Promise<SaveApiKeyResult> {
  try {
    // Validate inputs
    if (!userId || typeof userId !== "string") {
      return { success: false, message: "Invalid user ID" };
    }

    const validation = validateApiKey(apiKey);
    if (!validation.isValid) {
      return { success: false, message: validation.error || "Invalid API key" };
    }

    // Connect to database
    await connectToMongoDB();

    // Encrypt the API key
    const { encryptedData, iv, authTag } = encryptData(apiKey.trim());
    const apiKeyHash = await hashData(apiKey.trim());

    const now = new Date();

    const validateReq = await validateApiKeyReq(apiKey.trim());
    console.log("ValidateReq", validateReq);

    // Check if user already has an API key
    const existingApiKey = await ApiKey.findOne({ userId });

    if (existingApiKey) {
      // Update existing API key
      if (existingApiKey.encryptedApiKey != encryptedData) {
        // New api key, remove the RateLimitInfo
        existingApiKey.rateLimitInfo = null;
      }
      existingApiKey.encryptedApiKey = encryptedData;
      existingApiKey.iv = iv;
      existingApiKey.isActive = true;
      existingApiKey.authTag = authTag;
      existingApiKey.apiKeyHash = apiKeyHash;
      existingApiKey.lastSaved = now;
      existingApiKey.metadata = metadata;
      existingApiKey.rateLimitInfo = {
        ...validateReq,
        lastUpdated: now,
      };

      await existingApiKey.save();

      return {
        success: true,
        message: "API key updated successfully",
        lastSaved: existingApiKey.lastSaved,
      };
    } else {
      // Create new API key entry
      const newApiKey = new ApiKey({
        userId,
        encryptedApiKey: encryptedData,
        iv,
        authTag,
        apiKeyHash,
        lastSaved: now,
        isActive: true,
        metadata,
        rateLimitInfo: {
          ...validateReq,
          lastUpdated: now,
        },
      });

      await newApiKey.save();

      return {
        success: true,
        message: "API key saved successfully",
        lastSaved: newApiKey.lastSaved,
      };
    }
  } catch (error: any) {
    console.error("❌ Error saving API key:", error);
    let message = "Failed to save API key. Please try again.";
    if (error.message === "invalid_key") {
      message = "Invalid API key provided. Please check your key and try again.";
    }
    return {
      success: false,
      message,
    };
  }
}

/**
 * Get decrypted API key for a user
 */
export async function getApiKey(userId: string): Promise<GetApiKeyResult> {
  try {
    // Validate input
    if (!userId || typeof userId !== "string") {
      return { success: false, message: "Invalid user ID" };
    }

    // Connect to database
    await connectToMongoDB();

    // Find the user's API key
    const apiKeyDoc = await ApiKey.findOne({ userId, isActive: true });

    if (!apiKeyDoc) {
      return {
        success: false,
        message: "No API key found for this user",
      };
    }

    try {
      // Decrypt the API key
      const decryptedApiKey = decryptData(apiKeyDoc.encryptedApiKey, apiKeyDoc.iv, apiKeyDoc.authTag);

      return {
        success: true,
        apiKey: decryptedApiKey,
        lastSaved: apiKeyDoc.lastSaved,
        rateLimitInfo: apiKeyDoc.rateLimitInfo,
      };
    } catch (decryptError) {
      console.error("❌ Error decrypting API key:", decryptError);
      return {
        success: false,
        message: "Failed to decrypt API key. The key may be corrupted.",
      };
    }
  } catch (error) {
    console.error("❌ Error getting API key:", error);
    return {
      success: false,
      message: "Failed to retrieve API key. Please try again.",
    };
  }
}

/**
 * Delete/deactivate API key for a user
 */
export async function deleteApiKey(userId: string): Promise<SaveApiKeyResult> {
  try {
    // Validate input
    if (!userId || typeof userId !== "string") {
      return { success: false, message: "Invalid user ID" };
    }

    // Connect to database
    await connectToMongoDB();

    // Deactivate the API key (soft delete)
    const result = await ApiKey.updateOne(
      { userId, isActive: true },
      {
        isActive: false,
        lastSaved: new Date(),
        // Clear sensitive data
        encryptedApiKey: "",
        iv: "",
        authTag: "",
        apiKeyHash: "",
        rateLimitInfo: null,
      }
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        message: "No active API key found for this user",
      };
    }

    return {
      success: true,
      message: "API key deleted successfully",
    };
  } catch (error) {
    console.error("❌ Error deleting API key:", error);
    return {
      success: false,
      message: "Failed to delete API key. Please try again.",
    };
  }
}

/**
 * Check if user has an API key
 */
export async function hasApiKey(userId: string): Promise<{ hasKey: boolean; lastSaved?: Date }> {
  try {
    // Validate input
    if (!userId || typeof userId !== "string") {
      return { hasKey: false };
    }

    // Connect to database
    await connectToMongoDB();

    // Check if user has an active API key
    const apiKeyDoc = await ApiKey.findOne(
      { userId, isActive: true },
      { lastSaved: 1 } // Only return lastSaved field
    );

    return {
      hasKey: !!apiKeyDoc,
      lastSaved: apiKeyDoc?.lastSaved,
    };
  } catch (error) {
    console.error("❌ Error checking API key existence:", error);
    return { hasKey: false };
  }
}

/**
 * Get API key statistics (admin function)
 */
export async function getApiKeyStats(): Promise<{
  totalActiveKeys: number;
  totalInactiveKeys: number;
  recentlyUpdated: number;
}> {
  try {
    await connectToMongoDB();

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const [activeCount, inactiveCount, recentCount] = await Promise.all([
      ApiKey.countDocuments({ isActive: true }),
      ApiKey.countDocuments({ isActive: false }),
      ApiKey.countDocuments({
        isActive: true,
        lastSaved: { $gte: oneDayAgo },
      }),
    ]);

    return {
      totalActiveKeys: activeCount,
      totalInactiveKeys: inactiveCount,
      recentlyUpdated: recentCount,
    };
  } catch (error) {
    console.error("❌ Error getting API key stats:", error);
    return {
      totalActiveKeys: 0,
      totalInactiveKeys: 0,
      recentlyUpdated: 0,
    };
  }
}

/**
 * Update rate limit information for a user's API key
 */
export async function updateRateLimitInfo(userId: string, rateLimitInfo: RateLimitInfo): Promise<UpdateRateLimitResult> {
  try {
    // Validate input
    if (!userId || typeof userId !== "string") {
      return { success: false, message: "Invalid user ID" };
    }

    // Connect to database
    await connectToMongoDB();

    // Update the rate limit info
    const result = await ApiKey.updateOne(
      { userId },
      {
        $set: {
          rateLimitInfo: {
            ...rateLimitInfo,
            lastUpdated: new Date(),
          },
        },
      }
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        message: "No active API key found for this user",
      };
    }

    return {
      success: true,
      message: "Rate limit information updated successfully",
    };
  } catch (error) {
    console.error("❌ Error updating rate limit info:", error);
    return {
      success: false,
      message: "Failed to update rate limit information",
    };
  }
}

/**
 * Get rate limit information for a user's API key
 */
export async function getRateLimitInfo(userId: string): Promise<{ success: boolean; rateLimitInfo?: RateLimitInfo; message?: string }> {
  try {
    // Validate input
    if (!userId || typeof userId !== "string") {
      return { success: false, message: "Invalid user ID" };
    }

    // Connect to database
    await connectToMongoDB();

    // Find the user's API key
    const apiKeyDoc = await ApiKey.findOne(
      { userId, isActive: true },
      { rateLimitInfo: 1 } // Only return rateLimitInfo field
    );

    if (!apiKeyDoc) {
      return {
        success: false,
        message: "No API key found for this user",
      };
    }

    return {
      success: true,
      rateLimitInfo: apiKeyDoc.rateLimitInfo,
    };
  } catch (error) {
    console.error("❌ Error getting rate limit info:", error);
    return {
      success: false,
      message: "Failed to retrieve rate limit information",
    };
  }
}
