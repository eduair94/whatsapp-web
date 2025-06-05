import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import serviceAccount from "~/serviceAccount.json";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

/**
 * Initialize Firebase Admin SDK
 * This function is safe to call multiple times
 */
export function initFirebaseAdmin(): { app: App; auth: Auth } {
  if (adminApp && adminAuth) {
    return { app: adminApp, auth: adminAuth };
  }

  try {
    // Check if Firebase Admin is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0];
      adminAuth = getAuth(adminApp);
      return { app: adminApp, auth: adminAuth };
    }

    // Use imported serviceAccount directly
    adminApp = initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      }),
    });

    adminAuth = getAuth(adminApp);

    console.log("✅ Firebase Admin SDK initialized successfully");
    return { app: adminApp, auth: adminAuth };
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
}

/**
 * Verify Firebase ID token and return user information
 */
export async function verifyFirebaseToken(idToken: string) {
  try {
    const { auth } = initFirebaseAdmin();

    // Validar formato del token
    if (!idToken || typeof idToken !== "string") {
      throw new Error("Invalid token format");
    }

    // Forzar binding del método por seguridad
    const verifyIdToken = auth.verifyIdToken.bind(auth);
    const decodedToken = await verifyIdToken(idToken);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message;

      if (msg.includes("Firebase ID token has expired")) {
        throw new Error("Token has expired. Please sign in again.");
      } else if (msg.includes("Firebase ID token has invalid signature")) {
        throw new Error("Invalid token signature. Please sign in again.");
      } else if (msg.includes("Firebase ID token has been revoked")) {
        throw new Error("Token has been revoked. Please sign in again.");
      } else if (msg.includes("FIREBASE_SERVICE_ACCOUNT_KEY")) {
        throw new Error("Server configuration error. Please contact support.");
      } else if (msg.includes("Decoding Firebase ID token failed")) {
        throw new Error("Invalid or expired token");
      }
    }

    throw error;
  }
}

/**
 * Extract Firebase token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new Error("Authorization header is missing");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization header must use Bearer token");
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  if (!token) {
    throw new Error("Token is empty");
  }

  return token;
}
