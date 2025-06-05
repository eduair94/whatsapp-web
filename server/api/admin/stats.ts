import { getApiKeyStats } from "../../services/apiKeyService";
import { createAuthenticatedHandler, createErrorResponse, createSuccessResponse, validateMethod, type AuthenticatedUser } from "../../utils/auth-middleware";
import { getConnectionStatus } from "../../utils/mongodb";

export default defineEventHandler(async (event) => {
  // Handle CORS preflight requests
  if (event.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Only allow GET requests
  if (!validateMethod(event, ["GET"])) {
    return createErrorResponse("Method not allowed", 405);
  }

  return await handleGetStats(event);
});

/**
 * Handle GET request - Get API key and system statistics
 */
const handleGetStats = createAuthenticatedHandler(async (event, user: AuthenticatedUser) => {
  try {
    // Basic admin check (you can implement more sophisticated admin role checking)
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    const isAdmin = adminEmails.includes(user.email || "");

    if (!isAdmin) {
      return createErrorResponse("Access denied. Admin privileges required.", 403);
    }

    // Get API key statistics
    const apiKeyStats = await getApiKeyStats();

    // Get MongoDB connection status
    const dbStatus = getConnectionStatus();

    // Get system information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    return createSuccessResponse({
      apiKeys: apiKeyStats,
      database: dbStatus,
      system: systemInfo,
      user: {
        uid: user.uid,
        email: user.email,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("❌ Error in handleGetStats:", error);
    return createErrorResponse("Failed to retrieve statistics", 500);
  }
});
