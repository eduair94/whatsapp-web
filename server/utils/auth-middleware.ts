import type { IncomingMessage } from "http";
import { extractTokenFromHeader, verifyFirebaseToken } from "../utils/firebase-admin";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
}

export interface AuthenticatedRequest extends IncomingMessage {
  user?: AuthenticatedUser;
}

/**
 * Get headers from Nuxt event
 */
function getHeaders(event: any): Record<string, string> | undefined {
  return event.node?.req?.headers || event.headers;
}

/**
 * Get client IP address from event
 */
function getClientIP(event: any): string | undefined {
  const headers = getHeaders(event);
  if (!headers) return undefined;

  // Check various header names for client IP
  return headers["x-forwarded-for"]?.split(",")[0]?.trim() || headers["x-real-ip"] || headers["x-client-ip"] || headers["cf-connecting-ip"] || event.node?.req?.connection?.remoteAddress || event.node?.req?.socket?.remoteAddress || undefined;
}

/**
 * Get HTTP method from event
 */
function getMethod(event: any): string {
  return event.node?.req?.method || event.method || "GET";
}

/**
 * Extract request metadata for logging and security
 */
export function extractRequestMetadata(event: any) {
  const headers = getHeaders(event) || {};

  return {
    userAgent: headers["user-agent"] || undefined,
    ipAddress: getClientIP(event) || undefined,
    platform: headers["sec-ch-ua-platform"]?.replace(/"/g, "") || undefined,
  };
}

/**
 * Authenticate Firebase user from request
 */
export async function authenticateUser(event: any): Promise<{
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  metadata?: any;
}> {
  try {
    const headers = getHeaders(event);
    const authHeader = headers?.authorization;

    if (!authHeader) {
      return {
        success: false,
        error: "Authorization header is missing. Please include a valid Firebase ID token.",
      };
    }

    // Extract token from Bearer header
    let token: string;
    try {
      token = extractTokenFromHeader(authHeader);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Invalid authorization header format",
      };
    }

    // Verify the Firebase token
    const user = await verifyFirebaseToken(token);
    const metadata = extractRequestMetadata(event);

    return {
      success: true,
      user,
      metadata,
    };
  } catch (error) {
    // Provide specific error messages for common cases
    if (error instanceof Error) {
      const msg = error?.message?.toLowerCase();
      if (msg.includes("expired")) {
        return {
          success: false,
          error: "Your session has expired. Please sign in again.",
        };
      }
      if (msg.includes("invalid")) {
        return {
          success: false,
          error: "Invalid authentication token. Please sign in again.",
        };
      }

      console.error("❌ Authentication failed:", error);
    }

    return {
      success: false,
      error: "Authentication failed. Please ensure you are signed in with a valid account.",
    };
  }
}

/**
 * Create an authenticated API handler wrapper
 */
export function createAuthenticatedHandler<T = any>(handler: (event: any, user: AuthenticatedUser, metadata: any) => Promise<T>) {
  return async (event: any): Promise<T | Response> => {
    const authResult = await authenticateUser(event);

    if (!authResult.success || !authResult.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authResult.error || "Authentication failed",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    try {
      return await handler(event, authResult.user, authResult.metadata);
    } catch (error) {
      console.error("❌ Handler error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal server error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  };
}

/**
 * Validate request method
 */
export function validateMethod(event: any, allowedMethods: string[]): boolean {
  const method = getMethod(event);
  return allowedMethods.includes(method);
}

/**
 * Create error response with proper CORS headers
 */
export function createErrorResponse(message: string, status: number = 400, additionalData?: Record<string, any>): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      ...additionalData,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

/**
 * Create success response with proper CORS headers
 */
export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
