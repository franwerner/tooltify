import { useFetch } from "../../../shared/hooks/useFetch";
import { storage } from "../../../shared/utils/storage";


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
