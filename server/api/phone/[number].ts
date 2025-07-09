import axios from "axios";
import { parseChallengeToken, validateChallenge } from "~/utils/jsChallenge";
import { getApiKey, getRateLimitInfoReq, updateRateLimitInfo } from "../../services/apiKeyService";
import { IpRateLimiterService } from "../../services/ipRateLimiterService";
import { authenticateUser } from "../../utils/auth-middleware";

const captchaSecret = "6LcTNcMUAAAAADEpxYQ1v20gTFN4h4nHfC1kJqCs";

export default defineEventHandler(async (event) => {
  try {
    const ip = event.node.req.headers["x-forwarded-for"]?.toString().split(",")[0] || event.node.req.socket.remoteAddress || "unknown";
    // Check rate limit using MongoDB
    const authResult = await authenticateUser(event);
    const ipRateLimit = new IpRateLimiterService(authResult.success);
    const isWithinLimit = await ipRateLimit.canMakeRequest(ip);

    const number = getRouterParam(event, "number");
    const query = getQuery(event);
    const token = query.token;
    const challengeToken = query.challengeToken;
    const challengeId = query.challengeId;
    const challengeSolution = query.challengeSolution ? parseInt(query.challengeSolution as string) : undefined;
    const telegram = query.telegram;

    // Validate JavaScript challenge first (anti-bot measure)
    if (challengeToken && challengeId && typeof challengeSolution === "number") {
      const challengeData = parseChallengeToken(challengeToken as string);

      if (!challengeData) {
        return { error: "Invalid challenge token" };
      }

      if (challengeData.challengeId !== challengeId) {
        return { error: "Challenge ID mismatch" };
      }

      const validation = validateChallenge(challengeData, challengeSolution);
      if (!validation.valid) {
        return { error: "Challenge validation failed: " + (validation.error || "Invalid solution") };
      }
    } else if (!authResult.success || !authResult.user) {
      // If user is not authenticated, require JavaScript challenge
      return { error: "JavaScript challenge required for unauthenticated requests" };
    }

    // If not within rate limit, check if user has API key for fallback
    if (!isWithinLimit) {
      if (authResult.success && authResult.user) {
        const apiKeyResult = await getApiKey(authResult.user.uid);

        if (apiKeyResult.success && apiKeyResult.apiKey && token) {
          // Verify reCAPTCHA first
          const url = `https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecret}&response=${token}`;
          const captchaVerification = await axios.post(url).then((res) => res.data);
          if (captchaVerification.success) {
            try {
              // Use RapidAPI endpoint with user's API key
              const rapidApiUrl = `https://whatsapp-data1.p.rapidapi.com/number/${number}?telegram=${telegram}`;
              const rapidApiResponse = await axios.get(rapidApiUrl, {
                headers: {
                  "x-rapidapi-host": "whatsapp-data1.p.rapidapi.com",
                  "x-rapidapi-key": apiKeyResult.apiKey,
                },
              }); // Extract rate limit headers from response
              const rateLimitInfo = getRateLimitInfoReq(rapidApiResponse);

              // Update rate limit info in database (don't wait for it to complete)
              await updateRateLimitInfo(authResult.user.uid, rateLimitInfo).catch((error) => {
                console.error("Failed to update rate limit info:", error);
              });

              return rapidApiResponse.data;
            } catch (rapidApiError: any) {
              console.error("RapidAPI request failed:", rapidApiError);
              // Fall back to rate limit error if RapidAPI fails
              return { error: rapidApiError.response?.data?.message || "RapidAPI request failed" };
            }
          } else {
            return { error: "Invalid token" };
          }
        }
      }
      // No API key available or user not authenticated
      return { error: "lookup.rateLimit" };
    }

    // Normal flow when within rate limits
    if (token) {
      const url = `https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecret}&response=${token}`;
      const x = await axios.post(url).then((res) => res.data);
      if (x.success) {
        const endpoint = `http://104.234.204.107:3728/number/${number}?bypass992=true&ip=${encodeURIComponent(ip)}&telegram=${telegram}`;
        console.log("Endpoint:", endpoint);
        const data = await axios.get(endpoint).then((res) => res.data);
        if ((!data?.error || data?.error === "Whatsapp number doesn't exist") && !data?._id) {
          await ipRateLimit.incrementSuccessfulRequest(ip);
        }
        return data;
      }
      return { error: "Invalid token" };
    } else {
      return { error: "No token" };
    }
  } catch (error) {
    console.error("Error in phone lookup handler:", error);
    return { error: "An unexpected error occurred" };
  }
});
