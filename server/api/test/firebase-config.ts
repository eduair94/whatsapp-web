// Test endpoint to check Firebase Admin SDK configuration
export default defineEventHandler(async (event) => {
  // Only allow GET requests
  if (event.method !== "GET") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method not allowed",
    });
  }

  try {
    // Import here to catch initialization errors
    const { initFirebaseAdmin } = await import("~/server/utils/firebase-admin");

    // Try to initialize Firebase Admin
    const { app, auth } = initFirebaseAdmin();

    return {
      success: true,
      message: "Firebase Admin SDK initialized successfully",
      projectId: app.options.projectId || "Unknown",
      hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Firebase configuration test failed:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      timestamp: new Date().toISOString(),
    };
  }
});
