import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_PRIVATE_KEY_HAS_HEADER: process.env.FIREBASE_PRIVATE_KEY?.includes("BEGIN PRIVATE KEY") ?? false,
    GOOGLE_GENERATIVE_AI_API_KEY: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };

  // Test Firebase Admin init
  let firebaseStatus = "not tested";
  try {
    const { getAdminDb } = await import("@/firebase/admin");
    getAdminDb();
    firebaseStatus = "ok";
  } catch (e: any) {
    firebaseStatus = `error: ${e.message}`;
  }

  return NextResponse.json({ checks, firebaseStatus });
}
