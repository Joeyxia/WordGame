import { getToken } from "./session";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`POST ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`PATCH ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}
