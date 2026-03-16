import { useState } from "react";
import { storage } from "../../../shared/utils/storage";
import { useFetch } from "../../../shared/hooks/useFetch";

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
