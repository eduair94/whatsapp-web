import { getQuery, readBody } from "h3";
import { deleteApiKey, getApiKey, hasApiKey, saveApiKey } from "../../services/apiKeyService";
import { createAuthenticatedHandler, createErrorResponse, createSuccessResponse, validateMethod, type AuthenticatedUser } from "../../utils/auth-middleware";

export default defineEventHandler(async (event) => {
  // Handle CORS preflight requests
  if (event.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Validate HTTP method
  if (!validateMethod(event, ["GET", "POST", "DELETE"])) {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    switch (event.method) {
      case "POST":
        return await handleSaveApiKey(event);
      case "GET":
        return await handleGetApiKey(event);
      case "DELETE":
        return await handleDeleteApiKey(event);
      default:
        return createErrorResponse("Method not allowed", 405);
    }
  } catch (error) {
    console.error("❌ API Key endpoint error:", error);
    return createErrorResponse("Internal server error", 500);
  }
});

/**
 * Handle POST request - Save/Update API key
 */
const handleSaveApiKey = createAuthenticatedHandler(async (event, user: AuthenticatedUser, metadata) => {
  try {
    const body = await readBody(event);
    const { apiKey } = body;

    if (!apiKey) {
      return createErrorResponse("API key is required");
    }

    // Save the API key with user authentication
    const result = await saveApiKey(user.uid, apiKey, metadata);

    if (!result.success) {
      return createErrorResponse(result.message, 400);
    }

    return createSuccessResponse({
      message: result.message,
      lastSaved: result.lastSaved,
    });
  } catch (error) {
    console.error("❌ Error in handleSaveApiKey:", error);
    return createErrorResponse("Failed to save API key. Please try again.", 500);
  }
});

/**
 * Handle GET request - Retrieve API key information
 */
const handleGetApiKey = createAuthenticatedHandler(async (event, user: AuthenticatedUser) => {
  try {
    // Check if requesting full API key or just status
    const query = getQuery(event);
    const fullKey = query.full === "true";

    if (fullKey) {
      // Return the full decrypted API key (for API calls)
      const result = await getApiKey(user.uid);

      if (!result.success) {
        return createErrorResponse(result.message || "API key not found", 404);
      }

      return createSuccessResponse({
        apiKey: result.apiKey,
        lastSaved: result.lastSaved,
      });
    } else {
      // Return API key status and masked key (for UI display)
      const keyStatus = await hasApiKey(user.uid);

      if (!keyStatus.hasKey) {
        return createSuccessResponse({
          hasKey: false,
        });
      }

      // Get the key to create a masked version
      const result = await getApiKey(user.uid);

      if (!result.success || !result.apiKey) {
        return createSuccessResponse({
          hasKey: false,
        });
      }

      // Create masked version for display
      const maskedKey = result.apiKey.length > 12 ? result.apiKey.substring(0, 8) + "..." + result.apiKey.substring(result.apiKey.length - 4) : result.apiKey.substring(0, 4) + "...";

      return createSuccessResponse({
        hasKey: true,
        apiKey: maskedKey,
        lastSaved: keyStatus.lastSaved,
      });
    }
  } catch (error) {
    console.error("❌ Error in handleGetApiKey:", error);
    return createErrorResponse("Failed to retrieve API key information", 500);
  }
});

/**
 * Handle DELETE request - Remove API key
 */
const handleDeleteApiKey = createAuthenticatedHandler(async (event, user: AuthenticatedUser) => {
  try {
    const result = await deleteApiKey(user.uid);

    if (!result.success) {
      return createErrorResponse(result.message, 400);
    }

    return createSuccessResponse({
      message: result.message,
    });
  } catch (error) {
    console.error("❌ Error in handleDeleteApiKey:", error);
    return createErrorResponse("Failed to delete API key. Please try again.", 500);
  }
});
