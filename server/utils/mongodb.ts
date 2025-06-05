import mongoose from "mongoose";

let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

/**
 * Connect to MongoDB with proper error handling and connection reuse
 */
export async function connectToMongoDB(): Promise<typeof mongoose> {
  // Return existing connection if already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Return existing connection promise if connection is in progress
  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/whatsapp-app-db";
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  const options = {
    bufferCommands: false,
  };

  try {
    console.log("🔄 Connecting to MongoDB...");

    connectionPromise = mongoose.connect(mongoUri, options);
    const connection = await connectionPromise;

    isConnected = true;
    console.log("✅ MongoDB connected successfully");

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("📡 MongoDB connection established");
      isConnected = true;
    });

    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
      isConnected = false;
      connectionPromise = null;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("📡 MongoDB disconnected");
      isConnected = false;
      connectionPromise = null;
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("📡 MongoDB connection closed due to application termination");
      process.exit(0);
    });

    return connection;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    isConnected = false;
    connectionPromise = null;
    throw error;
  }
}

/**
 * Get MongoDB connection status
 */
export function getConnectionStatus(): {
  isConnected: boolean;
  readyState: number;
  readyStateDescription: string;
} {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const readyState = mongoose.connection.readyState;

  return {
    isConnected,
    readyState,
    readyStateDescription: states[readyState as keyof typeof states] || "unknown",
  };
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromMongoDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isConnected = false;
    connectionPromise = null;
    console.log("📡 MongoDB disconnected successfully");
  }
}
