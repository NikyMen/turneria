import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CLINIC_DASHBOARD } from "../lib/clinic-data.js";
import { getClinicFirestoreId, getFirestoreDb } from "../lib/firebase-admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

function loadEnvFile(filename) {
  const filePath = path.join(ROOT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function createChunks(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function replaceSubcollection(clinicRef, collectionName, items) {
  const db = getFirestoreDb();
  const collectionRef = clinicRef.collection(collectionName);
  const existingSnapshot = await collectionRef.get();
  const incomingIds = new Set(items.map((item) => item.id));
  const operations = [];

  for (const document of existingSnapshot.docs) {
    if (!incomingIds.has(document.id)) {
      operations.push({
        type: "delete",
        ref: document.ref
      });
    }
  }

  for (const item of items) {
    operations.push({
      type: "set",
      ref: collectionRef.doc(item.id),
      data: item
    });
  }

  for (const chunk of createChunks(operations, 400)) {
    const batch = db.batch();

    for (const operation of chunk) {
      if (operation.type === "delete") {
        batch.delete(operation.ref);
        continue;
      }

      batch.set(operation.ref, operation.data);
    }

    await batch.commit();
  }
}

async function main() {
  const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
  loadEnvFile(envFile);
  
  // Aca forzamos la carga de variables necesarias si el script se corre solo
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
    process.env.FIREBASE_ADMIN_PROJECT_ID = "turneria-consultoriadigital";
  }

  const db = getFirestoreDb();
  const clinicId = getClinicFirestoreId();
  const clinicRef = db.collection("clinics").doc(clinicId);

  await clinicRef.set(
    {
      ...CLINIC_DASHBOARD.clinic,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );

  await replaceSubcollection(clinicRef, "patients", CLINIC_DASHBOARD.patients);
  await replaceSubcollection(clinicRef, "doctors", CLINIC_DASHBOARD.doctors);
  await replaceSubcollection(clinicRef, "calendar", CLINIC_DASHBOARD.calendar);

  console.log(
    `Firestore seed listo para clinics/${clinicId}: ${CLINIC_DASHBOARD.patients.length} pacientes, ${CLINIC_DASHBOARD.doctors.length} doctores y ${CLINIC_DASHBOARD.calendar.length} dias de agenda.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

