import { getApp, getApps, initializeApp } from "firebase/app";

function sanitize(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getExplicitFirebaseConfig() {
  return {
    apiKey: sanitize(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: sanitize(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: sanitize(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: sanitize(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: sanitize(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: sanitize(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    measurementId: sanitize(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID)
  };
}

function hasExplicitFirebaseConfig(config) {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

export function getFirebaseClientApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const config = getExplicitFirebaseConfig();

  if (hasExplicitFirebaseConfig(config)) {
    return initializeApp(config);
  }

  return initializeApp();
}

export async function getFirebaseAnalyticsSafe() {
  if (typeof window === "undefined") {
    return null;
  }

  const analyticsModule = await import("firebase/analytics");
  const supported = await analyticsModule.isSupported().catch(() => false);

  if (!supported) {
    return null;
  }

  return analyticsModule.getAnalytics(getFirebaseClientApp());
}
