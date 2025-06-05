import { initFirebaseAdmin } from "../../utils/firebase-admin";

export default defineEventHandler(async (event) => {
  // Handle CORS
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

  try {
    // Test Firebase Admin initialization
    const { app, auth } = initFirebaseAdmin();

    return {
      success: true,
      message: "Firebase Admin SDK initialized successfully",
      projectId: app.options.projectId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Firebase init test failed:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
