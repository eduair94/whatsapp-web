// Test endpoint to verify Firebase token authentication
export default defineEventHandler(async (event) => {
  // Only allow POST requests
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method not allowed",
    });
  }

  try {
    const body = await readBody(event);
    const { token } = body;

    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: "Token is required",
      });
    }

    // Import and test token verification
    const { verifyFirebaseToken } = await import("~/server/utils/firebase-admin");
    const userInfo = await verifyFirebaseToken(token);

    return {
      success: true,
      message: "Token verified successfully",
      user: userInfo,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Token verification test failed:", error);

    throw createError({
      statusCode: 401,
      statusMessage: error instanceof Error ? error.message : "Authentication failed",
    });
  }
});
