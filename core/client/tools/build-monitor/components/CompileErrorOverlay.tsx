import React, { useState, useEffect } from "react"
import { apiFetch } from "../../../shared/utils/serverUrl"
import { storage } from "../../../shared/utils/storage"
import {
  notifyCompileError,
  registerOpenOverlay,
  unregisterOpenOverlay,
} from "../utils/compileErrorBus"

interface ErrorFile {
  file: string
  user: string
}

interface OverlayState {
  user: string
  file: string
  errors: string[]
  errorFiles: ErrorFile[]
  fixed: boolean
}

const parseError = (err: any): string =>
  typeof err === "string" ? err : err?.message || JSON.stringify(err)

const parseErrors = (raw: any): string[] => {
  if (Array.isArray(raw)) return raw.map(parseError)
  return [parseError(raw)]
}

const shortPath = (file: string) => {
  const idx = file.indexOf("/packages/")
  return idx !== -1 ? file.slice(idx + 1) : file
}

export const CompileErrorOverlay: React.FC = () => {
  const [state, setState] = useState<OverlayState | null>(null)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    registerOpenOverlay(() => setVisible(true))
    return () => unregisterOpenOverlay()
  }, [])

  useEffect(() => {
    if (state !== null) notifyCompileError(true, state.errors.length)
  }, [state])

  useEffect(() => {
    apiFetch("/build/status")
      .then((r) => r.json())
      .then((status) => {
        if (!status.ok && status.errors && status.errors.length > 0) {
          setState({ user: status.user || "unknown", file: status.file || "", errors: parseErrors(status.errors), errorFiles: status.errorFiles || [], fixed: false })
          setVisible(true)
          setCurrent(0)
        }
      })
      .catch(() => {})

    const onCompileError = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail) return
      setState({ user: detail.user || "unknown", file: detail.file || "", errors: parseErrors(detail.errors), errorFiles: detail.errorFiles || [], fixed: false })
      setVisible(true)
      setCurrent(0)
    }

    const onCompileOk = () => {
      setState((prev) => {
        if (prev && !prev.fixed) {
          if (storage.getAutoReload()) setTimeout(() => window.location.reload(), 300)
          return { ...prev, fixed: true }
        }
        return prev
      })
    }

    window.addEventListener("plugin-compile-error", onCompileError)
    window.addEventListener("plugin-compile-ok", onCompileOk)
    return () => {
      window.removeEventListener("plugin-compile-error", onCompileError)
      window.removeEventListener("plugin-compile-ok", onCompileOk)
    }
  }, [])

  if (!state || !visible) return null

  const total = state.errors.length
  const safeIdx = Math.min(current, total - 1)

  return (
    <div
      className="tfy-fixed tfy-inset-0 tfy-bg-black/75 tfy-z-[9999999] tfy-flex tfy-items-center tfy-justify-center tfy-font-mono tfy-backdrop-blur-sm"
    >
      <div
        className="tfy-bg-[#1a1d23] tfy-rounded-xl tfy-w-[90%] tfy-max-w-[720px] tfy-max-h-[80vh] tfy-flex tfy-flex-col tfy-overflow-hidden tfy-border tfy-border-[#f8514940] tfy-shadow-[0_0_40px_#f8514920]"
      >
        {/* Header */}
        <div className="tfy-flex tfy-justify-between tfy-items-center tfy-border-b tfy-border-border tfy-py-3.5 tfy-px-5">
          <div className="tfy-flex tfy-items-center tfy-gap-2.5">
            <span className="tfy-text-base tfy-font-bold" style={{ color: state.fixed ? "#3fb950" : "#f85149" }}>
              {state.fixed ? "ERRORS FIXED" : "COMPILE ERROR"}
            </span>
          </div>

          {!state.fixed && total > 1 ? (
            <div className="tfy-flex tfy-items-center tfy-gap-1.5">
              <button
                className="tfy-bg-transparent tfy-border tfy-border-border tfy-text-text tfy-rounded tfy-w-[28px] tfy-h-6 tfy-cursor-pointer tfy-text-[13px] tfy-font-mono tfy-flex tfy-items-center tfy-justify-center tfy-p-0"
                disabled={safeIdx === 0}
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              >
                &larr;
              </button>
              <span className="tfy-text-muted tfy-text-[11px] tfy-min-w-[40px] tfy-text-center">
                {safeIdx + 1} / {total}
              </span>
              <button
                className="tfy-bg-transparent tfy-border tfy-border-border tfy-text-text tfy-rounded tfy-w-[28px] tfy-h-6 tfy-cursor-pointer tfy-text-[13px] tfy-font-mono tfy-flex tfy-items-center tfy-justify-center tfy-p-0"
                disabled={safeIdx === total - 1}
                onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              >
                &rarr;
              </button>
            </div>
          ) : !state.fixed ? (
            <span className="tfy-text-muted tfy-text-[11px]">1 error</span>
          ) : (
            <span className="tfy-text-muted tfy-text-[11px]">HMR chain broken</span>
          )}
        </div>

        {/* Fixed banner */}
        {state.fixed && (
          <div className="tfy-rounded-md tfy-text-[#3fb950] tfy-text-xs tfy-leading-relaxed tfy-bg-[#3fb95015] tfy-border tfy-border-[#3fb95030] tfy-my-3 tfy-mx-5 tfy-py-2.5 tfy-px-3.5">
            All compile errors resolved. A full page reload is required because the HMR
            hash chain was broken during the error.
          </div>
        )}

        {/* Per-error file header + trace */}
        {!state.fixed && (() => {
          const errText = state.errors[safeIdx] || ""
          const matched = state.errorFiles.find(
            (ef) => errText.includes(ef.file) || errText.includes(shortPath(ef.file))
          )
          const errUser = matched?.user || state.user
          const errFile = matched?.file || state.file

          return (
            <>
              <div className="tfy-flex tfy-items-baseline tfy-gap-1.5 tfy-border-b tfy-border-border tfy-py-2 tfy-px-5">
                <span className="tfy-text-accent tfy-text-[11px] tfy-font-semibold tfy-shrink-0">{errUser}</span>
                {errFile && (
                  <>
                    <span className="tfy-text-muted tfy-text-[11px]">&rarr;</span>
                    <span className="tfy-text-text tfy-text-[11px] tfy-break-all">{shortPath(errFile)}</span>
                  </>
                )}
              </div>
              <div className="tfy-flex-1 tfy-overflow-auto tfy-py-3 tfy-px-5">
                <pre className="tfy-m-0 tfy-text-red tfy-text-[11px] tfy-leading-relaxed tfy-whitespace-pre-wrap tfy-break-words tfy-font-mono">
                  {errText}
                </pre>
              </div>
            </>
          )
        })()}

        {/* Footer */}
        <div className="tfy-flex tfy-justify-end tfy-gap-2.5 tfy-border-t tfy-border-border tfy-py-3 tfy-px-5">
          <button
            className="tfy-bg-transparent tfy-border tfy-border-border tfy-text-muted tfy-rounded-md tfy-py-2 tfy-px-4 tfy-cursor-pointer tfy-text-xs tfy-font-mono"
            onClick={() => setVisible(false)}
          >
            Dismiss
          </button>
          <button
            className={state.fixed
              ? "tfy-bg-red tfy-border-0 tfy-text-white tfy-rounded-md tfy-py-2 tfy-px-5 tfy-cursor-pointer tfy-text-xs tfy-font-semibold tfy-font-mono"
              : "tfy-bg-border tfy-border-0 tfy-text-muted tfy-rounded-md tfy-py-2 tfy-px-5 tfy-cursor-not-allowed tfy-text-xs tfy-font-semibold tfy-font-mono tfy-opacity-60"
            }
            disabled={!state.fixed}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}
