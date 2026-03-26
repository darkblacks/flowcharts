import admin from "firebase-admin";
import { env } from "../config/env.js";

const hasFirebaseCredentials =
  env.FIREBASE_PROJECT_ID &&
  env.FIREBASE_CLIENT_EMAIL &&
  env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length && hasFirebaseCredentials) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    }),
  });
}

export const firebaseAdmin = admin;
export const firebaseReady = Boolean(hasFirebaseCredentials);
