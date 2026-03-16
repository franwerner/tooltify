import { useCallback } from "react";
import { storage } from "../../../shared/utils/storage";
import { useFetch } from "../../../shared/hooks/useFetch";

function useLogin(onSuccess?: (user: string) => void) {
  const { status, error, execute } = useFetch<{ user: string; token: string; expiry: number }>("/auth/login", {
    lazy: true,
    callbacks: {
      onSuccess: ({ user }) => { storage.setUser(user); onSuccess?.(user) },
    },
  })

  const login = useCallback((username: string, password: string) => {
    execute({
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: username, password }),
      }
    })
  }, [execute])

  return { login, status, error }
}

export { useLogin }
