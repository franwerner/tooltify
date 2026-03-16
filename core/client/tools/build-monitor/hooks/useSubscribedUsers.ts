import { useState, useCallback, useEffect } from "react"
import { storage } from "../../../shared/utils/storage"

export function useSubscribedUsers(user?: string) {
  const [subscribed, setSubscribed] = useState<string[]>(storage.getSubscribed)

  useEffect(() => {
    if (user) setSubscribed(storage.getSubscribed())
  }, [user])

  const add = useCallback((name: string) => {
    setSubscribed((prev) => {
      const next = [...prev, name]
      storage.setSubscribed(next)
      return next
    })
  }, [])

  const remove = useCallback((name: string) => {
    setSubscribed((prev) => {
      const next = prev.filter((s) => s !== name)
      storage.setSubscribed(next)
      return next
    })
  }, [])

  return { subscribed, add, remove }
}
