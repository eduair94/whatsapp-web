import { connectToMongoDB, getConnectionStatus } from "~/server/utils/mongodb";

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
    // Test MongoDB connection
    await connectToMongoDB();
    const dbStatus = getConnectionStatus();

    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus.isConnected ? "connected" : "disconnected",
          readyState: dbStatus.readyStateDescription,
        },
        server: {
          status: "running",
          uptime: process.uptime(),
          nodeVersion: process.version,
        },
      },
    };

    return new Response(JSON.stringify(healthCheck), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);

    const healthCheck = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      services: {
        database: {
          status: "error",
        },
        server: {
          status: "running",
          uptime: process.uptime(),
          nodeVersion: process.version,
        },
      },
    };

    return new Response(JSON.stringify(healthCheck), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
