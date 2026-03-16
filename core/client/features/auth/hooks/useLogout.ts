import { useFetch } from "../../../shared/hooks/useFetch";
import { storage } from "../../../shared/utils/storage";

function useLogout(onSuccess?: () => void) {
  const { status, execute } = useFetch("/auth/logout", {
    lazy: true,
    callbacks: {
      onSuccess: () => { storage.setUser(""); onSuccess?.() },
    },
  })

  return { logout: execute, status }
}

export { useLogout }
