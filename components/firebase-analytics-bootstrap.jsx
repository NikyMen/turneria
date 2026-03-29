"use client";

import { useEffect } from "react";

import { getFirebaseAnalyticsSafe } from "@/lib/firebase-client";

export function FirebaseAnalyticsBootstrap() {
  useEffect(() => {
    getFirebaseAnalyticsSafe().catch(() => null);
  }, []);

  return null;
}
