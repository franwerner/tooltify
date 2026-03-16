import React, { useState, useEffect } from "react"
import { apiFetch } from "../../../shared/utils/serverUrl"
import { COLORS } from "../styles"
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
          setState({
            user: status.user || "unknown",
            file: status.file || "",
            errors: parseErrors(status.errors),
            errorFiles: status.errorFiles || [],
            fixed: false,
          })
          setVisible(true)
          setCurrent(0)
        }
      })
      .catch(() => {})

    const onCompileError = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail) return
      setState({
        user: detail.user || "unknown",
        file: detail.file || "",
        errors: parseErrors(detail.errors),
        errorFiles: detail.errorFiles || [],
        fixed: false,
      })
      setVisible(true)
      setCurrent(0)
    }

    const onCompileOk = () => {
      setState((prev) => {
        if (prev && !prev.fixed) {
          if (storage.getAutoReload()) {
            setTimeout(() => window.location.reload(), 300)
          }
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
    <div style={overlayStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: state.fixed ? COLORS.green : COLORS.red, fontSize: 16, fontWeight: 700 }}>
              {state.fixed ? "ERRORS FIXED" : "COMPILE ERROR"}
            </span>
          </div>

          {!state.fixed && total > 1 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                style={navBtn}
                disabled={safeIdx === 0}
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              >
                &larr;
              </button>
              <span style={{ color: COLORS.muted, fontSize: 11, minWidth: 40, textAlign: "center" }}>
                {safeIdx + 1} / {total}
              </span>
              <button
                style={navBtn}
                disabled={safeIdx === total - 1}
                onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              >
                &rarr;
              </button>
            </div>
          ) : !state.fixed ? (
            <span style={{ color: COLORS.muted, fontSize: 11 }}>1 error</span>
          ) : (
            <span style={{ color: COLORS.muted, fontSize: 11 }}>HMR chain broken</span>
          )}
        </div>

        {/* Fixed banner */}
        {state.fixed && (
          <div style={fixedBanner}>
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
              <div style={errorFileBar}>
                <span style={{ color: COLORS.accent, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                  {errUser}
                </span>
                {errFile && (
                  <>
                    <span style={{ color: COLORS.muted, fontSize: 11 }}>&rarr;</span>
                    <span style={{ color: COLORS.text, fontSize: 11, wordBreak: "break-all" }}>
                      {shortPath(errFile)}
                    </span>
                  </>
                )}
              </div>
              <div style={traceContainer}>
                <pre style={traceStyle}>{errText}</pre>
              </div>
            </>
          )
        })()}

        {/* Footer */}
        <div style={footerStyle}>
          <button style={dismissBtn} onClick={() => setVisible(false)}>
            Dismiss
          </button>
          <button
            style={state.fixed ? reloadBtn : reloadBtnDisabled}
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

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.75)",
  zIndex: 9999999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(4px)",
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
}

const cardStyle: React.CSSProperties = {
  background: "#1a1d23",
  border: `1px solid ${COLORS.red}40`,
  borderRadius: 12,
  width: "90%",
  maxWidth: 720,
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: `0 0 40px ${COLORS.red}20`,
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 20px",
  borderBottom: `1px solid ${COLORS.border}`,
}

const navBtn: React.CSSProperties = {
  background: "none",
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text,
  borderRadius: 4,
  width: 28,
  height: 24,
  cursor: "pointer",
  fontSize: 13,
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
}

const errorFileBar: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 6,
  padding: "8px 20px",
  borderBottom: `1px solid ${COLORS.border}`,
}

const fixedBanner: React.CSSProperties = {
  background: `${COLORS.green}15`,
  border: `1px solid ${COLORS.green}30`,
  borderRadius: 6,
  margin: "12px 20px",
  padding: "10px 14px",
  color: COLORS.green,
  fontSize: 12,
  lineHeight: 1.5,
}

const traceContainer: React.CSSProperties = {
  flex: 1,
  overflow: "auto",
  padding: "12px 20px",
}

const traceStyle: React.CSSProperties = {
  margin: 0,
  color: COLORS.red,
  fontSize: 11,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontFamily: "inherit",
}

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  padding: "12px 20px",
  borderTop: `1px solid ${COLORS.border}`,
}

const dismissBtn: React.CSSProperties = {
  background: "none",
  border: `1px solid ${COLORS.border}`,
  color: COLORS.muted,
  borderRadius: 6,
  padding: "8px 16px",
  cursor: "pointer",
  fontSize: 12,
  fontFamily: "inherit",
}

const reloadBtn: React.CSSProperties = {
  background: COLORS.red,
  border: "none",
  color: "#fff",
  borderRadius: 6,
  padding: "8px 20px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "inherit",
}

const reloadBtnDisabled: React.CSSProperties = {
  ...reloadBtn,
  background: COLORS.border,
  color: COLORS.muted,
  cursor: "not-allowed",
  opacity: 0.6,
}
