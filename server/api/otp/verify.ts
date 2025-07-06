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

    // Extract parameters from query
    const phone = query?.phone;
    const otp = query?.otp;

    // Validate required parameters
    if (!phone) {
      throw createError({
        statusCode: 400,
        statusMessage: "Phone number is required",
      });
    }

    if (!otp) {
      throw createError({
        statusCode: 400,
        statusMessage: "OTP is required",
      });
    }

    // Validate phone number format (basic validation)
    if (typeof phone !== "string" || !phone.match(/^\d{10,15}$/)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid phone number format. Must be 10-15 digits.",
      });
    }

    // Validate OTP format
    if (typeof otp !== "string" || !otp.match(/^\d{4,8}$/)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid OTP format. Must be 4-8 digits.",
      });
    }

    // Make request to external OTP service
    const response = await axios.get(`${OTP_BASE_URL}/verify-otp`, {
      params: {
        phone: phone,
        otp: otp,
      },
      timeout: 10000, // 10 second timeout
    });

    // Return the response data
    return {
      success: true,
      message: "OTP verification completed",
      data: response.data,
      timestamp: new Date().toISOString(),
      phone: phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"), // Mask phone number in response
    };
  } catch (error: any) {
    console.error("Verify OTP API Error:", error);

    // Handle axios errors
    if (error.response) {
      // Special handling for verification failures
      if (error.response.status === 400 || error.response.status === 401) {
        return {
          success: false,
          message: "OTP verification failed",
          error: error.response.data?.message || "Invalid or expired OTP",
          timestamp: new Date().toISOString(),
        };
      }

      throw createError({
        statusCode: error.response.status || 500,
        statusMessage: error.response.data?.message || "OTP verification failed",
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
