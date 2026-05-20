import { auth } from "@/auth";

export async function verifyAuth() {
  const session = await auth();
  if (!session?.accessToken) {
    return null;
  }
  return session;
}

export function apiError(message: string, status: number = 400) {
  return new Response(JSON.stringify({ error: message }), { 
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export function apiSuccess(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}
