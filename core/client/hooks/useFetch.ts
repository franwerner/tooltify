import { useState, useEffect, useCallback } from "react"
import { apiJson } from "../shared/serverUrl"
import type { TooltifyResponse } from "../../common/types/tooltify-response"

interface FetchState<T> {
  data: T | null
  error: string | null
  state: "idle" | "success" | "error" | "loading"
}

interface FetchCallbacks<T> {
  onSuccess?: (data: T) => void
  onFailed?: (error: string) => void
}

interface FetchOptions<T> {
  lazy?: boolean
  init?: RequestInit
  callbacks?: FetchCallbacks<T>
}

interface FetchResult<T> extends FetchState<T> {
  execute: (overrideInit?: RequestInit) => Promise<void>
}

function useFetch<T>(path: string, options?: FetchOptions<T>): FetchResult<T> {
  const [fetchState, setFetchState] = useState<FetchState<T>>({ data: null, state: "idle", error: null })

  const execute = useCallback(async (overrideInit?: RequestInit) => {
    setFetchState({ data: null, state: "loading", error: null })
    try {
      const res: TooltifyResponse<T> = await apiJson<T>(path, overrideInit ?? options?.init)
      setFetchState({ data: res.data, state: "success", error: null })
      options?.callbacks?.onSuccess?.(res.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setFetchState({ data: null, state: "error", error: message })
      options?.callbacks?.onFailed?.(message)
    }
  }, [path])

  useEffect(() => {
    if (!options?.lazy) execute()
  }, [path])

  return { ...fetchState, execute }
}

export { useFetch, type FetchCallbacks, type FetchOptions }
