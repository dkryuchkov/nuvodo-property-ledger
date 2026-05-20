import * as admin from "firebase-admin";

const isBuildTime = process.env.NODE_ENV === "production" && !process.env.FIREBASE_PROJECT_ID;

if (!admin.apps.length && !isBuildTime) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      console.warn("Firebase Admin credentials missing. Skipping initialization.");
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null as unknown as FirebaseFirestore.Firestore;
export const adminAuth = admin.apps.length ? admin.auth() : null as unknown as admin.auth.Auth;
