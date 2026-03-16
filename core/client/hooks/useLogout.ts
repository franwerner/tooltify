import { useFetch } from "./useFetch";
import { storage } from "../tools/build-monitor/storage";

function useLogout(onSuccess?: () => void) {
  const { state, execute } = useFetch("/auth/logout", {
    lazy: true,
    callbacks: {
      onSuccess: () => { storage.setUser(""); onSuccess?.() },
    },
  })

  return { logout: execute, state }
}

export { useLogout }
