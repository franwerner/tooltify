import { useState, useEffect, useCallback } from "react"
import { apiJson } from "../utils/serverUrl"
import { TooltifyResponse } from "#common/types/tooltify-response"


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

interface ExecuteOverride {
  path?: string
  init?: RequestInit
}

interface FetchResult<T> extends FetchState<T> {
  execute: (override?: ExecuteOverride) => Promise<void>
}

function useFetch<T>(path: string, options?: FetchOptions<T>): FetchResult<T> {
  const [fetchState, setFetchState] = useState<FetchState<T>>({ data: null, state: "idle", error: null })

  const execute = useCallback(async (override?: ExecuteOverride) => {
    setFetchState({ data: null, state: "loading", error: null })
    try {
      const resolvedPath = override?.path ?? path
      const resolvedInit = override?.init ?? options?.init
      const res: TooltifyResponse<T> = await apiJson<T>(resolvedPath, resolvedInit)
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

export { useFetch, type FetchCallbacks, type FetchOptions, type ExecuteOverride }
