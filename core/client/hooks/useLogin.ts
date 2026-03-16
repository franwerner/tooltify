import { useCallback } from "react";
import { useFetch } from "./useFetch";
import { storage } from "../tools/build-monitor/storage";

function useLogin(onSuccess?: (user: string) => void) {
  const { state, error, execute } = useFetch<{ user: string; token: string; expiry: number }>("/auth/login", {
    lazy: true,
    callbacks: {
      onSuccess: ({ user }) => { storage.setUser(user); onSuccess?.(user) },
    },
  })

  const login = useCallback((username: string, password: string) => {
    execute({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: username, password }),
    })
  }, [execute])

  return { login, state, error }
}

export { useLogin }
