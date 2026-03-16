import { useState } from "react";
import { useFetch } from "./useFetch";
import { storage } from "../tools/build-monitor/storage";

export function useAuth() {
  const [user, setUser] = useState<string | null>(storage.getUser() || null)

  const { state } = useFetch<{ user: string }>("/auth/session", {
    callbacks: {
      onSuccess: ({ user }) => { storage.setUser(user); setUser(user) },
      onFailed: () => { storage.setUser(""); setUser(null) },
    }
  })

  return { user, loading: state === "loading" }
}
