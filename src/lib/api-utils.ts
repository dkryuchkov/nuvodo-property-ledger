import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "./firebase-admin";
import { UserRole } from "@/types";

export async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  if (!adminAuth) {
    console.warn("adminAuth not initialized");
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Auth verification failed", error);
    return null;
  }
}

export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess(data: any) {
  return NextResponse.json(data);
}

// Mock role check for now - in production this would query Firestore user_roles
export async function checkRole(uid: string, requiredRoles: UserRole[]) {
  // TODO: Implement actual RBAC from Firestore
  return true;
}
