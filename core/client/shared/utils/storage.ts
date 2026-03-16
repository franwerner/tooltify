const KEYS = {
  user: "tooltify-user",
  subscribed: "tooltify-subscribed-users",
  autoReload: "tooltify-auto-reload",
} as const;

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

};
