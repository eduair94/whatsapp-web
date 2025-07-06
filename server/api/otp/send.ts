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

  /*
   * Send OTP Endpoint
   * Supports the following parameters:
   * - phone (required): Phone number (10-15 digits)
   * - length (optional): OTP length (4-8 digits, default: 6)
   * - expiry (optional): Expiry time in minutes (1-30, default: 5)
   * - company (optional): Company name (default: "Your Company")
   * - language (optional): 2-letter language code (default: "en")
   * - image (optional): Image URL for the OTP message
   * - name (optional): User's name for personalized messages
   * - template (optional): Template name for the OTP message
   */

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
    const length = query?.length || 6;
    const expiry = query?.expiry || 5;
    const company = query?.company || "Your Company";
    const language = query?.language || "en";
    const image = query?.image;
    const name = query?.name;
    const template = query?.template;

    // Validate required parameters
    if (!phone) {
      throw createError({
        statusCode: 400,
        statusMessage: "Phone number is required",
      });
    }

    // Validate phone number format (basic validation)
    if (typeof phone !== "string" || !phone.match(/^\d{10,15}$/)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid phone number format. Must be 10-15 digits.",
      });
    }

    // Validate OTP length
    const otpLength = parseInt(length.toString());
    if (isNaN(otpLength) || otpLength < 4 || otpLength > 8) {
      throw createError({
        statusCode: 400,
        statusMessage: "OTP length must be between 4 and 8 digits",
      });
    }

    // Validate expiry time
    const expiryMinutes = parseInt(expiry.toString());
    if (isNaN(expiryMinutes) || expiryMinutes < 1 || expiryMinutes > 30) {
      throw createError({
        statusCode: 400,
        statusMessage: "Expiry time must be between 1 and 30 minutes",
      });
    }

    // Validate language parameter
    if (typeof language !== "string" || !language.match(/^[a-z]{2}$/)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid language parameter. Must be a 2-letter language code.",
      });
    }

    // Validate image URL if provided
    if (image && typeof image !== "string") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid image parameter. Must be a valid URL string.",
      });
    }

    // Validate image URL format if provided
    if (image) {
      try {
        new URL(image.toString());
      } catch {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid image URL format.",
        });
      }
    }

    // Validate name if provided
    if (name && (typeof name !== "string" || name.length > 100)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid name parameter. Must be a string with max 100 characters.",
      });
    }

    // Validate template if provided
    if (template && (typeof template !== "string" || template.length > 50)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid template parameter. Must be a string with max 50 characters.",
      });
    }

    // Make request to external OTP service
    const requestParams: any = {
      ...query,
    };

    const response = await axios.get(`${OTP_BASE_URL}/send-otp`, {
      params: requestParams,
      timeout: 15000, // 15 second timeout for sending SMS
    });

    // Return the response data
    return {
      success: true,
      message: "OTP sent successfully",
      data: response.data,
      timestamp: new Date().toISOString(),
      phone: phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"), // Mask phone number in response
    };
  } catch (error: any) {
    console.error("Send OTP API Error:", error);

    // Handle axios errors
    if (error.response) {
      throw createError({
        statusCode: error.response.status || 500,
        statusMessage: error.response.data?.message || "Failed to send OTP",
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
