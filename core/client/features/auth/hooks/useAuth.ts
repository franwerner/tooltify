import { useState } from "react";
import { storage } from "../../../shared/utils/storage";
import { FetchStatus, useFetch } from "../../../shared/hooks/useFetch";

export function useAuth() {
  const [user, setUser] = useState<string | null>(storage.getUser() || null)

  const { status } = useFetch<{ user: string }>("/auth/session", {
    callbacks: {
      onSuccess: ({ user }) => { storage.setUser(user); setUser(user) },
      onFailed: () => { storage.setUser(""); setUser(null) },
    }
  })

  return { user, loading: status === FetchStatus.LOADING }
}
