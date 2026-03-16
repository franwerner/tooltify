const KEYS = {
  user: "devtools-user",
  subscribed: "devtools-subscribed-users",
  autoReload: "devtools-auto-reload",
} as const;

import { apiJson } from "../../shared/serverUrl";

export const storage = {
  getUser: (): string => localStorage.getItem(KEYS.user) || "",

  setUser: (user: string) => localStorage.setItem(KEYS.user, user),

  getSubscribed: (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.subscribed) || "[]");
    } catch {
      return [];
    }
  },

  setSubscribed: (users: string[]) =>
    localStorage.setItem(KEYS.subscribed, JSON.stringify(users)),

  getAutoReload: (): boolean => localStorage.getItem(KEYS.autoReload) !== "false",

  setAutoReload: (val: boolean) =>
    localStorage.setItem(KEYS.autoReload, String(val)),

  fetchUsers: async (): Promise<string[]> => {
    try {
      const res = await apiJson<string[]>("/auth/users");
      return res.data;
    } catch {
      return [];
    }
  },
};
