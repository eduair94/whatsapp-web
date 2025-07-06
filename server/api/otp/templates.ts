import axios from "axios";

const OTP_BASE_URL = "http://104.234.204.107:3720";

export default defineEventHandler(async (event) => {
  // Handle CORS preflight requests
  if (event.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    // Only allow GET requests
    if (event.method !== "GET") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method not allowed",
      });
    }

    const query = getQuery(event);
    const language = query.language || "en";

    // Validate language parameter
    if (typeof language !== "string" || !language.match(/^[a-z]{2}$/)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid language parameter. Must be a 2-letter language code.",
      });
    }

    // Make request to external OTP service
    const response = await axios.get(`${OTP_BASE_URL}/templates`, {
      params: {
        language: language,
      },
      timeout: 10000, // 10 second timeout
    });

    // Return the response data
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("OTP Templates API Error:", error);

    // Handle axios errors
    if (error.response) {
      throw createError({
        statusCode: error.response.status || 500,
        statusMessage: error.response.data?.message || "External API error",
      });
    }

    // Handle network/timeout errors
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      throw createError({
        statusCode: 503,
        statusMessage: "OTP service temporarily unavailable",
      });
    }

    // Handle other errors
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error",
    });
  }
});
