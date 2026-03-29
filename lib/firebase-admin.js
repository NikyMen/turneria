import { applicationDefault, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const DEFAULT_CLINIC_ID = "default";

function sanitize(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getInlineServiceAccount() {
  const projectId = sanitize(process.env.FIREBASE_ADMIN_PROJECT_ID);
  const clientEmail = sanitize(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const privateKey = sanitize(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n")
  };
}

function getFirebaseAdminOptions() {
  const serviceAccount = getInlineServiceAccount();

  if (serviceAccount) {
    return {
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId
    };
  }

  const projectId = sanitize(process.env.FIREBASE_ADMIN_PROJECT_ID);

  return {
    credential: applicationDefault(),
    ...(projectId ? { projectId } : {})
  };
}

export function isFirestoreEnabled() {
  return sanitize(process.env.FIREBASE_USE_FIRESTORE).toLowerCase() === "true";
}

export function getClinicFirestoreId() {
  return sanitize(process.env.FIREBASE_CLINIC_ID) || DEFAULT_CLINIC_ID;
}

export function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(getFirebaseAdminOptions());
}

export function getFirestoreDb() {
  return getFirestore(getFirebaseAdminApp());
}
