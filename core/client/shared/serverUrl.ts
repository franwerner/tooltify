export const SERVER_URL: string = (window as any).__DEVTOOLS_URL__ || window.location.origin;

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${SERVER_URL}${path}`, { credentials: "include", ...init });
