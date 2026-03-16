import React from "react"
import Editor, { type OnMount } from "@monaco-editor/react"

interface Props {
    content: string | null
    lang: string
    loading: boolean
    error: string | null
    onMount: OnMount
    onChange: (val: string) => void
}

export const EditorArea: React.FC<Props> = ({ content, lang, loading, error, onMount, onChange }) => (
    <div className="tfy-flex-1 tfy-overflow-hidden">
        {loading && (
            <div className="tfy-p-5 tfy-text-muted tfy-text-[11px]">Loading...</div>
        )}
        {error && (
            <div className="tfy-p-5 tfy-text-red tfy-text-[11px]">{error}</div>
        )}
        {content !== null && !loading && (
            <Editor
                key={lang}
                height="100%"
                language={lang}
                theme="vs-dark"
                value={content}
                onChange={(val) => onChange(val ?? "")}
                onMount={onMount}
                beforeMount={(monaco) => {
                    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                        noSemanticValidation: true, noSyntaxValidation: true,
                    })
                    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                        noSemanticValidation: true, noSyntaxValidation: true,
                    })
                }}
                options={{
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    renderLineHighlight: "line",
                    padding: { top: 8, bottom: 8 },
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    wordWrap: "on",
                    tabSize: 2,
                    automaticLayout: true,
                }}
            />
        )}
    </div>
)
