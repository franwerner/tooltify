import { useState, useCallback, useEffect } from "react"
import { storage } from "../../../shared/utils/storage"

export function useAutoReload(user?: string) {
  const [autoReload, setAutoReload] = useState(storage.getAutoReload)

  useEffect(() => {
    if (user) setAutoReload(storage.getAutoReload())
  }, [user])

  const toggle = useCallback(() => {
    setAutoReload((prev) => {
      const next = !prev
      storage.setAutoReload(next)
      return next
    })
  }, [])

  return { autoReload, toggle }
}
