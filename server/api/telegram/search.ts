import axios from "axios";
import { IpRateLimiterService } from "../../services/ipRateLimiterService";
import { authenticateUser } from "../../utils/auth-middleware";

// Helper function to get client IP
function getClientIP(event: any): string {
  const headers = getHeaders(event) || {};
  return headers["x-forwarded-for"]?.split(",")[0]?.trim() || headers["x-real-ip"] || headers["x-client-ip"] || headers["cf-connecting-ip"] || event.node?.req?.connection?.remoteAddress || event.node?.req?.socket?.remoteAddress || "unknown";
}

// Helper function to get headers
function getHeaders(event: any): Record<string, string> | undefined {
  return event.node?.req?.headers || event.headers;
}

const rateLimiter = new IpRateLimiterService(true, "IpRequest_telegram_search"); // true = authenticated user
rateLimiter.RATE_LIMIT = 20; // 20 requests per minute for authenticated users
rateLimiter.WINDOW = 60 * 1000; // 1 minute window

export default defineEventHandler(async (event) => {
  try {
    // Check authentication first
    const authResult = await authenticateUser(event);
    if (!authResult.success) {
      setResponseStatus(event, 401);
      return {
        success: false,
        error: "Authentication required. Please sign in to access the telegram database.",
        statusCode: 401,
        authRequired: true,
      };
    }

    // Check rate limit for authenticated users (20 requests per minute)
    const clientIP = getClientIP(event) || "unknown";

    const isWithinLimit = await rateLimiter.checkRateLimit(clientIP);
    if (!isWithinLimit) {
      const limitInfo = await rateLimiter.getRequestCount(clientIP);
      setResponseStatus(event, 429);
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
        statusCode: 429,
        rateLimit: {
          limit: limitInfo.max,
          current: limitInfo.count,
          restartsIn: limitInfo.restartsIn,
        },
      };
    }

    const query = getQuery(event);

    // Parse and validate query parameters for telegram search
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const number = query.number as string;
    const countryCode = query.countryCode as string;
    const hasPhoto = query.hasPhoto as string;
    const isBot = query.isBot as string;
    const dateFrom = query.dateFrom as string;
    const dateTo = query.dateTo as string;
    const includeCount = query.includeCount === "true"; // Optional: include total count
    const search = query.search as string;
    const username = query.username as string;
    const firstName = query.firstName as string;
    const lastName = query.lastName as string;

    // Build query parameters for the proxy request
    const params = new URLSearchParams();

    // Add parameters only if they exist
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    if (number) params.append("number", number);
    if (countryCode) params.append("countryCode", countryCode);
    if (hasPhoto) params.append("hasPhoto", hasPhoto);
    if (isBot) params.append("isBot", isBot);
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    if (includeCount) params.append("includeCount", "true");
    if (search) params.append("search", search);
    if (username) params.append("username", username);
    if (firstName) params.append("firstName", firstName);
    if (lastName) params.append("lastName", lastName);

    // Set cache headers based on query parameters
    // This helps ensure the cache varies by different search parameters
    const cacheKey = params.toString();

    // Set response headers for caching
    setHeader(event, "Cache-Control", "max-age=60, s-maxage=60"); // 1 minute cache
    setHeader(event, "Vary", "Accept-Encoding, Accept-Language, X-Forwarded-For");

    // Add ETag based on query parameters for better cache validation
    if (cacheKey) {
      const etag = Buffer.from(cacheKey).toString("base64");
      setHeader(event, "ETag", `"${etag}"`);

      // Check if client has cached version
      const ifNoneMatch = getHeader(event, "if-none-match");
      if (ifNoneMatch === `"${etag}"`) {
        setResponseStatus(event, 304);
        return null;
      }
    }

    const endpoint = `http://104.234.204.107:3728/telegram-numbers/search?${params.toString()}`;
    console.log("Requesting Telegram search API:", endpoint);

    const response = await axios.get(endpoint);

    // Increment rate limit counter after successful request
    await rateLimiter.incrementSuccessfulRequest(clientIP);

    return response.data;
  } catch (error: any) {
    console.error("Telegram search API request failed:", error);

    // Return structured error response
    return {
      success: false,
      error: error.response?.data?.message || "Telegram search request failed",
      statusCode: error.response?.status || 500,
    };
  }
});
