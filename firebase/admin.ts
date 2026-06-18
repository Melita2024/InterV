// File path: src/firebase/admin.ts (or wherever your admin initialization lives)
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    // Fail loudly if credentials are completely missing
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error("CRITICAL: Missing Firebase Admin environment variables in .env.local");
    }

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
}

// Export distinct runtime getters to ensure variables resolve dynamically
export const getAdminAuth = () => {
  initFirebaseAdmin();
  return getAuth();
};

export const getAdminDb = () => {
  initFirebaseAdmin();
  return getFirestore();
};
