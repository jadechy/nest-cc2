import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function headers() {
  const session = await getServerSession(authOptions);
  return {
    "Content-Type": "application/json",
    ...(session?.accessToken && {
      Authorization: `Bearer ${session.accessToken}`,
    }),
  };
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: await headers() });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: await headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: await headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}`);
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: await headers(),
  });
  if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}`);
  return res.json();
}