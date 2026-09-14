import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL;

async function request(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Something went wrong. Please try again.");
  return body;
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, data: unknown) => request(path, { method: "POST", body: JSON.stringify(data) }),
  patch: (path: string, data: unknown) => request(path, { method: "PATCH", body: JSON.stringify(data) }),
};