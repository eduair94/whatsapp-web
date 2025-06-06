import { getApiKey, GetApiKeyResult } from "~/server/services/apiKeyService";
import { IpRateLimiterService } from "../../services/ipRateLimiterService";
import { authenticateUser } from "../../utils/auth-middleware";

export default defineEventHandler(async (event) => {
  // Set cache control headers to prevent caching
  setResponseHeaders(event, {
    "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  });

  try {
    // Get the client's IP address
    const ip = event.node.req.headers["x-forwarded-for"]?.toString().split(",")[0] || event.node.req.socket.remoteAddress || "unknown";

    // Check for auth token in query parameters
    const query = getQuery(event);
    const authToken = query.auth as string;

    let userInfo = null;
    let isAuthenticated = false;

    // If auth token is provided, validate it (optional: you can implement token validation here)
    if (authToken) {
      try {
        // Here you could validate the Firebase auth token if needed
        // For now, we'll just mark as authenticated if token exists
        isAuthenticated = true;
        // You could decode the token to get user info:
        // userInfo = await verifyIdToken(authToken);
      } catch (error) {
        console.error("Invalid auth token:", error);
        // Continue as unauthenticated user
      }
    }

    // Get current rate limit status for this IP
    const authResult = await authenticateUser(event);
    const ipRateLimit = new IpRateLimiterService(authResult.success);
    const limitStatus = await ipRateLimit.getRequestCount(ip);
    let hasApiKey = false;
    let apiKeyResult: GetApiKeyResult | null = null;
    if (authResult.success && authResult.user) {
      apiKeyResult = await getApiKey(authResult.user.uid);
      hasApiKey = apiKeyResult.success && !!apiKeyResult.apiKey;
    }

    const res = {
      success: true,
      ip: ip === "unknown" ? "unknown" : ip,
      authenticated: isAuthenticated,
      hasApiKey,
      limits: {
        current: limitStatus.count,
        maximum: limitStatus.max,
        remaining: Math.max(0, limitStatus.max - limitStatus.count),
        restartsInSeconds: limitStatus.restartsIn,
        restartsInMinutes: Math.ceil(limitStatus.restartsIn / 60),
      },
    };
    if (apiKeyResult?.rateLimitInfo) {
      (res as any).apiKeyLimits = apiKeyResult.rateLimitInfo;
    }
    return res;
  } catch (error) {
    console.error("Error getting IP limits:", error);

    return {
      success: false,
      error: "Failed to retrieve rate limit information",
      limits: {
        current: 0,
        maximum: 20,
        remaining: 20,
        restartsInSeconds: 0,
        restartsInMinutes: 0,
      },
    };
  }
});
