import type { TooltifyResponse } from "../../common/types/tooltify-response"

export const SERVER_URL: string = (window as any).__TOOLTIFY_URL__ || window.location.origin;

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${SERVER_URL}${path}`, { credentials: "include", ...init });

export const apiJson = async <T>(path: string, init?: RequestInit): Promise<TooltifyResponse<T>> => {
  const res = await apiFetch(path, init)
  const body = await res.json() as TooltifyResponse<T>
  if (!res.ok) throw new Error(body.message ?? `HTTP ${res.status}`)
  return body
}
