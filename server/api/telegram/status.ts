import axios from "axios";

export default defineEventHandler(async (event) => {
  try {
    const endpoint = 'http://104.234.204.107:3728/telegram/status';
    const response = await axios.get(endpoint).then((res) => res.data);
    
    // Normalize the response to match the expected format
    return {
      status: response.success,
      isBroken: !response.success || response.isRateLimited,
      lastCheck: new Date(response.timestamp).toISOString(),
      successCount: response.totalChecks - response.totalErrors,
      errorCount: response.totalErrors,
      websiteRequests: 0, // Telegram API doesn't distinguish between website and API requests
      apiRequests: response.totalChecks,
      rateLimitErrors: response.rateLimitErrors,
      isRateLimited: response.isRateLimited,
      errorsByType: response.errorsByType
    };
  } catch (error) {
    console.error('Telegram API status error:', error);
    return {
      status: false,
      isBroken: true,
      lastCheck: new Date().toISOString(),
      successCount: 0,
      errorCount: 1,
      websiteRequests: 0,
      apiRequests: 0,
      error: 'Failed to fetch Telegram API status'
    };
  }
});
